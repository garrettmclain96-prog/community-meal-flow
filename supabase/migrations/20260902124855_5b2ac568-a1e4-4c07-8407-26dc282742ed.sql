-- ============ kitchens: geography + claim state ============
ALTER TABLE public.kitchens
  ALTER COLUMN owner_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS claimed boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'self_registered';

CREATE TABLE public.kitchen_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kitchen_id uuid NOT NULL REFERENCES public.kitchens(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_at_kitchen text,
  note text,
  status text NOT NULL DEFAULT 'approved',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.kitchen_claims TO authenticated;
GRANT ALL ON public.kitchen_claims TO service_role;
ALTER TABLE public.kitchen_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own claims read" ON public.kitchen_claims
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER kitchen_claims_touch BEFORE UPDATE ON public.kitchen_claims
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.claim_kitchen(_kitchen_id uuid, _role text DEFAULT NULL, _note text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _k public.kitchens;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  SELECT * INTO _k FROM public.kitchens WHERE id = _kitchen_id FOR UPDATE;
  IF _k.id IS NULL THEN RAISE EXCEPTION 'kitchen not found'; END IF;
  IF _k.claimed OR _k.owner_id IS NOT NULL THEN RAISE EXCEPTION 'this kitchen has already been claimed'; END IF;
  IF EXISTS (SELECT 1 FROM public.kitchens WHERE owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'you already operate a kitchen on TableForward';
  END IF;

  UPDATE public.kitchens
     SET owner_id = auth.uid(), claimed = true, claimed_at = now()
   WHERE id = _kitchen_id;

  INSERT INTO public.kitchen_claims (kitchen_id, user_id, role_at_kitchen, note, status)
  VALUES (_kitchen_id, auth.uid(), NULLIF(_role,''), NULLIF(_note,''), 'approved');

  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'kitchen')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN _kitchen_id;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_kitchen(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_kitchen(uuid, text, text) TO authenticated;

-- ============ volunteers ============
CREATE TABLE public.volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  city text NOT NULL DEFAULT 'Galveston',
  neighborhoods text[] NOT NULL DEFAULT '{}',
  skills text[] NOT NULL DEFAULT '{}',
  can_drive boolean NOT NULL DEFAULT false,
  availability text[] NOT NULL DEFAULT '{}',
  agreement_accepted_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.volunteers TO authenticated;
GRANT ALL ON public.volunteers TO service_role;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own volunteer profile" ON public.volunteers
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER volunteers_touch BEFORE UPDATE ON public.volunteers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.my_volunteer_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.volunteers WHERE user_id = auth.uid()
$$;
REVOKE ALL ON FUNCTION public.my_volunteer_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_volunteer_id() TO authenticated;

-- ============ shifts ============
CREATE TABLE public.volunteer_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kitchen_id uuid NOT NULL REFERENCES public.kitchens(id) ON DELETE CASCADE,
  title text NOT NULL,
  role text NOT NULL DEFAULT 'prep',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  slots integer NOT NULL DEFAULT 4,
  notes text,
  neighborhood text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.volunteer_shifts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_shifts TO authenticated;
GRANT ALL ON public.volunteer_shifts TO service_role;
ALTER TABLE public.volunteer_shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shifts are public" ON public.volunteer_shifts FOR SELECT USING (true);
CREATE POLICY "kitchen owners manage shifts" ON public.volunteer_shifts
  FOR ALL TO authenticated USING (public.owns_kitchen(kitchen_id)) WITH CHECK (public.owns_kitchen(kitchen_id));
CREATE TRIGGER volunteer_shifts_touch BEFORE UPDATE ON public.volunteer_shifts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.shift_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id uuid NOT NULL REFERENCES public.volunteer_shifts(id) ON DELETE CASCADE,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'claimed',
  hours numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (shift_id, volunteer_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shift_signups TO authenticated;
GRANT ALL ON public.shift_signups TO service_role;
ALTER TABLE public.shift_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "volunteers manage own signups" ON public.shift_signups
  FOR ALL TO authenticated
  USING (volunteer_id = public.my_volunteer_id())
  WITH CHECK (volunteer_id = public.my_volunteer_id());
CREATE POLICY "kitchens read their roster" ON public.shift_signups
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.volunteer_shifts s WHERE s.id = shift_id AND public.owns_kitchen(s.kitchen_id)));
CREATE POLICY "kitchens update their roster" ON public.shift_signups
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.volunteer_shifts s WHERE s.id = shift_id AND public.owns_kitchen(s.kitchen_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.volunteer_shifts s WHERE s.id = shift_id AND public.owns_kitchen(s.kitchen_id)));
CREATE POLICY "kitchens read roster volunteers" ON public.volunteers
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.shift_signups g
    JOIN public.volunteer_shifts s ON s.id = g.shift_id
    WHERE g.volunteer_id = volunteers.id AND public.owns_kitchen(s.kitchen_id)
  ));
CREATE TRIGGER shift_signups_touch BEFORE UPDATE ON public.shift_signups
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ delivery runs ============
CREATE TABLE public.delivery_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.funded_orders(id) ON DELETE CASCADE,
  kitchen_id uuid NOT NULL REFERENCES public.kitchens(id) ON DELETE CASCADE,
  volunteer_id uuid REFERENCES public.volunteers(id) ON DELETE SET NULL,
  meals integer NOT NULL DEFAULT 0,
  dropoff_area text,
  window_start timestamptz NOT NULL DEFAULT now(),
  window_end timestamptz NOT NULL DEFAULT (now() + interval '6 hours'),
  status text NOT NULL DEFAULT 'open',
  claimed_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.delivery_runs TO authenticated;
GRANT ALL ON public.delivery_runs TO service_role;
ALTER TABLE public.delivery_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed in volunteers see runs" ON public.delivery_runs
  FOR SELECT TO authenticated USING (true);
CREATE TRIGGER delivery_runs_touch BEFORE UPDATE ON public.delivery_runs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.create_delivery_run_on_prepared()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'prepared' AND COALESCE(OLD.status,'') <> 'prepared' THEN
    INSERT INTO public.delivery_runs (order_id, kitchen_id, meals, dropoff_area)
    VALUES (NEW.id, NEW.kitchen_id, NEW.meals_funded, NEW.neighborhood)
    ON CONFLICT (order_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER funded_orders_dispatch AFTER UPDATE ON public.funded_orders
  FOR EACH ROW EXECUTE FUNCTION public.create_delivery_run_on_prepared();

CREATE OR REPLACE FUNCTION public.claim_delivery_run(_run_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _v uuid; _r public.delivery_runs;
BEGIN
  _v := public.my_volunteer_id();
  IF _v IS NULL THEN RAISE EXCEPTION 'create a volunteer profile first'; END IF;
  SELECT * INTO _r FROM public.delivery_runs WHERE id = _run_id FOR UPDATE;
  IF _r.id IS NULL THEN RAISE EXCEPTION 'run not found'; END IF;
  IF _r.status <> 'open' OR _r.volunteer_id IS NOT NULL THEN RAISE EXCEPTION 'this run has already been claimed'; END IF;
  UPDATE public.delivery_runs SET volunteer_id = _v, status = 'claimed', claimed_at = now() WHERE id = _run_id;
  RETURN _run_id;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_delivery_run(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_delivery_run(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.advance_delivery_run(_run_id uuid, _status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _v uuid; _r public.delivery_runs; _o public.funded_orders;
BEGIN
  IF _status NOT IN ('picked_up','delivered','released') THEN RAISE EXCEPTION 'invalid status'; END IF;
  _v := public.my_volunteer_id();
  SELECT * INTO _r FROM public.delivery_runs WHERE id = _run_id FOR UPDATE;
  IF _r.id IS NULL THEN RAISE EXCEPTION 'run not found'; END IF;
  IF _r.volunteer_id IS DISTINCT FROM _v AND NOT public.owns_kitchen(_r.kitchen_id) THEN
    RAISE EXCEPTION 'this run is not assigned to you';
  END IF;

  IF _status = 'released' THEN
    UPDATE public.delivery_runs SET volunteer_id = NULL, status = 'open', claimed_at = NULL WHERE id = _run_id;
    RETURN;
  END IF;

  IF _status = 'picked_up' THEN
    UPDATE public.delivery_runs SET status = 'picked_up', picked_up_at = now() WHERE id = _run_id;
    RETURN;
  END IF;

  UPDATE public.delivery_runs SET status = 'delivered', delivered_at = now() WHERE id = _run_id;

  SELECT * INTO _o FROM public.funded_orders WHERE id = _r.order_id;
  IF _o.id IS NOT NULL AND _o.status <> 'delivered' THEN
    UPDATE public.funded_orders SET status = 'delivered', delivered_at = now() WHERE id = _o.id;
    INSERT INTO public.impact_events (order_id, kitchen_id, kind, meals, neighborhood)
    VALUES (_o.id, _o.kitchen_id, 'delivered', _o.meals_funded, _o.neighborhood);
    IF NOT EXISTS (SELECT 1 FROM public.payouts WHERE order_id = _o.id) THEN
      INSERT INTO public.payouts (kitchen_id, amount_cents, status, order_id)
      VALUES (_o.kitchen_id, _o.amount_cents, 'pending', _o.id);
    END IF;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.advance_delivery_run(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.advance_delivery_run(uuid, text) TO authenticated;