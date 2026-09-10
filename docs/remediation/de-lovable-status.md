# De-Lovable remediation status

Updated: 2026-09-10
Branch: `de-lovable-control`
PR: #24

## Completed on migration branch

- Native TanStack Start + Vite + Nitro build replaces Lovable build wrapper.
- Vercel preview builds are green without Lovable build config.
- Google auth path uses native Supabase OAuth instead of Lovable `~oauth` routes.
- Acquisition worker uses owner-controlled `CRON_SECRET` only.
- Stripe server client talks directly to Stripe instead of `connector-gateway.lovable.dev`.
- God Mode health no longer checks a Lovable gateway credential.
- `@lovable.dev/cloud-auth-js` and `@lovable.dev/vite-tanstack-config` removed from `package.json`.
- `src/integrations/lovable/index.ts` removed.
- Production remains untouched while migration is validated.

## Remaining hard dependencies before cutover

1. ProvisionLoop production database/auth still lives in the Lovable-managed Supabase project.
2. Owner-controlled Supabase project must be created and migrations replayed.
3. Production data must be migrated with RLS/security verification.
4. Google provider + redirect allowlist must be configured in the owner-controlled Supabase project.
5. Direct Stripe test/live secrets and webhook secrets must be installed in Vercel.
6. Resend DKIM is still pending; SPF MX and TXT are verified.
7. The previously exposed Resend API key must be revoked and replaced with a fresh send-only key before production outreach is enabled.
8. Owner-controlled `CRON_SECRET` must be installed in Vercel and scheduled worker invocation configured.
9. Lockfiles and stale documentation should be regenerated/cleaned after dependency cutover.
10. Full smoke test and production cutover must pass before Lovable is disconnected.

## Cutover invariant

Lovable is not removed from the old production backend until the replacement stack passes end-to-end validation. Rollback is always the previous Vercel env set + last known-good production commit.
