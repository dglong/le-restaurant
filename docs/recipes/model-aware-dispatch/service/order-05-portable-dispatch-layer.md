# Order 05 · Portable dispatch layer (B1) · Status: Served
**Covers:** Phase B1 — difficulty/HITL flows from plan to ticket; the human gate works on every agent.
**Depends on:** 01

## Done when  (acceptance — checked at the pass)
- [ ] `mise-en-place` SKILL.md instructs authoring `Difficulty: tidy|hard` + `HITL: yes|no` per feature in `Phases.md`/`Development-Plan.md`, with a **stated deterministic rubric** (criteria count, shared-surface touches, dependency depth, unresolved decisions).
- [ ] `maître-d` SKILL.md copies the tag onto each ticket at seating and, on `HITL: yes`, pauses to ask the human before firing.
- [ ] `chef-de-rang` SKILL.md reads its ticket's tag.
- [ ] Edits in canonical `.claude/skills/`, mirrored to `skills/`, `npm run check:sync` green.
- [ ] A dry-run plan→service walkthrough shows tags authored, copied, and a HITL ticket pausing — independent of any model switch.

## Touches
- `.claude/skills/mise-en-place/SKILL.md`, `.claude/skills/maitre-d/SKILL.md`, `.claude/skills/chef-de-rang/SKILL.md` + mirrored `skills/...` · shared surfaces: **skill-markdown sync** (canonical↔vendored)

## Progress log
- 2026-06-26 — Edited all three skills (both `.claude/skills/` and `skills/` trees). mise-en-place: added tagging instruction + deterministic rubric in the wiki section, updated `Phases.md` and `Development-Plan.md` templates to show tag placement. maître-d: copy-down clause added to "Seat the room"; HITL pause added to "Fire the next ticket". chef-de-rang: tag-awareness note added to "Load the table first". `npm run check:sync` green (5/5). Full vitest suite green (18 files, 95 tests).

## Current WIP / next action
- SERVED. Pass verified by Maître D' (re-run): `check:sync` 5/5; rubric + copy-down + HITL-pause clauses read & confirmed sound in both trees; suite 95/95. ✓

## Decisions
- Difficulty authored by mise-en-place, enforced by maître-d (plan ADR).
- HITL gate is portable; model switch is deliberately NOT in this ticket (that's order 06).

## Blockers / escalations
- none

## Tests
- `npm run check:sync` (2026-06-26): 5/5 passed — canonical and vendored trees byte-identical after all edits.
- `npx vitest run` (2026-06-26): 18 test files, 95 tests, all passed — no regressions.
- Walkthrough (dry-run): mise-en-place authors `Difficulty: hard` (shared surface, unresolved unknowns) and `HITL: yes` (architecturally consequential) on a feature in `Phases.md`; maître-d copies those tags to the ticket at seating; at fire-time, sees `HITL: yes` and pauses to ask the human before firing; chef-de-rang reads the tags on ticket load and notes them as informational — no model switch in this ticket (that's order 06).
