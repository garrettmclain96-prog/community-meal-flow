# ProvisionLoop

**Private need. Local capacity. Public accountability.**

**Money in. Meals out. Proof attached.**

ProvisionLoop is a community food-infrastructure platform being piloted in Galveston County, Texas. It is designed to connect private household need, usable local kitchen capacity, sponsors, volunteers, community partners, and public aggregate accountability in one governed workflow.

ProvisionLoop is **not a nonprofit claim, a tax-deductibility claim, or a promise that every workflow is already production-certified**. The product is in pilot stage and payments remain in test mode until the production gates are cleared.

## Live product

- **Canonical site:** https://www.provisionloop.org
- **Hosting:** Vercel
- **Source of truth:** GitHub `main`
- **Repository:** `garrettmclain96-prog/community-meal-flow`
- **Current owner-control migration:** PR #24 / `de-lovable-control`

GitHub is the canonical codebase. Vercel is the production host. The target architecture has **no Lovable runtime dependency**.

The current production database/auth backend is still the legacy Lovable-managed Supabase environment while an owner-controlled Supabase project is being migrated and verified. Production traffic will not be switched until schema, data, auth, payments, email, scheduled work, and regression checks pass.

## Why ProvisionLoop exists

Communities often already have people who care, households with real need, local kitchens with unused capacity, organizations that understand the local landscape, and volunteers willing to move resources. The failure is often connective infrastructure: getting those pieces from intention to a completed, auditable outcome.

ProvisionLoop is built around one rule:

> **If it does not close the loop, it is not done.**

The operating model is:

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

MealForge is the household food-intelligence workspace inside ProvisionLoop. Its intended end-to-end scope includes:

- custom allergies and foods to avoid
- household food profiles
- pantry tracking
- recipe ingestion
- meal planning under budget, time, and equipment constraints
- grocery-list generation
- cooking workflow
- leftovers
- pricing provenance
- grounded AI assistance when server-side AI credentials are configured

**Important:** MealForge has substantial implementation in the repository, but it is **not yet certified as fully working end-to-end in production**. Code presence must not be treated as production readiness.

## Architecture

| Layer | Current / target |
| --- | --- |
| Application | TanStack Start + React 19 + TypeScript |
| Styling | Tailwind CSS + component primitives |
| Production hosting | Vercel |
| Source control | GitHub |
| Database | Supabase Postgres |
| Authentication | Native Supabase Auth |
| Payments | Direct Stripe SDK/API |
| Email | Resend |
| CI | GitHub Actions |
| Package/runtime tooling | Bun |
| Scheduled work | Owner-controlled cron/scheduler |

### Owner-control rule

A production-critical capability should not depend on a proprietary editor/runtime intermediary when the underlying service can be owned directly.

The target dependency chain is:

**GitHub → Vercel → owner-controlled Supabase → Stripe / Resend**

Lovable may have been used to generate or edit earlier versions of the project, but it is **not part of the target production architecture**.

## De-Lovable migration

The `de-lovable-control` branch and PR #24 are the controlled severance path. Production remains on `main` until the replacement backend is proven.

Completed or proven on the migration branch:

- native TanStack Start / Vite / Nitro build path
- removal of the Lovable Vite build wrapper
- native Supabase OAuth path
- removal of the Lovable cloud-auth package/integration
- direct Stripe SDK path instead of the Lovable Stripe gateway
- owner-controlled cron secret path
- removal of Lovable gateway health dependency
- successful Vercel preview builds without Lovable build packages
- owner-controlled Supabase project created and healthy
- cutover runbook, remediation record, and release gate added

Still required before production cutover:

- replay and validate the complete database migration history
- migrate production data safely
- validate RLS, functions, triggers, and generated types against the new database
- configure and verify Google OAuth on the owner-controlled Supabase project
- configure Vercel server-side Supabase credentials securely
- complete Resend domain verification and rotate the previously exposed API key
- configure direct Stripe credentials and webhook secrets
- run payment, webhook, fulfillment, and payout tests in test mode
- verify the acquisition worker succeeds on schedule
- regression-test public, household, kitchen, volunteer, partner, admin, and God Mode workflows
- cut production over only after the release gate passes

## Operational status — 2026-09-10

The public production site is serving from Vercel. During the current systems audit, several issues were identified that older README text incorrectly described as healthy:

- Google sign-in was calling a Lovable-only `~oauth` route on Vercel and returning 404; the application code has been patched to use native Supabase Google OAuth, with provider-side configuration still requiring end-to-end validation.
- The scheduled acquisition worker has returned repeated HTTP 503 responses in production. The current migration is removing the backend/configuration dependency that caused the Vercel-hosted worker to lack the required privileged database configuration.
- Resend SPF records are verified; DKIM verification is still pending as of this update.
- Stripe remains in test mode. Live-money operation is **not** certified.
- The owner-controlled replacement Supabase project exists and is healthy, but schema/data cutover is not complete.

Do not interpret a successful build or the presence of code as proof that a third-party-dependent workflow is operational. External integrations require real end-to-end verification.

## Security and governance controls

The repository includes fail-closed controls intended to support the pilot, including:

- platform-admin checks for privileged operations
- pending review for new kitchen registrations/claims
- funding gates tied to verification and payout readiness
- restrictions on unverified kitchen operations
- legal-acceptance checks for governed actions
- partner data-access controls
- volunteer waiver gates
- restricted public kitchen fields
- aggregate-only civic reporting patterns
- sandbox/test separation in public impact reporting
- pinned `search_path` patterns for security-definer database functions

These controls must be revalidated after migration to the owner-controlled Supabase project.

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

PR verification also reports repository-size metrics so line counts are measured from the checked-out commit rather than guessed from GitHub file sizes.

A green CI run means the checked code passed those automated checks. It does **not** by itself certify Google OAuth, Resend delivery, Stripe webhooks, scheduled jobs, or other external services.

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
