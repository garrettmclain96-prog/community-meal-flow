-- Public civic reporting must expose aggregate proof, not raw impact ledger rows.
-- Test-kitchen data remains separated and only aggregate sandbox counts are
-- returned for transparency.

CREATE OR REPLACE FUNCTION public.get_public_civic_snapshot(_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH params AS (
  SELECT CASE WHEN _days IN (7, 30, 90) THEN _days ELSE 30 END AS days,
         now() - make_interval(days => CASE WHEN _days IN (7, 30, 90) THEN _days ELSE 30 END) AS since_at
),
real_kitchens AS (
  SELECT id, name, kind, city, neighborhood, address, latitude, longitude,
         daily_capacity_meals, cost_per_meal, claimed, payout_status, website, summary
  FROM public.kitchens
  WHERE approved = true AND active = true AND is_test = false
),
test_kitchens AS (
  SELECT id, daily_capacity_meals
  FROM public.kitchens
  WHERE approved = true AND active = true AND is_test = true
),
real_events AS (
  SELECT e.kind, e.meals, e.occurred_at,
         coalesce(e.neighborhood, k.neighborhood, k.city, 'Unassigned') AS area
  FROM public.impact_events e
  JOIN public.kitchens k ON k.id = e.kitchen_id
  CROSS JOIN params p
  WHERE e.occurred_at >= p.since_at
    AND k.is_test = false
),
test_events AS (
  SELECT e.id
  FROM public.impact_events e
  JOIN public.kitchens k ON k.id = e.kitchen_id
  CROSS JOIN params p
  WHERE e.occurred_at >= p.since_at
    AND k.is_test = true
),
real_shifts AS (
  SELECT s.id,
         coalesce(s.neighborhood, k.neighborhood, k.city) AS area
  FROM public.volunteer_shifts s
  LEFT JOIN public.kitchens k ON k.id = s.kitchen_id
  CROSS JOIN params p
  WHERE s.starts_at >= p.since_at
    AND (s.kitchen_id IS NULL OR coalesce(k.is_test, false) = false)
),
areas AS (
  SELECT coalesce(neighborhood, city) AS area FROM real_kitchens
  UNION
  SELECT area FROM real_events
  UNION
  SELECT area FROM real_shifts WHERE area IS NOT NULL
),
raw_rows AS (
  SELECT a.area,
         (SELECT count(*)::int FROM real_kitchens k WHERE coalesce(k.neighborhood, k.city) = a.area) AS kitchens,
         (SELECT coalesce(sum(k.daily_capacity_meals * 7), 0)::int FROM real_kitchens k WHERE coalesce(k.neighborhood, k.city) = a.area) AS capacity_per_week,
         (SELECT coalesce(sum(e.meals), 0)::int FROM real_events e WHERE e.area = a.area AND e.kind = 'funded') AS funded,
         (SELECT coalesce(sum(e.meals), 0)::int FROM real_events e WHERE e.area = a.area AND e.kind = 'delivered') AS delivered,
         (SELECT count(*)::int FROM real_shifts s WHERE s.area = a.area) AS shifts,
         (SELECT coalesce(max(k.cost_per_meal), 6.5)::numeric FROM real_kitchens k WHERE coalesce(k.neighborhood, k.city) = a.area) AS posted_cost
  FROM areas a
),
derived AS (
  SELECT area,
         kitchens,
         capacity_per_week,
         funded,
         delivered,
         greatest(0, funded - delivered) AS awaiting,
         greatest(0, capacity_per_week - funded) AS unmet,
         CASE WHEN capacity_per_week > 0
           THEN least(1::numeric, funded::numeric / capacity_per_week::numeric)
           ELSE 0::numeric
         END AS coverage,
         shifts,
         round(funded * posted_cost)::int AS dollars,
         (greatest(funded, delivered) > 0 AND greatest(funded, delivered) < 5) AS impact_suppressed
  FROM raw_rows
),
visible_rows AS (
  SELECT area AS neighborhood,
         CASE WHEN impact_suppressed THEN 0 ELSE funded END AS funded,
         CASE WHEN impact_suppressed THEN 0 ELSE delivered END AS delivered,
         CASE WHEN impact_suppressed THEN 0 ELSE awaiting END AS awaiting,
         capacity_per_week,
         kitchens,
         unmet,
         CASE WHEN impact_suppressed THEN 0::numeric ELSE coverage END AS coverage,
         shifts,
         CASE WHEN impact_suppressed THEN 0 ELSE dollars END AS dollars,
         impact_suppressed
  FROM derived
),
trend_raw AS (
  SELECT e.occurred_at::date AS day,
         coalesce(sum(e.meals) FILTER (WHERE e.kind = 'funded'), 0)::int AS funded,
         coalesce(sum(e.meals) FILTER (WHERE e.kind = 'delivered'), 0)::int AS delivered
  FROM real_events e
  GROUP BY e.occurred_at::date
),
trend AS (
  SELECT day, funded, delivered
  FROM trend_raw
  WHERE greatest(funded, delivered) >= 5
),
result AS (
  SELECT jsonb_build_object(
    'window', p.days,
    'city', coalesce((SELECT city FROM real_kitchens ORDER BY name LIMIT 1), 'Galveston'),
    'rows', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'neighborhood', r.neighborhood,
        'funded', r.funded,
        'delivered', r.delivered,
        'awaiting', r.awaiting,
        'capacityPerWeek', r.capacity_per_week,
        'kitchens', r.kitchens,
        'unmet', r.unmet,
        'coverage', r.coverage,
        'shifts', r.shifts,
        'dollars', r.dollars,
        'impactSuppressed', r.impact_suppressed
      ) ORDER BY r.unmet DESC, r.funded DESC)
      FROM visible_rows r
    ), '[]'::jsonb),
    'totals', jsonb_build_object(
      'funded', coalesce((SELECT sum(funded)::int FROM visible_rows), 0),
      'delivered', coalesce((SELECT sum(delivered)::int FROM visible_rows), 0),
      'awaiting', coalesce((SELECT sum(awaiting)::int FROM visible_rows), 0),
      'capacityPerWeek', coalesce((SELECT sum(capacity_per_week)::int FROM visible_rows), 0),
      'kitchens', (SELECT count(*)::int FROM real_kitchens),
      'unclaimed', (SELECT count(*)::int FROM real_kitchens WHERE claimed = false),
      'shifts', coalesce((SELECT sum(shifts)::int FROM visible_rows), 0),
      'dollars', coalesce((SELECT sum(dollars)::int FROM visible_rows), 0)
    ),
    'test', jsonb_build_object(
      'kitchens', (SELECT count(*)::int FROM test_kitchens),
      'capacityPerWeek', coalesce((SELECT sum(daily_capacity_meals * 7)::int FROM test_kitchens), 0),
      'events', (SELECT count(*)::int FROM test_events)
    ),
    'trend', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'date', to_char(t.day, 'YYYY-MM-DD'),
        'funded', t.funded,
        'delivered', t.delivered
      ) ORDER BY t.day)
      FROM trend t
    ), '[]'::jsonb),
    'kitchens', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', k.id,
        'name', k.name,
        'kind', k.kind,
        'city', k.city,
        'neighborhood', k.neighborhood,
        'address', k.address,
        'latitude', k.latitude,
        'longitude', k.longitude,
        'daily_capacity_meals', k.daily_capacity_meals,
        'cost_per_meal', k.cost_per_meal,
        'is_test', false,
        'claimed', k.claimed,
        'payout_status', k.payout_status,
        'website', k.website,
        'summary', k.summary
      ) ORDER BY k.name)
      FROM real_kitchens k
    ), '[]'::jsonb),
    'suppressed', (SELECT count(*)::int FROM visible_rows WHERE impact_suppressed)
  ) AS payload
  FROM params p
)
SELECT payload FROM result;
$$;

REVOKE ALL ON FUNCTION public.get_public_civic_snapshot(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_civic_snapshot(integer)
  TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "impact events are public" ON public.impact_events;
REVOKE SELECT ON TABLE public.impact_events FROM anon, authenticated;
