CREATE OR REPLACE FUNCTION public.allocate_sponsorship_funding(
  _user_id uuid,
  _amount_cents integer,
  _sponsor_name text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _k record;
  _remaining integer := _amount_cents;
  _share integer;
  _meals integer;
  _cost_cents integer;
  _order uuid;
  _count integer := 0;
  _targets integer;
BEGIN
  IF _amount_cents IS NULL OR _amount_cents < 100 THEN RETURN 0; END IF;

  CREATE TEMP TABLE _demand ON COMMIT DROP AS
  SELECT k.id,
         k.neighborhood,
         k.city,
         k.cost_per_meal,
         GREATEST(
           k.daily_capacity_meals * 7 - COALESCE((
             SELECT SUM(o.meals_funded) FROM public.funded_orders o
             WHERE o.kitchen_id = k.id AND o.created_at > now() - interval '7 days'
           ), 0),
           0
         ) AS unmet
  FROM public.kitchens k
  WHERE k.approved AND k.active AND k.cost_per_meal > 0
  ORDER BY unmet DESC
  LIMIT 5;

  SELECT COUNT(*) INTO _targets FROM _demand WHERE unmet > 0;
  IF _targets = 0 THEN
    SELECT COUNT(*) INTO _targets FROM _demand;
  END IF;
  IF _targets = 0 THEN RETURN 0; END IF;

  _share := _amount_cents / _targets;

  FOR _k IN SELECT * FROM _demand ORDER BY unmet DESC LIMIT _targets LOOP
    _cost_cents := GREATEST(round(_k.cost_per_meal * 100)::int, 1);
    _meals := LEAST(_share, _remaining) / _cost_cents;
    IF _meals < 1 THEN CONTINUE; END IF;

    INSERT INTO public.funded_orders
      (sponsor_id, sponsor_name, kitchen_id, meals_funded, amount_cents, status, neighborhood, paid)
    VALUES
      (_user_id, NULLIF(_sponsor_name, ''), _k.id, _meals, _meals * _cost_cents, 'funded',
       COALESCE(_k.neighborhood, _k.city), true)
    RETURNING id INTO _order;

    INSERT INTO public.impact_events (order_id, kitchen_id, kind, meals, neighborhood)
    VALUES (_order, _k.id, 'funded', _meals, COALESCE(_k.neighborhood, _k.city));

    _remaining := _remaining - (_meals * _cost_cents);
    _count := _count + _meals;
  END LOOP;

  RETURN _count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.allocate_sponsorship_funding(uuid, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.allocate_sponsorship_funding(uuid, integer, text) TO service_role;

-- Record which sponsorship invoices have already been allocated (idempotency).
CREATE TABLE public.sponsorship_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_invoice_id text NOT NULL UNIQUE,
  stripe_subscription_id text,
  amount_cents integer NOT NULL,
  meals_allocated integer NOT NULL DEFAULT 0,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sponsorship_allocations TO authenticated;
GRANT ALL ON public.sponsorship_allocations TO service_role;
ALTER TABLE public.sponsorship_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sponsors read own allocations" ON public.sponsorship_allocations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);