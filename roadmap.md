# TableForward 2.0 — Roadmap

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
- [ ] /partners: assistance requests + partner referrals, verification, dispatches, outcomes
- [ ] /civic: geographic demand, kitchen capacity vs demand, sponsor allocation, CSV export
- [ ] /app: budget, preferences, pantry, planner, shop screens fully built out

## Vision alignment (TableForward 2.0 brief)
- [ ] Volunteer integration: sign up to deliver, prep, distribute, host events; volunteer portal
- [ ] Kitchen types beyond restaurants: food trucks, caterers, meal prep, churches, school cafeterias
- [ ] Restaurant stabilization: guaranteed daily minimum, micro-grants, discounted supplies, volunteer labor
- [ ] Smart matching: route funded meals to family/senior/homeless/student/veteran cohorts via partners
- [ ] Sponsorship subscriptions: 100 meals/week, neighborhood, school, restaurant

## Later
- [ ] Recipe ingestion from URLs, photos and PDFs (text paste ships today)
- [ ] Live store price feeds to promote ESTIMATED prices to VERIFIED LIVE


