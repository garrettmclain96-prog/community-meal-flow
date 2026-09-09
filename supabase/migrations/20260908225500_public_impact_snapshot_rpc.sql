-- Public all-time impact/provider snapshot without raw ledger access or a
-- Vercel service-role secret. Sandbox kitchens and their events are excluded.

CREATE OR REPLACE FUNCTION public.get_public_impact_snapshot()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH real_kitchens AS (
    SELECT id, approved, active, claimed, payout_status, payout_account_id
    FROM public.kitchens
    WHERE is_test = false
  ),
  real_events AS (
    SELECT e.id, e.kind, e.meals, e.neighborhood, e.occurred_at
    FROM public.impact_events e
    JOIN real_kitchens k ON k.id = e.kitchen_id
  ),
  neighborhood_rows AS (
    SELECT COALESCE(neighborhood, 'Unassigned') AS neighborhood, sum(meals)::int AS meals
    FROM real_events
    WHERE kind = 'funded'
    GROUP BY 1
  ),
  recent_rows AS (
    SELECT id, kind, meals, neighborhood, occurred_at
    FROM real_events
    ORDER BY occurred_at DESC
    LIMIT 12
  )
  SELECT jsonb_build_object(
    'mealsFunded', COALESCE((SELECT sum(meals)::int FROM real_events WHERE kind = 'funded'), 0),
    'mealsDelivered', COALESCE((SELECT sum(meals)::int FROM real_events WHERE kind = 'delivered'), 0),
    'providersMapped', (SELECT count(*)::int FROM real_kitchens WHERE approved = true AND active = true),
    'verifiedOperators', (SELECT count(*)::int FROM real_kitchens WHERE approved = true AND active = true AND claimed = true),
    'fundingEnabledKitchens', (
      SELECT count(*)::int
      FROM real_kitchens
      WHERE approved = true
        AND active = true
        AND claimed = true
        AND payout_status = 'ready'
        AND payout_account_id IS NOT NULL
    ),
    'neighborhoods', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object('neighborhood', neighborhood, 'meals', meals)
        ORDER BY meals DESC
      )
      FROM neighborhood_rows
    ), '[]'::jsonb),
    'recent', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'kind', kind,
          'meals', meals,
          'neighborhood', neighborhood,
          'occurred_at', occurred_at
        ) ORDER BY occurred_at DESC
      )
      FROM recent_rows
    ), '[]'::jsonb)
  );
$$;

REVOKE ALL ON FUNCTION public.get_public_impact_snapshot() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_impact_snapshot() TO anon, authenticated;
