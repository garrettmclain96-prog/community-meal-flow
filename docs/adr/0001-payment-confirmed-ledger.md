# 0001 — Public totals count only webhook-confirmed payments

- Status: accepted
- Date: 2026-09-05
- Deciders: Garrett McLain

## Context

Sponsor funding is initiated in the browser, but a started checkout is not a
payment. The public ledger and civic dashboard are the platform's trust surface.

## Decision

Funded orders are written `pending` and only become `funded` — and only then emit
an `impact_event` — from the signed Stripe webhook, through the security-definer
`confirm_sponsor_checkout` function, idempotent by event id.

## Consequences

- Public numbers can never include unpaid meals.
- Webhook availability becomes a hard dependency for impact accounting.
- Client code cannot credit the ledger, even with a valid session.
