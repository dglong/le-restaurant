# Order 06 · Claude model selection (B2) · Status: Served
**Covers:** Phase B2 — the cost win on Claude Code.
**Depends on:** 05

## Done when  (acceptance — checked at the pass)
- [ ] The Claude adapter additionally emits `.claude/agents/chef-de-rang.md` with frontmatter `name`/`description`/`model: sonnet`/`tools` and the chef-de-rang skill body. Adapter test asserts the file exists with `model: sonnet`.
- [ ] `maître-d` SKILL.md dispatches chef-de-rang as a subagent, maps `tidy→sonnet` / `hard→opus`, overrides to Opus on a pass-bounce, and documents that manual invoke uses the session model.
- [ ] `chef-de-rang` SKILL.md notes manual invocation runs the session model.
- [ ] Skill edits synced (`check:sync` green); build clean; existing suite green.

## Touches
- `src/adapters/claude.ts` (**strategy change: passthrough → also emit an agent definition**), `test/`, `.claude/skills/maitre-d/SKILL.md`, `.claude/skills/chef-de-rang/SKILL.md` + mirrored `skills/...` · shared surfaces: Claude adapter strategy; skill-markdown sync

## Progress log
- 2026-06-26 — RED: extended `test/claude-passthrough.test.ts` — updated the path-list golden to expect `.claude/agents/chef-de-rang.md`, added a test asserting the agent def has `name`/`description`/`model: sonnet`/a `tools:` line + the skill body, and a test asserting it is omitted when chef-de-rang isn't selected. Watched the two new assertions fail for the right reason (agent output undefined).
- 2026-06-26 — GREEN: changed `src/adapters/claude.ts` from passthrough-only to passthrough + agent-def emission. When the selected skills include `chef-de-rang`, it pushes a `FileOutput` at `.claude/agents/chef-de-rang.md` (frontmatter `name`/`description`/`model: sonnet`/`tools: Read, Write, Edit, Bash, Glob, Grep`, body = `Skill.body`). Passthrough for all skills unchanged.
- 2026-06-26 — Markdown (both trees, byte-identical): maître-d §3 now dispatches chef-de-rang as a subagent and maps `tidy→Sonnet` / `hard→Opus` (per-call override beats the frontmatter default); §4 escalates Sonnet→Opus on a pass-bounce re-fire; both note Claude-Code-only + the manual-invoke-uses-session-model caveat. chef-de-rang "Load the table first" gained the manual-invoke caveat. Mirrored `skills/` → `.claude/skills/`.
- 2026-06-26 — Full suite green (97), tsc clean, check:sync green.

## Current WIP / next action
- SERVED. Pass verified by Maître D' (re-run, thorough): `npm test` → 97/97; `tsc` clean; `check:sync` 5/5. Read `src/adapters/claude.ts` (agent def w/ `model: sonnet`, guarded, passthrough intact) and maître-d mapping (tidy→Sonnet/hard→Opus, bounce→Opus, manual + Codex/Gemini caveats). ✓

## Decisions
- Enforce the cheap default via the emitted agent definition (`model: sonnet`); Opus is a per-dispatch override (plan ADR).
- Model selection is Claude-only — Codex/Gemini handled in order 07.
- Agent def `tools:` line uses a conservative build/edit/search default (`Read, Write, Edit, Bash, Glob, Grep`); the maître-d overrides the *model* per dispatch, not the tools. No existing agent-definition convention found in repo to match.
- Emit the agent def only when `chef-de-rang` is among the selected skills (guards partial selections); writer mode `overwrite`, matching the skill passthrough.
- Did not bump skill `version:` fields — version stamping is Track A scope and out of this ticket's Touches; drift/manifest tests stay green.

## Blockers / escalations
- none

## Tests
- `npx vitest run` → 18 files, **97 passed** (was 95; +2 new claude-passthrough assertions, no regressions).
- `npx tsc --noEmit` → clean (no output).
- `npm run check:sync` → `test/check-skills-sync.test.ts` 5 passed — both trees byte-identical.
- New/updated: `test/claude-passthrough.test.ts` — path-list golden includes the agent def; agent-def content test (`model: sonnet` + body); omitted-when-not-selected test.
