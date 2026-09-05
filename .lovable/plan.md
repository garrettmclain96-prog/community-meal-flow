# Design-doc system + finish the pilot open items

Five pieces. VaultOS and GloveGate are out of scope this pass — their code isn't here; we'll do them when it is.

## 1. requirements.md

A companion to `design.md` at the project root, written in EARS form so each criterion is testable and referenceable.

- Numbered requirement groups: funding integrity (FR-1xx), kitchen listings and claims (FR-2xx), volunteers and delivery (FR-3xx), partners and privacy (FR-4xx), legal acceptance (FR-5xx), civic reporting (FR-6xx), admin queues (FR-7xx).
- Each requirement: a user story, then EARS criteria — `WHEN <event> THEN the system SHALL <response>`, plus `IF <condition> THEN ... SHALL` for unwanted-behavior cases and `WHILE`/`WHERE` for state and feature-specific ones.
- Criteria describe behaviour that already exists where it exists, and mark not-yet-true ones as `[open]` so nothing overstates the system.
- `design.md` gets a filled-in Requirements Traceability table mapping each requirement ID to the component and the verification method.

## 2. tasks.md

Generated from `design.md`'s Risks & Open Questions plus the open items in `roadmap.md`. A numbered checklist, each task tagged with the requirement IDs it satisfies.

Contents (the actual remaining work):

1. Link the monitored contact address from Trust & Method (replacing the "channel will be published later" wording), the site footer, and the Legal Center index; update the roadmap note.
2. Render the "test-mode pilot kitchen — not a real partner" badge everywhere a kitchen shows (home, `/help`, `/impact`, `/kitchen`, `/civic` capacity), and add `is_test` to the kitchen query columns.
3. Add `/pilot` to the header and footer navigation.
4. Grant Garrett's account the `platform_admin` role so `/admin` shows data.
5. Run the end-to-end sandbox check: fund → confirm → prepare → deliver → payout, reporting the actual numbers at each step.
6. Work through the 19 SECURITY DEFINER linter warnings (`SET search_path` where missing) and re-run the linter.
7. Format, typecheck, lint, build, smoke test.

Items 1–4 and 7 get built this pass; 5 and 6 are done in order after and reported honestly if anything blocks.

## 3. AI collaborator docs

- `docs/ai/how-claude-works-with-garrett.md` — the full operating design doc (Appendix C5 shape): operating context (iPhone-only, no desktop IDE, copy-paste-ready output), standing rules (full files not fragments, state assumptions before long work, never fabricate contacts/partners/numbers), verification requirements (prove changes with named checks before declaring done), output preferences, escalation behaviour, memory protocol, non-goals, changelog.
- `CLAUDE.md` at the repo root — the lean enforced subset, under 60 lines, pointing at `design.md`, `requirements.md` and the operating doc rather than repeating them. `AGENTS.md` already exists and stays as-is; `CLAUDE.md` will reference it instead of duplicating.

## 4. Private design dashboard at `/design`

A signed-in, `platform_admin`-gated route listing every design doc in the repo.

- Every doc grows a `priority` front-matter field (`p0`–`p3`) alongside status/owner/version/date.
- The route reads the markdown files at build time (Vite raw glob over `design.md` and `docs/projects/**/design.md`), parses front matter, and pulls the Risks & Open Questions bullets and the ADR files linked from each doc.
- Cards show: title, domain, status chip, version, last updated, open-question count with the questions expandable, and the ADR list with status. Sorted by priority, then status, then last-updated.
- A summary strip across the top: total docs, count by status, total open questions.
- Non-admins get the same clean "not authorized" state `/admin` uses. The page is never public.
- Built in the existing glass/aurora tokens — no new colors.

## 5. Build the tasks

Work tasks 1–4 and 7 above, then attempt 5 and 6, updating `design.md` as things change: tick off resolved open questions, bump `last_updated` and the version, and add changelog entries as each task lands. Any new decision made along the way gets an ADR in `docs/adr/`.

## Technical notes

- Doc parsing is a small `src/lib/design-docs.ts` using `import.meta.glob('...', { query: '?raw', eager: true })` — no runtime filesystem access, works in the Worker.
- The `/design` route gate reuses the existing server-side `has_role(auth.uid(), 'platform_admin')` check used by `/admin`; nothing relies on client state.
- No schema changes are needed for the dashboard — the docs are the data source.
- The `platform_admin` grant is a one-row insert into `user_roles`; it needs your account's email so I can look up the user id.
