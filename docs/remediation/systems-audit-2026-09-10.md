# Systems Audit — 2026-09-10

This is the remediation ledger for the first cross-system interrogation pass across ProvisionLoop and the surrounding deployment portfolio. It is intended to separate observed facts from assumptions and keep remediation work durable outside chat history.

## Scope

Sources interrogated in this pass:

- GitHub repository state and PR #24
- Vercel project inventory, deployments, grouped runtime errors, and recent request paths
- owner-controlled Supabase project inventory and migration state
- existing ProvisionLoop remediation issue #21
- Todoist execution queue created for owner-control and remediation work

## Severity model

- **P0** — production integrity/security/data-loss risk; act immediately
- **P1** — production workflow is broken or owner control is incomplete
- **P2** — infrastructure drift/duplication that creates operational risk
- **P3** — cleanup/documentation/optimization

## Findings

### SYS-001 — ProvisionLoop acquisition worker is/was silently unhealthy

**Severity:** P1  
**Status:** OPEN / under migration

Vercel grouped 16 runtime errors on `/__server` reporting missing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the legacy production runtime. The acquisition worker was also observed returning HTTP 503 on scheduled invocations while the public site could still return 200.

Existing remediation record: GitHub issue #21.

**Acceptance:** worker dry-run succeeds with owner-controlled server configuration, then at least two consecutive scheduled runs complete without 5xx.

### SYS-002 — Production has a hidden Lovable backend dependency

**Severity:** P1  
**Status:** OPEN

GitHub/Vercel are already the code/deploy control plane, but production database/auth remains on the legacy Lovable-managed Supabase environment until cutover is completed. PR #24 removes Lovable runtime/build/auth/Stripe/cron coupling from code.

**Acceptance:** production operates from owner-controlled Supabase, direct Stripe, direct Resend, owner-controlled scheduling, and no required `LOVABLE_*` runtime variable/package/gateway remains.

### SYS-003 — Owner-controlled ProvisionLoop Supabase exists but is empty

**Severity:** P1  
**Status:** OPEN

Owner Supabase project `ProvisionLoop` (`myfgnukugylhqvmcjceu`) is `ACTIVE_HEALTHY` in `us-east-1`, but currently reports zero applied migrations. No production traffic should be moved to it until the repository schema is replayed and verified.

**Acceptance:** migrations applied in order, schema/RLS/functions checked, security/performance advisors reviewed, production data reconciled, auth provider configured, then regression-tested before cutover.

### SYS-004 — Deployment portfolio contains naming/link drift

**Severity:** P2  
**Status:** OPEN / inventory required before deletion

Observed Vercel drift:

- three separate Vercel projects point to GitHub `garrettmclain96-prog/youbeenclassedoffical`
- Vercel `youbeenclassed` points to GitHub `garrettmclain96-prog/ai-research-agent`
- Vercel `classed` points to GitHub `garrettmclain96-prog/claude-flow`
- `parcelforge` currently has no Git repository linked in Vercel
- `project-lun5q` has no Git repository linked
- `youbeenclassed-prod` has no Git repository linked

No project should be deleted solely from this observation. Domains, latest deployments, and canonical ownership must be resolved first.

**Acceptance:** each Vercel project marked canonical / archive / delete / relink with a verified repo and domain mapping.

### SYS-005 — Several Supabase projects are inactive

**Severity:** P2  
**Status:** REVIEW

Current owner Supabase inventory shows:

- ClaimForge — INACTIVE
- Brainchild of a BrainRot Genius — INACTIVE
- Jamaica Beach RV Resort — INACTIVE
- ProvisionLoop — ACTIVE_HEALTHY

Inactive is not automatically broken or disposable; it is a signal to correlate each backend with its canonical project before relying on it.

### SYS-006 — CI exposed lockfile drift during Lovable removal

**Severity:** P1 before merge  
**Status:** OPEN

The migration branch removed Lovable dependencies from `package.json` while `bun.lock` still contained them. CI correctly caught a frozen-lockfile failure. PR #24 currently permits lock refresh during the migration, but the final lockfile must be regenerated, committed, and frozen verification restored before merge.

### SYS-007 — Monitoring previously depended too heavily on provider-local visibility

**Severity:** P2  
**Status:** REMEDIATED (baseline)

An independent GitHub Actions production watchdog was installed on `main` in commit `fc283498b997ad7e353e5bf92ebeb7227e926862`. It checks public ProvisionLoop surfaces plus the acquisition-worker endpoint every 30 minutes and opens/updates a GitHub incident on failure, closing it on recovery.

This monitor intentionally lives outside the application runtime so application/backend failures cannot hide behind a healthy homepage alone.

## Current cross-system conclusion

ProvisionLoop is the only Vercel project in the first portfolio pass that returned grouped runtime errors in the selected 7-day window. The larger portfolio risk is currently **control-plane drift**, not a broad wave of runtime crashes: duplicate/misnamed Vercel projects, unlinked deployments, inactive backends, and unclear canonical ownership.

## Remediation order

1. Keep current production online; do not cut over the database prematurely.
2. Replay and verify ProvisionLoop schema in owner Supabase.
3. Migrate/reconcile production data and auth identity.
4. Configure owner secrets for Supabase, Stripe, Resend, and cron.
5. Regression-test PR #24 preview and finalize `bun.lock`.
6. Cut production to owner-controlled backend and verify scheduled worker.
7. Resolve Vercel portfolio drift one project at a time after domain/repo confirmation.
8. Expand independent monitoring to the canonical P0 projects after ownership mapping is complete.

## Execution plumbing

Todoist now contains three control projects:

- ProvisionLoop — Owner Control
- Systems — Failures & Remediation
- Execution — Life & Follow-ups

Only work requiring human/future action should be added there. Work that can be remediated automatically should be fixed directly and recorded here instead of creating task noise.
