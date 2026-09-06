-- Public impact reporting never needs the internal funded_order UUID. Keep the
-- event facts public while preventing raw order correlation through PostgREST.
REVOKE ALL PRIVILEGES ON TABLE public.impact_events FROM anon;
GRANT SELECT (
  id,
  kitchen_id,
  kind,
  meals,
  neighborhood,
  occurred_at
) ON TABLE public.impact_events TO anon;
