---
title: Private build-time design dashboard
status: accepted
owner: Garrett McLain
priority: p0
version: 1.0.0
date: 2026-09-05
last_updated: 2026-09-05
---

# 0002 — Private build-time design dashboard

- Status: accepted
- Date: 2026-09-05

## Context

Markdown imported directly by a browser route would be downloadable even with a
UI role gate. The existing admin page uses a browser RPC; documents have no RLS
table to provide a second boundary. Authentication uses the existing validated
bearer-token middleware and its authenticated subject, never a caller-supplied ID.

## Decision

Use a POST `createServerFn`, `requireSupabaseAuth`, and the existing `has_role`
RPC with the middleware subject and `platform_admin`. Only after a positive role
result dynamically import `design-docs.ts`. Wrap its eager Vite raw globs in
`createServerOnlyFn`. Responses are private/no-store. No document schema or new
router is introduced. Client auth controls only loading and sign-in presentation.

Parse the repository's scalar front matter, multiline risk bullets and explicit
relative Markdown ADR links. Ignore completed `[x]` risks; flag missing ADRs.
Require explicit ADR links rather than treating every ADR as belonging to every
design. Render ADR contents as escaped text inside expandable panels, never raw
HTML or public document URLs.

Order p0–p3, then draft, proposed, in_progress, accepted, implemented, deprecated,
superseded, archived; unknown statuses follow, alphabetically. Within a status,
newest ISO date sorts first; path resolves ties. Missing metadata has conservative
visible defaults. Docs outside the two design globs are companion documents,
not dashboard inventory entries; add project design files to expand inventory.

## Consequences

Docs update at rebuild. Verify public bundles contain no raw document content,
and exercise unauthenticated, non-admin, error and admin responses. This protects
application delivery; it does not make a public Git repository private. Bearer
sessions attach after hydration, so signed-out SSR contains only the shell.
