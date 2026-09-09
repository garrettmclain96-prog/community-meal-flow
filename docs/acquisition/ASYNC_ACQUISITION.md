# ProvisionLoop async acquisition system

Status: active production operating model
Owner: Garrett McLain
Last updated: 2026-09-08

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
7. Lead Autopilot sends the role-specific next-step email and at most one unanswered follow-up.
8. Reply Autopilot handles routine positive questions asynchronously.
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
- Automated cold outreach receives at most one unanswered follow-up.
- Website leads receive an initial next-step email and at most one unanswered follow-up.
- Explicit decline, unsubscribe or do-not-contact language stops further outreach. Matching `pilot_signups` records must be marked `do_not_contact=true`.
- Way West Grill / `waywestcatering@gmail.com` must not receive additional unsolicited automated outreach unless Way West first replies or Garrett explicitly changes this rule.

## What the Reply Autopilot may handle

It may autonomously answer routine human messages that:

- express interest;
- ask what ProvisionLoop is;
- ask for more information;
- ask what the next step is;
- can be satisfied by the correct public/self-service link.

It must not overstate affiliation, readiness or impact.

## What must be escalated to Garrett

Do not autonomously commit ProvisionLoop when a reply involves:

- contracts or legal terms;
- partner data-sharing terms;
- grants or procurement;
- money/payment commitments or pricing negotiations;
- press interviews, quotes or attributable statements;
- operator-authority evidence or final provider verification;
- a specific requested meeting/call time;
- anything that would bind Garrett or ProvisionLoop to a material obligation.

When escalating, provide the sender, organization, concise summary, exact decision needed and a suggested reply. Do not require Garrett to reconstruct the thread.

## Claims that acquisition messaging must not make

Unless the underlying production state changes and is verified, do not claim:

- that a directory listing is a ProvisionLoop partner;
- that live payment processing is enabled;
- that ProvisionLoop is a nonprofit;
- that payments are tax-deductible donations;
- guaranteed household service or coverage;
- fake, estimated-as-real or sandbox impact;
- operator verification before independent verification actually occurs.

## Lead-state fields

`pilot_signups` supports the acquisition pipeline with:

- nullable `user_id` for pre-account interest;
- `organization_name`;
- `lead_source`;
- non-sensitive `metadata` for routing/acquisition context;
- `preferred_contact`;
- `followup_count`;
- `last_contacted_at`;
- `do_not_contact`.

These fields are acquisition state only. They are never substitutes for role authorization, legal acceptance or payout readiness.

## Outreach job interface

An external outreach automation must never hold raw SQL or service-role access:
that bypasses RLS, exposes household PII, payment and partner data, and allows
arbitrary destructive writes. It authenticates as a platform admin and uses a
narrow server interface instead (`src/lib/acquisition.functions.ts`, backed by
admin-gated `SECURITY DEFINER` functions):

- `listOutreachQueue` — leads with `do_not_contact = false` that are due either
  an initial contact (`last_contacted_at IS NULL`) or their single follow-up
  (`followup_count = 0` and the initial contact is at least three business days
  old). Obvious fake/test/disposable addresses are excluded. Returns only id,
  email, first name, role, status, `last_contacted_at`, `followup_count` and
  the stage. Never notes, metadata, postal code or organization.
- `markInitialOutreachSent` — after a confirmed successful send only: sets
  `last_contacted_at = now()` and moves `queued_manual_review` to
  `in_progress`. `followup_count` and `internal_note` are untouched.
- `markFollowupOutreachSent` — after a confirmed successful send only: sets
  `followup_count = 1` and `last_contacted_at = now()`. `internal_note` is
  untouched.

Both mutations require the exact row id and re-check eligibility in the
database, so a replay cannot double-contact a lead.

## Owner visibility

God Mode should summarize acquisition rather than expose raw lead PII on the dashboard:

- total leads;
- new leads in the last seven days;
- uncontacted leads;
- email-only leads;
- followed-up leads;
- opted-out leads;
- lead counts by role;
- lead counts by source.

Raw lead detail remains in the protected admin workflow when it is actually needed.

## Success condition

The system is doing its job when Garrett generally does **not** need to interact with a lead until that person or organization has already demonstrated meaningful intent and the remaining step genuinely requires founder/admin judgment.
