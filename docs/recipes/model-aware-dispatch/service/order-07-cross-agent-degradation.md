# Order 07 · Cross-agent degradation (B3) · Status: Served
**Covers:** Phase B3 — Codex/Gemini are honest about what they can't do.
**Depends on:** 06

## Done when  (acceptance — checked at the pass)
- [ ] Codex and Gemini outputs carry a notice that model-selection is a no-op on that agent (alongside the existing on-demand-triggering degradation note); HITL guidance still present.
- [ ] The installer summary (`src/summary.ts`) surfaces the no-op to the user at install time.
- [ ] Adapter/summary tests assert the notice.
- [ ] Build clean, existing suite green.

## Touches
- `src/adapters/codex.ts`, `src/adapters/gemini.ts`, `src/summary.ts`, `test/` · shared surfaces: builds on the version-stamp edits to `codex.ts`/`gemini.ts` from order 02 — read current state, don't revert it

## Progress log
- 2026-06-26: Implemented Phase B3. Added model-aware dispatch no-op notice to Codex adapter (AGENTS.md managed block) and Gemini adapter (GEMINI.md managed block). Updated `src/summary.ts` usageNotes for codex and gemini. Updated golden fixtures. Added 5 tests (RED → GREEN). Full suite: 102 tests / 18 files green; tsc --noEmit clean.

## Current WIP / next action
- SERVED. Pass verified by Maître D' (re-run): `npm test` → 102/102; `tsc` clean; `check:sync` green; `npm run build` success. ✓ Final ticket — build complete.

## Decisions
- Document the no-op rather than fake model selection (plan ADR: model selection is Claude-only).

## Blockers / escalations
- none

## Tests
```
 Test Files  18 passed (18)
       Tests  102 passed (102)
    Start at  00:15:55
    Duration  1.79s

npx tsc --noEmit  →  (no output, exit 0)
```
New assertions (5):
- codex: AGENTS.md contains "model-aware dispatch", "no-op", "hitl", "session model"
- gemini: GEMINI.md contains "model-aware dispatch", "no-op", "hitl", "session model"
- summary: codex output contains "no-op" + "model"
- summary: gemini output contains "no-op" + "model"
- summary: claude output does NOT contain "no-op"
