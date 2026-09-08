-- ProvisionLoop provider trust hardening.
-- Applied to the Lovable-managed production database on 2026-09-08 before
-- being recorded here so GitHub main remains the durable source of truth.

ALTER TABLE public.kitchen_claims
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

CREATE TABLE IF NOT EXISTS public.operator_authority_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type text NOT NULL CHECK (subject_type IN ('claim','registration')),
  claim_id uuid REFERENCES public.kitchen_claims(id) ON DELETE CASCADE,
  kitchen_id uuid NOT NULL REFERENCES public.kitchens(id) ON DELETE CASCADE,
  verification_method text NOT NULL CHECK (length(trim(verification_method)) >= 3),
  verification_note text NOT NULL CHECK (length(trim(verification_note)) >= 12),
  verified_by uuid NOT NULL,
  verified_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (subject_type = 'claim' AND claim_id IS NOT NULL)
    OR (subject_type = 'registration' AND claim_id IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS operator_authority_claim_once
  ON public.operator_authority_verifications(claim_id)
  WHERE subject_type = 'claim';

CREATE UNIQUE INDEX IF NOT EXISTS operator_authority_registration_once
  ON public.operator_authority_verifications(kitchen_id)
  WHERE subject_type = 'registration';

ALTER TABLE public.operator_authority_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform admins read authority evidence"
  ON public.operator_authority_verifications;
CREATE POLICY "platform admins read authority evidence"
ON public.operator_authority_verifications
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'platform_admin'));

DROP POLICY IF EXISTS "platform admins insert authority evidence"
  ON public.operator_authority_verifications;
CREATE POLICY "platform admins insert authority evidence"
ON public.operator_authority_verifications
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'platform_admin')
  AND verified_by = auth.uid()
);

REVOKE ALL ON TABLE public.operator_authority_verifications FROM PUBLIC, anon;
GRANT SELECT, INSERT ON TABLE public.operator_authority_verifications TO authenticated;

-- Client-side agreement gates remain for UX, but this trigger is the durable
-- database boundary. It also prevents an owner from self-approving or changing
-- trust flags after a pending self-registration is created.
CREATE OR REPLACE FUNCTION public.enforce_kitchen_registration_trust()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.source = 'self_registered' AND NEW.owner_id IS NOT NULL THEN
    IF auth.uid() IS NULL OR NEW.owner_id <> auth.uid() THEN
      RAISE EXCEPTION 'self-registration must belong to the signed-in operator';
    END IF;

    PERFORM public.require_legal_acceptance('terms', '1.0');
    PERFORM public.require_legal_acceptance('privacy', '1.0');
    PERFORM public.require_legal_acceptance('kitchen_agreement', '1.0');

    NEW.approved := false;
    NEW.active := false;
    NEW.claimed := false;
    NEW.claimed_at := NULL;
    NEW.is_test := false;
  END IF;

  IF TG_OP = 'UPDATE'
     AND auth.uid() IS NOT NULL
     AND NOT public.has_role(auth.uid(), 'platform_admin') THEN
    IF NEW.approved IS DISTINCT FROM OLD.approved
       OR NEW.active IS DISTINCT FROM OLD.active
       OR NEW.claimed IS DISTINCT FROM OLD.claimed
       OR NEW.claimed_at IS DISTINCT FROM OLD.claimed_at
       OR NEW.owner_id IS DISTINCT FROM OLD.owner_id
       OR NEW.is_test IS DISTINCT FROM OLD.is_test THEN
      RAISE EXCEPTION 'provider trust fields require platform administrator review';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_kitchen_registration_trust_trigger ON public.kitchens;
CREATE TRIGGER enforce_kitchen_registration_trust_trigger
BEFORE INSERT OR UPDATE ON public.kitchens
FOR EACH ROW EXECUTE FUNCTION public.enforce_kitchen_registration_trust();

CREATE OR REPLACE FUNCTION public.claim_kitchen(
  _kitchen_id uuid,
  _role text DEFAULT NULL,
  _note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _k public.kitchens;
  _claim_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not signed in';
  END IF;

  PERFORM public.require_legal_acceptance('terms', '1.0');
  PERFORM public.require_legal_acceptance('privacy', '1.0');
  PERFORM public.require_legal_acceptance('kitchen_agreement', '1.0');

  SELECT * INTO _k
  FROM public.kitchens
  WHERE id = _kitchen_id
  FOR UPDATE;

  IF _k.id IS NULL THEN
    RAISE EXCEPTION 'kitchen not found';
  END IF;
  IF _k.is_test THEN
    RAISE EXCEPTION 'test kitchens cannot be claimed through the public workflow';
  END IF;
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

  INSERT INTO public.kitchen_claims(
    kitchen_id,
    user_id,
    role_at_kitchen,
    note,
    status
  )
  VALUES(
    _kitchen_id,
    auth.uid(),
    nullif(trim(_role), ''),
    nullif(trim(_note), ''),
    'pending'
  )
  RETURNING id INTO _claim_id;

  RETURN _claim_id;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_kitchen(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_kitchen(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_kitchen_claim(
  _claim_id uuid,
  _approve boolean,
  _verification_method text,
  _verification_note text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  IF _c.id IS NULL THEN
    RAISE EXCEPTION 'claim not found';
  END IF;
  IF _c.status <> 'pending' THEN
    RAISE EXCEPTION 'claim already reviewed';
  END IF;

  SELECT * INTO _k
  FROM public.kitchens
  WHERE id = _c.kitchen_id
  FOR UPDATE;

  IF _k.id IS NULL THEN
    RAISE EXCEPTION 'kitchen not found';
  END IF;

  IF _approve THEN
    IF length(trim(coalesce(_verification_method, ''))) < 3 THEN
      RAISE EXCEPTION 'verification method is required';
    END IF;
    IF length(trim(coalesce(_verification_note, ''))) < 12 THEN
      RAISE EXCEPTION 'verification note must explain what was checked';
    END IF;
    IF _k.claimed OR _k.owner_id IS NOT NULL THEN
      RAISE EXCEPTION 'kitchen already claimed';
    END IF;
    IF EXISTS (SELECT 1 FROM public.kitchens WHERE owner_id = _c.user_id) THEN
      RAISE EXCEPTION 'claimant already operates a kitchen';
    END IF;

    INSERT INTO public.operator_authority_verifications(
      subject_type,
      claim_id,
      kitchen_id,
      verification_method,
      verification_note,
      verified_by
    )
    VALUES(
      'claim',
      _claim_id,
      _c.kitchen_id,
      trim(_verification_method),
      trim(_verification_note),
      auth.uid()
    );

    UPDATE public.kitchens
    SET owner_id = _c.user_id,
        claimed = true,
        claimed_at = now(),
        approved = true,
        active = true
    WHERE id = _c.kitchen_id;

    UPDATE public.kitchen_claims
    SET status = 'approved',
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        updated_at = now()
    WHERE id = _claim_id;

    INSERT INTO public.user_roles(user_id, role)
    VALUES(_c.user_id, 'kitchen')
    ON CONFLICT(user_id, role) DO NOTHING;
  ELSE
    UPDATE public.kitchen_claims
    SET status = 'rejected',
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        updated_at = now()
    WHERE id = _claim_id;
  END IF;

  RETURN _c.kitchen_id;
END;
$$;

REVOKE ALL ON FUNCTION public.review_kitchen_claim(uuid, boolean, text, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_kitchen_claim(uuid, boolean, text, text)
  TO authenticated;

-- Preserve rejection compatibility for callers that still use the historical
-- two-argument signature while making approval impossible without evidence.
CREATE OR REPLACE FUNCTION public.review_kitchen_claim(
  _claim_id uuid,
  _approve boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _approve THEN
    RAISE EXCEPTION 'operator authority verification evidence is required before approval';
  END IF;
  RETURN public.review_kitchen_claim(_claim_id, false, NULL, NULL);
END;
$$;

REVOKE ALL ON FUNCTION public.review_kitchen_claim(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_kitchen_claim(uuid, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_kitchen_registration(
  _kitchen_id uuid,
  _approve boolean,
  _verification_method text,
  _verification_note text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  IF _approve THEN
    IF length(trim(coalesce(_verification_method, ''))) < 3 THEN
      RAISE EXCEPTION 'verification method is required';
    END IF;
    IF length(trim(coalesce(_verification_note, ''))) < 12 THEN
      RAISE EXCEPTION 'verification note must explain what was checked';
    END IF;

    INSERT INTO public.operator_authority_verifications(
      subject_type,
      claim_id,
      kitchen_id,
      verification_method,
      verification_note,
      verified_by
    )
    VALUES(
      'registration',
      NULL,
      _kitchen_id,
      trim(_verification_method),
      trim(_verification_note),
      auth.uid()
    );

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

REVOKE ALL ON FUNCTION public.review_kitchen_registration(uuid, boolean, text, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_kitchen_registration(uuid, boolean, text, text)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.review_kitchen_registration(
  _kitchen_id uuid,
  _approve boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _approve THEN
    RAISE EXCEPTION 'operator authority verification evidence is required before approval';
  END IF;
  RETURN public.review_kitchen_registration(_kitchen_id, false, NULL, NULL);
END;
$$;

REVOKE ALL ON FUNCTION public.review_kitchen_registration(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_kitchen_registration(uuid, boolean) TO authenticated;

-- Public discovery excludes sandbox providers. Admins retain access to pending
-- and test rows for operations review.
DROP POLICY IF EXISTS "approved kitchens are public" ON public.kitchens;
CREATE POLICY "approved kitchens are public"
ON public.kitchens FOR SELECT TO public
USING (approved AND active AND NOT is_test);

DROP POLICY IF EXISTS "platform admins read all kitchens" ON public.kitchens;
CREATE POLICY "platform admins read all kitchens"
ON public.kitchens FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'platform_admin'));

DROP POLICY IF EXISTS "approved active templates are public" ON public.meal_templates;
CREATE POLICY "approved active templates are public"
ON public.meal_templates FOR SELECT TO public
USING (
  active AND EXISTS (
    SELECT 1
    FROM public.kitchens k
    WHERE k.id = meal_templates.kitchen_id
      AND k.approved = true
      AND k.active = true
      AND k.claimed = true
      AND k.is_test = false
  )
);

DROP POLICY IF EXISTS "approved kitchen shifts are public" ON public.volunteer_shifts;
CREATE POLICY "approved kitchen shifts are public"
ON public.volunteer_shifts FOR SELECT TO public
USING (
  kitchen_id IS NULL OR EXISTS (
    SELECT 1
    FROM public.kitchens k
    WHERE k.id = volunteer_shifts.kitchen_id
      AND k.approved = true
      AND k.active = true
      AND k.claimed = true
      AND k.is_test = false
  )
);
