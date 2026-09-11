# Remediation records

This directory records production failures, owner-control work, and the evidence used to close them.

## Current actionable blocker

The Vercel hourly acquisition cron is registered and reaches the protected worker, but production is missing the worker's four downstream environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `PROVISIONLOOP_OUTREACH_FROM`

A temporary authenticated health probe on 2026-09-11 isolated this exact configuration failure and was removed after diagnosis. `CRON_SECRET` is present and cron authentication succeeds. The missing values must be configured directly in Vercel Production before the acquisition worker can complete successfully.

Do not treat absence of Supabase `pg_cron` jobs as a failure: Vercel Cron is the active scheduler.
