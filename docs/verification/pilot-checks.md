---
title: Pilot verification record
status: in_progress
owner: Garrett McLain
priority: p0
version: 1.0.0
date: 2026-09-06
last_updated: 2026-09-06
---

# Pilot verification — 2026-09-06

## Source and scope

Repository: garrettmclain96-prog/community-meal-flow. Source changes implement
contact links, kitchen labels, pilot navigation, the design dashboard and its
documentation system. AGENTS.md and generated Supabase integrations are unchanged.
The route tree change is produced by the TanStack generator, not a manual edit.
No production deployment, database mutation, real payment or role grant occurred.

## Named checks

| Check                                          | Actual result                                                               | Limit                                                               |
| ---------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `bun install --frozen-lockfile` (via npm exec) | Pass; 495 packages installed                                                | Lockfile unchanged                                                  |
| `prettier --check .`                           | Pass                                                                        | Generated files excluded under ADR 0003                             |
| `tsc --noEmit`                                 | Pass                                                                        | Includes generated integration types                                |
| `npm run lint`                                 | Pass: 0 errors, 16 existing warnings                                        | Generated files excluded; warning set is not new                    |
| `npm run build`                                | Pass, client and Worker/server output                                       | Chunk-size and Wrangler-main warnings remain                        |
| `node --test tests/design-docs.test.mjs`       | 5 tests pass                                                                | Parser, role handler with fixtures, metadata, public-bundle privacy |
| Bundle privacy                                 | No design prose/parser found in public output; module in server output only | Does not make the GitHub repository private                         |
| Preview startup                                | Reports running                                                             | Does not establish browser reachability                             |
| Browser `/design` and root                     | BLOCKED: `net::ERR_BLOCKED_BY_CLIENT`                                       | No browser smoke success claimed                                    |
| HTTP preview `/design`                         | 502 from preview endpoint                                                   | Route rendering not verified end-to-end                             |
| Admin role lookup                              | BLOCKED: database permission denied                                         | Support email is not confirmed sign-in identity                     |
| Security advisor                               | BLOCKED: database permission denied                                         | No measured deployed warning count                                  |

## Task 5 — authenticated sandbox attempt

Attempted after source verification/preview attempt. The preview was unreachable,
there was no signed-in session, and the local process lacked Stripe secret,
webhook secret and Supabase service-role configuration. No payment was initiated.
Missing local configuration does not prove the deployed app is misconfigured.

| Step    | Observed meals | Observed amount | Actual status              |
| ------- | -------------- | --------------- | -------------------------- |
| Fund    | Not observed   | Not observed    | Blocked before checkout    |
| Confirm | Not observed   | Not observed    | No signed webhook observed |
| Prepare | Not observed   | Not observed    | No test order available    |
| Deliver | Not observed   | Not observed    | No run available           |
| Payout  | Not observed   | Not observed    | No transfer available      |

To resume: use a reachable sandbox preview with authenticated sponsor, kitchen
operator and driver sessions, and test-mode connected account/payment settings.
Capture baseline events; choose the labelled test kitchen; record quantity and
unit cost, checkout total/fees/tax, order ID and checkout ID. Complete test checkout
and await the signed webhook; record credited meal and amount deltas. Accept and
prepare the order; record run creation. Claim, pick up and deliver; record delivered
meal delta and payout row amount/status. Verify transfer ID and amount at payout.
Replay the same confirmation event and prove no second credit. Never bypass this
flow with manually credited impact events. Redact private IDs from public reports.

## Task 6 — security warning attempt

After the sandbox attempt was classified blocked, requesting the security advisor
for ProvisionLoop's configured project returned permission denied. Project discovery
listed other projects only; no alternate project's database was touched.

A source-only regex inventory over latest committed function signatures found
23 functions, 21 SECURITY DEFINER, and zero of those missing `SET search_path`.
This is not a database linter, does not inspect deployed overloads or schema drift,
and cannot resolve the historical 19 warnings. No blind ALTER/migration was made.
Read-only inspection SQL and a commented, identity-dependent role grant template
are in [pilot-database-checks.sql](../operations/pilot-database-checks.sql).

To resume: obtain the exact deployed advisor output and `pg_get_functiondef` for
each affected signature. Review dependencies and pin a safe path with qualified
objects (do not blanket-edit unrelated functions). Use a forward migration,
re-run advisors and exercise each affected RPC with permitted and denied callers.

## Newly exposed gaps — not silently fixed

- Claims auto-approve ownership without operator-authority verification.
- Legal `assertAccepted` runs in UI handlers; server/RPC acceptance enforcement
  remains open.
- Civic minimum cohort is 1; dollar values are estimates; test impact/capacity is
  not separated from real aggregates.
- Admin queue query failures can appear as empty data.

These are `[open]` criteria in requirements.md and carried-forward tasks. Existing
copy is not proof of these guarantees. VaultOS and GloveGate remain untouched.

## Delivery

Implementation commit: `a573756` on `codex/design-docs-pilot`.
Final build, formatting, typecheck and five tests passed after documentation changes.
Automatic approval review rejected the GitHub push because the implementation
request did not explicitly authorize publishing this branch. No workaround or PR
creation was attempted. The branch is local and awaits explicit push authorization.

### Authorized publishing follow-up

Garrett authorized publishing in the next turn. Shell Git lacked a credential;
the connected GitHub app published all 37 changed files to
`codex/design-docs-pilot` as commit `27457de`. The earlier approval blocker is
resolved. Database access, account identity, sandbox and browser checks remain
blocked as described above. No merge or production deployment has been performed.
