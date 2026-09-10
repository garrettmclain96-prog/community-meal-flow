# ProvisionLoop

**Private need. Local capacity. Public accountability.**

**Money in. Meals out. Proof attached.**

ProvisionLoop is a community food-infrastructure platform being piloted in Galveston County, Texas. It connects private household need, usable local kitchen capacity, sponsors, volunteers, community partners, and public aggregate accountability in one governed workflow.

ProvisionLoop is **not a nonprofit claim or tax-deductibility claim**. The product remains in pilot stage and payments remain in Stripe test mode until production gates are cleared.

## Live product

- **Canonical site:** https://www.provisionloop.org
- **Hosting:** Vercel
- **Source of truth:** GitHub `main`
- **Repository:** `garrettmclain96-prog/community-meal-flow`
- **Owner-control cutover:** PR #24 / `de-lovable-control`

GitHub is the canonical codebase. Vercel is the production host. The target architecture has **no Lovable runtime dependency**.

## Why ProvisionLoop exists

Communities often already have households with real need, local kitchens with usable capacity, organizations that understand the local landscape, sponsors willing to fund outcomes, and volunteers willing to move resources. ProvisionLoop exists to provide the connective infrastructure that turns those pieces into completed, auditable outcomes.

> **If it does not close the loop, it is not done.**

Operating model:

**private need → verified local capacity → accountable resources → verified fulfillment → public aggregate proof**

## Product surfaces

### Household assistance
Households can find resources and submit assistance requests without turning private need into public content. Recipient-level information is not intended for public reporting.

### Kitchen network
Restaurants, caterers, churches, community kitchens, and other eligible providers can register or claim listings. Registration does not automatically make a kitchen verified or funding-enabled.

### Funding
ProvisionLoop is designed to route funding only through eligible, verified, payout-ready providers. The pilot platform fee is currently **$0**. Payments remain in Stripe test mode until the full payment lifecycle is certified.

### Volunteers and delivery
Volunteer workflows support prep and delivery operations. Governed actions require the current volunteer waiver and applicable authorization checks.

### Partners
Community organizations can participate in coordination workflows subject to access controls and the current partner data-handling agreement.

### Civic accountability
Public reporting is aggregate-first. Sandbox/test activity is separated from real pilot totals, and recipient identities are not meant to appear in public civic reporting.

### MealForge
MealForge is the household food-intelligence workspace inside ProvisionLoop. Its intended end-to-end scope includes custom allergies and foods to avoid, household food profiles, pantry tracking, recipe ingestion, meal planning under budget/time/equipment constraints, grocery-list generation, cooking workflow, leftovers, pricing provenance, and grounded AI assistance when server-side AI credentials are configured.

**Important:** MealForge has substantial implementation in the repository, but it is **not yet certified as fully working end-to-end in production**. Code presence must not be treated as production readiness.

## Architecture

| Layer | Current / target |
| --- | --- |
| Application | TanStack Start + React 19 + TypeScript |
| Styling | Tailwind CSS + component primitives |
| Production hosting | Vercel |
| Source control | GitHub |
| Database | Owner-controlled Supabase Postgres |
| Authentication | Native Supabase Auth |
| Payments | Direct Stripe SDK/API |
| Email | Resend |
| CI | GitHub Actions |
| Package/runtime tooling | Bun |
| Scheduled work | Supabase `pg_cron` + `pg_net` / owner-controlled worker path |

Target dependency chain:

**GitHub → Vercel → owner-controlled Supabase → Stripe / Resend**

Lovable may have been used to generate or edit earlier versions, but it is **not part of the target production runtime**.

## Owner-control cutover status — 2026-09-10

The `de-lovable-control` branch and PR #24 are the controlled severance path.

### Completed and verified

- native TanStack Start + Vite + Nitro build path
- Lovable Vite build wrapper removed
- native Supabase OAuth application path
- Lovable cloud-auth runtime integration removed
- direct Stripe SDK path in application code
- owner-controlled Supabase project created
- complete application schema migration history replayed into the owner-controlled project
- `pg_cron` and `pg_net` installed and verified
- database security-hardening migrations applied
- migration branch public Supabase configuration points to the owner-controlled ProvisionLoop project
- owner-controlled acquisition worker/scheduler database support installed
- successful Vercel preview deployment
- CI passes production build, typecheck, lint, and all current automated tests
- cutover runbook, architecture decision, remediation records, and release gate are in the repository

### Remaining production gates

Before production traffic is moved to the owner-controlled runtime, verify these **end-to-end against the cutover environment**:

1. Vercel server-side Supabase/service credentials
2. Supabase authentication, including configured Google OAuth if enabled
3. Stripe test checkout, webhook verification, ledger updates, and payout-readiness invariants
4. Resend outbound-email path and domain authentication
5. acquisition worker execution from scheduler through persisted outcome
6. God Mode/platform-admin authorization using a real authorized user
7. public, household, kitchen, volunteer, partner, admin, and MealForge smoke paths
8. final lockfile/frozen-install gate and production deployment smoke/security checks

Production must not be declared migrated merely because the code builds. External integrations require real runtime verification.

## Security and governance controls

The repository includes fail-closed controls intended to support the pilot, including platform-admin checks for privileged operations, pending review for new kitchen registrations/claims, funding gates tied to verification and payout readiness, restrictions on unverified kitchen operations, legal-acceptance checks, partner data-access controls, volunteer waiver gates, restricted public kitchen fields, aggregate-only civic reporting, sandbox/test separation, and pinned `search_path` patterns for security-definer database functions.

## Key routes

| Route | Purpose |
| --- | --- |
| `/` | Public ProvisionLoop experience |
| `/about` | Story and operating thesis |
| `/impact` | Funding surface |
| `/help` | Household assistance |
| `/kitchen` | Kitchen network and provider workflows |
| `/volunteer` | Volunteer workflows |
| `/partners` | Community-partner workflows |
| `/civic` | Public aggregate accountability |
| `/trust-method` | Verification/reporting methodology |
| `/pilot` | Galveston County pilot |
| `/app` | MealForge workspace |
| `/admin` | Platform administration |
| `/god-mode` | Platform-admin mission control |
| `/legal` | Legal center |

## Verification and CI

The repository verification workflow runs:

```sh
bun run build
bun run typecheck
bun run lint
bun run test
```

A green CI run means the checked code passed automated checks. It does **not** by itself certify OAuth, email delivery, Stripe webhooks, scheduled jobs, or other external services.

## Development

```sh
git clone https://github.com/garrettmclain96-prog/community-meal-flow.git
cd community-meal-flow
bun install
bun run dev
```

Run the full local verification gate with:

```sh
bun run verify
```

## Project documentation

- `PROJECT_CONTEXT.md` — durable project context and current operating assumptions
- `design.md` — system design and operating model
- `requirements.md` — testable EARS-form requirements
- `roadmap.md` — product roadmap
- `tasks.md` — implementation/open-item tracking
- `docs/adr/` — architecture decisions
- `docs/remediation/` — failures and remediation records
- `docs/runbooks/` — operational/cutover procedures
- `docs/verification/` — pilot verification procedures
- `docs/operations/` — operational database checks
- `docs/acquisition/` — acquisition pipeline design

## Founder

ProvisionLoop was founded by **Garrett McLain** around a systems-first thesis: local generosity is more useful when the infrastructure can reliably convert intent into a completed, observable outcome.

## Product principle

ProvisionLoop is not intended to be another donation page or a dashboard that mistakes activity for completion.

**Private need. Local capacity. Public accountability.**

**Money in. Meals out. Proof attached.**
