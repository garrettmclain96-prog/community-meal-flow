---
title: ProvisionLoop master project context
status: active
owner: Garrett McLain
priority: p0
version: 1.0.0
date: 2026-09-07
last_updated: 2026-09-11
---

# ProvisionLoop — Master Project Context

This file is the durable human/AI handoff for ProvisionLoop. It records the project story, product intent, decisions, constraints, current state, unresolved work, and launch context that can be lost when individual chats or coding sessions end.

**Maintenance rule:** update this file whenever a material product, brand, operating-model, architecture, legal, launch, monetization, or verification decision changes. Do not silently rewrite history; add dated notes to the timeline or change log when the direction changes.

## September 11, 2026 — Galveston Movement visual direction

Garrett selected the third of three homepage concepts as the new public visual direction. The system is named **Galveston Movement**: storm navy, sun-faded paper, high-visibility coral, acid-lime proof accents, documentary Gulf Coast imagery, field-signage typography, map/order-ticket texture, and direct vertical role lanes.

The homepage must feel like credible, locally born civic infrastructure capable of becoming a national movement—not a generic nonprofit template, charity fundraiser, or SaaS dashboard. The primary mobile conversion is now **Choose your lane**: request food, run a kitchen, fund meals/join the pilot, or deliver. The funding lane must continue to state the production gate honestly until live funding is cleared.

### September 11 palette fidelity pass

Garrett approved the overall direction but rejected the first implementation's color balance as too clean and too far from the selected concept. The corrected hierarchy uses storm navy for the entire global chrome and role section, weathered warm paper for editorial fields, vivid red-coral for movement copy/actions, and acid lime only as a scarce proof-marker color. The lime utility banner is retired. “It needs connection” is coral type on paper with a lime underline, matching the selected poster rather than appearing as a white-on-coral web block.

## Source-of-truth hierarchy
### September 12, 2026 — MealForge visual and workflow completion pass

MealForge shares the approved navy/paper/coral/lime palette, uses existing shared-table photography with a household ticket, and removes the unlabelled fictional weekly prices. Its public page is in the sitemap. The app shows device-save/cloud-sync status, opens without waiting for the price catalog, preserves its sign-in return path, and creates a plan in the same state update as household setup. Package leftovers cannot enter the pantry until every grocery item is marked purchased.

Local production build, typecheck, lint, and 29 existing tests passed. Browser setup generated the requested three-dinner plan; banking was disabled before purchases, enabled after checking all groceries, and remained banked after reload. Signed-in cloud persistence and mobile-device testing remain unverified. This is not evidence that every MealForge feature is production-ready.


Use the repository documents together rather than forcing one file to do every job:

1. **`PROJECT_CONTEXT.md`** — project history, intent, user expectations, current operating context, and handoff memory.
2. **`design.md`** — system design, architecture, risks, non-goals, and rationale.
3. **`requirements.md`** — testable EARS-form behavioral requirements and `[open]` guarantees.
4. **`tasks.md`** — ordered pilot execution work and completion evidence.
5. **`roadmap.md`** — broader feature roadmap outside the immediate pilot gate.
6. **`docs/adr/`** — durable architecture and product decisions.

When these disagree, prefer observed production behavior and the newest explicitly approved decision. Never report an unverified source implementation as a verified real-world outcome.

---

# 1. Identity and project evolution

## Canonical product name

**ProvisionLoop** is the canonical product and brand.

The GitHub repository remains named **`community-meal-flow`** for continuity:

- Repository: `garrettmclain96-prog/community-meal-flow`
- Source-of-truth branch: `main`
- Vercel project: `community-meal-flow`

### Name history

- The food-network project previously used **TableForward** as a working/public concept.
- Garrett rejected TableForward after realizing it was already the name of a friend's idea.
- The project was renamed to **ProvisionLoop** in early September 2026.
- The household food product was initially discussed as **CookForge**, then standardized as **MealForge**.

Do not revive TableForward as the product name.

## Founder

ProvisionLoop was founded by **Garrett McLain**.

The founder thesis is systems-oriented: communities often already have willing people, usable kitchen capacity, organizations that understand local need, sponsors, and volunteers. The failure is frequently the connective infrastructure between intention and completed outcome.

Core founder principle:

> **If it does not close the loop, it is not done.**

## Current positioning

ProvisionLoop is **community food infrastructure**, not merely a donation page or public directory.

Canonical positioning language used across the project:

- **Private need. Local capacity. Public accountability.**
- **Money in. Meals out. Proof attached.**
- **Need enters privately → capacity is verified → money and people move → fulfillment is tracked → aggregate proof closes publicly.**

The product should feel like an operating system for a local food network, not a collection of disconnected forms and dashboards.

## Geographic strategy

The initial operating pilot is **Galveston County, Texas**.

The project should prove a reliable local model before claiming broader scale. Future expansion is allowed by the architecture, but public claims must remain grounded in what is actually operating.

---

# 2. The problem ProvisionLoop is solving

The core problem is not simply lack of generosity or lack of food. The project is built around a coordination failure:

- people need food but should not have to expose that need publicly;
- kitchens can have usable capacity but need verification and a reliable funding path;
- sponsors want proof that money produced a real outcome;
- community organizations understand local need but need governed referral workflows;
- volunteers can help move meals but need clear assignments and privacy boundaries;
- the public should see aggregate outcomes without seeing recipient identities.

ProvisionLoop closes that loop by connecting private need, verified capacity, accountable funding, fulfillment, delivery, and aggregate public proof.

---

# 3. Primary users and role-based surfaces

ProvisionLoop intentionally uses **distinct role-based experiences** instead of forcing everyone into one generic dashboard.

## Households / people seeking help

Goals:

- find nearby food resources;
- submit a private assistance request;
- avoid public exposure of names, household details, or need;
- route requests through approved partner workflows when applicable.

## Sponsors / funders

Goals:

- fund actual meal capacity;
- only fund eligible kitchens;
- receive a clear test/live payment state;
- connect money to fulfilled outcomes;
- view aggregate public proof rather than vague donation claims.

## Kitchens / providers

Potential participants include restaurants, caterers, churches, community kitchens, and other eligible food providers.

Goals:

- appear in a clearly labeled directory state;
- claim or register a listing;
- complete operator verification;
- become funding-enabled only after approval and payout readiness;
- publish meal capacity / participate in fulfillment only when eligible.

## Volunteers

Goals:

- register skills and availability;
- claim prep or delivery work;
- advance delivery state without receiving unnecessary household identity data;
- accept the current volunteer waiver before governed actions.

## Community partners

Goals:

- receive and manage private referrals only after organization approval and current agreement acceptance;
- use minimum-necessary household data;
- record outcomes without exposing recipient information publicly.

## Civic/public viewers

Goals:

- see aggregate funded/delivered meal outcomes;
- inspect methodology and trust rules;
- see real versus sandbox/test activity distinguished honestly;
- never infer private recipient identities from civic reporting.

## Platform owner / administrators

Goals:

- operate queues and approvals;
- see platform health, readiness, impact, funding, kitchens, volunteers, partners, and open execution items;
- use a high-density owner command surface (**God Mode**) rather than ordinary public UX.

---

# 4. The accountable operating loop

The intended closed-loop lifecycle is:

1. Need enters privately or sponsor intent enters through funding.
2. Kitchen capacity is verified.
3. Sponsor money is constrained to eligible, funding-enabled kitchens.
4. A funded order is confirmed by payment evidence.
5. Kitchen prepares the meal/order.
6. Delivery is created and advanced through controlled states.
7. Delivery completion advances the order and queues payout.
8. Aggregate impact events feed the public ledger.
9. Recipient identities remain outside public reporting.

**Critical trust rule:** a mapped or directory kitchen is not automatically a partner, verified operator, or funding-enabled provider.

Funding currently requires the kitchen to be approved, active, claimed/operator-controlled, payout-ready, and connected to the required payout account.

Test kitchens and sandbox activity must never be presented as unqualified real-world partners or impact.

---

# 5. Trust, privacy, and anti-fake-data rules

The project has repeatedly established the following non-negotiable rules:

- Do not invent partners, kitchens, contact details, impact numbers, testimonials, funding outcomes, or live integrations.
- Do not show fictional/demo metrics as if they are pilot outcomes.
- Directory discovery is not the same thing as affiliation.
- Funding must fail closed when eligibility is missing.
- Household assistance remains private.
- Public civic data is aggregate and should not query private household/referral identity tables.
- Sandbox/test activity must be clearly labeled and ultimately separated from real pilot totals.
- Public claims should describe only what has actually been verified.

Earlier visual concepts showed sample-looking metrics such as meals served, active kitchens, volunteers, and communities. Those values are **not authorized as real production claims unless backed by actual live data**.

---

# 6. MealForge — household food operating system

## Relationship to ProvisionLoop

**MealForge is the household food-intelligence workspace inside ProvisionLoop**, not a separate unrelated brand.

The product direction emerged from an earlier CookForge concept and evolved into MealForge.

## Intended MealForge capabilities

- household onboarding and member profiles;
- dietary preferences;
- **custom allergies and foods to avoid**;
- equipment and cooking constraints;
- weekly grocery budget;
- pantry inventory;
- recipe library;
- manual recipe entry;
- pasted recipe ingestion;
- supported recipe URL import;
- ingredient normalization;
- weekly meal planning;
- planning under budget, time, equipment, and household constraints;
- consolidated package-aware shopping lists;
- price/provenance tracking;
- Cook Mode;
- meal completion;
- leftovers and waste reduction;
- feedback and learning;
- grounded AI meal-planning assistance when the required server credentials are configured.

A previous architecture direction also called for server-side use of `recipe-scrapers`, normalized schemas, deterministic planning before AI augmentation, and no fake APIs/dead buttons.

## Current MealForge truth

The repository contains MealForge routes and supporting logic, and the README describes a number of implemented capabilities. **Garrett has explicitly reported that MealForge does not yet fully work end to end.** Therefore:

- treat MealForge as **incomplete until verified by actual user flow testing**;
- do not equate the existence of screens/functions with production readiness;
- custom allergy support is a required user expectation and must remain editable and obvious in household setup/profile flows;
- the next completion pass should test the entire path from onboarding → pantry/import → plan → shopping → cook/complete rather than patching isolated screens.

## Public MealForge positioning — 2026-09-11

- `/mealforge` is the public, indexable introduction to the household product;
- shared navigation explains MealForge before asking a new visitor to enter `/app`;
- the ProvisionLoop homepage includes a dedicated MealForge spotlight with direct paths to the public overview and app;
- `/app` remains noindex until the authenticated persistence cycle and complete household workflow are verified;
- public copy must distinguish current estimated/observed pricing from any future verified live retailer feed.

---

# 7. Experience and visual direction

Garrett rejected the earlier experience as too boring/generic and asked for a complete visual redesign.

The direction that followed:

- bold, high-contrast, systems-oriented visual language;
- public site should feel intentional and alive rather than like a default SaaS dashboard;
- consistent navigation, trust states, forms, actions, and feedback patterns across workflows;
- the homepage should communicate the loop before explaining every feature;
- role-based entry points should be obvious;
- owner/admin interfaces can be denser and more mission-control-like than public pages.

The current homepage language includes:

- **NEED IN. MEALS OUT.**
- **ONE NETWORK. FOUR WAYS IN.**
- **THE GAP ISN'T GENEROSITY. IT'S COORDINATION.**
- **MONEY IN. MEALS OUT. PROOF ATTACHED.**

---

# 8. God Mode and admin expectations

Garrett specifically asked for a **God Mode** owner panel and later reported that he could not see the expected panel / that the site appeared unchanged.

Current source includes:

- `/admin` — operations queues;
- `/god-mode` — owner mission-control route;
- `/design` — private design-document dashboard.

However, owner access is not considered operationally verified until Garrett's actual authenticated account has the `platform_admin` role in the ProvisionLoop database and `has_role` returns true for it.

The existing pilot task for that grant remains blocked by database/account-access verification. Do not claim God Mode is fully available to Garrett until the authenticated role is verified in the deployed environment.

God Mode should eventually surface at minimum:

- impact/funding status;
- kitchen states and approvals;
- volunteer/delivery activity;
- partner/referral queues;
- privacy/refund/pilot queues;
- system health;
- production-readiness blockers;
- design/task readiness state.

---

# 9. Legal and participation framework

A versioned Legal Center was added during the pilot hardening work.

The seven principal documents are:

1. Terms of Service
2. Privacy Policy
3. Refund & Cancellation Policy
4. Fees & Tax Treatment
5. Kitchen Participation Agreement
6. Partner Data-Handling Agreement
7. Volunteer Assumption of Risk / Release / Waiver

Key current policy decisions:

- pilot platform fee: **$0**;
- Stripe processing cost is currently absorbed rather than presented as a platform fee;
- ProvisionLoop must not represent payments as tax-deductible donations unless the operating/legal structure later supports that claim;
- do not make nonprofit claims that are not true;
- legal acceptance is versioned and recorded;
- governed actions should require the correct current acceptance;
- live-money activation remains gated while the operating legal entity and production requirements are unresolved.

Known open legal/security item: server-side/RPC enforcement of required legal acceptance is not yet complete everywhere; some current checks are UI-side.

---

# 10. Technical architecture

Current core stack:

- **Framework:** TanStack Start
- **Frontend:** React + TypeScript
- **UI:** Tailwind CSS + shadcn/ui-style components
- **Database/Auth:** Supabase / Postgres / RLS
- **Payments/Payouts:** Stripe
- **Hosting:** Vercel
- **Source control:** GitHub
- **Package/runtime tooling:** Bun
- **CI:** GitHub Actions

Important engineering boundaries already documented in the repo:

- TanStack Start only; do not add a second router.
- App-internal server logic should use the established server-function model.
- Public API routes must verify callers as appropriate.
- New public tables require grants and RLS in the same migration.
- Roles come from `user_roles` / `has_role()` rather than an ad hoc profile flag.
- Payments remain test-mode until explicit production gates are passed.
- Never invent partner/contact/impact data.

## Deployment

Current Vercel project:

- **Project:** `community-meal-flow`
- **Git source:** `garrettmclain96-prog/community-meal-flow`
- **Branch:** `main`
- **Production Vercel URL:** `https://community-meal-flow.vercel.app`

The public brand/domain being promoted is **ProvisionLoop.org**. Domain routing and the SEO canonical host must be treated as a deployment/SEO concern and verified rather than assumed from the repository name.

Lovable remains an optional editor/design workflow; production is handled through Vercel.

---

# 11. Current key public routes

- `/` — public network homepage
- `/about` — story, founder, thesis
- `/impact` — funding
- `/help` — food assistance
- `/kitchen` — provider network / registration / claims
- `/volunteer` — volunteer opportunities
- `/partners` — partner workflow
- `/civic` — aggregate public impact
- `/trust-method` — trust/verification methodology
- `/pilot` — Galveston County pilot
- `/app` — MealForge
- `/admin` — platform operations
- `/god-mode` — owner mission control
- `/design` — private design dashboard
- `/legal` — Legal Center

---

# 12. What has been completed or substantially implemented

The following have been completed in source or previous deployment passes, subject to the distinction between source completion and real-world verification:

- full ProvisionLoop rename away from TableForward;
- major public visual/experience redesign;
- public role-based pathways for funding, help, kitchens, volunteers, partners, civic reporting, and pilot information;
- founder/about story;
- trust-state labeling for mapped/test/claimed/funding-enabled kitchens;
- funding eligibility gates in source;
- private assistance and partner workflow structure;
- volunteer/delivery workflow structure;
- aggregate civic reporting structure;
- Legal Center and versioned legal documents;
- versioned acceptance recording/gating in multiple flows;
- `design.md`;
- EARS-form `requirements.md`;
- `tasks.md` pilot execution file;
- ADR system;
- private design-document dashboard;
- admin and God Mode routes;
- Vercel/GitHub production integration;
- build/type/lint/test verification passes during prior release work.

---

# 13. Current open pilot blockers

The repository's pilot task system remains the precise execution list. Major known blockers include:

1. **Verify Garrett's `platform_admin` role** in the actual ProvisionLoop database.
2. **Run the authenticated Stripe sandbox lifecycle end to end:** fund → webhook confirm → prepare → deliver → payout; record real observed IDs/counts/amounts.
3. **Obtain deployed Supabase advisor/function evidence** and resolve any remaining SECURITY DEFINER/search-path issues rather than relying on historical warning counts.
4. **Finish browser/route smoke verification** in a reachable deployed environment.
5. **Configure a sending domain and admin email notifications.**
6. **Confirm pilot date and eligibility language.**
7. **Verify real operator authority before approving a kitchen claim.**
8. **Move legal acceptance enforcement into server/RPC boundaries where required.**
9. **Improve civic reporting privacy suppression, estimated-dollar labeling, and real-vs-sandbox separation.**
10. **Show admin query failures separately from genuinely empty queues.**
11. **Complete production activation gates:** migrations, approved partner, payment configuration, legal entity, authenticated assistance/referral verification, outbound mail, and mobile QA.
12. **Do not turn on live payments until those gates are intentionally cleared.**

---

# 14. Launch, recruiting, and outreach context

## Current phase

As of **September 7, 2026**, Garrett has begun publicly promoting ProvisionLoop and has already made a recruitment/interest post for **ProvisionLoop.org**.

The immediate goal is not generic awareness. It is to recruit the first real operating participants needed to close a real local loop.

Priority stakeholder groups for outreach:

- local kitchens / restaurants / caterers / churches / community kitchens;
- food pantries and trusted community organizations;
- volunteer drivers / prep volunteers;
- local businesses or individuals willing to sponsor meals;
- civic/community leaders who can help with trust, referrals, or distribution;
- local media/community pages once the operating proof is strong enough to support the story.

A previous launch concept was **“Fund the First 100”** — useful as a campaign concept, but it should not imply that 100 meals have already been funded or delivered.

## Email outreach

Garrett asked ChatGPT to draft the needed outreach emails and asked whether Gmail could be connected so the messages could be sent on his behalf.

The current ChatGPT environment has Gmail actions available for creating drafts and sending emails from the authenticated Gmail account when explicit recipients and sending intent are available.

Recommended outreach system:

- create role-specific templates rather than one mass email;
- maintain a prospect list with name, organization, role, email, outreach category, status, last contact, and follow-up date;
- send small personalized batches;
- track replies and objections;
- convert successful language into reusable sequences.

Do not spam broad scraped lists. The objective is credible local participation, not vanity send volume.

---

# 15. SEO state and active SEO work

Garrett requested an SEO fix on September 7, 2026.

## What source already has

The current code includes route-level titles/descriptions on important public pages, Open Graph metadata on several routes, and a ProvisionLoop/Galveston County homepage title/description.

The homepage currently targets language such as:

- ProvisionLoop
- local food infrastructure
- Galveston County
- fund local meals
- food assistance
- verified kitchen capacity
- volunteer delivery
- public accountability / aggregate proof

## SEO gaps identified in the current audit

At the time this context file was created:

- no canonical-link implementation was found in the repository search;
- no sitemap implementation was found in repository search;
- no confirmed public `robots.txt` implementation was found;
- canonical host/domain strategy needs to align to **ProvisionLoop.org** after domain routing is verified;
- root metadata has Open Graph/Twitter basics but should be normalized with canonical URLs and consistent social-image handling;
- authenticated/private product surfaces should be reviewed for `noindex` so search engines index the public acquisition/trust pages rather than private app/admin routes;
- structured data / JSON-LD should be reviewed/added where appropriate;
- route metadata should be audited for duplicate/default descriptions and missing `og:url` / Twitter image equivalents.

## SEO objective

SEO should not be treated as keyword stuffing. The acquisition architecture should create indexable public pages that answer concrete local intent, including:

- food assistance in Galveston County;
- help getting meals locally;
- sponsor/fund local meals;
- volunteer meal delivery;
- community kitchen participation;
- Galveston County food-support network;
- local food infrastructure / community food coordination;
- ProvisionLoop trust/methodology and public-impact pages.

No page should make inflated claims simply to rank.

---

# 16. Business model and monetization status

Current pilot economic decision:

- **Platform fee = $0** during the pilot.

Future monetization is not yet locked and should not be invented in public copy.

The near-term business value is proving that ProvisionLoop can reliably coordinate and document a closed local food loop. Future monetization can be designed from verified operating leverage: payment/coordination fees, sponsor tools, partner infrastructure, enterprise/community deployments, or other models only after the core loop works and the legal/economic structure is intentionally chosen.

---

# 17. Success criteria for the pilot

The pilot should be judged by completed real outcomes, not feature count.

A credible minimum proof set includes:

- at least one real verified funding-enabled kitchen;
- at least one real sponsor/funder transaction when live-money gates are cleared;
- payment evidence connected to a funded order;
- actual preparation and delivery state progression;
- payout/reconciliation evidence;
- a private household/partner flow that respects access controls;
- a volunteer/delivery flow that does not expose unnecessary recipient identity;
- aggregate public reporting that can be reconciled to source events;
- outbound operational email that actually sends;
- mobile usability on the production domain;
- no fake or sandbox activity blended into real impact claims.

---

# 18. Working rules for future AI/coding sessions

Before changing ProvisionLoop, an agent should read:

1. `PROJECT_CONTEXT.md`
2. `AGENTS.md`
3. `design.md`
4. `requirements.md`
5. `tasks.md`
6. relevant ADRs and route/source files

Future sessions should:

- distinguish **user-reported behavior**, **source implementation**, and **deployed verification**;
- never mark a workflow complete solely because code exists;
- preserve approved branding and trust language;
- keep payments test-mode until the activation gate changes explicitly;
- update `tasks.md`, relevant requirements, design/ADR docs, and this context file after material changes;
- record what was actually tested and what remains assumed;
- optimize for one reliable closed loop before adding broad new scope.

---

# 19. Timeline of major decisions

## 2026-08-28

- CookForge/MealForge concept developed into a household food operating system.
- MealForge adopted as the household-facing name.
- Direction set to preserve the civic/community food platform as the parent ecosystem while MealForge becomes the household surface.
- Role-based surfaces, private household data, normalized food data, deterministic planning, and no fake/dead features established as key constraints.

## 2026-09-03

- `community-meal-flow` redesign pushed through the project.
- TableForward working name rejected because it conflicted with a friend's existing idea.
- **ProvisionLoop** adopted and deployed as the canonical brand.
- Public positioning standardized around a closed-loop Galveston food network.

## 2026-09-04

- Trust layer hardened so mapped/unclaimed listings cannot receive funding.
- Verified/funding-enabled distinction emphasized.
- Legal Center and seven core legal documents added.
- Pilot remained in Stripe test mode.

## 2026-09-05

- `requirements.md` added in EARS form.
- `tasks.md` generated from risks/open items.
- traceability/design-document system formalized.
- private design dashboard added.

## 2026-09-06

- Garrett pushed for the visible God Mode/owner experience and reported that the expected panel was not evident.
- MealForge functionality was called out as not fully working.
- custom allergy/avoidance handling was reaffirmed as required functionality.

## 2026-09-07

- ProvisionLoop recruitment/public-interest post published by Garrett.
- Outreach shifted from product-only work toward recruiting real kitchens, partners, volunteers, sponsors, and advocates.
- Gmail-assisted outreach requested.
- SEO audit initiated.
- Master project context file created to make project memory durable across chats and coding sessions.

---

# 20. Current immediate priorities

Unless Garrett explicitly reprioritizes, the immediate execution stack is:

1. **Recruit real pilot participants** rather than continuing to build in a vacuum.
2. **Draft and send role-specific outreach emails** and track responses/follow-ups.
3. **Fix technical SEO** around ProvisionLoop.org: canonical host, sitemap, robots/index rules, structured metadata, social previews, and route-level acquisition intent.
4. **Restore/verify Garrett's owner access to God Mode/admin.**
5. **Finish MealForge end-to-end functionality**, not just individual components.
6. **Complete the pilot verification blockers in `tasks.md`.**
7. **Only then consider live-money activation and broader public growth.**

---

# Change log

## v1.0.0 — 2026-09-07

- Created durable ProvisionLoop project-memory file.
- Consolidated naming history, product vision, MealForge relationship, trust rules, architecture, legal framework, pilot blockers, launch/outreach state, SEO audit state, and current priorities.
- Added explicit rule to distinguish implemented source behavior from deployed/real-world verification.
