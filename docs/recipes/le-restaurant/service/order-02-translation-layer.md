# Order 02 · Translation layer (Codex + Gemini) · Status: Served
**Covers:** Plan Phase 1 — Codex merge adapter, Gemini import adapter, conflict policy + atomic writes. (The `Adapter` interface itself was delivered in 01.)
**Depends on:** 01

## Done when  (acceptance — checked at the pass)
- [ ] **Codex adapter:** golden-file test — N skills → one `AGENTS.md` with one delimited `## Skill: <name>` section each, wrapped in managed markers; re-run updates between markers without touching surrounding user content.
- [ ] **Gemini adapter:** golden-file test — each skill becomes `.gemini/skills/<name>.md` plus an `@./.gemini/skills/<name>.md` import line in `GEMINI.md`; re-run is idempotent.
- [ ] **Conflict policy:** existing files detected; skip/overwrite/merge honored; a failed write never leaves a half-written or clobbered file (tested).
- [ ] All three adapters implement the shared `Adapter` interface; `tsc --noEmit` clean; full `vitest run` green.

## Touches
- `src/adapters/codex.ts`, `src/adapters/gemini.ts`, `test/fixtures/codex/`, `test/fixtures/gemini/` · shared surfaces: **extends** `src/writer.ts` (conflict policy + atomic writes) — Maître D'-held; extend, don't rewrite the passthrough behavior from 01
- managed-marker helper (e.g. `src/markers.ts`)

## Progress log  (append-only, newest last)
- Confirmed green start: `npx vitest run` → 8 passed (Order 01).
- Wrote `src/markers.ts` (shared marker helper) test-first: `MARKER_START/END`, `MANAGED_NOTICE`, `renderManagedBlock`, `mergeManagedBlock`, `hasManagedBlock`. Replace-in-place when markers exist, append (blank-line separated) when absent → idempotent.
- Codex adapter (`src/adapters/codex.ts`): N skills → single `AGENTS.md` (mode `merge`), one `## Skill: <name>` section (heading + description + body) per skill, all inside one managed-marker block. Golden-file test + re-run test proving the managed span is replaced while surrounding user content (above and below) is untouched.
- Gemini adapter (`src/adapters/gemini.ts`): each skill → `.gemini/skills/<name>.md` (mode `overwrite`, fully tool-owned) + a single `GEMINI.md` (mode `merge`) holding `@./.gemini/skills/<name>.md` import lines inside managed markers. Golden-file test + idempotent re-run test (no duplicate imports).
- Extended `src/writer.ts`: added `atomicWriteFile` (temp-then-rename, cleans up temp + rethrows on failure) and conflict-policy handling. New files always created; existing files honor skip/overwrite/merge; `merge` folds the managed block into existing content via `mergeManagedBlock`, else falls back to overwrite. `WriteResult` now carries an `action`. Order 01 passthrough behavior preserved (claude tests still byte-identical & green).
- Full suite: `npx vitest run` → 22 passed (8 Order 01 + 14 new). `npx tsc --noEmit` → exit 0. Verified real generation against the 4 vendored skills (markers wrap all four `## Skill:` sections in AGENTS.md; GEMINI.md lists four `@imports`).

## Current WIP / next action
- Feature complete; all four "Done when" criteria covered by passing tests. Handed to the pass for verification. (Not wired into the CLI yet — `src/cli.ts` still installs Claude only, and `src/index.ts` does not re-export the new adapters/markers; both are out of this ticket's Touches. Flag for a CLI-wiring ticket.)

## Decisions
- Managed markers `<!-- le-restaurant:start/end -->` bound tool-owned content in shared files; only that span is ever modified. (Cross-cutting → plan ADR.)
- `mergeManagedBlock` replaces the existing marker span in place (incl. one trailing newline) when present; otherwise appends, separated by a blank line. Keeps re-runs idempotent and never touches user content outside the markers.
- Adapter `FileOutput.mode` declares intent (`merge` vs `overwrite`); the writer combines that with `InstallContext.conflictPolicy`. `merge` policy only does a marker-merge for `mode: "merge"` outputs; for plain files it overwrites. This keeps `.gemini/skills/*.md` and Claude passthrough files fully replaceable while `AGENTS.md`/`GEMINI.md` merge safely.
- Atomicity via temp-file + `renameSync` (atomic on one filesystem; on Windows replaces an existing target). On error the temp is removed so a failed write never leaves a half-written or clobbered target.
- Golden-file tests use two small synthetic skills (`alpha`, `beta` in `test/helpers.ts`) rather than the real vendored skills, so fixtures stay small and stable as real skill text evolves.

## Blockers / escalations
- none for this ticket. **Noted for Order 03:** the new adapters are intentionally not wired into the CLI yet (out of scope here) — Order 03 must dispatch agent→adapter and re-export them.

## Pass verification (Maître D')
- 2026-06-24 — Verified independently: `npx vitest run` → 22 passed (Order 01's 8 still green); `tsc --noEmit` → exit 0. Drove the real adapters myself against a temp dir with pre-existing user content in `AGENTS.md`: user content preserved, start/end markers present, 4 `## Skill:` sections, re-run byte-identical (idempotent), 4 Gemini `@imports` + all 4 `.gemini/skills/*.md` present. **Served.**

## Tests  (all green — `npx vitest run` → 22 passed)
- `test/markers.test.ts` — wrap, append-when-absent, replace-only-span-on-re-merge (3).
- `test/codex.test.ts` — single merge output, golden `AGENTS.md`, re-run preserves surrounding user content (3).
- `test/gemini.test.ts` — file set + GEMINI.md merge mode, golden skill files + import block, idempotent re-run (3).
- `test/writer-conflict.test.ts` — created/skip/overwrite/merge actions + atomic failed-write leaves existing target and no temp behind (5).
- Fixtures: `test/fixtures/codex/AGENTS.golden.md`, `test/fixtures/gemini/{GEMINI,alpha,beta}.golden.md`. Helper: `test/helpers.ts`.
- Order 01 unchanged & green: `test/claude-passthrough.test.ts` (2), `test/registry.test.ts` (3), `test/cli.test.ts` (3).
