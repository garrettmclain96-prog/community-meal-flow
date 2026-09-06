# ProvisionLoop

**Private need. Local capacity. Public accountability.**

ProvisionLoop is a community food infrastructure platform for Galveston County, Texas. It connects people who need food, local kitchens with usable capacity, sponsors, volunteers, trusted community partners, and a public aggregate impact ledger in one accountable workflow.

The project is currently in **pilot stage**. The goal is to prove a reliable local operating model before scaling it further.

## Live deployment

- **Production:** https://community-meal-flow.vercel.app
- **Hosting:** Vercel
- **Source of truth:** GitHub `main`
- **Repository:** `garrettmclain96-prog/community-meal-flow`

Lovable remains connected as an optional design/editor workflow, but production deployment is handled through Vercel.

## What ProvisionLoop does

### Fund local meals

Sponsors can fund meals through verified, funding-enabled kitchens. Funding eligibility is constrained by kitchen verification and payout readiness rather than treating every directory listing as fundable.

### Get food help privately

Households can find resources or submit assistance requests without turning personal need into public content. Partner-facing workflows are gated by legal acceptance and access controls.

### Activate local kitchens

Restaurants, caterers, churches, community kitchens, and other eligible providers can register or claim a listing. New providers remain pending until reviewed and approved.

### Coordinate volunteers and delivery

Volunteers can participate in prep and delivery workflows. Governed actions require the current volunteer waiver.

### Publish aggregate civic impact

ProvisionLoop exposes public outcome data in aggregate while keeping recipient identities private. Sandbox/test activity is separated from real pilot totals.

### MealForge

MealForge is the household meal-planning workspace inside ProvisionLoop. It supports:

- Household food profiles
- Custom allergies and foods to avoid
- Meal planning under budget/time/equipment constraints
- Pantry tracking
- Grocery lists and pricing provenance
- Cooking completion and leftover handling
- Recipe text and supported URL import
- Grounded ChatGPT meal-plan assistance when server AI credentials are configured

## Core architecture

- **Frontend / server framework:** TanStack Start + React + TypeScript
- **UI:** Tailwind CSS + shadcn/ui-style components
- **Database / auth:** Supabase
- **Payments / payouts:** Stripe
- **Production hosting:** Vercel
- **CI:** GitHub Actions
- **Package/runtime tooling:** Bun

## Security and operational controls

The current codebase includes several fail-closed safeguards added during the pilot hardening pass:

- Platform-admin role checks for privileged operations
- Pending review for kitchen claims and new registrations
- Kitchen funding requires approval, claimed status, active status, payout readiness, and a payout account
- Unverified kitchens cannot publish public meal templates or volunteer shifts
- Server-side legal acceptance checks before payment and payout actions
- Partner data access gated by the current partner agreement
- Volunteer delivery actions gated by the current volunteer waiver
- Public kitchen data restricted to a safe column set
- Public impact data excludes internal order IDs
- Civic reporting suppresses small cohorts and excludes sandbox activity from real totals
- Security-definer database functions use a pinned `search_path`

## Verification

The repository runs a release gate on `main` covering:

```sh
bun run build
bun run typecheck
bun run lint
bun run test
```

The latest audited release completed production build, TypeScript verification, lint, and tests successfully.

## Current production status

The Vercel project is linked directly to this GitHub repository and deploys from `main`.

Current verified production observations:

- Latest Vercel production deployment: `READY`
- Homepage responds successfully over HTTPS
- `/about` responds successfully over HTTPS
- No Vercel runtime error clusters were found in the recent audit window
- Latest inspected Vercel build completed successfully

Operational certification still requires real-world external-service testing for any workflow that depends on live credentials or third-party delivery, especially complete Stripe payment → webhook → funded order → fulfillment → payout and outbound email delivery.

## Key routes

| Route | Purpose |
| --- | --- |
| `/` | Public homepage |
| `/about` | Why ProvisionLoop exists and how the model works |
| `/impact` | Meal funding |
| `/help` | Food assistance |
| `/kitchen` | Kitchen network and provider workflows |
| `/volunteer` | Volunteer opportunities |
| `/partners` | Community partner workflows |
| `/civic` | Public aggregate impact ledger |
| `/trust-method` | Verification and reporting methodology |
| `/pilot` | Galveston County pilot |
| `/app` | MealForge |
| `/admin` | Platform administration |
| `/god-mode` | Platform-admin mission control |
| `/legal` | Legal center |

## Development

Install dependencies with Bun:

```sh
git clone https://github.com/garrettmclain96-prog/community-meal-flow.git
cd community-meal-flow
bun install
bun run dev
```

Run the full verification suite:

```sh
bun run verify
```

## Project documentation

- `design.md` — system design and operating model
- `requirements.md` — testable EARS-form requirements
- `roadmap.md` — product roadmap
- `docs/adr/` — architecture decision records
- `docs/verification/` — pilot verification procedures
- `docs/operations/` — operational database checks

## Product principle

ProvisionLoop is not intended to be another donation page. The operating model is:

**private need → local capacity → accountable funding → verified fulfillment → public aggregate proof**

The platform should earn trust by closing real local loops before claiming scale.