# ProvisionLoop owner-control cutover runbook

This runbook is the operational checklist for removing Lovable from the production dependency graph without an outage.

## Phase A — independent build

- [x] Create `de-lovable-control` branch from current production `main`.
- [x] Replace `@lovable.dev/vite-tanstack-config` usage with native TanStack Start + Vite + Nitro configuration.
- [ ] Preview build succeeds on Vercel.
- [ ] Remove Lovable build/auth packages and regenerate lockfiles.
- [ ] Delete `src/integrations/lovable` after all imports are gone.

## Phase B — owner-controlled Supabase

- [ ] Create a new Supabase project in Garrett's chosen organization.
- [ ] Replay every committed `supabase/migrations/*` migration in order.
- [ ] Generate types and compare schema objects to the current production schema.
- [ ] Verify RLS/security advisors with no high-severity unresolved findings.
- [ ] Configure production Site URL and redirect allowlist.
- [ ] Enable Google auth using owner-controlled OAuth credentials.
- [ ] Recreate the `platform_admin` membership only after the target user exists.
- [ ] Export/import production data after schema parity checks.

## Phase C — direct services

- [ ] Replace Lovable Stripe gateway with direct Stripe SDK calls to `api.stripe.com`.
- [ ] Use owner-controlled Stripe test secret and webhook secret in Vercel server environment.
- [ ] Keep production payments in test mode until end-to-end checkout/webhook tests pass.
- [ ] Verify `provisionloop.org` in Resend.
- [ ] Rotate the exposed Resend key and install a new send-only key as a server secret.
- [ ] Route production outreach and transactional mail directly through Resend.

## Phase D — scheduling

- [ ] Remove `LOVABLE_CRON_SECRET` and generated cron-auth dependency.
- [ ] Use owner-controlled `CRON_SECRET` for authenticated Vercel cron requests, or move worker execution to a Supabase Edge Function protected by a server secret.
- [ ] Prove one manual worker run and one scheduled run complete with a 2xx status and persisted result.

## Phase E — cutover

- [ ] Back up the current production database immediately before cutover.
- [ ] Put write-sensitive operations into a short maintenance window if required.
- [ ] Perform final delta data migration.
- [ ] Change Vercel Supabase environment variables to the owner-controlled project.
- [ ] Deploy production.
- [ ] Test `/`, `/auth`, Google OAuth, MealForge read/write, owner God Mode, public impact data, kitchen flow, sandbox checkout, webhook, Resend, and acquisition worker.
- [ ] Monitor production runtime errors and 5xx for at least one full worker cycle.

## Phase F — severance

- [ ] Remove all `LOVABLE_*` environment variables.
- [ ] Confirm `rg -i "lovable" src package.json vite.config.ts` has no runtime dependency references.
- [ ] Remove or archive `.lovable` planning artifacts if no longer useful.
- [ ] Disconnect Lovable only after all exit criteria in ADR 0005 pass.

## Rollback rule

Do not destroy or mutate the old backend during migration. If a cutover smoke test fails, restore the previous Vercel environment-variable set and redeploy the last known-good production commit while the replacement is fixed off-path.
