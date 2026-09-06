-- A self-registered kitchen is owned by its applicant before review so the
-- applicant can see the pending record. Operational child resources must not
-- become public or writable until the provider is actually approved.

CREATE OR REPLACE FUNCTION public.operates_approved_kitchen(_kitchen_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.kitchens k
    WHERE k.id = _kitchen_id
      AND k.owner_id = auth.uid()
      AND k.approved = true
      AND k.active = true
      AND k.claimed = true
  );
$$;

REVOKE ALL ON FUNCTION public.operates_approved_kitchen(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.operates_approved_kitchen(uuid) TO authenticated, service_role;

-- Existing listing claims already set claimed=true on approval. New
-- registrations must do the same or they can never pass the funding gate.
CREATE OR REPLACE FUNCTION public.review_kitchen_registration(
  _kitchen_id uuid,
  _approve boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _k public.kitchens;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'platform_admin') THEN
    RAISE EXCEPTION 'platform admin required';
  END IF;

  SELECT * INTO _k
  FROM public.kitchens
  WHERE id = _kitchen_id
  FOR UPDATE;

  IF _k.id IS NULL OR _k.owner_id IS NULL THEN
    RAISE EXCEPTION 'registration not found';
  END IF;

  IF _approve THEN
    UPDATE public.kitchens
    SET approved = true,
        active = true,
        claimed = true,
        claimed_at = coalesce(claimed_at, now())
    WHERE id = _kitchen_id;

    INSERT INTO public.user_roles(user_id, role)
    VALUES(_k.owner_id, 'kitchen')
    ON CONFLICT(user_id, role) DO NOTHING;
  ELSE
    -- A rejected self-registration is retained for audit but no longer belongs
    -- to the applicant and cannot surface as an operational/public provider.
    UPDATE public.kitchens
    SET approved = false,
        active = false,
        claimed = false,
        claimed_at = NULL,
        owner_id = NULL
    WHERE id = _kitchen_id;
  END IF;

  RETURN _kitchen_id;
END;
$$;

DROP POLICY IF EXISTS "kitchen owners manage templates" ON public.meal_templates;
CREATE POLICY "approved kitchen owners manage templates"
ON public.meal_templates
FOR ALL
TO authenticated
USING (public.operates_approved_kitchen(kitchen_id))
WITH CHECK (public.operates_approved_kitchen(kitchen_id));

DROP POLICY IF EXISTS "active templates are public" ON public.meal_templates;
CREATE POLICY "approved active templates are public"
ON public.meal_templates
FOR SELECT
TO public
USING (
  active
  AND EXISTS (
    SELECT 1 FROM public.kitchens k
    WHERE k.id = meal_templates.kitchen_id
      AND k.approved = true
      AND k.active = true
      AND k.claimed = true
  )
);

DROP POLICY IF EXISTS "kitchen owners manage shifts" ON public.volunteer_shifts;
CREATE POLICY "approved kitchen owners manage shifts"
ON public.volunteer_shifts
FOR ALL
TO authenticated
USING (public.operates_approved_kitchen(kitchen_id))
WITH CHECK (public.operates_approved_kitchen(kitchen_id));

DROP POLICY IF EXISTS "shifts are public" ON public.volunteer_shifts;
CREATE POLICY "approved kitchen shifts are public"
ON public.volunteer_shifts
FOR SELECT
TO public
USING (
  kitchen_id IS NULL
  OR EXISTS (
    SELECT 1 FROM public.kitchens k
    WHERE k.id = volunteer_shifts.kitchen_id
      AND k.approved = true
      AND k.active = true
      AND k.claimed = true
  )
);
