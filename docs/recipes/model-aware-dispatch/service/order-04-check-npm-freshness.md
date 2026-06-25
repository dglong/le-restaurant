# Order 04 · `check` — npm freshness (A3) · Status: Served
**Covers:** Phase A3 — also flag when the package itself is behind npm.
**Depends on:** 03

## Done when  (acceptance — checked at the pass)
- [ ] With a mocked-newer registry response, `check` adds `update available (npm)` to the report.
- [ ] A failing/absent network falls back to local-only with a notice and exits 0.
- [ ] The registry `fetch` is mocked in tests — no live network call.
- [ ] Build clean, existing suite green.

## Touches
- `src/check.ts`, `test/` · shared surfaces: none new

## Progress log
- 2026-06-26: Implemented Phase A3 (npm freshness). TDD: wrote 8 RED tests in `test/check.test.ts` first (all failed with "not a function"), then implemented `fetchLatestNpmVersion` + `checkNpmFreshness` in `src/check.ts`, wired the async check into `src/cli.ts check` action, and stubbed global `fetch` in `test/install.test.ts` to prevent live network calls. Full suite: 95/95 green, `tsc --noEmit` clean.

## Current WIP / next action
- SERVED. Pass verified by Maître D' (re-run): `npm test` → 95/95 (18 files); `npm run typecheck` → clean; `fetchLatestNpmVersion`/`checkNpmFreshness` wired into `src/cli.ts` with offline→exit-0 fallback. ✓ Track A complete.

## Decisions
- Plain `fetch` to the registry JSON — no new dependency (plan).
- Compare both local drift and npm freshness (plan ADR).
- Used injectable fetcher (`fetcher: typeof fetch = fetch`) in `fetchLatestNpmVersion` so tests pass a mock directly — no need to stub globals in the check-unit tests.
- Added `vi.stubGlobal("fetch", ...)` + `vi.unstubAllGlobals()` to `test/install.test.ts` beforeEach/afterEach to prevent live network calls from the CLI integration tests.
- Offline / non-200 / missing-version-field all return `null` → CLI logs a short warn notice and still exits 0.

## Blockers / escalations
- none

## Tests
```
npx vitest run
# Test Files  18 passed (18)
# Tests       95 passed (95)  ← was 87 before this order; 8 new tests added
# Duration    2.06s

npx tsc --noEmit
# (no output — clean)
```

New test coverage added (all in `test/check.test.ts`):
- `fetchLatestNpmVersion` — 5 tests: 200 response returns version; fetch throws → null; non-200 → null; URL-encodes scoped name correctly; missing version field → null.
- `checkNpmFreshness` — 3 tests: behind latest → "update available (npm)"; equal → "up-to-date (npm)"; ahead → "up-to-date (npm)".
