---
title: ProvisionLoop pilot completion tasks
status: in_progress
owner: Garrett McLain
priority: p0
version: 1.0.0
date: 2026-09-05
last_updated: 2026-09-08
---

# Pilot completion tasks

Derived from design.md Risks & Open Questions and roadmap.md open items.
Checked means the stated source/production condition was verified; live-money
activation remains separately gated. Evidence: [pilot checks](./docs/verification/pilot-checks.md).

1. [x] **Monitored contact** [FR-203, FR-502]: link existing contact constant from
       Trust & Method, site footer and Legal Center; remove unpublished-channel copy;
       update roadmap. Source address already existed; no new contact invented.
2. [x] **Test kitchen labels** [FR-201, FR-601]: include `is_test` in directory,
       fundable, claim-listing and civic queries; label home, help, impact select/detail,
       kitchen owner/listing and civic kitchen capacity views. Public policies and civic
       aggregation now exclude sandbox providers/events from real-world totals.
3. [x] **Pilot navigation** [FR-502]: add `/pilot` to shared desktop/mobile header
       and footer navigation.
4. [x] **Garrett platform_admin grant** [FR-701]: verified against the actual
       Lovable-managed ProvisionLoop database on 2026-09-08. The account
       `garrettmclain96@gmail.com` has `platform_admin` (and household) role membership.
5. [ ] **Authenticated sandbox lifecycle** [FR-101, FR-102, FR-103, FR-302]: fund →
       confirm → prepare → deliver → payout remains intentionally open. Live money is not
       enabled in this pass; do not replace webhook/payment evidence with manual ledger rows.
6. [x] **SECURITY DEFINER search-path verification** [FR-703]: production catalog
       inspected through the Lovable-managed database on 2026-09-08. All 25 public
       `SECURITY DEFINER` functions observed have `search_path=public` pinned. The old
       historical count of 19 warnings was not a trustworthy measured current count.
7. [ ] **Verification** [FR-201, FR-203, FR-502, FR-702, FR-703]: production Vercel
       deployments and public route smoke are reachable and recent hardening builds are READY;
       regression tests now cover provider authority and aggregate-only civic proof. Keep this
       item open until the full authenticated mobile workflow and MealForge end-to-end pass are
       exercised after the current persistence cleanup.

## Supporting design-doc deliverables

8. [x] **Requirements and traceability** [FR-101–FR-703]: EARS stories/criteria,
       `[open]` guarantees, component and verification table.
9. [x] **Collaborator contract** [FR-703]: Appendix C5 operating document;
       CLAUDE.md under 60 lines references AGENTS.md without changing it.
10. [x] **Private dashboard** [FR-702]: raw build globs, authenticated server RPC
        gate, priority/status/date order, summary, questions and ADR expansion.
        Decision: docs/adr/0002-private-build-time-design-dashboard.md.

## Carried forward — outside this implementation pass

11. [ ] **Sending domain and admin email notifications** [FR-402, FR-703].
12. [ ] **Confirm provisional pilot date and eligibility** [FR-502].
13. [x] **Verify operator authority before claim approval** [FR-202]: production DB
        approval now fails closed unless a platform admin supplies a verification method and
        concrete evidence note. Evidence is stored in an admin-only RLS-protected audit table;
        kitchen owners cannot change their own trust/approval/test flags.
14. [ ] **Enforce legal acceptance in server functions/RPCs** [FR-501]: kitchen claim
        and self-registration now enforce Terms v1.0, Privacy v1.0 and Kitchen Agreement v1.0
        at the database boundary; partner/referral and volunteer delivery RPCs also enforce
        their governed agreements. Keep the umbrella item open until every remaining direct-call
        path, including money activation paths, has negative-bypass verification.
15. [x] **Civic suppression, estimated-dollar labels, sandbox separation** [FR-601]:
        civic reporting now comes from `get_public_civic_snapshot`; raw impact rows are not
        anonymously/browser-readable, test kitchens/events/shifts are separated, cohorts under
        five are suppressed, and sponsor-dollar values remain explicitly estimated.
16. [x] **Show admin query errors separately from empty queues** [FR-701]: verified in
        the current admin route; query errors render as errors rather than being presented as
        empty operational queues.
17. [ ] **Production activation gates** [FR-101, FR-401, FR-502]: verify remaining
        migrations/source parity, first approved partner, payment configuration, legal entity,
        authenticated assistance/referral workflow, full MealForge persistence cycle and
        published mobile QA. Do not switch on live payments in this pass.
18. [x] **Public MealForge entry point**: add an indexable `/mealforge` product page,
        prominent homepage spotlight, public navigation path and app CTA without claiming live
        retailer pricing or completed end-to-end verification.
19. [ ] **MealForge completion pass**: record onboarding → pantry → recipe import → plan →
        shopping → cook → leftovers → reload and authenticated cross-device persistence; expose
        sync failure/retry state instead of silently swallowing cloud errors; expand automated
        coverage beyond planner invariants and atomic-RPC source checks.

Non-pilot roadmap work (price/recipe depth, broader ingestion and live feeds) stays
in roadmap.md; MealForge remains noindex until its end-to-end persistence cycle is verified.
