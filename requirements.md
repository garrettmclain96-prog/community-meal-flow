---
title: ProvisionLoop requirements
status: in_progress
owner: Garrett McLain
priority: p0
version: 1.0.0
date: 2026-09-05
last_updated: 2026-09-05
---

# ProvisionLoop requirements

Source: inspected application and committed migrations, 2026-09-05. Unmarked
criteria describe implemented source behavior, not proof of deployed behavior.
`[open]` means the guarantee is absent or still needs operational verification.
Criteria are referenceable as FR-101.1, etc. Verification methods and limitations
are in design.md and docs/verification/pilot-checks.md. Goals do not override
observed behavior. VaultOS and GloveGate are out of scope.

## Funding integrity (FR-1xx)

### FR-101 — Confirmed funding

As a sponsor, I want payment confirmation to govern credited meals so public totals have evidence.

1. WHEN a valid paid checkout webhook is processed THEN the system SHALL confirm the checkout through `confirm_sponsor_checkout` and record funded meals.
2. IF a webhook signature is invalid THEN the system SHALL reject it before crediting the ledger.
3. IF an already confirmed checkout is replayed THEN the system SHALL avoid crediting that checkout twice.
4. WHILE checkout is unpaid THEN the system SHALL exclude its meals from funded impact events.

### FR-102 — Eligible kitchen funding

As a sponsor, I want unavailable kitchens excluded so funding reaches eligible operators.

1. WHEN funding options load THEN the system SHALL select only approved, active, claimed, payout-ready kitchens.
2. IF a submitted kitchen fails the funding gate THEN the system SHALL reject checkout even if the client submits its ID directly.
3. IF meal quantity is not an integer from 1 through 5000 THEN the system SHALL reject one-time checkout input.

### FR-103 — Sandbox lifecycle evidence

As the pilot owner, I want reconciled sandbox evidence before claiming the payment flow works.

1. [open] WHEN a signed-in sandbox test funds, confirms, prepares, delivers and pays out an order THEN the system SHALL provide observed meal counts, amounts, statuses and correlated identifiers at every step.
2. [open] IF the payment, webhook or payout fails THEN the system SHALL leave the test incomplete with the observed failure and no invented success amounts.
3. WHERE pilot checkout is offered THEN the system SHALL label the payment environment as test mode in the funding UI.

## Kitchen listings and claims (FR-2xx)

### FR-201 — Honest listing states

As a listed operator, I want directory discovery distinguished from participation.

1. WHEN a non-test kitchen is displayed THEN the system SHALL distinguish directory, claimed/operator-verified and funding-enabled states from row data.
2. WHERE `is_test` is true THEN the system SHALL render “Test-mode pilot kitchen — not a real partner” on home, help, impact selection and detail, kitchen portal/listings, and civic kitchen capacity details.
3. WHEN kitchen directory and civic queries run THEN the system SHALL include `is_test` in their selected columns.
4. IF a kitchen is a test row THEN the system SHALL show the test label instead of an unqualified verified-partner badge.

### FR-202 — Claim ownership

As an operator, I want a listing claim tied to my authenticated account.

1. WHEN a signed-in user claims an available listing THEN the system SHALL assign ownership and grant the kitchen role through `claim_kitchen`.
2. IF the listing is claimed, the caller is signed out or the caller already owns a kitchen THEN the system SHALL reject the claim.
3. [open] WHEN a real operator submits a claim THEN the system SHALL verify authority before approving ownership. The committed RPC currently approves automatically.

### FR-203 — Monitored corrections channel

As a listed organization, I want a contact path that does not require claiming a listing.

1. WHEN Trust & Method, the footer or Legal Center is rendered THEN the system SHALL link the monitored address from `src/lib/contact.ts`.
2. IF an operator wants a correction or removal THEN the system SHALL provide that contact without requiring sign-in or ownership.

## Volunteers and delivery (FR-3xx)

### FR-301 — Volunteer participation

As a volunteer, I want to register availability and join shifts.

1. WHEN a signed-in volunteer saves their profile THEN the system SHALL persist skills, availability and driving capability.
2. WHEN a volunteer joins or leaves a shift THEN the system SHALL persist their signup or remove it through the existing shift flow.
3. WHEN an operator completes a shift signup THEN the system SHALL record completed status and hours.

### FR-302 — Delivery progression

As a delivery volunteer, I want a traceable run without household identities.

1. WHEN an order becomes prepared THEN the system SHALL create a delivery run through the database trigger.
2. WHEN a permitted volunteer advances a claimed run THEN the system SHALL persist picked-up or delivered status through `advance_delivery_run`.
3. IF an unauthorized caller tries to advance a run THEN the system SHALL reject the operation through the RPC ownership check.
4. WHEN volunteers read runs THEN the system SHALL expose drop-point data rather than recipient names and contact details.
5. WHEN a run is delivered THEN the system SHALL advance its order and queue the kitchen payout; actual settlement remains FR-103.

## Partners and privacy (FR-4xx)

### FR-401 — Private referrals

As a household, I want assistance routed to approved partners without public disclosure.

1. WHEN a signed-in household submits assistance THEN the system SHALL store private intake and use the existing area matching flow.
2. WHILE a partner organization is unapproved THEN the system SHALL withhold referral workspace access through approved membership checks.
3. WHEN an approved partner updates an assigned referral THEN the system SHALL record its decision or fulfillment outcome.
4. WHEN public civic data is requested THEN the system SHALL avoid querying household identity and private referral tables.

### FR-402 — Privacy requests

As an account holder, I want to submit and track my privacy requests.

1. WHEN a signed-in user submits a privacy request THEN the system SHALL create a queued manual-review row tied to that user.
2. WHEN a user opens their Privacy Center THEN the system SHALL query their requests under row-level security.
3. [open] WHEN an admin queue item is created THEN the system SHALL notify the monitored operator automatically. Email delivery requires a sending domain and integration.

## Legal acceptance (FR-5xx)

### FR-501 — Versioned acceptance

As a participant, I want to know which terms I accepted.

1. WHEN acceptance is recorded THEN the system SHALL persist user, document key, version, signer and context in `legal_document_acceptances`.
2. IF the same user accepts the same document version again THEN the system SHALL avoid creating a duplicate acceptance.
3. WHEN a governed UI action is attempted without required acceptance THEN the system SHALL prompt for acceptance using `useLegalGate`.
4. [open] IF a caller bypasses the UI and invokes a governed server function or RPC without acceptance THEN the system SHALL reject the action server-side. Current `assertAccepted` calls are in UI handlers, not payment server handlers.

### FR-502 — Legal information and requests

As a sponsor, I want terms, fees and refund handling available before participating.

1. WHEN the Legal Center is opened THEN the system SHALL list the seven versioned documents and links to privacy and refund request forms.
2. WHEN a signed-in sponsor submits a refund request THEN the system SHALL queue it for manual review.
3. WHERE pilot participation is offered THEN the system SHALL expose `/pilot` in desktop/mobile header and footer navigation.
4. WHILE the operating legal entity is unpublished THEN the system SHALL retain the live-money launch gate in the Legal Center.

## Civic reporting (FR-6xx)

### FR-601 — Bounded aggregate reporting

As a civic planner, I want bounded area summaries and exportable data.

1. WHEN a user selects 7, 30 or 90 days THEN the system SHALL load impact events for that time window and render area totals and a daily trend.
2. WHEN CSV export is requested THEN the system SHALL export area capacity, funded and delivered counts, coverage and estimated sponsor dollars.
3. WHERE kitchen capacity includes a test kitchen THEN the system SHALL label that kitchen as a test in the area detail.
4. [open] WHEN privacy suppression is applied THEN the system SHALL use an approved meaningful cohort threshold. `MIN_COHORT` is currently 1 and areas with kitchens bypass it.
5. [open] WHEN civic sponsor dollars are shown THEN the system SHALL distinguish estimates from actual settled amounts on every display. The current calculation estimates dollars from meals and area pricing.
6. [open] WHEN real-world pilot impact is reported THEN the system SHALL separate sandbox events and capacity from real-world totals. Badges alone do not provide aggregate separation.

## Admin queues (FR-7xx)

### FR-701 — Administration and access

As the platform owner, I want restricted operations queues.

1. WHEN `/admin` checks access THEN the system SHALL call `has_role` against `user_roles` and show the not-authorized state for a non-admin.
2. WHEN an administrator updates a privacy, refund or pilot queue item THEN the system SHALL persist status and internal notes under database policies.
3. [open] WHEN Garrett's confirmed account is resolved THEN the system SHALL hold exactly one `(user_id, platform_admin)` role row and return true from `has_role` for it. Database access is blocked in this session.
4. [open] IF a database queue read fails THEN the system SHALL distinguish that failure from an empty queue. Existing queue components render empty on missing data.

### FR-702 — Private design dashboard

As the platform owner, I want an inventory of design decisions without exposing documents publicly through the application.

1. WHEN an authenticated platform admin requests `/design` data THEN the system SHALL verify the authenticated subject using `has_role` inside a server function before loading any documents.
2. IF the caller lacks the admin role THEN the system SHALL return no documents and show “Not authorized.”
3. IF the request has no valid session THEN the system SHALL reject the data request; the page SHALL offer sign-in without document content.
4. WHEN a build runs THEN the system SHALL discover root `design.md` and `docs/projects/**/design.md` through eager Vite raw globs, with no runtime filesystem access.
5. WHEN cards render THEN the system SHALL show title, domain, priority, status, version, last update, expandable unresolved questions and linked ADRs with status.
6. WHEN documents are ordered THEN the system SHALL sort by p0–p3, documented status order, descending update date, and path for ties.
7. WHEN the summary renders THEN the system SHALL show total docs, counts by present status and total unresolved questions, excluding checked questions.
8. IF an ADR link is missing THEN the system SHALL display a missing status instead of inventing a decision.
9. WHEN client assets are built THEN the system SHALL exclude raw design and ADR content from public bundles.

### FR-703 — Verification and database hardening

As the maintainer, I want reproducible checks and accurate completion reports.

1. WHEN source changes are delivered THEN the system SHALL have named formatting, typecheck, lint, build and smoke check results recorded, including any failure.
2. [open] WHERE a SECURITY DEFINER function lacks a pinned search path THEN the system SHALL use a reviewed safe search path and pass a subsequent database advisor check. The historical count of 19 is not reverified without database access.
3. WHEN a design decision changes THEN the system SHALL record an ADR link, design version, update date and changelog entry.
