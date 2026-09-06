---
title: Verify authored code without editing generated integrations
status: accepted
owner: Garrett McLain
priority: p1
version: 1.0.0
date: 2026-09-06
last_updated: 2026-09-06
---

# 0003 — Verify authored code without editing generated integrations

- Status: accepted
- Date: 2026-09-06

## Context

The first full lint run found 1,477 errors, including formatting and prefer-const
in generated Supabase files. AGENTS.md explicitly prohibits editing those files.
The router generator owns routeTree.gen.ts. Authored files also had format drift.

## Decision

Exclude generated Supabase integrations and the generated route tree from ESLint;
exclude Supabase integrations from Prettier (the route tree was already excluded).
Format authored source using the existing formatter. Keep all files in TypeScript
and production build validation. Do not disable authored-code lint rules or change
AGENTS.md. Allow only the router generator to update its route tree.

## Consequences

The source lint check does not audit generated code. Its existing warnings/errors
must be resolved upstream if needed; type/build checks still include it. Record
lint warnings separately from errors. This is not evidence of security verification
for generated auth code or deployed database policies.
