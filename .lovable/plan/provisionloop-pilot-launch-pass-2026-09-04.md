# ProvisionLoop — Pilot Launch Pass

Five pieces of work, ending with a publish so the live URL finally shows the rebrand and the Legal Center.

## 1. Real contact channel

Publish `Garrettmclain96@gmail.com` as the monitored contact for corrections, removals and pilot questions.

- Add a single `SUPPORT_EMAIL` constant so the address exists in one place.
- Link it from the Trust & Method page (the "claim, correct or remove your listing" block, replacing the "a channel will be published later" wording), from the site footer, and from the Legal Center index.
- Update the roadmap note that still says a monitored channel is pending.

## 2. Test-mode pilot kitchens

Seed a small set of clearly labeled pilot kitchens so the funding gate is exercisable without claiming any real partnership.

- Migration adds an `is_test` flag on kitchens (default false) and inserts 3 pilot kitchens named unambiguously as pilot/test entries, with `claimed = true` and `payout_status = 'ready'`.
- Every surface that shows a kitchen renders a visible "Test-mode pilot kitchen — not a real partner" badge whenever `is_test` is true: directory, funding selector, kitchen network, civic capacity.
- Impact totals and the ledger keep counting only real closed events; test kitchens are counted separately in the "funding-enabled" tile with a footnote, never folded into partner claims.

## 3. Pilot announcement page

New public route `/pilot` with its own metadata.

- Live date: **November 3, 2026** (roughly two months out — say the word if you want a different date and it changes in one line).
- Eligibility: Galveston County households; no income documentation required for the pilot; requests routed through a verified community partner; limited nightly and rural coverage stated plainly.
- Sign-up form: name, email, ZIP, role (household / kitchen operator / volunteer / partner / sponsor). Signed-in users submit directly; signed-out users are sent to sign-in first so acceptance is attributable.
- Submitting requires accepting Terms v1.0 and Privacy v1.0 through the existing `LegalAcceptance` gate, with `assertAccepted()` inside the handler so the button cannot be bypassed.
- Rows land in a new `pilot_signups` table (RLS: user reads own rows, admins read all).
- Linked from the site header/footer and the home page.

## 4. Admin queue

New route `/admin` gated on the existing `has_role(auth.uid(), 'admin')` check, showing three tabs: privacy requests, refund requests, pilot signups.

- Each row shows type, details, requester, age and status; admins can move status through `queued_manual_review → in_progress → resolved` with an internal note.
- New RLS policies let admins select and update `privacy_requests` and `refund_requests` (users keep read access to their own rows only).
- Non-admins get a clean "not authorized" state, never a blank page.

## 5. Email notification

New requests need to reach the inbox rather than sitting in a queue.

- Set up Lovable email infrastructure and app-email templates.
- One notification email per new privacy request, refund request and pilot signup, sent to the monitored address, containing the request type, an internal reference id and a link to `/admin` — no household details in the body.
- Idempotency keyed on the row id so retries do not duplicate.

## 6. Publish

Format, typecheck, lint and build; smoke test `/`, `/pilot`, `/admin`, `/trust-method`, `/privacy-center`, `/refund-request` and the legal pages; run a security scan; then publish so the live URL serves the ProvisionLoop build.

## Technical notes

- Payments stay in **test mode**. No live Stripe keys, no tax-deductibility or nonprofit claims, no fabricated partnerships — the seeded kitchens are explicitly labeled test entries in the UI and in the database.
- Admin authorization is checked server-side via the existing `has_role` security-definer function and RLS, never client state.
- Roles are assigned in the `user_roles` table; you will need one admin row for your account before `/admin` shows data.
