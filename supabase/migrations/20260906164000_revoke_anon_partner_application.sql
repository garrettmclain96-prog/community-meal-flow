-- Partner applications are authenticated, signed operator actions. Anonymous
-- callers do not need EXECUTE even though the RPC also fails closed on auth.
REVOKE EXECUTE ON FUNCTION public.apply_partner_organization(text, text, text, text[]) FROM anon;
