# ProvisionLoop: Real Money, Real Data, Real Portals

Five workstreams that take the platform from "wired to a live ledger" to a system a city, a nonprofit, a kitchen and a household could actually run on.

## 1. Payments on the Impact portal

Sponsor pledges become real charges, and delivered meals become real payouts.

- Run the provider eligibility check for a US-registered seller, then enable the recommended provider (Stripe is the expected fit: meals are physical fulfilment, and platform-to-kitchen payouts need connected accounts).
- Products: one-time meal funding (quantity-priced), plus recurring sponsorship tiers (100 meals/week, neighborhood, school, kitchen).
- Checkout flow: the funding form on `/impact` creates a checkout session; the pledge row is written as `pending` and only flips to `funded` when the payment webhook confirms. Existing `fund_meals` logic moves behind that confirmation so the public ledger never shows unpaid meals.
- Webhook endpoint under `/api/public/` with signature verification, idempotent by event id.
- Kitchen payouts: kitchens complete a payout onboarding link from `/kitchen`; on `delivered`, the queued payout is submitted to the provider and its status tracked (`pending` → `in_transit` → `paid` → `failed`). A payouts tab on `/kitchen` shows every transfer with its order.
- Honest note: if connected payouts aren't available under the built-in integration, the fallback is the tracked ledger with export, and I'll tell you before building rather than silently swapping.

## 2. Price and recipe depth

- Expand seeded store prices well beyond the current 365 rows: more ingredients, more package sizes, all five banners, each labeled with provenance and observation date.
- Ship in-app price capture: while shopping, a household can confirm or correct a price; that writes a `RECENT OBSERVED` observation which outranks the estimate for their store, with a freshness window after which it decays back to estimate.
- Aggregate anonymous observations into a shared per-store price signal so newer households benefit from older ones, without exposing who observed what.
- Grow the public recipe library from 26 to a broad set spanning budget, vegetarian, high-protein, batch-cook, 20-minute and allergy-safe tracks, all normalized against the ingredient graph so the planner can actually use them.

## 3. `/civic` — city planning dashboard

- Geographic demand: meals requested, funded, delivered and unmet per neighborhood, with trend over time.
- Kitchen capacity map: daily capacity vs. committed orders per neighborhood, surfacing coverage gaps where demand exists but no kitchen does.
- Sponsor allocation view: where sponsor dollars are landing versus where demand is, so cities can target the mismatch.
- Time filters (7/30/90 days), neighborhood drill-down, and CSV export for public reporting.
- Aggregate-only by construction: no household identity ever reaches this surface.

## 4. `/partners` — nonprofit portal

- Two intake paths, as chosen: a self-request queue (households raise an assistance request from MealForge when the plan exceeds budget) and partner-created referrals for households the nonprofit already serves.
- Verification workflow: pending → verified → active → closed, with the verifying partner and timestamp recorded.
- Dispatch management: match a verified household to a funded meal order at a kitchen, assign delivery, track handoff.
- Outcome reporting: meals delivered, households served, repeat vs. new, exportable for grant reporting.
- Strict access: partners see only their own referrals and dispatches; nothing crosses organizations.

## 5. Full `/app` screens

- **Budget** — weekly budget, spend to date, projected overage, and the assistance bridge (request help when the gap is real) as a first-class screen.
- **Preferences** — members, appetites, allergies, diets, avoid tags, equipment, cook-time ceiling, store selection.
- **Pantry** — real inventory with expiry, quantity edits, low-stock and use-it-first prompts, and remainder banking from shopping.
- **Planner** — swap a dinner, lock a dinner, regenerate under constraints, per-meal cost breakdown with provenance, and an explanation of why each recipe was chosen.
- **Shop** — aisle-grouped list, per-store totals, check-off with price confirmation, and store comparison for the same list.

## Technical notes

- New tables: assistance requests, referrals, dispatches, partner organizations and memberships, payment intents/records, payout transfers, and price observation aggregates — all with GRANTs, RLS scoped by role, and updated-at triggers.
- New roles wiring: `nonprofit` and `city_admin` gain read paths through security-definer helpers (`is_partner_member`, `has_role`) rather than broad policies.
- Server work stays in `createServerFn` (app-internal) and `src/routes/api/public/*` (webhooks); no edge functions.
- Payment secrets stay server-side; the ledger remains the single source of truth for public numbers.

## Build order

1. Payments enablement + checkout + webhook + payouts.
2. Price/recipe seed expansion and observation capture.
3. Partner schema and portal (feeds civic data).
4. Civic dashboard on top of that data.
5. Full `/app` screens last, once budget/price/assistance data is complete.
