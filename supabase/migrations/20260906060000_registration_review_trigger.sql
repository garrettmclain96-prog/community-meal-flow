-- Frontend flags are not trusted for provider approval. Any signed-in,
-- non-admin user registering their own kitchen is forced into private review.

CREATE OR REPLACE FUNCTION public.enforce_kitchen_registration_review()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NEW.owner_id = auth.uid()
     AND NOT public.has_role(auth.uid(), 'platform_admin') THEN
    NEW.approved := false;
    NEW.active := false;
    NEW.payout_status := 'not_started';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kitchens_registration_review_gate ON public.kitchens;
CREATE TRIGGER kitchens_registration_review_gate
BEFORE INSERT ON public.kitchens
FOR EACH ROW
EXECUTE FUNCTION public.enforce_kitchen_registration_review();

REVOKE ALL ON FUNCTION public.enforce_kitchen_registration_review() FROM PUBLIC, anon, authenticated;
