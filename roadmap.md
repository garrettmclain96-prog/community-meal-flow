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

## Next
- [ ] Payment settlement for sponsor commitments (currently recorded as pledges)
- [ ] Nonprofit intake + dispatch routing on /partners
- [ ] Recipe ingestion from URLs, photos and PDFs (text paste ships today)
- [ ] Live store price feeds to promote ESTIMATED prices to VERIFIED LIVE

