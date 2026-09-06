-- Run with an authorized database session for ProvisionLoop only.
-- Read-only inventory; inspect definitions and identities before proposing ALTERs.
SELECT p.oid::regprocedure AS signature, p.prosecdef AS security_definer,
       p.proconfig, pg_get_functiondef(p.oid) AS definition
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prosecdef
ORDER BY p.oid::regprocedure::text;

-- Missing pinned paths. Compare this output with the security advisor report.
SELECT p.oid::regprocedure AS signature
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prosecdef
  AND NOT EXISTS (
    SELECT 1 FROM unnest(coalesce(p.proconfig, ARRAY[]::text[])) setting
    WHERE setting LIKE 'search_path=%'
  );

-- Role grant template, deliberately commented out until sign-in email is confirmed.
-- Replace CONFIRMED_ACCOUNT_EMAIL with Garrett's confirmed sign-in email.
-- First resolve exactly one account; zero or multiple results is a blocker.
-- SELECT id, email FROM auth.users
-- WHERE lower(email) = lower('CONFIRMED_ACCOUNT_EMAIL');
-- BEGIN;
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'platform_admin'::public.app_role FROM auth.users
-- WHERE lower(email) = lower('CONFIRMED_ACCOUNT_EMAIL')
-- ON CONFLICT (user_id, role) DO NOTHING;
-- SELECT u.id, public.has_role(u.id, 'platform_admin'::public.app_role) AS is_admin
-- FROM auth.users u WHERE lower(u.email) = lower('CONFIRMED_ACCOUNT_EMAIL');
-- COMMIT;
