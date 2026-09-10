# Fix the hourly outreach job without handing out database keys

## What is actually broken

The hourly job lives at `/api/internal/acquisition-worker`. It is scheduled by Vercel, but the Vercel deployment has no database credentials, so the job stops immediately and answers 503 every hour. Nothing is sent, and no lead rows change.

The Lovable-hosted deployment of the same app already has those database credentials injected automatically. So the safe fix is to run the job where the credentials already exist, and to schedule it from the database itself — instead of copying the privileged database key into Vercel.

Verified before writing this plan:

- `vercel.json` schedules `/api/internal/acquisition-worker` hourly.
- The route requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `PROVISIONLOOP_OUTREACH_FROM`, and `CRON_SECRET`, and fails closed when any is missing.
- The project currently has only three stored secrets (the Lovable key and two sandbox payment secrets). `RESEND_API_KEY`, `PROVISIONLOOP_OUTREACH_FROM` and the cron secret are not stored here yet.
- The scheduling extensions (`pg_cron`, `pg_net`) are not yet enabled on this database.

## The fix

1. Move the worker to a callable endpoint on the Lovable deployment: `src/routes/api/public/hooks/acquisition-worker.ts`. The logic, email text, idempotency key, claim RPC, and success/failure recording stay byte-for-byte the same — only the file location and the caller check change.
2. Authorise the caller with the platform's managed cron authentication (`authenticateCronRequest`), and keep accepting the existing `CRON_SECRET` bearer token as a fallback so nothing breaks during the switchover. Unauthorised callers still get 401; the endpoint remains unlisted and unindexed.
3. Keep `/api/internal/acquisition-worker` as a thin forwarder to the shared handler for one release, then remove it.
4. Enable the database scheduling extensions and register an hourly job that calls the stable Lovable production URL with the cron bearer token. Remove the `crons` block from `vercel.json` so the two schedules cannot double-fire.
5. Keep the `?dry_run=1` behaviour: counts only, sends nothing.

Everything else — three-business-day follow-up rule, single follow-up, opt-out and reply suppression, claim tokens, per-lead idempotency keys, audit rows — is untouched.

## What you need to provide

Email sending still needs real credentials. In Project Settings → Secrets, add:

- `RESEND_API_KEY` — from your Resend account.
- `PROVISIONLOOP_OUTREACH_FROM` — the verified sender address on your Resend domain.
- `PROVISIONLOOP_REPLY_TO` — optional.

Until those exist the job stays deliberately inert: it returns "not configured" and sends nothing. I will not invent a sender address.

## Can Lovable do this end to end?

Yes, except the two Resend values above, which only you can obtain. I can move the route, enable the scheduling extensions, register the hourly job, drop the Vercel schedule, update the tests and the acquisition doc, and confirm with a dry run that the job authenticates and reports eligible counts. Live sending starts only once the Resend secrets are in place. No database key is ever exposed to the browser, and no access rule is relaxed.

## Technical notes

- New file `src/routes/api/public/hooks/acquisition-worker.ts`; shared logic extracted to a server-only module so both paths call one implementation.
- Auth order: `authenticateCronRequest` (managed `LOVABLE_CRON_SECRET`), else bearer `CRON_SECRET` when set; otherwise 401.
- Schedule via `cron.schedule('provisionloop-acquisition-hourly', '0 * * * *', ...)` using `net.http_post` against `https://project--e0310514-f821-4056-88a3-79f62361f397.lovable.app/api/public/hooks/acquisition-worker` with an empty JSON body, matching the handler.
- The schedule statement is run as data (it embeds a secret), not as a migration.
- `tests/acquisition-worker.test.mjs` updated to assert the new location and the dual auth check; `docs/acquisition/ASYNC_ACQUISITION.md` architecture section rewritten to describe the database-scheduled flow.
- Verification: format, typecheck, lint, tests, build, plus an authorised dry-run call.
