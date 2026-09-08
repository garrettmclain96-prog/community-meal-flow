# ProvisionLoop — agent notes

Read `PROJECT_CONTEXT.md` first for product history, current operating context, user expectations, launch state, and unresolved work. Then read `design.md` for architecture, goals, non-goals and rationale. Decisions live in `docs/adr/`. Testable behavior lives in `requirements.md`; current execution status lives in `tasks.md`; broader feature status lives in `roadmap.md`.

## Commands

- `bun run dev` — dev server on :8080 (already running in the sandbox)
- `bun run build` / `bun run lint` / `bunx prettier --write .`

## Boundaries

- TanStack Start only. Never add react-router-dom or a second router.
- App-internal server logic uses `createServerFn`. Only `src/routes/api/public/*`
  is externally callable, and it must verify the caller.
- Never edit `src/integrations/supabase/*` generated files or `src/routeTree.gen.ts`.
- Every new public table needs GRANTs + RLS in the same migration.
- Roles come from `user_roles` via `has_role()`, never a profile column.
- Payments stay in test mode. No tax-deductibility or partnership claims.
- Never invent contact details, partners or impact numbers.
- Colors and type come from tokens in `src/styles.css`; no hardcoded color utilities.
- Never equate code presence with production readiness: distinguish user-reported behavior, source implementation, and deployed verification.
- After material product/brand/launch/legal/architecture decisions, update `PROJECT_CONTEXT.md` along with the relevant design, requirements, tasks, roadmap, or ADR document.
