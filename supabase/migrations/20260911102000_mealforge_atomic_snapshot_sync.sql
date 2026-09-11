-- Make MealForge household persistence atomic. The previous client flow updated
-- the household and then independently deleted/reinserted each child collection;
-- a failed request in the middle could leave a partially erased cloud snapshot.
--
-- This RPC remains SECURITY INVOKER so existing RLS policies are the authority.
-- The explicit ownership check gives callers a clear failure before any mutation.

CREATE OR REPLACE FUNCTION public.sync_mealforge_snapshot(
  _household_id uuid,
  _snapshot jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _household jsonb;
  _plan jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT public.owns_household(_household_id) THEN
    RAISE EXCEPTION 'household access denied' USING ERRCODE = '42501';
  END IF;

  IF _snapshot IS NULL
     OR jsonb_typeof(_snapshot) <> 'object'
     OR NOT (_snapshot ? 'household')
     OR NOT (_snapshot ? 'pantry')
     OR NOT (_snapshot ? 'recipes')
     OR NOT (_snapshot ? 'observations')
     OR NOT (_snapshot ? 'checked') THEN
    RAISE EXCEPTION 'invalid MealForge snapshot' USING ERRCODE = '22023';
  END IF;

  _household := _snapshot -> 'household';
  _plan := _snapshot -> 'plan';

  IF jsonb_typeof(_household) <> 'object'
     OR jsonb_typeof(COALESCE(_household -> 'members', '[]'::jsonb)) <> 'array'
     OR jsonb_typeof(_snapshot -> 'pantry') <> 'array'
     OR jsonb_typeof(_snapshot -> 'recipes') <> 'array'
     OR jsonb_typeof(_snapshot -> 'observations') <> 'array'
     OR jsonb_typeof(_snapshot -> 'checked') <> 'array' THEN
    RAISE EXCEPTION 'invalid MealForge snapshot shape' USING ERRCODE = '22023';
  END IF;

  UPDATE public.households
  SET
    name = COALESCE(NULLIF(_household ->> 'name', ''), name),
    weekly_budget = COALESCE((_household ->> 'weeklyBudget')::numeric, weekly_budget),
    dinners_per_week = COALESCE((_household ->> 'dinnersPerWeek')::integer, dinners_per_week),
    max_cook_minutes = COALESCE((_household ->> 'maxCookMinutes')::integer, max_cook_minutes),
    store_ids = ARRAY(
      SELECT jsonb_array_elements_text(COALESCE(_household -> 'storeIds', '[]'::jsonb))
    ),
    equipment = ARRAY(
      SELECT jsonb_array_elements_text(COALESCE(_household -> 'equipment', '[]'::jsonb))
    ),
    dietary_preferences = ARRAY(
      SELECT jsonb_array_elements_text(COALESCE(_household -> 'dietaryPreferences', '[]'::jsonb))
    ),
    avoid_tags = ARRAY(
      SELECT jsonb_array_elements_text(COALESCE(_household -> 'avoidTags', '[]'::jsonb))
    ),
    allergies = ARRAY(
      SELECT jsonb_array_elements_text(COALESCE(_household -> 'allergies', '[]'::jsonb))
    ),
    onboarded = COALESCE((_snapshot ->> 'onboarded')::boolean, onboarded),
    updated_at = now()
  WHERE id = _household_id;

  DELETE FROM public.household_members WHERE household_id = _household_id;
  INSERT INTO public.household_members (household_id, name, age_group, appetite)
  SELECT
    _household_id,
    member ->> 'name',
    COALESCE(NULLIF(member ->> 'ageGroup', ''), 'adult'),
    COALESCE((member ->> 'appetite')::numeric, 1)
  FROM jsonb_array_elements(COALESCE(_household -> 'members', '[]'::jsonb)) AS member
  WHERE NULLIF(member ->> 'name', '') IS NOT NULL;

  DELETE FROM public.pantry_items WHERE household_id = _household_id;
  INSERT INTO public.pantry_items (
    household_id,
    ingredient_id,
    amount,
    unit,
    origin,
    added_at,
    expires_at
  )
  SELECT
    _household_id,
    item ->> 'ingredientId',
    COALESCE((item -> 'quantity' ->> 'amount')::numeric, 0),
    item -> 'quantity' ->> 'unit',
    COALESCE(NULLIF(item ->> 'origin', ''), 'manual'),
    COALESCE(NULLIF(item ->> 'addedAt', '')::timestamptz, now()),
    NULLIF(item ->> 'expiresAt', '')::timestamptz
  FROM jsonb_array_elements(_snapshot -> 'pantry') AS item
  WHERE NULLIF(item ->> 'ingredientId', '') IS NOT NULL
    AND NULLIF(item -> 'quantity' ->> 'unit', '') IS NOT NULL;

  DELETE FROM public.recipes WHERE household_id = _household_id;
  INSERT INTO public.recipes (
    household_id,
    slug,
    title,
    servings,
    total_time_minutes,
    steps,
    ingredients,
    tags,
    equipment,
    source
  )
  SELECT
    _household_id,
    recipe ->> 'id',
    recipe ->> 'title',
    COALESCE((recipe ->> 'servings')::integer, 4),
    COALESCE((recipe ->> 'totalTimeMinutes')::integer, 30),
    COALESCE(recipe -> 'steps', '[]'::jsonb),
    COALESCE(recipe -> 'ingredients', '[]'::jsonb),
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(recipe -> 'tags', '[]'::jsonb))),
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(recipe -> 'equipment', '[]'::jsonb))),
    COALESCE(recipe -> 'source', '{}'::jsonb)
  FROM jsonb_array_elements(_snapshot -> 'recipes') AS recipe
  WHERE NULLIF(recipe ->> 'id', '') IS NOT NULL
    AND NULLIF(recipe ->> 'title', '') IS NOT NULL;

  DELETE FROM public.price_observations WHERE household_id = _household_id;
  INSERT INTO public.price_observations (
    household_id,
    ingredient_id,
    store_id,
    package_label,
    price,
    observed_at
  )
  SELECT
    _household_id,
    observation ->> 'ingredientId',
    observation ->> 'storeId',
    NULLIF(observation ->> 'packageLabel', ''),
    (observation ->> 'price')::numeric,
    COALESCE(NULLIF(observation ->> 'observedAt', '')::timestamptz, now())
  FROM jsonb_array_elements(_snapshot -> 'observations') AS observation
  WHERE NULLIF(observation ->> 'ingredientId', '') IS NOT NULL
    AND NULLIF(observation ->> 'storeId', '') IS NOT NULL
    AND NULLIF(observation ->> 'price', '') IS NOT NULL;

  DELETE FROM public.meal_plans WHERE household_id = _household_id;
  IF _plan IS NOT NULL AND jsonb_typeof(_plan) = 'object' THEN
    INSERT INTO public.meal_plans (household_id, plan, checked)
    VALUES (
      _household_id,
      _plan,
      ARRAY(SELECT jsonb_array_elements_text(_snapshot -> 'checked'))
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_mealforge_snapshot(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_mealforge_snapshot(uuid, jsonb) TO authenticated;
