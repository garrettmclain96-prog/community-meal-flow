-- Directory claims and new registrations must be reviewed by a platform admin
-- before the kitchen can become an approved ProvisionLoop provider.

ALTER TABLE public.kitchen_claims
  ALTER COLUMN status SET DEFAULT 'pending';

CREATE OR REPLACE FUNCTION public.claim_kitchen(
  _kitchen_id uuid,
  _role text DEFAULT NULL,
  _note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _k public.kitchens;
  _claim_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;

  SELECT * INTO _k
  FROM public.kitchens
  WHERE id = _kitchen_id
  FOR UPDATE;

  IF _k.id IS NULL THEN RAISE EXCEPTION 'kitchen not found'; END IF;
  IF _k.claimed OR _k.owner_id IS NOT NULL THEN
    RAISE EXCEPTION 'this kitchen has already been claimed';
  END IF;
  IF EXISTS (SELECT 1 FROM public.kitchens WHERE owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'you already operate a kitchen on ProvisionLoop';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.kitchen_claims
    WHERE kitchen_id = _kitchen_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'this listing already has a claim under review';
  END IF;

  INSERT INTO public.kitchen_claims (
    kitchen_id, user_id, role_at_kitchen, note, status
  ) VALUES (
    _kitchen_id, auth.uid(), NULLIF(_role, ''), NULLIF(_note, ''), 'pending'
  )
  RETURNING id INTO _claim_id;

  RETURN _claim_id;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_kitchen(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_kitchen(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_kitchen_claim(
  _claim_id uuid,
  _approve boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _c public.kitchen_claims;
  _k public.kitchens;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'platform_admin') THEN
    RAISE EXCEPTION 'platform admin required';
  END IF;

  SELECT * INTO _c
  FROM public.kitchen_claims
  WHERE id = _claim_id
  FOR UPDATE;

  IF _c.id IS NULL THEN RAISE EXCEPTION 'claim not found'; END IF;
  IF _c.status <> 'pending' THEN RAISE EXCEPTION 'claim already reviewed'; END IF;

  SELECT * INTO _k
  FROM public.kitchens
  WHERE id = _c.kitchen_id
  FOR UPDATE;

  IF _k.id IS NULL THEN RAISE EXCEPTION 'kitchen not found'; END IF;

  IF _approve THEN
    IF _k.claimed OR _k.owner_id IS NOT NULL THEN
      RAISE EXCEPTION 'kitchen already claimed';
    END IF;
    IF EXISTS (SELECT 1 FROM public.kitchens WHERE owner_id = _c.user_id) THEN
      RAISE EXCEPTION 'claimant already operates a kitchen';
    END IF;

    UPDATE public.kitchens
    SET owner_id = _c.user_id,
        claimed = true,
        claimed_at = now(),
        approved = true,
        active = true
    WHERE id = _c.kitchen_id;

    UPDATE public.kitchen_claims
    SET status = 'approved', updated_at = now()
    WHERE id = _claim_id;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (_c.user_id, 'kitchen')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    UPDATE public.kitchen_claims
    SET status = 'rejected', updated_at = now()
    WHERE id = _claim_id;
  END IF;

  RETURN _c.kitchen_id;
END;
$$;

REVOKE ALL ON FUNCTION public.review_kitchen_claim(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_kitchen_claim(uuid, boolean) TO authenticated;

DROP POLICY IF EXISTS "platform admins read claims" ON public.kitchen_claims;
CREATE POLICY "platform admins read claims"
ON public.kitchen_claims
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'platform_admin'));

CREATE OR REPLACE FUNCTION public.review_kitchen_registration(
  _kitchen_id uuid,
  _approve boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _k public.kitchens;
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

  UPDATE public.kitchens
  SET approved = _approve,
      active = _approve
  WHERE id = _kitchen_id;

  IF _approve THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_k.owner_id, 'kitchen')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN _kitchen_id;
END;
$$;

REVOKE ALL ON FUNCTION public.review_kitchen_registration(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_kitchen_registration(uuid, boolean) TO authenticated;
