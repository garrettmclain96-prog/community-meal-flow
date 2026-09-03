-- Complete the human-side workflows promised by the ProvisionLoop 2.0 brief.
-- Recipient contact details remain private and never enter the public impact ledger.

CREATE TABLE public.partner_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'nonprofit',
  website text,
  service_areas text[] NOT NULL DEFAULT '{}',
  approved boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.partner_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, user_id)
);

CREATE TABLE public.assistance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  email text,
  phone text,
  area text NOT NULL,
  household_size integer NOT NULL CHECK (household_size BETWEEN 1 AND 30),
  need_type text NOT NULL CHECK (need_type IN ('meal_today', 'groceries', 'ongoing_meals', 'senior_support', 'child_support', 'disaster')),
  urgency text NOT NULL DEFAULT 'soon' CHECK (urgency IN ('today', 'soon', 'planning')),
  notes text,
  consent boolean NOT NULL CHECK (consent),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'referred', 'fulfilled', 'closed')),
  matched_partner_id uuid REFERENCES public.partner_organizations(id) ON DELETE SET NULL,
  matched_kitchen_id uuid REFERENCES public.kitchens(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE public.partner_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.assistance_requests(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  kitchen_id uuid REFERENCES public.kitchens(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'offered' CHECK (status IN ('offered', 'accepted', 'scheduled', 'fulfilled', 'declined')),
  scheduled_for timestamptz,
  internal_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fulfillment_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid NOT NULL UNIQUE REFERENCES public.partner_referrals(id) ON DELETE CASCADE,
  verified_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  meals integer NOT NULL DEFAULT 0 CHECK (meals >= 0),
  outcome text NOT NULL,
  verified_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.kitchen_support_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kitchen_id uuid NOT NULL REFERENCES public.kitchens(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('revenue_floor', 'micro_grant', 'supply_credit', 'equipment', 'volunteer_labor')),
  title text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0 CHECK (amount_cents >= 0),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'applied', 'approved', 'active', 'completed', 'declined')),
  starts_at timestamptz,
  ends_at timestamptz,
  details text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS target_type text DEFAULT 'highest_need',
  ADD COLUMN IF NOT EXISTS target_id uuid,
  ADD COLUMN IF NOT EXISTS target_label text;

ALTER TABLE public.partner_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_support_awards ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_approved_partner_member(_partner_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_memberships m
    JOIN public.partner_organizations p ON p.id = m.partner_id
    WHERE m.partner_id = _partner_id AND m.user_id = auth.uid() AND p.approved AND p.active
  );
$$;

REVOKE ALL ON FUNCTION public.is_approved_partner_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_approved_partner_member(uuid) TO authenticated;

CREATE POLICY "approved partner directory is public" ON public.partner_organizations
  FOR SELECT USING (approved AND active);
CREATE POLICY "members read own memberships" ON public.partner_memberships
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "requesters read own requests" ON public.assistance_requests
  FOR SELECT TO authenticated USING (requester_id = auth.uid());
CREATE POLICY "assigned partners read requests" ON public.assistance_requests
  FOR SELECT TO authenticated USING (
    matched_partner_id IS NOT NULL AND public.is_approved_partner_member(matched_partner_id)
  );
CREATE POLICY "platform admins manage requests" ON public.assistance_requests
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'platform_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "partners manage their referrals" ON public.partner_referrals
  FOR ALL TO authenticated USING (public.is_approved_partner_member(partner_id))
  WITH CHECK (public.is_approved_partner_member(partner_id));
CREATE POLICY "partners verify their referrals" ON public.fulfillment_verifications
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.partner_referrals r WHERE r.id = referral_id AND public.is_approved_partner_member(r.partner_id))
  ) WITH CHECK (
    verified_by = auth.uid() AND EXISTS (SELECT 1 FROM public.partner_referrals r WHERE r.id = referral_id AND public.is_approved_partner_member(r.partner_id))
  );
CREATE POLICY "kitchens read their support" ON public.kitchen_support_awards
  FOR SELECT TO authenticated USING (public.owns_kitchen(kitchen_id));
CREATE POLICY "admins manage kitchen support" ON public.kitchen_support_awards
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'platform_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));

CREATE OR REPLACE FUNCTION public.suggest_kitchen_for_area(_area text)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT k.id FROM public.kitchens k
  LEFT JOIN public.funded_orders o ON o.kitchen_id = k.id AND o.created_at >= now() - interval '7 days'
  WHERE k.approved AND k.active AND (lower(coalesce(k.neighborhood, k.city)) = lower(_area) OR lower(k.city) = lower(_area))
  GROUP BY k.id, k.daily_capacity_meals
  ORDER BY (k.daily_capacity_meals * 7 - coalesce(sum(o.meals_funded), 0)) DESC, k.name
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.suggest_kitchen_for_area(text) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.submit_assistance_request(
  _first_name text,
  _email text,
  _phone text,
  _area text,
  _household_size integer,
  _need_type text,
  _urgency text,
  _notes text,
  _consent boolean
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
DECLARE _kitchen_id uuid;
DECLARE _partner_id uuid;
BEGIN
  IF NOT _consent THEN RAISE EXCEPTION 'Consent is required'; END IF;
  IF length(trim(coalesce(_first_name, ''))) < 1 THEN RAISE EXCEPTION 'First name is required'; END IF;
  IF length(trim(coalesce(_area, ''))) < 2 THEN RAISE EXCEPTION 'Area is required'; END IF;
  IF nullif(trim(coalesce(_email, '')), '') IS NULL AND nullif(trim(coalesce(_phone, '')), '') IS NULL THEN
    RAISE EXCEPTION 'Email or phone is required';
  END IF;
  SELECT public.suggest_kitchen_for_area(trim(_area)) INTO _kitchen_id;
  SELECT p.id INTO _partner_id
  FROM public.partner_organizations p
  WHERE p.approved AND p.active
    AND EXISTS (SELECT 1 FROM unnest(p.service_areas) a WHERE lower(a) = lower(trim(_area)))
  ORDER BY p.created_at
  LIMIT 1;

  INSERT INTO public.assistance_requests (requester_id, first_name, email, phone, area, household_size, need_type, urgency, notes, consent, matched_partner_id, matched_kitchen_id)
  VALUES (auth.uid(), trim(_first_name), nullif(trim(_email), ''), nullif(trim(_phone), ''), trim(_area), _household_size, _need_type, _urgency, nullif(trim(_notes), ''), true, _partner_id, _kitchen_id)
  RETURNING id INTO _id;

  IF _partner_id IS NOT NULL THEN
    INSERT INTO public.partner_referrals (request_id, partner_id, kitchen_id)
    VALUES (_id, _partner_id, _kitchen_id);
  END IF;
  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_assistance_request(text,text,text,text,integer,text,text,text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_assistance_request(text,text,text,text,integer,text,text,text,boolean) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.apply_partner_organization(
  _name text,
  _kind text,
  _website text,
  _service_areas text[]
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _partner_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in is required'; END IF;
  IF length(trim(coalesce(_name, ''))) < 2 THEN RAISE EXCEPTION 'Organization name is required'; END IF;
  INSERT INTO public.partner_organizations (name, kind, website, service_areas)
  VALUES (trim(_name), coalesce(nullif(trim(_kind), ''), 'nonprofit'), nullif(trim(_website), ''), _service_areas)
  RETURNING id INTO _partner_id;
  INSERT INTO public.partner_memberships (partner_id, user_id, role)
  VALUES (_partner_id, auth.uid(), 'owner');
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'nonprofit') ON CONFLICT DO NOTHING;
  RETURN _partner_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_partner_workspace()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'organization', to_jsonb(p),
    'referrals', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', r.id,
        'status', r.status,
        'scheduled_for', r.scheduled_for,
        'kitchen_id', r.kitchen_id,
        'created_at', r.created_at,
        'request', jsonb_build_object(
          'first_name', q.first_name,
          'email', q.email,
          'phone', q.phone,
          'area', q.area,
          'household_size', q.household_size,
          'need_type', q.need_type,
          'urgency', q.urgency,
          'notes', q.notes
        )
      ) ORDER BY r.created_at DESC)
      FROM public.partner_referrals r
      JOIN public.assistance_requests q ON q.id = r.request_id
      WHERE r.partner_id = p.id
    ), '[]'::jsonb)
  )
  FROM public.partner_memberships m
  JOIN public.partner_organizations p ON p.id = m.partner_id
  WHERE m.user_id = auth.uid()
  ORDER BY m.created_at
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.update_partner_referral(
  _referral_id uuid,
  _status text,
  _scheduled_for timestamptz DEFAULT NULL,
  _outcome text DEFAULT NULL,
  _meals integer DEFAULT 0
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _partner_id uuid;
BEGIN
  IF _status NOT IN ('accepted', 'scheduled', 'fulfilled', 'declined') THEN RAISE EXCEPTION 'Invalid referral status'; END IF;
  SELECT partner_id INTO _partner_id FROM public.partner_referrals WHERE id = _referral_id;
  IF _partner_id IS NULL OR NOT public.is_approved_partner_member(_partner_id) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE public.partner_referrals SET status = _status, scheduled_for = coalesce(_scheduled_for, scheduled_for) WHERE id = _referral_id;
  UPDATE public.assistance_requests q SET status = CASE WHEN _status = 'fulfilled' THEN 'fulfilled' WHEN _status = 'declined' THEN 'reviewing' ELSE 'referred' END
  FROM public.partner_referrals r WHERE r.id = _referral_id AND q.id = r.request_id;
  IF _status = 'fulfilled' THEN
    IF length(trim(coalesce(_outcome, ''))) < 2 THEN RAISE EXCEPTION 'Outcome is required'; END IF;
    INSERT INTO public.fulfillment_verifications (referral_id, verified_by, meals, outcome)
    VALUES (_referral_id, auth.uid(), greatest(_meals, 0), trim(_outcome))
    ON CONFLICT (referral_id) DO UPDATE SET meals = excluded.meals, outcome = excluded.outcome, verified_at = now();
  END IF;
  RETURN _status;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_partner_organization(text,text,text,text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_partner_workspace() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_partner_referral(uuid,text,timestamptz,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_partner_organization(text,text,text,text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_partner_workspace() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_partner_referral(uuid,text,timestamptz,text,integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_my_kitchen_support(_kitchen_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.created_at DESC), '[]'::jsonb)
  FROM public.kitchen_support_awards a
  WHERE a.kitchen_id = _kitchen_id AND public.owns_kitchen(_kitchen_id);
$$;

CREATE OR REPLACE FUNCTION public.apply_for_kitchen_support(_award_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _status text;
BEGIN
  UPDATE public.kitchen_support_awards a
  SET status = 'applied'
  WHERE a.id = _award_id AND a.status = 'available' AND public.owns_kitchen(a.kitchen_id)
  RETURNING a.status INTO _status;
  IF _status IS NULL THEN RAISE EXCEPTION 'Support award is not available'; END IF;
  RETURN _status;
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_kitchen_support(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_for_kitchen_support(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_kitchen_support(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_for_kitchen_support(uuid) TO authenticated;

CREATE TRIGGER touch_partner_organizations BEFORE UPDATE ON public.partner_organizations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_assistance_requests BEFORE UPDATE ON public.assistance_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_partner_referrals BEFORE UPDATE ON public.partner_referrals FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_kitchen_support_awards BEFORE UPDATE ON public.kitchen_support_awards FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
