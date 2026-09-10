-- Supabase security advisor hardening.
-- These SECURITY DEFINER functions are internal/authenticated helpers. They were
-- not intended to be directly callable by anonymous PostgREST clients.
--
-- Intentionally public SECURITY DEFINER RPCs are NOT changed here:
-- - submit_public_pilot_lead(...)
-- - submit_assistance_request(...)
-- - get_public_civic_snapshot(integer)
-- - get_public_impact_snapshot()

REVOKE EXECUTE ON FUNCTION public.apply_for_kitchen_support(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.enforce_kitchen_registration_trust() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_god_mode_snapshot_data() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_my_kitchen_support(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_my_partner_workspace() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_approved_partner_member(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.suggest_kitchen_for_area(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_partner_referral(uuid, text, timestamptz, text, integer) FROM anon;
