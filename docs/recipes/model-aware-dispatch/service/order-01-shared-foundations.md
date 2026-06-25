# Order 01 · Shared foundations (Phase 0) · Status: Served
**Covers:** Phase 0 — the typed foundations both tracks build on, sync green.
**Depends on:** none

## Done when  (acceptance — checked at the pass)
- [ ] `Skill` interface has `version: string`, parsed from frontmatter in `src/registry.ts`; absent version falls back to `0.0.0` and logs a warning. Unit test covers present + absent.
- [ ] All four skills' `SKILL.md` frontmatter carries a semver `version:` (start at `1.0.0`), in canonical `.claude/skills/` AND mirrored to vendored `skills/`.
- [ ] `npm run check:sync` is green.
- [ ] The order-ticket template in the maître-d skill documents `Difficulty: tidy|hard` and `HITL: yes|no` fields (markdown only, no behavior yet).
- [ ] Build clean (`tsc`/`tsup`), existing suite green.

## Touches
- `src/types.ts`, `src/registry.ts`, `test/` · shared surfaces: **defines `Skill.version` (the core shared type)** · `.claude/skills/*/SKILL.md` + `skills/*/SKILL.md` (sync) · `.claude/skills/maitre-d/SKILL.md` ticket template

## Progress log  (append-only, newest last)
- (none yet)
- 2026-06-25 — RED: added `test/registry-version.test.ts` with two failing tests (`parseSkillContent` not a function). GREEN: added `version: string` to `Skill` interface (`src/types.ts`); extracted `parseSkillContent(raw, name)` from `loadSkill` in `src/registry.ts` with version fallback to `"0.0.0"` + `console.warn`; updated `test/helpers.ts` alpha/beta fixtures to include `version: "0.0.0"`. Added `version: 1.0.0` to frontmatter of all four skills in both `.claude/skills/` (canonical) and `skills/` (vendored) trees. Added `**Difficulty:** tidy|hard` and `**HITL:** yes|no` fields to the order-ticket template block in maitre-d SKILL.md (both trees). All gates green: 65/65 tests, tsc clean, check:sync 5/5.

## Current WIP / next action
- SERVED. Pass verified by Maître D' — all Done-when met.

## Decisions
- Per-skill semver starting at `1.0.0` (plan ADR: track versions per skill).

## Blockers / escalations
- none

## Tests
- `npx vitest run test/registry-version.test.ts` → 2 passed (RED confirmed then GREEN)
- `npx vitest run` → 16 test files, 65 tests passed, 0 failed
- `npx tsc --noEmit` → clean (no output)
- `npm run check:sync` → 5 tests passed (vendored skills/ in sync with canonical .claude/skills/)
- **Pass (Maître D', 2026-06-25, re-run independently):** `npm test` → 65/65 (16 files); `npm run typecheck` → clean, exit 0; `npm run check:sync` → 5/5; all 8 SKILL.md carry `version: 1.0.0`. ✓ Served.
