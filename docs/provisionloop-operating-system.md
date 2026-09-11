# ProvisionLoop Operating System

Status: active operating contract  
Owner: Garrett McLain  
Operator: authorized AI-assisted delivery workflow  
Canonical product: ProvisionLoop  
Canonical production domain: https://www.provisionloop.org  
Initial geography: Galveston County, Texas

## 1. Objective

ProvisionLoop should operate as a continuously improving community-food infrastructure system, not a static website.

The system objective is to move a real local need through an auditable chain:

**private need -> verified local capacity -> confirmed funding -> preparation -> delivery -> proof -> public aggregate -> learning -> next action**

MealForge is the household food-intelligence surface inside the same system. It should turn household constraints, pantry state, allergies/foods-to-avoid, recipes, time, budget and equipment into useful plans without compromising household privacy.

The operating target is not feature count. It is a reliable, measurable loop that can acquire participants, complete real pilot workflows, expose failures quickly, improve from evidence, and eventually expand beyond one county without rewriting the core platform.

## 2. Non-negotiable invariants

1. Public impact is evidence-backed. No unpaid pledge, unverified kitchen or incomplete delivery becomes a public success metric.
2. Household identity is private. Sponsors, volunteers and public reporting receive only the minimum information required for their role.
3. Operator consent is real. A public listing is not represented as a partner until a real operator claims and verifies authority.
4. Money fails closed. Live charges or payouts remain disabled until the sandbox lifecycle, legal gates, reconciliation and production configuration are verified.
5. Automation is observable. A cron job, worker or outreach sequence is not considered healthy merely because its endpoint is reachable.
6. Production changes are reversible where practical. Code moves through branches/previews/tests before production; destructive database changes require an explicit migration and rollback/data-preservation plan.
7. Claims remain narrower than evidence. ProvisionLoop is not described as a nonprofit and does not promise tax deductibility unless that becomes legally true and documented.

## 3. Continuous operating loop

### Research

Use public research, connected first-party data, Search Console/SEO data, product analytics, support feedback and pilot outcomes to identify the highest-value constraint. Research outputs must become a decision, issue, requirement, ADR or experiment rather than disappear into chat.

### Architecture

Translate the constraint into a testable system change. Update requirements/traceability when behavior changes, use ADRs for material architectural choices, and define success/failure metrics before implementation.

### GitHub

GitHub `main` remains source of truth. Substantive changes use a focused branch and pull request. Each PR states why, changed behavior, validation evidence and any deployment gate. Small reversible documentation-only changes may be committed directly only when repository policy allows it.

### Supabase

Postgres + RLS is the data/authorization boundary. Schema and RPC changes are forward migrations. Privileged functions must pin `search_path`, restrict execute grants and perform their own role/ownership checks. Service-role credentials remain server-only.

### Vercel

Every code change should produce a preview deployment before production. Production is the canonical domain. Deployment success alone is insufficient: application routes, critical server functions and dependency readiness must also pass probes.

### Testing and debugging

The minimum merge gate for behavior changes is typecheck + relevant tests + production build + route smoke. High-risk flows add authenticated integration tests. Failures should be converted into regression tests whenever feasible.

### Visual design

Design serves comprehension and conversion, not decoration. Every major surface should make the next action obvious, explain trust states honestly, work on mobile first, and preserve a coherent ProvisionLoop design language. Design changes are validated against real content and narrow mobile widths before release.

### Deployment

Deploy only after preview/build validation and required runtime configuration are present. Production changes are then smoke-tested against canonical URLs. Database migrations and application code must be ordered so either side can tolerate the rollout boundary.

### Monitoring

Monitor outcomes and dependencies, not just HTTP reachability. Minimum production signals include route availability, worker readiness, Supabase failures, payment/webhook failures, outbound-email failures, GitHub/Vercel deployment failures and user-facing error rates. Monitoring must create an actionable incident rather than merely log a failure.

### Marketing and distribution

Marketing is a funnel tied to real platform roles: household, kitchen operator, volunteer, community partner and sponsor. Acquisition should favor consented/self-service entry points. Outreach is segmented by role, records outcomes, suppresses opt-outs/replies and never manufactures partnership claims.

### Iteration

Every week, rank work by evidence: reliability blockers first, then completion/conversion bottlenecks, then acquisition, then enhancements. A shipped feature with no usage or measurable outcome is not automatically more valuable than a removed source of friction.

## 4. Autonomous authority model

### Green: AI operator may execute without a new approval

- Public/product/market research.
- Repository reads, issue creation, focused branches and pull requests.
- Reversible code fixes, tests, documentation and preview deployments.
- Read-only production diagnostics and logs.
- Supabase reads/advisors and non-destructive migrations that preserve existing data and security boundaries.
- Test/sandbox Stripe analysis and test-mode integration work.
- Resend configuration diagnostics and consent-based transactional/outreach logic.
- SEO audits, analytics instrumentation, landing-page experiments and marketing drafts.
- Monitoring improvements that do not expose secrets or customer data.

### Yellow: execute only after an explicit human go-ahead for the specific action

- Activating live Stripe charges, transfers or payouts.
- Sending a new bulk outbound campaign to people who did not submit a ProvisionLoop form or otherwise opt in.
- Destructive or irreversible production-data migrations.
- Changing production authentication/authorization in a way that broadens access.
- Rotating/revoking credentials when it could interrupt production.
- Publishing new legal representations, tax claims, nonprofit claims or contractual commitments.
- Purchasing paid services, domains, ads or data.

### Red: do not automate as an optimization shortcut

- Fabricating kitchens, partners, deliveries, testimonials, impact or demand.
- Exposing household/private records for marketing or public proof.
- Circumventing access controls, terms, anti-abuse systems or third-party authorization.
- Sending deceptive/spam outreach or ignoring unsubscribe/do-not-contact states.
- Moving real money around merely to make metrics look active.

## 5. Authorized systems and required capability

| System | Purpose in the loop | Required capability |
| --- | --- | --- |
| GitHub | Source, issues, branches, PRs, CI, rollback history | Read/write repo, branches/PRs, Actions/issues |
| Supabase | Auth, Postgres, RLS, RPCs, product state, operational evidence | SQL/migrations/advisors plus server-side runtime credential in Vercel |
| Vercel | Preview/production deploys, runtime logs, domain, cron/server execution | Project/deployment/log access plus environment-variable management |
| Resend | Transactional email and role-specific follow-up | Verified domain, server-side API key, delivery/log access |
| Stripe | Sponsor funding and kitchen payout lifecycle | Sandbox access now; live-mode activation only after explicit gate |
| Product analytics | Funnels, activation, retention, experiment evidence | ProvisionLoop-specific project and event ingestion |
| Search Console / SEO | Search discovery, technical SEO, query/page opportunity | provisionloop.org property access |
| Prospecting/research | Identify relevant organizations and decision makers | Business discovery/enrichment; outbound remains consent/compliance gated |
| Figma/Canva | Reusable visual system, campaign assets and design review | Design create/edit access when needed |
| Gmail / Drive | Partner conversations, attachments, proposals and operating records | Search/read plus explicit send/edit actions when requested/authorized |

## 6. Current KPI tree

### North-star operational metric

**Verified meals delivered** — only a completed evidence-backed delivery counts.

### Leading indicators

- Real assistance requests that meet pilot eligibility.
- Claimed + authority-verified kitchens.
- Payout-ready kitchens in test/live mode as applicable.
- Confirmed sponsor funding.
- Active volunteers and claimed delivery runs.
- Median time from funded order to delivered verification.
- Funnel conversion by role: landing -> signup -> verified/activated -> completed action.
- MealForge activated households and successful cloud-synced planning sessions.

### Guardrail metrics

- 0 false public impact events.
- 0 household identity leaks to public/sponsor/volunteer surfaces.
- 0 unauthorized admin/role escalations.
- 0 outreach after do-not-contact/reply suppression.
- 0 live-money activation before the production gate is explicitly cleared.

## 7. Production readiness gates

ProvisionLoop is pilot-ready only when all of the following have evidence, not merely source code:

- Sponsor sandbox lifecycle completes end-to-end: fund -> webhook confirmation -> kitchen preparation -> delivery -> verification -> payout/settlement behavior.
- Platform admin identity and authorization render correctly in production.
- MealForge completes an authenticated mobile workflow with reliable cloud persistence, including custom allergies/foods-to-avoid.
- Kitchen claim approval verifies real operator authority.
- Server-side legal acceptance cannot be bypassed through a direct handler/RPC path.
- Civic reporting has deliberate privacy suppression and separates test/sandbox evidence from real production impact.
- Transactional/outreach email sends from the ProvisionLoop domain and records a persisted success/failure outcome.
- Production workers have real readiness monitoring and alerting.
- Mobile navigation, forms, errors and core conversions are tested on narrow iPhone-class widths.
- A live-payment decision is explicitly made after the above gates; live mode is never inferred from code completeness.

## 8. Execution order from 2026-09-11

P0-A — Fix observability so a broken backend cannot look healthy.  
P0-B — Restore/verify server runtime credentials and make acquisition email worker genuinely ready.  
P0-C — Complete the authenticated sandbox funding-to-delivery lifecycle.  
P0-D — Harden MealForge cloud sync and run the authenticated mobile E2E pass.  
P0-E — Close operator-authority, legal-bypass and civic-suppression requirements.  
P1-A — Instrument the role funnels and production error telemetry.  
P1-B — Build a consent-first Galveston County acquisition pipeline for kitchens, partners, volunteers, sponsors and households.  
P1-C — Improve conversion-oriented visual design based on funnel evidence.  
P1-D — Run recurring SEO/content/outreach experiments and promote winners.  
P2 — Package the pilot operating model so a second county can be added by configuration/data providers rather than a rewrite.

## 9. Definition of done

A work item is not done because code exists. It is done when the intended behavior is deployed or deliberately held behind a documented gate, has verification evidence, is observable in production, has a rollback/recovery path appropriate to its risk, and updates the source-of-truth docs when architecture or product behavior changed.
