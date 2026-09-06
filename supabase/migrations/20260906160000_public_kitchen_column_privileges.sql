-- Public kitchen directory reads are intentionally column-scoped.
-- Anonymous callers must never be able to read operator ownership or payout
-- identifiers from the raw kitchens table, even if they bypass the UI.

REVOKE ALL PRIVILEGES ON TABLE public.kitchens FROM anon;

GRANT SELECT (
  id,
  name,
  kind,
  city,
  neighborhood,
  daily_capacity_meals,
  cost_per_meal,
  approved,
  active,
  created_at,
  payout_status,
  kind_detail,
  address,
  postal_code,
  latitude,
  longitude,
  website,
  summary,
  claimed,
  source,
  is_test
) ON TABLE public.kitchens TO anon;
