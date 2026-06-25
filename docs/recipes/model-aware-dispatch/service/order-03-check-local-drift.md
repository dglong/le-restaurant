# Order 03 · `check` — local drift (A2) · Status: Served
**Covers:** Phase A2 — `le-restaurant check` reports staleness vs the installed package, offline.
**Depends on:** 02

## Done when  (acceptance — checked at the pass)
- [ ] `le-restaurant check` in an installed project prints, per skill, `up-to-date | stale (local)` by comparing the manifest against the bundled package's skill versions.
- [ ] Missing manifest → a clear "not installed here" message, exit 0.
- [ ] Logic tested against fixture manifests (newer/older/missing).
- [ ] Build clean, existing suite green.

## Touches
- `src/cli.ts` (new `check` subcommand via `commander`), new `src/check.ts`, `test/` · shared surfaces: reads the order-02 manifest schema as given

## Progress log
- **2026-06-25** — Order built to completion (Sonnet 4.6).
  - Created `src/check.ts`: pure `compareVersions` (numeric major.minor.patch, no new dep) and `checkSkills(manifest, bundled) → SkillStatus[]`.
  - Added `check` subcommand to `src/cli.ts` via `commander`; reads `.le-restaurant.json`, loads bundled versions via `loadSkills()`, prints per-skill `up-to-date | stale (local) | unknown` using `@clack/prompts` (`log.success`, `log.warn`, `log.info`); missing manifest → `note()` box + exit 0.
  - Added 11 unit tests in `test/check.test.ts`, 1 wiring test in `test/cli.test.ts`, 2 integration tests in `test/install.test.ts`.
  - `npx tsc --noEmit` clean; `npx vitest run` 87/87 green (73 prior + 14 new).

## Current WIP / next action
- SERVED. Pass verified by Maître D' (2026-06-25, re-run): `npm test` → 87/87 (18 files); `npm run typecheck` → clean; `src/check.ts` present, `.command("check")` wired in `src/cli.ts`. ✓

## Decisions
- `check` reports only — never mutates installed skills (plan ADR).
- Used a simple numeric `major.minor.patch` compare; no `semver` dep needed.
- Skills in the manifest not present in bundled receive `"unknown"` status (not an error).

## Blockers / escalations
- none

## Tests

### Unit: `npx vitest run test/check.test.ts`
```
✓ test/check.test.ts (11 tests) 5ms
Test Files  1 passed (1)
      Tests  11 passed (11)
```

### Full suite: `npx vitest run`
```
Test Files  18 passed (18)
      Tests  87 passed (87)
   Duration  2.18s
```

### TypeCheck: `npx tsc --noEmit`
```
(no output — clean)
```
