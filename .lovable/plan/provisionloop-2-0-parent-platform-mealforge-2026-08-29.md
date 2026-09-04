# ProvisionLoop 2.0 → Parent Platform + MealForge

ProvisionLoop stays exactly as it is: the cinematic Civic Ledger public experience at `/`. Everything new is added around it. Nothing existing gets replaced with mockups.

This is a very large program, so it ships in stages. This plan covers the full architecture and defines Stage 1 precisely — the part I build now.

## Brand architecture

```text
ProvisionLoop (parent)
├── /            public Civic Ledger site (exists today)
├── /app         MealForge — household food intelligence (warm, premium food app)
├── /impact      donors, sponsors, businesses
├── /kitchen     restaurants, food trucks, community kitchens
├── /partners    verified nonprofits
└── /civic       cities and public-sector
```

Separate surfaces, one shared backend. MealForge shares tokens and typography with ProvisionLoop but reads warmer and simpler — lighter surfaces, softer edges, less telemetry. The civic/ledger aesthetic stays on the public and civic/impact surfaces.

Public nav gains four prominent entries: Plan My Meals, Fund Meals, Join as a Kitchen, Partner With Us.

## Data honesty

Every number on the existing landing page that isn't backed by a database row gets an explicit `SAMPLE DATA` / `PROJECTED` marker, styled as a deliberate part of the design rather than an apology. As each metric becomes a real aggregate query, the marker is removed.

---

## Stage 1 — what I build now

**1. Stabilize what exists.** Finish the outstanding wiring: display boot script into the document head so saved photo opacity/scrim apply on first paint, `PhotoBackdrop` and the City Pulse layers reading the CSS variables, `min-h-dvh`, and a clean typecheck/build.

**2. Enable Lovable Cloud** (database, auth, storage, server logic) and turn on email/password auth.

**3. Roles and identity.** Roles in a dedicated table — `household`, `kitchen`, `nonprofit`, `sponsor`, `city_admin`, `platform_admin` — never on the profile row, checked through a security-definer function. Profiles auto-created on signup. All new tables get UUID keys, timestamps, indexes, RLS and explicit grants.

**4. Core household schema.** `households`, `household_members`, `dietary_preferences`, `allergies`, `pantry_items`, `budgets`, plus the ingredient graph (`ingredients`, `ingredient_aliases`, unit conversions, package sizes) and the recipe set (`recipes`, `recipe_ingredients`, `recipe_steps`, `recipe_sources`). Household data is readable only by its own members — no public exposure, ever.

**5. MealForge shell.** Mobile-first authenticated app at `/app` with bottom navigation: Home, Plan, Shop, Cook, Kitchen. Real routes, no dead buttons.

**6. Household onboarding.** Household size and members, dietary preferences, allergies, equipment, preferred stores, weekly grocery budget — written to the database and editable afterwards.

**7. Pantry.** Add, edit, consume and expire pantry items against canonical ingredients.

**8. Recipe ingestion v1.** Manual entry and paste-a-recipe, normalized into the ingredient graph, with raw source preserved alongside the normalized record plus extraction method and confidence. URL import is designed for in this stage and enabled in Stage 2 (see technical notes).

**9. Deterministic meal planner v1.** Given household size, restrictions, allergies, pantry contents, budget and recipe costs, it produces a scored week of dinners under constraint. Deterministic scoring and constraint filtering do the selection; AI is only used for normalization and explanation, never to invent the plan.

**10. Grocery list v1.** One consolidated list per plan, with package-size intelligence: recipe quantity vs purchasable quantity, remainder flowing back into pantry inventory, and reuse of remainders across the week.

**11. Price provider abstraction.** A single interface behind which providers register, with every price carrying a provenance label — `VERIFIED LIVE`, `RECENT OBSERVED`, or `ESTIMATED` — surfaced in the UI. Stage 1 ships the estimated/observed providers and receipt-driven observation; nothing is ever labeled live unless a real retailer feed supplies it.

---

## Later stages (architecture reserved now, built after households work)

- **Stage 2** — recipe URL/JSON-LD ingestion service, receipt capture and reconciliation, nutrition, cooking mode, preference learning.
- **Stage 3** — `/kitchen`: capacity, community meal templates, funded orders, payouts, revenue stabilization; batch-scaling the same optimizer to community meals.
- **Stage 4** — `/impact` and `/partners`: funding pools, sponsor commitments, allocations, dispatches, fulfillment verification, impact events.
- **Stage 5** — `/civic`: privacy-preserving aggregate demand vs kitchen capacity vs available funding, by neighborhood.
- **Stage 6** — the community impact bridge: eligible household budget gaps matched to funded assistance, with sponsors seeing impact metrics only and never recipient identity.
- **Stage 7** — monetization surfaces (Pro, kitchen SaaS, municipal). Sponsored placement is always labeled and never allowed to reorder household recommendations.

---

## Technical notes

- **Runtime**: the app runs on a serverless edge runtime, so a Python `recipe-scrapers` service cannot run inside it. The ingestion pipeline is built provider-shaped: JSON-LD / Schema.org parsing and deterministic HTML parsing run in-platform, and a `recipe-scrapers` provider slots in as an external HTTP service when you're ready to host one. Fallback order stays as specified, ending in AI normalization, with extraction method and confidence recorded on every import.
- **Server logic** uses server functions; nonprofit-verified and cross-role reads run authenticated server-side so RLS applies as the calling user. Privileged operations verify role first.
- **Aggregates** for civic and sponsor surfaces are computed from database views with minimum-cohort thresholds, so no individual household is identifiable.
- **Optimizer** lives in a shared module used by both household planning and community batch cooking, so improvements benefit both.
- Existing routes, components, tokens and dispatch data are preserved; new work is additive.
