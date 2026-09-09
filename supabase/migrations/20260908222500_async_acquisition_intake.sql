-- Async-first acquisition intake.
-- Public visitors submit through a server function using the service-role client;
-- anonymous database write access is NOT granted here.

ALTER TABLE public.pilot_signups
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.pilot_signups
  ADD COLUMN IF NOT EXISTS organization_name text,
  ADD COLUMN IF NOT EXISTS lead_source text NOT NULL DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS preferred_contact text NOT NULL DEFAULT 'email_only',
  ADD COLUMN IF NOT EXISTS followup_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS do_not_contact boolean NOT NULL DEFAULT false;

ALTER TABLE public.pilot_signups
  DROP CONSTRAINT IF EXISTS pilot_signups_preferred_contact_check;

ALTER TABLE public.pilot_signups
  ADD CONSTRAINT pilot_signups_preferred_contact_check
  CHECK (preferred_contact IN ('email_only', 'text_if_needed', 'call_ok'));

COMMENT ON COLUMN public.pilot_signups.user_id IS
  'Nullable for low-friction public acquisition leads; identity/legal acceptance is required later for protected workflows.';

COMMENT ON COLUMN public.pilot_signups.metadata IS
  'Non-sensitive acquisition context such as role answers and UTM/referrer data; never operator authorization evidence.';
