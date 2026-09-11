# ProvisionLoop async acquisition system

Status: active production operating model
Owner: Garrett McLain
Last updated: 2026-09-11

## Objective

ProvisionLoop acquisition must require as little synchronous interaction from Garrett as practical. A prospect should be able to discover the product, understand the pilot, express interest, self-qualify, take the appropriate next step and exchange routine follow-up by email without requiring Garrett to make a phone call, walk into a business, schedule a meeting or manually shepherd every lead.

This is an operating constraint, not merely a copy preference.

## Default funnel

1. Public discovery, direct outreach, referral or shared link.
2. Role-specific link to `/pilot?role=<role>`.
3. Low-friction expression-of-interest form: name + email + role, with limited routing fields.
4. No account, phone number, meeting or legal acceptance is required merely to express interest.
5. Server-side intake validates, de-duplicates and stores the lead. Anonymous browser clients do not receive direct INSERT access to `pilot_signups`.
6. The confirmation screen immediately provides the correct self-service next step.
7. The ProvisionLoop backend acquisition worker sends the role-specific next-step email and at most one unanswered follow-up.
8. Reply Autopilot handles routine positive questions asynchronously and records reply detection for follow-up suppression.
9. Garrett is escalated only when human judgment, commitment or real-time participation is actually necessary.

## Role routing

| Role | Primary self-service path |
| --- | --- |
| Household | `/help` |
| Kitchen / restaurant operator | `/kitchen` |
| Volunteer | `/volunteer` |
| Community partner | `/partners` |
| Sponsor / funder | `/impact` |

`/trust-method` is the secondary trust/explanation surface when helpful.

## Trust boundary

Low friction applies to **interest**, not to protected authority or data.

Accounts, current legal acceptance and independent verification remain required at the appropriate protected workflow. An intake-form statement that a person owns/manages a kitchen is routing context only and must never count as operator-authority evidence. No acquisition automation may activate live payments, approve a provider, expose household PII or create a partnership commitment.

## Contact policy

- Default contact preference: email only.
- No phone number is required for intake.
- Routine acquisition messages must not ask for a call by default.
- A prospect may continue entirely asynchronously whenever the protected workflow allows it.
- Website leads receive an initial next-step email and at most one unanswered follow-up.
- Follow-up is suppressed whenever a meaningful reply has been detected.
- Explicit decline, unsubscribe or do-not-contact language stops further outreach. Matching `pilot_signups` records must be marked `do_not_contact=true`.
- Way West Grill / `waywestcatering@gmail.com` must not receive additional unsolicited automated outreach unless Way West first replies or Garrett explicitly changes this rule.

## What the Reply Autopilot may handle

It may autonomously answer routine human messages that express interest, ask what ProvisionLoop is, ask for more information, ask what the next step is, or can be satisfied by the correct public/self-service link. It must not overstate affiliation, readiness or impact.

The Reply Autopilot must set `reply_detected_at` (and `reply_status` when useful) on the matching lead when it identifies a meaningful human reply. The backend worker treats any non-null `reply_detected_at` as a hard follow-up suppression signal.

## What must be escalated to Garrett

Do not autonomously commit ProvisionLoop when a reply involves contracts or legal terms, partner data-sharing terms, grants or procurement, money/payment commitments or pricing negotiations, press interviews or attributable statements, operator-authority evidence or final provider verification, a specific requested meeting/call time, or anything that would bind Garrett or ProvisionLoop to a material obligation.

## Claims acquisition messaging must not make

Unless the underlying production state changes and is verified, do not claim that a directory listing is a ProvisionLoop partner, that live payment processing is enabled, that ProvisionLoop is a nonprofit, that payments are tax-deductible donations, guaranteed household service or coverage, fake/estimated-as-real impact, or operator verification before independent verification actually occurs.

## Lead-state fields

`pilot_signups` supports the acquisition pipeline with nullable `user_id`, `organization_name`, `lead_source`, non-sensitive routing `metadata`, `preferred_contact`, `followup_count`, `last_contacted_at`, `do_not_contact`, `reply_detected_at`, `reply_status`, and short-lived worker claim fields.

These fields are acquisition state only. They are never substitutes for role authorization, legal acceptance or payout readiness.

## Canonical outbound architecture

Outbound acquisition is backend-owned. ChatGPT, Gmail connectors and other external agents do **not** read the lead table in order to send routine outbound acquisition mail.

The production flow is:

`Vercel Cron -> /api/public/hooks/acquisition-worker -> service-role claim RPC -> Resend -> exact-row success/failure RPC`

Vercel Cron runs the worker hourly and supplies the bearer token derived from `CRON_SECRET`. The worker fails closed when authentication or required server secrets are unavailable.

### Runtime configuration

Required Vercel Production secrets:

- `CRON_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

The worker has safe code defaults for the public owner-controlled Supabase project URL and for `ProvisionLoop <outreach@provisionloop.org>`, because `provisionloop.org` is the verified sending domain. These may still be overridden with `SUPABASE_URL` and `PROVISIONLOOP_OUTREACH_FROM` when needed.

`PROVISIONLOOP_REPLY_TO` is optional.

Never commit the service-role key, Resend API key, or cron secret to source control.

### Eligibility

The database claim operation is authoritative. It excludes `do_not_contact=true`, malformed/fake/test/disposable addresses, rows that are already claimed by another live worker invocation, and rows with a successful event for the same stage. Initial contact requires `last_contacted_at IS NULL`. Follow-up requires `followup_count=0`, no `reply_detected_at`, and at least three business days since the initial contact.

### Concurrency and idempotency

Claims use `FOR UPDATE SKIP LOCKED` plus a short-lived claim token so concurrent worker runs cannot claim the same row. Each `(lead_id, stage)` has a deterministic provider idempotency key (`provisionloop-acquisition/<stage>/<lead-id>`). Resend receives that key on every attempt. The database also maintains a unique `(lead_id, stage)` outreach event record.

### State transitions

A provider failure clears the claim and records a failed outcome without changing `last_contacted_at`, `followup_count`, `status`, or `internal_note`.

After a provider-confirmed initial send, the database sets `last_contacted_at=now()` and changes `queued_manual_review` to `in_progress`; `followup_count` remains unchanged at zero. After a provider-confirmed follow-up send, it sets `followup_count=1` and `last_contacted_at=now()`. Human `internal_note` is never overwritten by the worker.

### Audit trail

`outreach_events` stores lead id, stage, deterministic idempotency key, provider, provider message id, outcome, error category, attempt count and timestamps. It intentionally avoids duplicating lead email or unrelated PII. RLS is enabled and ordinary users receive no access.

### Dry run

`GET /api/public/hooks/acquisition-worker?dry_run=1` returns only aggregate eligible counts after normal cron-secret authorization and sends nothing.

### Scheduler ownership

Vercel Cron is the active production scheduler. Supabase `pg_cron` / `pg_net` may remain available for other database work, but absence of a database acquisition cron is not an acquisition failure under the current architecture. Do not configure both schedulers for the same worker unless intentionally migrating and preventing double execution.

### Retired external queue

The earlier ChatGPT-facing `acquisition_outreach_queue`, `mark_acquisition_initial_sent` and `mark_acquisition_followup_sent` functions are no longer part of the canonical workflow. Authenticated-user execute access is revoked by the backend-worker migration. Service-role-only compatibility can remain temporarily for migration/diagnostics.

## Owner visibility

God Mode should summarize acquisition rather than expose raw lead PII on the dashboard: total leads, new leads in the last seven days, uncontacted leads, email-only leads, followed-up leads, opted-out leads, and counts by role/source. Raw lead detail remains in the protected admin workflow when it is actually needed.

## Success condition

The system is doing its job when Garrett generally does **not** need to interact with a lead until that person or organization has already demonstrated meaningful intent and the remaining step genuinely requires founder/admin judgment.
