-- Public acquisition intake without direct anonymous table writes or a Vercel
-- service-role secret. The function validates and de-duplicates before writing.

CREATE OR REPLACE FUNCTION public.submit_public_pilot_lead(
  _full_name text,
  _email text,
  _postal_code text,
  _interest text,
  _organization_name text,
  _note text,
  _lead_source text,
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(coalesce(_email, '')));
  v_name text := trim(coalesce(_full_name, ''));
  v_interest text := trim(coalesce(_interest, ''));
  v_org text := nullif(trim(coalesce(_organization_name, '')), '');
  v_existing uuid;
BEGIN
  IF length(v_name) < 1 OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'A valid name is required.' USING ERRCODE = '22023';
  END IF;

  IF length(v_email) < 5
    OR length(v_email) > 254
    OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  THEN
    RAISE EXCEPTION 'A valid email is required.' USING ERRCODE = '22023';
  END IF;

  IF v_interest NOT IN ('household', 'kitchen_operator', 'volunteer', 'partner', 'sponsor') THEN
    RAISE EXCEPTION 'A valid pilot role is required.' USING ERRCODE = '22023';
  END IF;

  IF v_interest IN ('kitchen_operator', 'partner') AND v_org IS NULL THEN
    RAISE EXCEPTION 'An organization name is required for this role.' USING ERRCODE = '22023';
  END IF;

  IF length(coalesce(_postal_code, '')) > 16
    OR length(coalesce(_note, '')) > 1000
    OR length(coalesce(_lead_source, '')) > 100
    OR length(coalesce(v_org, '')) > 160
  THEN
    RAISE EXCEPTION 'Pilot intake field is too long.' USING ERRCODE = '22023';
  END IF;

  SELECT id
  INTO v_existing
  FROM public.pilot_signups
  WHERE lower(email) = v_email
    AND interest = v_interest
    AND created_at >= now() - interval '30 days'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    UPDATE public.pilot_signups
    SET full_name = v_name,
        postal_code = nullif(trim(coalesce(_postal_code, '')), ''),
        organization_name = v_org,
        note = nullif(trim(coalesce(_note, '')), ''),
        lead_source = coalesce(nullif(trim(coalesce(_lead_source, '')), ''), 'website'),
        preferred_contact = 'email_only',
        metadata = coalesce(_metadata, '{}'::jsonb),
        do_not_contact = false
    WHERE id = v_existing;

    RETURN jsonb_build_object('accepted', true, 'duplicate', true);
  END IF;

  INSERT INTO public.pilot_signups (
    user_id,
    full_name,
    email,
    postal_code,
    interest,
    organization_name,
    note,
    lead_source,
    preferred_contact,
    metadata,
    do_not_contact,
    status
  )
  VALUES (
    auth.uid(),
    v_name,
    v_email,
    nullif(trim(coalesce(_postal_code, '')), ''),
    v_interest,
    v_org,
    nullif(trim(coalesce(_note, '')), ''),
    coalesce(nullif(trim(coalesce(_lead_source, '')), ''), 'website'),
    'email_only',
    coalesce(_metadata, '{}'::jsonb),
    false,
    'queued_manual_review'
  );

  RETURN jsonb_build_object('accepted', true, 'duplicate', false);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_public_pilot_lead(
  text, text, text, text, text, text, text, jsonb
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_public_pilot_lead(
  text, text, text, text, text, text, text, jsonb
) TO anon, authenticated;
