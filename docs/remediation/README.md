# Remediation records

This directory records production failures, owner-control work, and the evidence used to close them.

## Current actionable blocker

The Vercel hourly acquisition cron is registered and reaches the protected worker. A temporary authenticated production health probe on 2026-09-11 proved cron authentication works and isolated missing downstream runtime configuration.

The worker now has safe code defaults for the public Supabase project URL and the verified ProvisionLoop sender address, so only two server secrets remain required in Vercel Production:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

`CRON_SECRET` is already present and cron authentication succeeds. The two remaining secrets must be configured directly in Vercel Production before the acquisition worker can complete successfully.

Do not put either secret in GitHub, public source files, or chat. Do not treat absence of Supabase `pg_cron` jobs as a failure: Vercel Cron is the active scheduler.
