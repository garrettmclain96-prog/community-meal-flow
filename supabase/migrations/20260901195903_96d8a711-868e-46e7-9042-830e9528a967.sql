-- 1. Sponsor checkout attempts
CREATE TABLE public.sponsor_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sponsor_name text,
  kitchen_id uuid NOT NULL REFERENCES public.kitchens(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.meal_templates(id) ON DELETE SET NULL,
  meals integer NOT NULL CHECK (meals > 0 AND meals <= 5000),
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  neighborhood text,
  status text NOT NULL DEFAULT 'pending',
  environment text NOT NULL DEFAULT 'sandbox',
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  order_id uuid REFERENCES public.funded_orders(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.sponsor_checkouts TO authenticated;
GRANT ALL ON public.sponsor_checkouts TO service_role;
ALTER TABLE public.sponsor_checkouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sponsors read own checkouts" ON public.sponsor_checkouts
  FOR SELECT TO authenticated USING (auth.uid() = sponsor_id);
CREATE POLICY "kitchens read their checkouts" ON public.sponsor_checkouts
  FOR SELECT TO authenticated USING (public.owns_kitchen(kitchen_id));

CREATE INDEX idx_sponsor_checkouts_sponsor ON public.sponsor_checkouts(sponsor_id);
CREATE INDEX idx_sponsor_checkouts_session ON public.sponsor_checkouts(stripe_session_id);

CREATE TRIGGER sponsor_checkouts_touch BEFORE UPDATE ON public.sponsor_checkouts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2. Subscriptions (recurring sponsorships)
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  product_id text,
  price_id text,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE TRIGGER subscriptions_touch BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. Payment state on existing tables
ALTER TABLE public.funded_orders
  ADD COLUMN IF NOT EXISTS paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checkout_id uuid REFERENCES public.sponsor_checkouts(id) ON DELETE SET NULL;

ALTER TABLE public.kitchens
  ADD COLUMN IF NOT EXISTS payout_account_id text,
  ADD COLUMN IF NOT EXISTS payout_status text NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS kind_detail text;

ALTER TABLE public.payouts
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.funded_orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS stripe_transfer_id text,
  ADD COLUMN IF NOT EXISTS failure_reason text,
  ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;

-- 4. Confirm a paid checkout: creates the funded order + ledger event.
CREATE OR REPLACE FUNCTION public.confirm_sponsor_checkout(_checkout_id uuid, _payment_intent text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _c public.sponsor_checkouts;
  _order uuid;
BEGIN
  SELECT * INTO _c FROM public.sponsor_checkouts WHERE id = _checkout_id FOR UPDATE;
  IF _c.id IS NULL THEN RAISE EXCEPTION 'checkout not found'; END IF;
  IF _c.status = 'paid' AND _c.order_id IS NOT NULL THEN RETURN _c.order_id; END IF;

  INSERT INTO public.funded_orders
    (sponsor_id, sponsor_name, kitchen_id, template_id, meals_funded, amount_cents, status, neighborhood, paid, checkout_id)
  VALUES
    (_c.sponsor_id, _c.sponsor_name, _c.kitchen_id, _c.template_id, _c.meals, _c.amount_cents, 'funded', _c.neighborhood, true, _c.id)
  RETURNING id INTO _order;

  INSERT INTO public.impact_events (order_id, kitchen_id, kind, meals, neighborhood)
  VALUES (_order, _c.kitchen_id, 'funded', _c.meals, _c.neighborhood);

  UPDATE public.sponsor_checkouts
     SET status = 'paid',
         order_id = _order,
         stripe_payment_intent_id = COALESCE(_payment_intent, stripe_payment_intent_id)
   WHERE id = _checkout_id;

  RETURN _order;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.confirm_sponsor_checkout(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_sponsor_checkout(uuid, text) TO service_role;

-- 5. Payouts now record which order they settle
CREATE OR REPLACE FUNCTION public.advance_order(_order_id uuid, _status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _o public.funded_orders;
BEGIN
  IF _status NOT IN ('accepted','prepared','delivered') THEN RAISE EXCEPTION 'invalid status'; END IF;
  SELECT * INTO _o FROM public.funded_orders WHERE id = _order_id;
  IF _o.id IS NULL OR NOT public.owns_kitchen(_o.kitchen_id) THEN RAISE EXCEPTION 'not your order'; END IF;

  UPDATE public.funded_orders
     SET status = _status,
         delivered_at = CASE WHEN _status = 'delivered' THEN now() ELSE delivered_at END
   WHERE id = _order_id;

  INSERT INTO public.impact_events (order_id, kitchen_id, kind, meals, neighborhood)
  VALUES (_order_id, _o.kitchen_id, _status, _o.meals_funded, _o.neighborhood);

  IF _status = 'delivered' AND NOT EXISTS (SELECT 1 FROM public.payouts WHERE order_id = _order_id) THEN
    INSERT INTO public.payouts (kitchen_id, amount_cents, status, order_id)
    VALUES (_o.kitchen_id, _o.amount_cents, 'pending', _order_id);
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.advance_order(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.advance_order(uuid, text) TO authenticated;