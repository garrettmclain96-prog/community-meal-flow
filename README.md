# ProvisionLoop

**GOOD INTENTIONS NEED EXECUTION.**

**NO OUTCOME. NO CREDIT.**

ProvisionLoop is the accountable system underneath a simple movement: local help should not get credit until it reaches the other end.

Someone needs food. A local kitchen has capacity. Someone is willing to fund the meal. Someone can move it. ProvisionLoop exists because those people should not have to find one another by accident — and because a donation receipt is not the same thing as dinner.

The initial pilot is in **Galveston County, Texas**.

ProvisionLoop is **not a nonprofit claim or tax-deductibility claim**. Payments remain in Stripe test mode until the production payment gates are intentionally cleared.

## The operating thesis

- **Movement:** good intentions must reach the other end.
- **System:** ProvisionLoop.
- **Unit of proof:** one completed, recorded loop.
- **Public scoreboard:** verified aggregate outcomes only.
- **Call to action:** close the next loop.

Operating sequence:

**private need → verified capacity → accountable funding + people → fulfillment → delivery → public aggregate proof**

If the outcome did not happen, ProvisionLoop does not count it as impact.

The durable public voice and visual rules live in [`docs/brand/movement.md`](docs/brand/movement.md).

## Live product

- **Canonical site:** https://www.provisionloop.org
- **Hosting:** Vercel
- **Source of truth:** GitHub `main`
- **Repository:** `garrettmclain96-prog/community-meal-flow`
- **Database/Auth:** owner-controlled Supabase
- **Payments:** Stripe
- **Email:** Resend
- **Scheduled acquisition work:** Vercel Cron

GitHub is the canonical codebase. Vercel is the production host. The production runtime does not depend on Lovable.

## Public experience

| Route | Job |
| --- | --- |
| `/` | Explain the movement, show the live loop, and drive one concrete action |
| `/about` | Founder story, movement thesis, and operating standard |
| `/impact` | Fund eligible local meal capacity |
| `/help` | Find food resources or submit private assistance need |
| `/kitchen` | Claim/register capacity and enter verification |
| `/volunteer` | Claim work that helps close a local loop |
| `/civic` | Inspect verified aggregate public proof |
| `/trust-method` | Inspect verification, privacy, and reporting rules |
| `/pilot` | Galveston County pilot status |
| `/partners` | Governed community-partner workflows |
| `/app` | MealForge household food workspace |
| `/admin` | Operations queues |
| `/god-mode` | Platform-admin mission control |
| `/legal` | Versioned Legal Center |

## Public trust rules

ProvisionLoop intentionally fails closed rather than filling gaps with marketing claims.

- No invented partners, kitchens, testimonials, contact details, or impact numbers.
- No projections presented as delivered meals.
- A mapped directory listing is not automatically an affiliated partner.
- Funding is constrained to eligible, verified, payout-ready capacity.
- Recipient-level need stays private.
- Public reporting is aggregate-first and suppresses small cohorts where needed.
- Sandbox/test activity is excluded or clearly labeled.
- A payment is not counted as a delivered meal.
- A completed outcome is the unit that counts.

## The four commitments

### Fund a meal
Put money behind capacity the live network can actually use, then follow the outcome instead of losing the story at checkout.

### Need food
Make one private request or find local resources without turning hardship into public content.

### Run a kitchen
Turn usable local capacity into funded meals after the required verification and payout-readiness gates.

### Deliver
Claim prep or delivery work that moves a real meal toward the person waiting on the other end.

## Civic proof

The `/civic` surface is the public scoreboard. It uses real-world aggregate data, separates sandbox activity, suppresses small cohorts, and labels estimated-dollar calculations rather than presenting them as settlement totals.

The homepage also exposes the latest verified delivery when one exists. Until a real recorded delivery exists, the product says so instead of manufacturing a success story.

## Founder

ProvisionLoop was founded by **Garrett McLain** around a refusal to accept the gap between intention and execution as normal.

> **I won't let good intentions fail at execution.**

The founder standard is operational rather than theatrical: find the broken handoff, make it visible, assign responsibility, and keep following the work until the outcome is real.

## MealForge

MealForge is the household food-intelligence workspace inside ProvisionLoop. Its intended end-to-end scope includes:

- custom allergies and foods to avoid;
- household food profiles;
- pantry inventory;
- recipe ingestion;
- meal planning under budget, time, equipment, and dietary constraints;
- shopping-list generation;
- cooking workflow;
- leftovers and waste reduction;
- price/provenance tracking;
- grounded AI assistance when server credentials are configured.

**MealForge is not yet certified as fully working end to end in production.** Code presence is not production readiness.

## Runtime architecture

| Layer | Current |
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
| Scheduled work | Vercel Cron |

Runtime chain:

**GitHub → Vercel → owner-controlled Supabase → Stripe / Resend**

The acquisition worker is scheduled hourly by Vercel Cron at:

`/api/public/hooks/acquisition-worker`

The worker is bearer-token protected and uses `CRON_SECRET`. Supabase `pg_cron` / `pg_net` support may exist in the database, but it is **not the active acquisition scheduler under the current architecture**.

## Verification and CI

The repository verification workflow runs:

```sh
bun run build
bun run typecheck
bun run lint
bun run test
```

A green CI run proves those automated checks passed for that commit. It does **not** by itself certify OAuth, email delivery, Stripe webhooks, scheduled jobs, God Mode authorization, or a real-world closed loop.

## Production gates that still require real evidence

- authenticated Stripe test lifecycle: funding → webhook → preparation → delivery → payout state;
- Resend outbound path and domain authentication;
- scheduled acquisition worker execution through persisted outcome;
- Garrett's actual `platform_admin` role and God Mode authorization;
- complete MealForge end-to-end user flow;
- real kitchen/operator verification before public partnership claims;
- mobile workflow QA across the major role paths;
- explicit decision before enabling live payments.

## Development

```sh
git clone https://github.com/garrettmclain96-prog/community-meal-flow.git
cd community-meal-flow
bun install
bun run dev
```

Full local verification:

```sh
bun run verify
```

## Documentation

- `PROJECT_CONTEXT.md` — durable project history and operating context
- `design.md` — architecture, risks, rationale, and non-goals
- `requirements.md` — EARS-form behavioral requirements
- `tasks.md` — pilot execution work and evidence
- `roadmap.md` — broader roadmap
- `docs/brand/movement.md` — movement voice, visual direction, and proof rules
- `docs/adr/` — architecture/product decisions
- `docs/remediation/` — failures and fixes
- `docs/runbooks/` — operating procedures
- `docs/verification/` — pilot verification procedures

---

**If help never reaches the other end, the job is not finished.**
