-- Admin-only acquisition outreach job interface.
-- Replaces any need for unrestricted raw SQL access by an external automation.

CREATE OR REPLACE FUNCTION public.business_days_since(_from timestamptz)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN _from IS NULL THEN NULL
    ELSE (
      SELECT count(*)::int
      FROM generate_series(
        (_from AT TIME ZONE 'UTC')::date + 1,
        (now() AT TIME ZONE 'UTC')::date,
        interval '1 day'
      ) AS d
      WHERE extract(isodow FROM d) < 6
    )
  END
$$;

CREATE OR REPLACE FUNCTION public.assert_acquisition_admin()
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL
    OR NOT public.has_role(auth.uid(), 'platform_admin'::public.app_role)
  THEN
    RAISE EXCEPTION 'Not authorized for acquisition outreach.' USING ERRCODE = '42501';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.acquisition_outreach_queue(_limit integer DEFAULT 50)
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  role text,
  status text,
  last_contacted_at timestamptz,
  followup_count integer,
  stage text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_acquisition_admin();

  RETURN QUERY
  SELECT
    s.id,
    s.email,
    NULLIF(split_part(btrim(s.full_name), ' ', 1), '') AS first_name,
    s.interest AS role,
    s.status,
    s.last_contacted_at,
    s.followup_count,
    CASE WHEN s.last_contacted_at IS NULL THEN 'initial' ELSE 'followup' END AS stage
  FROM public.pilot_signups s
  WHERE s.do_not_contact = false
    AND s.email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    AND s.email !~* '(^|[._%+-])(test|testing|fake|spam|noreply|no-reply|donotreply|do-not-reply|postmaster|abuse|admin|asdf|qwerty)([._%+-]|@)'
    AND s.email !~* '@(example|test|invalid|localhost|mailinator|guerrillamail|yopmail|10minutemail|trashmail|sharklasers|tempmail|dispostable|maildrop)\.'
    AND s.email !~* '\.(test|invalid|localhost|example)$'
    AND s.email !~* '@(mailinator|yopmail|guerrillamail|tempmail|trashmail|sharklasers|getnada|dispostable|maildrop)\.[a-z]+$'
    AND (
      s.last_contacted_at IS NULL
      OR (s.followup_count = 0 AND public.business_days_since(s.last_contacted_at) >= 3)
    )
  ORDER BY (s.last_contacted_at IS NULL) DESC, s.created_at ASC
  LIMIT GREATEST(1, LEAST(COALESCE(_limit, 50), 200));
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_acquisition_initial_sent(_signup_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated public.pilot_signups%ROWTYPE;
BEGIN
  PERFORM public.assert_acquisition_admin();
  IF _signup_id IS NULL THEN
    RAISE EXCEPTION 'A signup id is required.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.pilot_signups
     SET last_contacted_at = now(),
         status = CASE WHEN status = 'queued_manual_review' THEN 'in_progress' ELSE status END,
         updated_at = now()
   WHERE id = _signup_id
     AND do_not_contact = false
     AND last_contacted_at IS NULL
  RETURNING * INTO updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No lead is eligible for an initial send with that id.' USING ERRCODE = 'P0002';
  END IF;

  RETURN jsonb_build_object(
    'id', updated.id,
    'status', updated.status,
    'last_contacted_at', updated.last_contacted_at,
    'followup_count', updated.followup_count
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_acquisition_followup_sent(_signup_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated public.pilot_signups%ROWTYPE;
BEGIN
  PERFORM public.assert_acquisition_admin();
  IF _signup_id IS NULL THEN
    RAISE EXCEPTION 'A signup id is required.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.pilot_signups
     SET followup_count = 1,
         last_contacted_at = now(),
         updated_at = now()
   WHERE id = _signup_id
     AND do_not_contact = false
     AND followup_count = 0
     AND last_contacted_at IS NOT NULL
     AND public.business_days_since(last_contacted_at) >= 3
  RETURNING * INTO updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No lead is eligible for a follow-up send with that id.' USING ERRCODE = 'P0002';
  END IF;

  RETURN jsonb_build_object(
    'id', updated.id,
    'status', updated.status,
    'last_contacted_at', updated.last_contacted_at,
    'followup_count', updated.followup_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.assert_acquisition_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.business_days_since(timestamptz) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.acquisition_outreach_queue(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mark_acquisition_initial_sent(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mark_acquisition_followup_sent(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.business_days_since(timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.acquisition_outreach_queue(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_acquisition_initial_sent(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_acquisition_followup_sent(uuid) TO authenticated;