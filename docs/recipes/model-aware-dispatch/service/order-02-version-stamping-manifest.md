# Order 02 · Version stamping & manifest (A1) · Status: Served
**Covers:** Phase A1 — an install records what it put down.
**Depends on:** 01

## Done when  (acceptance — checked at the pass)
- [ ] Installing the selected skills into a temp dir writes `.le-restaurant.json` listing package version, agent id, install date, and per-skill versions. Covered by a writer test.
- [ ] Codex (`AGENTS.md` sections) and Gemini (modular files) each carry the skill's version in the rendered output; Claude passthrough retains the frontmatter version. Adapter tests assert presence.
- [ ] Build clean, existing suite green.

## Touches
- `src/writer.ts`, `src/types.ts`, `src/adapters/codex.ts`, `src/adapters/gemini.ts`, `test/` · shared surfaces: **pins the `.le-restaurant.json` schema** (orders 03/04 depend on it); edits `codex.ts`/`gemini.ts` (order 07 edits them again later)

## Progress log
- **2026-06-25** — Implemented fully. TDD: wrote RED tests first (8 failures), then GREEN. Added `InstallManifest` interface to `src/types.ts`; `writeManifest()` to `src/writer.ts` (atomic write, always-overwrite); called from `runInstall` in `src/cli.ts` (uses package.json `VERSION` already in scope). Stamped version in Codex `renderSection` (`## Skill: name (v1.0.0)`) and Gemini `renderSkillFile` (`<!-- Version: 1.0.0 -->` comment). Updated golden fixtures for both adapters. Claude passthrough unchanged. All 73 tests pass; `tsc --noEmit` clean.

## Current WIP / next action
- SERVED. Pass verified by Maître D' (2026-06-25, re-run independently): `npm test` → 73/73 (17 files); `npm run typecheck` → clean; `writeManifest` wired into `src/cli.ts`. ✓

## Decisions
- **Manifest schema (pinned):**
  ```jsonc
  {
    "package": "<le-restaurant version>",
    "agent": "claude|codex|gemini",
    "installedAt": "<ISO date>",
    "skills": { "<skill-name>": "<semver>" }
  }
  ```
- Manifest written by the **writer**, once per install (uniform across agents), not by each adapter — so `check` reads one place.

## Blockers / escalations
- none

## Tests

Commands run:
```
npx vitest run
npx tsc --noEmit
```

Results:
```
 ✓ test/codex.test.ts (4 tests)
 ✓ test/writer-conflict.test.ts (5 tests)
 ✓ test/gemini.test.ts (4 tests)
 ✓ test/registry-version.test.ts (2 tests)
 ✓ test/check-skills-sync.test.ts (5 tests)
 ✓ test/registry.test.ts (3 tests)
 ✓ test/claude-passthrough.test.ts (2 tests)
 ✓ test/dispatch.test.ts (8 tests)
 ✓ test/install.test.ts (5 tests)
 ✓ test/manifest.test.ts (6 tests)   ← new
 ✓ test/ci-workflows.test.ts (7 tests)
 ✓ test/summary.test.ts (4 tests)
 ✓ test/markers.test.ts (3 tests)
 ✓ test/cli.test.ts (3 tests)
 ✓ test/docs.test.ts (4 tests)
 ✓ test/index-exports.test.ts (2 tests)
 ✓ test/packaging.test.ts (6 tests)

 Test Files  17 passed (17)
       Tests  73 passed (73)

tsc --noEmit: no output (clean)
```

New tests added:
- `test/manifest.test.ts` — 6 tests covering: file written, package version, agent id, installedAt date format, per-skill semver map, claude installs
- `test/codex.test.ts` — 1 test: each skill section carries `v<semver>`
- `test/gemini.test.ts` — 1 test: each skill file carries the version string
