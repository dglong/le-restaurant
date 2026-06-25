# Phases · Status: Draft

Two independent tracks share **Phase 0**, then can proceed in parallel. Each phase ships something demoable. Versioning is sequenced first — it's smaller and fully self-contained.

## Phase 0 — Walking skeleton / shared surfaces
- **Goal:** the typed foundations both tracks build on, with the sync check green.
- **Deliverables:** `Skill.version` field + frontmatter parsing; `version:` added to all four skills' frontmatter; ticket template gains `Difficulty`/`HITL` fields (markdown); confirm/stand up the `vitest` runner covers the new modules.
- **Exit:** repo builds, `check-skills-sync.ts` passes, version parses for all four skills, existing suite green.

## Track A — Skill Versioning

### Phase A1 — Version stamping & manifest
- **Goal:** an install records what it put down.
- **Deliverables:** writer emits `.le-restaurant.json` (package + per-skill versions + agent); Claude passthrough keeps frontmatter version; Codex/Gemini annotate each rendered section with its version.
- **Exit:** installing into a temp target produces a correct manifest for each of the three agents (tested).
- **Depends on:** Phase 0.

### Phase A2 — `check` command (local drift)
- **Goal:** `le-restaurant check` reports staleness vs the installed package, offline.
- **Deliverables:** `commander` `check` subcommand; reads manifest + bundled versions; per-skill `up-to-date | stale (local)` report via `@clack/prompts` output.
- **Exit:** a manifest behind the bundled versions reports the right skills stale; missing manifest degrades with a clear message.
- **Depends on:** A1.

### Phase A3 — npm freshness
- **Goal:** also flag when the package itself is behind npm.
- **Deliverables:** registry `fetch` for latest version; merge into the report (`update available (npm)`); offline → local-only + notice; lookup mocked in tests.
- **Exit:** with a mocked-newer registry, report shows update available; with the fetch failing, report falls back to local-only and exits 0.
- **Depends on:** A2.

## Track B — Model-Aware Dispatch

### Phase B1 — Portable layer (tag authoring + HITL gate, all agents)
- **Goal:** difficulty/HITL flows from plan to ticket and the human gate works everywhere.
- **Deliverables:** mise-en-place SKILL.md authors `Difficulty`/`HITL` tags with a rubric; maître-d SKILL.md copies them to tickets at seating and pauses for HITL at fire-time; chef-de-rang reads its tag. All synced to `.claude/skills/`.
- **Exit:** a dry-run plan→service walkthrough shows tags authored, copied, and a HITL ticket pausing — independent of any model switch.
- **Depends on:** Phase 0.

### Phase B2 — Claude model selection
- **Goal:** the cost win on Claude Code.
- **Deliverables:** Claude adapter emits `.claude/agents/chef-de-rang.md` (`model: sonnet`) from the skill body; maître-d SKILL.md dispatches that subagent, overrides to Opus on `Difficulty: hard`, and escalates Sonnet→Opus on a pass-bounce; chef-de-rang notes manual invoke uses session model.
- **Exit:** Claude install produces the agent definition; the maître-d instructions deterministically map tidy→Sonnet, hard→Opus, bounce→Opus (verified by reading emitted output + a walkthrough).
- **Depends on:** B1.

### Phase B3 — Cross-agent degradation
- **Goal:** Codex/Gemini are honest about what they can't do.
- **Deliverables:** Codex/Gemini adapters document model-selection as a no-op (notice alongside the existing triggering-degradation note); installer summary surfaces it to the user.
- **Exit:** Codex/Gemini outputs carry the no-op notice; HITL guidance still present.
- **Depends on:** B2.

## Sequencing notes
- Phase 0 first, always. Then Track A and Track B are independent — do A fully (smaller, self-contained) then B, or interleave.
- Within each track, phases are strictly ordered.
- Every skill-editing phase (0, B1, B2) must re-sync `.claude/skills/` before its exit criteria count.

← [Home](./Home.md)
