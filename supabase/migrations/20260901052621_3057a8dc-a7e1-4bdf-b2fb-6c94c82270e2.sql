
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.owns_household(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.owns_kitchen(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_household(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_kitchen(uuid) TO authenticated;
