# TableForward 2.0 — Roadmap

## Done
- Civic Ledger public landing, theme + display controls, City Pulse hotspots
- Food intelligence engine (units, ingredients, pricing, recipes, parser, planner, grocery)
- MealForge shell + routes (/app home, plan, shop, cook, kitchen, pantry, import, setup)
- Portal surfaces /impact /kitchen /partners /civic
- Lovable Cloud enabled

## In progress
- [x] Auth + role tables (profiles, user_roles, has_role)
- [x] Household schema (households, members, pantry, recipes, meal_plans, price_observations)
- [ ] Fix security-definer linter warnings
- [ ] Platform schema: kitchens, meal_templates, funded_orders, payouts, impact_events,
      ingredient_prices, public_recipes
- [ ] Seed real grocery prices + wider recipe set
- [ ] /auth login flow with role selection (household, kitchen, sponsor, civic)
- [ ] Wire MealForge repository to the database (household, pantry, plan persistence)
- [ ] /kitchen portal: capacity, meal templates, funded orders, payouts
- [ ] /impact: sponsors fund meals; replace SAMPLE DATA with real aggregates
