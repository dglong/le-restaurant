# Development Plan · Status: Draft

## Tasks

### Phase 0 — Shared surfaces
- [ ] Add `version: string` to the `Skill` interface and parse it from frontmatter — **S**
  - **Done when:** `Skill.version` is populated from `SKILL.md` frontmatter for all four skills; absent version falls back to `0.0.0` and logs a warning; unit test covers present + absent.
  - **Touches:** `src/types.ts`, `src/registry.ts`, `test/`
- [ ] Add `version:` frontmatter to all four canonical skills and re-sync `.claude/skills/` — **S**
  - **Done when:** each `skills/*/SKILL.md` has a semver; `scripts/check-skills-sync.ts` passes.
  - **Touches:** `skills/*/SKILL.md`, `.claude/skills/*/SKILL.md`
- [ ] Add `Difficulty`/`HITL` fields to the order-ticket template in maître-d — **S**
  - **Done when:** the ticket markdown template documents both fields with allowed values; no behavior yet.
  - **Touches:** `skills/maitre-d/SKILL.md`

### Phase A1 — Version stamping & manifest
- [ ] Define + write the `.le-restaurant.json` manifest on install — **M**
  - **Done when:** after install into a temp dir, the manifest lists package version, agent id, and per-skill versions for the selected skills; covered by a writer test.
  - **Touches:** `src/writer.ts`, `src/types.ts`, `test/`
- [ ] Stamp version in Codex/Gemini rendered sections — **S**
  - **Done when:** each rendered skill section/file carries its version; Claude passthrough already retains frontmatter version; adapter tests assert presence.
  - **Touches:** `src/adapters/codex.ts`, `src/adapters/gemini.ts`, `test/`

### Phase A2 — `check` command (local drift)
- [ ] Add `check` subcommand comparing manifest vs bundled versions — **M**
  - **Done when:** `le-restaurant check` in an installed project prints per-skill `up-to-date | stale (local)`; missing manifest prints a clear "not installed here" message; tested against fixture manifests.
  - **Touches:** `src/cli.ts`, new `src/check.ts`, `test/`

### Phase A3 — npm freshness
- [ ] Fetch latest from npm registry and merge into the report — **M**
  - **Done when:** with a mocked-newer registry response the report shows `update available (npm)`; a failing/absent network falls back to local-only with a notice and exits 0; fetch is mocked in tests.
  - **Touches:** `src/check.ts`, `test/`

### Phase B1 — Portable dispatch layer
- [ ] mise-en-place authors `Difficulty`/`HITL` tags with a rubric — **M**
  - **Done when:** mise-en-place SKILL.md instructs writing both tags per feature in `Phases.md`/`Development-Plan.md`, with a stated deterministic rubric (criteria count, shared-surface touches, dependency depth, unresolved decisions); synced.
  - **Touches:** `skills/mise-en-place/SKILL.md`, `.claude/skills/...`
- [ ] maître-d copies tags to tickets + HITL pause at fire-time — **M**
  - **Done when:** maître-d SKILL.md copies the tag at seating and, on `HITL: yes`, pauses to ask the human before firing; chef-de-rang reads the tag; synced.
  - **Touches:** `skills/maitre-d/SKILL.md`, `skills/chef-de-rang/SKILL.md`, `.claude/skills/...`

### Phase B2 — Claude model selection
- [ ] Claude adapter emits `.claude/agents/chef-de-rang.md` (`model: sonnet`) — **M**
  - **Done when:** Claude install produces a valid agent definition (name/description/model/tools + skill body) from the chef-de-rang skill; adapter test asserts the file + `model: sonnet`.
  - **Touches:** `src/adapters/claude.ts`, `test/`
- [ ] maître-d model-selection + escalation rules — **M**
  - **Done when:** maître-d SKILL.md dispatches chef-de-rang as a subagent, maps `tidy→sonnet` / `hard→opus`, overrides to Opus on a pass-bounce, and documents that manual invoke uses the session model; synced.
  - **Touches:** `skills/maitre-d/SKILL.md`, `skills/chef-de-rang/SKILL.md`, `.claude/skills/...`

### Phase B3 — Cross-agent degradation
- [ ] Document model-selection no-op in Codex/Gemini + installer summary — **S**
  - **Done when:** Codex/Gemini outputs carry a no-op notice next to the existing degradation note; `src/summary.ts` surfaces it; tests assert the notice.
  - **Touches:** `src/adapters/codex.ts`, `src/adapters/gemini.ts`, `src/summary.ts`, `test/`

## Test strategy
- **Unit (vitest):** version + tag parsing, manifest write/read, adapter stamping & agent-def emission, `check` comparison logic. npm lookup **mocked** — never a live call in tests.
- **Integration:** install all four skills into a temp dir per agent; assert emitted tree (incl. manifest, Claude agent def) and that `check` reads it back correctly.
- **Skill-markdown changes** have no runtime test — their Done-when is a re-read walkthrough + the sync check passing. "Tested enough" per phase = the named unit/integration tests green + `check-skills-sync.ts` green + existing suite no regressions.

## Risks & mitigations
- **Skill instructions are prose, not code** → can't unit-test behavior. *Mitigation:* keep rubric/mapping deterministic and explicit; verify by walkthrough.
- **npm lookup flakiness/offline** → *Mitigation:* mandatory catch + local-only fallback, exit 0.
- **Sync drift between `skills/` and `.claude/skills/`** → *Mitigation:* sync is in every skill task's Done-when; CI sync check gates.
- **Host model ignores the model-pin instruction** → *Mitigation:* prefer the emitted agent-definition default (`model: sonnet`) so the floor is enforced by config, not just prose.

## Definition of done
Code: typed, lint-clean, covered by the named tests, builds via `tsup`, existing suite green. Skills: edited in `skills/`, synced to `.claude/skills/`, sync check green. No live network in tests.

## Definition of ready
A task has acceptance criteria, a touched-files list, and no blocking unknown. Skill-editing tasks name the exact rubric/mapping wording to add.

## Start here
1. Phase 0 · `Skill.version` field + frontmatter parsing.
2. Phase 0 · add `version:` to the four skills + sync.
3. Phase A1 · define + write the `.le-restaurant.json` manifest.

← [Home](./Home.md)
