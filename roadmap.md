# ProvisionLoop 2.0 — Roadmap

## Done

- Civic Ledger public landing, theme + display controls, City Pulse hotspots
- Food intelligence engine (units, ingredients, pricing, recipes, parser, planner, grocery)
- MealForge shell + routes (/app home, plan, shop, cook, kitchen, pantry, import, setup)
- Portal surfaces /impact /kitchen /partners /civic
- Lovable Cloud enabled

## Done (backend + product)

- [x] Auth + role tables (profiles, user_roles, has_role); role chosen at sign-up
- [x] Household schema (households, members, pantry, recipes, meal_plans, price_observations)
- [x] Platform schema: kitchens, meal_templates, funded_orders, payouts, impact_events,
      ingredient_prices, public_recipes
- [x] Seeded 365 store prices (5 banners) + 26 recipes into the shared library
- [x] /auth email + Google sign-in with role selection; session-aware header everywhere
- [x] MealForge syncs household, pantry, recipes and plan to the database when signed in
- [x] /kitchen: register kitchen, publish meals, work funded orders, payouts queue on delivery
- [x] /impact: live fund-meals flow + real ledger aggregates
- [x] /civic: live neighborhood totals

## In progress (approved plan — Real Money, Real Data, Real Portals)

- [ ] Stripe payments: sponsor checkout, webhook confirmation, connected payouts to kitchens
- [ ] Price depth: expanded seed prices + in-app observation capture with freshness decay
- [ ] Recipe depth: wider public library across budget/veg/protein/batch/quick/allergy tracks
- [x] /partners: private assistance intake, partner applications, approval-gated referral queue,
      accept/decline and fulfillment verification
- [x] /civic: area demand vs weekly capacity, coverage, unmet gap, sponsor dollars, 7/30/90 windows,
      daily trend, drill-down and CSV export
- [ ] /app: budget, preferences, pantry, planner, shop screens fully built out

## Vision alignment (ProvisionLoop 2.0 brief)

- [x] Volunteer integration: /volunteer profiles, skills/availability, kitchen shifts, signups,
      hours logging, delivery-run dispatch (claim → picked up → delivered → payout queued)
- [x] Kitchen types beyond restaurants: food trucks, caterers, meal prep, churches, school cafeterias
- [x] Restaurant stabilization workflow: revenue floors, micro-grants, supply credits, equipment and
      volunteer-labor offers with kitchen applications
- [x] Smart matching: private requests match approved partner service areas and the kitchen with the
      strongest remaining seven-day capacity
- [x] Sponsorship subscriptions: 100 meals/week, neighborhood, school, restaurant

## Later

- [ ] Recipe ingestion from URLs, photos and PDFs (text paste ships today)
- [ ] Live store price feeds to promote ESTIMATED prices to VERIFIED LIVE

## Payments (shipped this pass)

- [x] Product catalog: Funded Meals (dynamic per-kitchen unit price) + 4 recurring sponsorship tiers
- [x] Embedded checkout for meal funding and sponsorships (no redirect)
- [x] `sponsor_checkouts` + `subscriptions` tables, signed webhook, ledger only credits paid meals
- [x] Kitchen connected-account payout onboarding, status refresh, per-order payout send
- [x] Billing portal for sponsorship upgrade/downgrade/cancel
- [x] Automatic tax on checkout (falls back to untaxed if origin address is missing)
- [x] Auto-send payouts the moment an order is marked delivered (manual button remains as fallback)
- [x] Sponsorship renewals auto-fund the kitchens with the largest unmet demand
- [ ] Refunds handled manually by policy (no self-serve refund path)

## Galveston launch (this pass)

- [x] 10 real Galveston-county food programs seeded as unclaimed listings with address, coordinates,
      area, website and program summary
- [x] Operator claim flow: claiming a listing transfers ownership and grants the kitchen role
- [x] Volunteer schema (volunteers, volunteer_shifts, shift_signups, delivery_runs) with RLS —
      volunteers never see recipient identity, kitchens see only their own roster
- [ ] End-to-end sandbox sponsorship → delivery → payout: NOT yet run (no signed-in preview session)

## Activation required before production claims

- [ ] Apply the latest Supabase migration and approve the first partner organization
- [ ] Configure Stripe sandbox/live keys, webhook secrets, catalog prices and connected accounts
- [ ] Run authenticated end-to-end tests for assistance → referral → verification and sponsor →
      delivery → payout
- [ ] Replace the currently deployed build with this branch and complete mobile/browser QA on the
      public URL

## Trust & funding integrity (done)

- Funding safety gate: `listFundableKitchens()` (approved + active + claimed + payout_status=ready) drives the funding UI; server re-checks the same conditions in one-time and subscription checkout and returns "This kitchen is not yet accepting funding."
- Honest network states everywhere: Directory listing — not affiliated / Operator verified / Funding enabled.
- Home + impact metrics split "providers mapped" from "funding-enabled kitchens"; ledger totals unchanged.
- `/trust-method` public transparency page; linked from footer and next to funding decisions.

## Open

- [x] Linked the monitored address from `src/lib/contact.ts` on Trust & Method, footer and Legal Center; no claim required for correction/removal requests.
- [x] Added `/pilot` navigation and test-kitchen badges to the five pilot surfaces.
- [x] Added private build-time `/design` dashboard and requirements/task traceability.
- [x] Garrett's account holds platform_admin (confirmed by owner 2026-09-06).

## GOD MODE — owner command center (ready, not started)

Requested 2026-09-06. No code written yet; this is the execution plan.

- [ ] **Data layer** `src/lib/god-mode.functions.ts`: `getGodModeSnapshot` server fn,
      `requireSupabaseAuth` → `has_role(platform_admin)` via `context.supabase` (same
      pattern as `design.functions.ts`) → `Cache-Control: private, no-store` → then
      `await import("@/integrations/supabase/client.server")` for aggregate counts only.
      Return counts, never emails/PII. Sections: funding (`sponsor_checkouts` by status,
      `funded_orders` by status + `paid`, `payouts` by status, `impact_events` last 10,
      `subscriptions` by status, `sponsorship_allocations` total); kitchens (`kitchens`
      total / claimed / is_test / funding-enabled, `kitchen_claims` pending); ops
      (`delivery_runs` by status, `volunteers` active, `volunteer_shifts` upcoming,
      `shift_signups`); partners (`partner_organizations` approved/pending,
      `partner_referrals` by status, `assistance_requests` by status — counts only);
      queues (`privacy_requests` / `refund_requests` / `pilot_signups` by status);
      readiness (parse `tasks.md` + `design.md` checkboxes via `import.meta.glob ?raw`
      in a `createServerOnlyFn`, reuse `design-docs.ts` parser); health (DB query ok,
      auth ok, env presence booleans only: STRIPE key + mode from `sk_test_` prefix,
      webhook secret, OPENAI key). Every block carries `{ ok, error? }` for graceful
      partial failure. If the admin client fails with the `Expected 3 parts in JWT`
      key-format error, fall back to a SECURITY DEFINER `god_mode_snapshot()` RPC
      gated on `has_role`, granted to `authenticated` only (revoke from anon/public).
- [ ] **Route** `src/routes/god-mode.tsx` (public file route, client-side gate like
      `/admin`): `robots noindex, nofollow`; states sign-in / not authorized / error /
      loading / data. Mission-control visual language distinct from the public site:
      compact sticky command header with live clock + health pips, horizontally
      scrollable segmented section nav on phone, KPI tiles with mono numerals, status
      bars per queue, "Operations Queue" primary action → `/admin`, plus wired actions
      only: `/admin` (privacy/refund/pilot tabs), `/design`, `/kitchen`, `/partners`,
      `/volunteer`, `/civic`, `/impact`. Labels: TEST / SANDBOX / ESTIMATE / UNAVAILABLE
      where applicable. iPhone-first: single column, 44px targets, no desktop-only grids.
- [ ] **Entry point**: `AccountButton` shows a "GOD MODE" link when
      `hasRole("platform_admin")`; add the same to the mobile nav block in `SiteHeader`.
      Never rendered for other roles.
- [ ] **Public visual refresh** (`src/styles.css`, `index.tsx`, `SiteHeader.tsx`):
      stronger hero treatment, section contrast, nav polish and spacing so the new
      deploy is unmistakable vs the stale published build. Keep tokens, brand and routes.
- [ ] **Verify**: `bunx prettier --write`, `tsgo`, `bun run lint`, `bun run build`,
      Playwright smoke of `/god-mode` (signed-out, non-admin, admin via injected session
      when `LOVABLE_BROWSER_AUTH_STATUS=injected`) at 390px and 1280px; update
      `design.md` (v1.2.0 + changelog), `requirements.md` (FR-704 God Mode),
      `tasks.md`, and add `docs/adr/0004-owner-command-center.md`.

Execution evidence and remaining verification: [tasks.md](./tasks.md).
