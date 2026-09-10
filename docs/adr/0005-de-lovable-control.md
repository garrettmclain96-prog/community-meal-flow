# ADR 0005 — Remove Lovable as a ProvisionLoop runtime dependency

Status: in progress
Date: 2026-09-10

## Decision

ProvisionLoop will be operated as a platform fully controlled by the repository owner. Production must not require Lovable-hosted OAuth routes, connector gateways, managed cron secrets, generated build wrappers, or a Lovable-owned database project.

Target stack:

- GitHub `main` is the source of truth.
- Vercel hosts the TanStack Start application.
- Supabase is owned directly by Garrett and provides Postgres, Auth, Storage, RLS, RPCs, and Edge Functions.
- Stripe is called directly with owner-controlled API keys and webhook secrets.
- Resend is called directly with owner-controlled send-only credentials.
- Scheduled work uses owner-controlled Vercel Cron and/or Supabase pg_cron/Edge Functions.
- Production monitoring is based on Vercel runtime logs plus explicit health checks.

## Current Lovable coupling discovered

1. `@lovable.dev/vite-tanstack-config` controls the Vite build.
2. `@lovable.dev/cloud-auth-js` and `src/integrations/lovable` implement OAuth.
3. `src/lib/stripe.server.ts` proxies Stripe traffic through `connector-gateway.lovable.dev/stripe` and requires `LOVABLE_API_KEY`.
4. Cron authorization accepts `LOVABLE_CRON_SECRET` and generated `authenticateCronRequest` logic.
5. The current ProvisionLoop database is Lovable-managed rather than present in Garrett's directly connected Supabase organization.
6. Documentation and health checks still describe or test Lovable-specific state.

## Migration rules

- Never cut production over until the replacement passes build, auth, data-integrity, RLS, payment-sandbox, email, and cron smoke tests.
- Never copy privileged database credentials into browser-visible variables.
- Migrations are replayed into the owner-controlled Supabase project and verified before data cutover.
- Current production data is exported/imported only after schema parity is proven.
- OAuth redirect URLs explicitly include `https://provisionloop.org/auth` and production site URL.
- Stripe remains test-mode until direct Stripe wiring and webhook verification are proven.
- Existing Lovable-specific code may remain temporarily on the migration branch only where required to preserve compatibility during cutover.

## Exit criteria

Lovable can be disconnected without affecting build, deploy, authentication, database access, payments, email, scheduled workers, monitoring, or administrative access.
