-- ProvisionLoop backend-owned acquisition worker state and RPCs.
-- Privileged worker operations are executable by service_role only.

ALTER TABLE public.pilot_signups
  ADD COLUMN IF NOT EXISTS reply_detected_at timestamptz,
  ADD COLUMN IF NOT EXISTS reply_status text,
  ADD COLUMN IF NOT EXISTS outreach_claim_token uuid,
  ADD COLUMN IF NOT EXISTS outreach_claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS outreach_claim_stage text;

CREATE TABLE IF NOT EXISTS public.outreach_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.pilot_signups(id) ON DELETE CASCADE,
  stage text NOT NULL CHECK (stage IN ('initial', 'followup')),
  idempotency_key text NOT NULL,
  provider text NOT NULL DEFAULT 'resend',
  provider_message_id text,
  outcome text NOT NULL CHECK (outcome IN ('claimed', 'sent', 'failed')),
  error_category text,
  attempt_count integer NOT NULL DEFAULT 1,
  first_claimed_at timestamptz NOT NULL DEFAULT now(),
  last_attempted_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lead_id, stage),
  UNIQUE (idempotency_key)
);

ALTER TABLE public.outreach_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.outreach_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.outreach_events TO service_role;

CREATE INDEX IF NOT EXISTS pilot_signups_outreach_due_idx
  ON public.pilot_signups (do_not_contact, last_contacted_at, followup_count, outreach_claimed_at);

CREATE OR REPLACE FUNCTION public.claim_acquisition_outreach(
  _limit integer DEFAULT 25,
  _claim_token uuid DEFAULT gen_random_uuid()
)
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  role text,
  status text,
  last_contacted_at timestamptz,
  followup_count integer,
  stage text,
  claim_token uuid,
  idempotency_key text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT
      s.id,
      CASE WHEN s.last_contacted_at IS NULL THEN 'initial'::text ELSE 'followup'::text END AS stage
    FROM public.pilot_signups s
    WHERE s.do_not_contact = false
      AND s.email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      AND s.email !~* '(^|[._%+-])(test|testing|fake|spam|noreply|no-reply|donotreply|do-not-reply|postmaster|abuse|asdf|qwerty)([._%+-]|@)'
      AND s.email !~* '@(example|test|invalid|localhost|mailinator|guerrillamail|yopmail|10minutemail|trashmail|sharklasers|tempmail|dispostable|maildrop|getnada)\.'
      AND (s.outreach_claimed_at IS NULL OR s.outreach_claimed_at < now() - interval '20 minutes')
      AND (
        s.last_contacted_at IS NULL
        OR (
          s.last_contacted_at IS NOT NULL
          AND s.followup_count = 0
          AND s.reply_detected_at IS NULL
          AND public.business_days_since(s.last_contacted_at) >= 3
        )
      )
      AND NOT EXISTS (
        SELECT 1
        FROM public.outreach_events e
        WHERE e.lead_id = s.id
          AND e.stage = CASE WHEN s.last_contacted_at IS NULL THEN 'initial' ELSE 'followup' END
          AND e.outcome = 'sent'
      )
    ORDER BY (s.last_contacted_at IS NULL) DESC, s.created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT GREATEST(1, LEAST(COALESCE(_limit, 25), 100))
  ), claimed AS (
    UPDATE public.pilot_signups s
       SET outreach_claim_token = _claim_token,
           outreach_claimed_at = now(),
           outreach_claim_stage = c.stage,
           updated_at = now()
      FROM candidates c
     WHERE s.id = c.id
    RETURNING s.id, s.email, s.full_name, s.interest, s.status,
              s.last_contacted_at, s.followup_count, c.stage
  ), event_rows AS (
    INSERT INTO public.outreach_events (
      lead_id, stage, idempotency_key, outcome, attempt_count, last_attempted_at, updated_at
    )
    SELECT
      c.id,
      c.stage,
      'provisionloop-acquisition/' || c.stage || '/' || c.id::text,
      'claimed',
      1,
      now(),
      now()
    FROM claimed c
    ON CONFLICT (lead_id, stage) DO UPDATE
      SET outcome = CASE WHEN public.outreach_events.outcome = 'sent' THEN 'sent' ELSE 'claimed' END,
          attempt_count = public.outreach_events.attempt_count + 1,
          last_attempted_at = now(),
          updated_at = now(),
          error_category = NULL
    RETURNING lead_id, stage, idempotency_key
  )
  SELECT
    c.id,
    c.email,
    NULLIF(split_part(btrim(c.full_name), ' ', 1), ''),
    c.interest,
    c.status,
    c.last_contacted_at,
    c.followup_count,
    c.stage,
    _claim_token,
    e.idempotency_key
  FROM claimed c
  JOIN event_rows e ON e.lead_id = c.id AND e.stage = c.stage;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_acquisition_outreach_sent(
  _signup_id uuid,
  _claim_token uuid,
  _stage text,
  _provider_message_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_row public.pilot_signups%ROWTYPE;
BEGIN
  IF _stage NOT IN ('initial', 'followup') THEN
    RAISE EXCEPTION 'Invalid outreach stage' USING ERRCODE = '22023';
  END IF;

  UPDATE public.pilot_signups
     SET last_contacted_at = now(),
         status = CASE
           WHEN _stage = 'initial' AND status = 'queued_manual_review' THEN 'in_progress'
           ELSE status
         END,
         followup_count = CASE WHEN _stage = 'followup' THEN 1 ELSE followup_count END,
         outreach_claim_token = NULL,
         outreach_claimed_at = NULL,
         outreach_claim_stage = NULL,
         updated_at = now()
   WHERE id = _signup_id
     AND do_not_contact = false
     AND outreach_claim_token = _claim_token
     AND outreach_claim_stage = _stage
     AND (
       (_stage = 'initial' AND last_contacted_at IS NULL)
       OR (
         _stage = 'followup'
         AND last_contacted_at IS NOT NULL
         AND followup_count = 0
         AND reply_detected_at IS NULL
         AND public.business_days_since(last_contacted_at) >= 3
       )
     )
  RETURNING * INTO updated_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead is no longer eligible or claim is stale' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.outreach_events
     SET outcome = 'sent',
         provider_message_id = NULLIF(_provider_message_id, ''),
         sent_at = now(),
         updated_at = now(),
         error_category = NULL
   WHERE lead_id = _signup_id AND stage = _stage;

  RETURN jsonb_build_object(
    'id', updated_row.id,
    'stage', _stage,
    'last_contacted_at', updated_row.last_contacted_at,
    'followup_count', updated_row.followup_count,
    'status', updated_row.status
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.record_acquisition_outreach_failed(
  _signup_id uuid,
  _claim_token uuid,
  _stage text,
  _error_category text DEFAULT 'provider_error'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.pilot_signups
     SET outreach_claim_token = NULL,
         outreach_claimed_at = NULL,
         outreach_claim_stage = NULL,
         updated_at = now()
   WHERE id = _signup_id
     AND outreach_claim_token = _claim_token
     AND outreach_claim_stage = _stage;

  UPDATE public.outreach_events
     SET outcome = CASE WHEN outcome = 'sent' THEN 'sent' ELSE 'failed' END,
         error_category = CASE WHEN outcome = 'sent' THEN error_category ELSE left(COALESCE(_error_category, 'provider_error'), 120) END,
         updated_at = now()
   WHERE lead_id = _signup_id AND stage = _stage;
END;
$$;

CREATE OR REPLACE FUNCTION public.acquisition_outreach_dry_run()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'initial', count(*) FILTER (WHERE s.last_contacted_at IS NULL),
    'followup', count(*) FILTER (
      WHERE s.last_contacted_at IS NOT NULL
        AND s.followup_count = 0
        AND s.reply_detected_at IS NULL
        AND public.business_days_since(s.last_contacted_at) >= 3
    ),
    'total', count(*)
  )
  FROM public.pilot_signups s
  WHERE s.do_not_contact = false
    AND s.email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    AND s.email !~* '(^|[._%+-])(test|testing|fake|spam|noreply|no-reply|donotreply|do-not-reply|postmaster|abuse|asdf|qwerty)([._%+-]|@)'
    AND s.email !~* '@(example|test|invalid|localhost|mailinator|guerrillamail|yopmail|10minutemail|trashmail|sharklasers|tempmail|dispostable|maildrop|getnada)\.'
    AND (
      s.last_contacted_at IS NULL
      OR (
        s.last_contacted_at IS NOT NULL
        AND s.followup_count = 0
        AND s.reply_detected_at IS NULL
        AND public.business_days_since(s.last_contacted_at) >= 3
      )
    );
$$;

REVOKE ALL ON FUNCTION public.claim_acquisition_outreach(integer, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_acquisition_outreach_sent(uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_acquisition_outreach_failed(uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.acquisition_outreach_dry_run() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_acquisition_outreach(integer, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_acquisition_outreach_sent(uuid, uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_acquisition_outreach_failed(uuid, uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.acquisition_outreach_dry_run() TO service_role;

-- Retire the ChatGPT-facing queue interface from ordinary authenticated callers.
REVOKE ALL ON FUNCTION public.acquisition_outreach_queue(integer) FROM authenticated;
REVOKE ALL ON FUNCTION public.mark_acquisition_initial_sent(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.mark_acquisition_followup_sent(uuid) FROM authenticated;
