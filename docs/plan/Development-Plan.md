# Development Plan · Status: Draft

## Tasks

### Phase 0 — Walking skeleton
- [ ] Scaffold TS package: `tsup`, `vitest`, `bin` entry, `package.json` with `npx` config — **S**
  - **Done when:** `npx .` runs the CLI and prints a help/version; `vitest` runs green on a placeholder test.
  - **Touches:** `package.json`, `tsup.config.ts`, `src/index.ts`, `src/cli.ts`
- [ ] Vendor the four source skills + skill registry — **M**
  - **Done when:** registry returns 4 normalized `Skill` objects (name, description, frontmatter, body) parsed via `gray-matter`.
  - **Touches:** `skills/` (vendored), `src/registry.ts`, `src/types.ts`
- [ ] Claude Code passthrough adapter + writer — **M**
  - **Done when:** running the CLI writes all four `.claude/skills/<name>/SKILL.md` into a target dir, byte-identical to source; covered by a test.
  - **Touches:** `src/adapters/claude.ts`, `src/writer.ts`

### Phase 1 — Translation layer
- [ ] Define `Adapter` interface + `FileOutput`/`InstallContext` model — **S**
  - **Done when:** all adapters implement one interface; types compile; unit test asserts the contract.
  - **Touches:** `src/adapters/types.ts`
- [ ] Codex adapter — merge skills into `AGENTS.md` with managed markers — **M**
  - **Done when:** golden-file test: N skills → one `AGENTS.md` with one delimited section each; re-run updates between markers without touching surrounding user content.
  - **Touches:** `src/adapters/codex.ts`, `test/fixtures/codex/`
- [ ] Gemini adapter — `.gemini/skills/*.md` + `@import` lines in `GEMINI.md` — **M**
  - **Done when:** golden-file test: each skill becomes a file + an `@./.gemini/skills/<name>.md` import; re-run is idempotent.
  - **Touches:** `src/adapters/gemini.ts`, `test/fixtures/gemini/`
- [ ] Conflict policy (skip / overwrite / merge) + atomic writes — **M**
  - **Done when:** existing files are detected; chosen policy honored; a failed write never leaves a half-written/clobbered file (tested).
  - **Touches:** `src/writer.ts`

### Phase 2 — Interactive UX
- [ ] `@clack/prompts` wizard: pick agent → multiselect skills — **M**
  - **Done when:** running with no args walks the user through selection and installs the result.
  - **Touches:** `src/cli.ts`, `src/wizard.ts`
- [ ] `commander` non-interactive flags `--agent --skills --yes` — **S**
  - **Done when:** `--agent codex --skills all --yes` installs without prompts; bad values error clearly.
  - **Touches:** `src/cli.ts`
- [ ] Post-install summary (incl. always-on caveat for Codex/Gemini) — **S**
  - **Done when:** after install, output lists files written, target agent, and how to use the skills.
  - **Touches:** `src/summary.ts`

### Phase 3 — Front door & ship
- [ ] README: brigade story + per-skill blurbs + install/usage — **M**
  - **Done when:** README explains the four-skill workflow and the install command; renders cleanly on GitHub.
  - **Touches:** `README.md`
- [ ] Source-skill sync check (vendored vs `.claude/skills/`) — **S**
  - **Done when:** a script/test fails if vendored skills drift from canonical source.
  - **Touches:** `scripts/check-skills-sync.ts`, CI
- [ ] npm publish via CI — **S**
  - **Done when:** tagged release publishes; `npx le-restaurant@latest` works from a clean machine.
  - **Touches:** `.github/workflows/publish.yml`, `package.json`

## Test strategy
- **Unit:** registry parsing, each adapter's transform (pure functions).
- **Golden-file (integration):** fixture skills → expected output tree per agent; this is the safety net for the translation layer and re-run idempotency.
- **E2E (light):** run the built CLI against a temp dir for each agent, assert files exist and re-run is stable.
- **Tooling stands up in Phase 0** — `vitest` is an explicit first task; "tested enough" per phase = adapters have golden tests before UX work begins.

## Risks & mitigations
- **Agent conventions drift** → isolate in adapters; pin doc links in `Decisions`; sync check in CI.
- **Translation loses triggering on Codex/Gemini** → accept + clearly communicate in summary/README; don't fake a skill system.
- **Clobbering user files on merge** → managed markers + atomic writes + backups; heavily tested.
- **Vendored skills drift from source** → automated sync check.

## Definition of done
Code + tests green; no clobbering of out-of-marker user content; behavior matches the task's "Done when"; docs/summary updated where the task touches user-facing behavior.

## Definition of ready
Task has acceptance criteria, named files/areas, and no blocking unknown (the agent-format unknowns are now resolved — see [Architecture](./Architecture.md)).

## Start here
1. Scaffold the TS package (Phase 0, task 1).
2. Vendor skills + registry (Phase 0, task 2).
3. Claude Code passthrough adapter + writer (Phase 0, task 3) — first end-to-end install.

← [Home](./Home.md)
