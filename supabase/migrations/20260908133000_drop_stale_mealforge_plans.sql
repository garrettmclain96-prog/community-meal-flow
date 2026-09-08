-- Generated MealForge plans are disposable derived state. Remove pre-current
-- plan shapes or plans whose requested dinner count no longer matches the
-- household so the current deterministic planner rebuilds them on next load.
-- Household profile, pantry, recipes, observations and history are untouched.

DELETE FROM public.meal_plans mp
USING public.households h
WHERE mp.household_id = h.id
  AND h.onboarded = true
  AND coalesce((mp.plan->>'requestedDinners')::int, -1) <> h.dinners_per_week;
