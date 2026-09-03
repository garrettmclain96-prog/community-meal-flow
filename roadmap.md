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
