---
title: ProvisionLoop pilot completion tasks
status: in_progress
owner: Garrett McLain
priority: p0
version: 1.0.0
date: 2026-09-05
last_updated: 2026-09-06
---

# Pilot completion tasks

Derived from design.md Risks & Open Questions and roadmap.md open items.
Execution order: 1–4, 7, then 5, then 6. Checked means source implementation
completed; deployment and authenticated results are separately reported.
Evidence: [pilot checks](./docs/verification/pilot-checks.md).

1. [x] **Monitored contact** [FR-203, FR-502]: link existing contact constant from
       Trust & Method, site footer and Legal Center; remove unpublished-channel copy;
       update roadmap. Source address already existed; no new contact invented.
2. [x] **Test kitchen labels** [FR-201, FR-601]: include `is_test` in directory,
       fundable, claim-listing and civic queries; label home, help, impact select/detail,
       kitchen owner/listing and civic kitchen capacity views. Aggregate separation
       remains FR-601.6, not accomplished by a badge.
3. [x] **Pilot navigation** [FR-502]: add `/pilot` to shared desktop/mobile header
       and footer navigation.
4. [ ] **Garrett platform_admin grant** [FR-701]: BLOCKED. ProvisionLoop database
       access was denied; the connected account lists other projects only. Confirm
       Garrett's sign-in email; the support address is not sufficient identity proof.
       Perform a single idempotent role insert and verify `has_role` after access.
5. [ ] **Authenticated sandbox lifecycle** [FR-101, FR-102, FR-103, FR-302]: after
       task 7, fund → confirm → prepare → deliver → payout. BLOCKED: no reachable
       preview, authenticated session or local payment configuration. Record observed amounts,
       counts and IDs; do not replace the webhook with a manual ledger insert.
6. [ ] **19 reported SECURITY DEFINER warnings** [FR-703]: after task 5, obtain
       deployed advisor output and function definitions. ATTEMPTED: permission denied;
       source-only scan found 21 definers already pinned. Pin missing deployed search paths,
       rerun advisors and verify affected RPCs. Historical 19 is not a measured count.
7. [ ] **Verification** [FR-201, FR-203, FR-502, FR-702, FR-703]: formatting,
       typecheck, lint, production build, parser/access/bundle tests and route smoke.
       Format/type/build pass; lint 0 errors/16 existing warnings; 5 automated tests
       pass. Browser smoke BLOCKED by preview reachability, so this item stays open.

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
13. [ ] **Verify operator authority before claim approval** [FR-202].
14. [ ] **Enforce legal acceptance in server functions/RPCs** [FR-501].
15. [ ] **Civic suppression, estimated-dollar labels, sandbox separation** [FR-601].
16. [ ] **Show admin query errors separately from empty queues** [FR-701].
17. [ ] **Production activation gates** [FR-101, FR-401, FR-502]: verify applied
        migrations, first approved partner, payment configuration, legal entity,
        authenticated assistance/referral verification and published mobile QA.
        Do not switch on live payments in this pass.

Non-pilot roadmap work (price/recipe depth, MealForge screens, live feeds and
URL/photo/PDF ingestion) stays in roadmap.md; no new scope is implied here.
