-- Defense in depth for governed database RPCs. These versions mirror the
-- current legal registry at the time of this migration. When a governed legal
-- document version is bumped, the matching RPC requirement must be bumped in
-- the same release so old acceptance can never authorize a new agreement.

CREATE OR REPLACE FUNCTION public.require_legal_acceptance(
  _document_key text,
  _document_version text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in is required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.legal_document_acceptances a
    WHERE a.user_id = auth.uid()
      AND a.document_key = _document_key
      AND a.document_version = _document_version
  ) THEN
    RAISE EXCEPTION 'Current legal acceptance required: %', _document_key;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.require_legal_acceptance(text, text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.apply_partner_organization(
  _name text,
  _kind text,
  _website text,
  _service_areas text[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _partner_id uuid;
BEGIN
  PERFORM public.require_legal_acceptance('terms', '1.0');
  PERFORM public.require_legal_acceptance('privacy', '1.0');
  PERFORM public.require_legal_acceptance('partner_data', '1.0');

  IF length(trim(coalesce(_name, ''))) < 2 THEN
    RAISE EXCEPTION 'Organization name is required';
  END IF;

  INSERT INTO public.partner_organizations (name, kind, website, service_areas)
  VALUES (
    trim(_name),
    coalesce(nullif(trim(_kind), ''), 'nonprofit'),
    nullif(trim(_website), ''),
    _service_areas
  )
  RETURNING id INTO _partner_id;

  INSERT INTO public.partner_memberships (partner_id, user_id, role)
  VALUES (_partner_id, auth.uid(), 'owner');

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'nonprofit')
  ON CONFLICT DO NOTHING;

  RETURN _partner_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_partner_workspace()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _result jsonb;
BEGIN
  PERFORM public.require_legal_acceptance('terms', '1.0');
  PERFORM public.require_legal_acceptance('privacy', '1.0');
  PERFORM public.require_legal_acceptance('partner_data', '1.0');

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
  INTO _result
  FROM public.partner_memberships m
  JOIN public.partner_organizations p ON p.id = m.partner_id
  WHERE m.user_id = auth.uid()
  ORDER BY m.created_at
  LIMIT 1;

  RETURN _result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_partner_referral(
  _referral_id uuid,
  _status text,
  _scheduled_for timestamptz DEFAULT NULL,
  _outcome text DEFAULT NULL,
  _meals integer DEFAULT 0
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _partner_id uuid;
BEGIN
  PERFORM public.require_legal_acceptance('terms', '1.0');
  PERFORM public.require_legal_acceptance('privacy', '1.0');
  PERFORM public.require_legal_acceptance('partner_data', '1.0');

  IF _status NOT IN ('accepted', 'scheduled', 'fulfilled', 'declined') THEN
    RAISE EXCEPTION 'Invalid referral status';
  END IF;

  SELECT partner_id INTO _partner_id
  FROM public.partner_referrals
  WHERE id = _referral_id;

  IF _partner_id IS NULL OR NOT public.is_approved_partner_member(_partner_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.partner_referrals
  SET status = _status,
      scheduled_for = coalesce(_scheduled_for, scheduled_for)
  WHERE id = _referral_id;

  UPDATE public.assistance_requests q
  SET status = CASE
    WHEN _status = 'fulfilled' THEN 'fulfilled'
    WHEN _status = 'declined' THEN 'reviewing'
    ELSE 'referred'
  END
  FROM public.partner_referrals r
  WHERE r.id = _referral_id
    AND q.id = r.request_id;

  IF _status = 'fulfilled' THEN
    IF length(trim(coalesce(_outcome, ''))) < 2 THEN
      RAISE EXCEPTION 'Outcome is required';
    END IF;

    INSERT INTO public.fulfillment_verifications (referral_id, verified_by, meals, outcome)
    VALUES (_referral_id, auth.uid(), greatest(_meals, 0), trim(_outcome))
    ON CONFLICT (referral_id)
    DO UPDATE SET
      meals = excluded.meals,
      outcome = excluded.outcome,
      verified_at = now();
  END IF;

  RETURN _status;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_delivery_run(_run_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _v uuid; _r public.delivery_runs;
BEGIN
  PERFORM public.require_legal_acceptance('terms', '1.0');
  PERFORM public.require_legal_acceptance('privacy', '1.0');
  PERFORM public.require_legal_acceptance('volunteer_waiver', '1.0');

  _v := public.my_volunteer_id();
  IF _v IS NULL THEN
    RAISE EXCEPTION 'create a volunteer profile first';
  END IF;

  SELECT * INTO _r
  FROM public.delivery_runs
  WHERE id = _run_id
  FOR UPDATE;

  IF _r.id IS NULL THEN RAISE EXCEPTION 'run not found'; END IF;
  IF _r.status <> 'open' OR _r.volunteer_id IS NOT NULL THEN
    RAISE EXCEPTION 'this run has already been claimed';
  END IF;

  UPDATE public.delivery_runs
  SET volunteer_id = _v,
      status = 'claimed',
      claimed_at = now()
  WHERE id = _run_id;

  RETURN _run_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.advance_delivery_run(_run_id uuid, _status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _v uuid; _r public.delivery_runs; _o public.funded_orders;
BEGIN
  PERFORM public.require_legal_acceptance('terms', '1.0');
  PERFORM public.require_legal_acceptance('privacy', '1.0');
  PERFORM public.require_legal_acceptance('volunteer_waiver', '1.0');

  IF _status NOT IN ('picked_up','delivered','released') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;

  _v := public.my_volunteer_id();
  SELECT * INTO _r FROM public.delivery_runs WHERE id = _run_id FOR UPDATE;
  IF _r.id IS NULL THEN RAISE EXCEPTION 'run not found'; END IF;

  IF _r.volunteer_id IS DISTINCT FROM _v AND NOT public.owns_kitchen(_r.kitchen_id) THEN
    RAISE EXCEPTION 'this run is not assigned to you';
  END IF;

  IF _status = 'released' THEN
    UPDATE public.delivery_runs
    SET volunteer_id = NULL,
        status = 'open',
        claimed_at = NULL
    WHERE id = _run_id;
    RETURN;
  END IF;

  IF _status = 'picked_up' THEN
    UPDATE public.delivery_runs
    SET status = 'picked_up',
        picked_up_at = now()
    WHERE id = _run_id;
    RETURN;
  END IF;

  UPDATE public.delivery_runs
  SET status = 'delivered',
      delivered_at = now()
  WHERE id = _run_id;

  SELECT * INTO _o FROM public.funded_orders WHERE id = _r.order_id;
  IF _o.id IS NOT NULL AND _o.status <> 'delivered' THEN
    UPDATE public.funded_orders
    SET status = 'delivered',
        delivered_at = now()
    WHERE id = _o.id;

    INSERT INTO public.impact_events (order_id, kitchen_id, kind, meals, neighborhood)
    VALUES (_o.id, _o.kitchen_id, 'delivered', _o.meals_funded, _o.neighborhood);

    IF NOT EXISTS (SELECT 1 FROM public.payouts WHERE order_id = _o.id) THEN
      INSERT INTO public.payouts (kitchen_id, amount_cents, status, order_id)
      VALUES (_o.kitchen_id, _o.amount_cents, 'pending', _o.id);
    END IF;
  END IF;
END;
$$;
