# Order 01 · Walking skeleton · Status: Served
**Covers:** Plan Phase 0 — scaffold TS package, vendor skills + registry, Claude Code passthrough adapter + writer. Plus the shared `Adapter` interface + core types (pulled forward from Phase 1).
**Depends on:** none

## Done when  (acceptance — checked at the pass)
- [x] `npx .` (local) runs the CLI and prints help/version; `vitest run` is green. *(after `npx tsup` build; bin → `dist/cli.js`)*
- [x] Core types exist in `src/types.ts` (`Skill`, `Agent`, `InstallContext`, `FileOutput`) and an `Adapter` interface in `src/adapters/types.ts`; project compiles (`tsc --noEmit` clean).
- [x] Skill registry returns 4 normalized `Skill` objects (name, description, frontmatter, body) parsed via `gray-matter` from the vendored skills.
- [x] Claude Code passthrough adapter + writer install all four `.claude/skills/<name>/SKILL.md` into a target dir, byte-identical to source — covered by a test.

> Checkboxes reflect chef-de-rang's self-assessment; the Maître D' verifies at the pass.

## Touches
- `package.json`, `tsup.config.ts`, `vitest.config.ts`, `src/index.ts`, `src/cli.ts` · shared surfaces: **all four shared surfaces originate here** (types, Adapter interface, writer, cli entry — Maître D'-held)
- `skills/` (vendored copies of the four source skills), `src/registry.ts`, `src/types.ts`, `src/adapters/types.ts`, `src/adapters/claude.ts`, `src/writer.ts`

## Progress log  (append-only, newest last)
- 2026-06-24 — Vendored the four source `SKILL.md` files from `D:\Claude Hubs\.claude\skills\` into `skills/<name>/SKILL.md`; verified md5-identical to source.
- 2026-06-24 — Scaffolded TS package: `package.json` (type:module, `bin` → `dist/cli.js`), `tsconfig.json`, `tsup.config.ts` (esm, dts, shebang banner), `vitest.config.ts`. Deps: `gray-matter@4.0.3`, `commander@14.0.3`; dev: `tsup@8.5.1`, `vitest@3.2.6`, `typescript@5.9.3`, `@types/node`. Node v24.12.0.
- 2026-06-24 — Wrote core types (`src/types.ts`) and `Adapter` interface (`src/adapters/types.ts`).
- 2026-06-24 — TDD registry: RED (`test/registry.test.ts`, module-not-found) → GREEN (`src/registry.ts`, `loadSkills`/`loadSkill`/`skillSourcePath`/`skillsDir` via gray-matter). 3 tests pass.
- 2026-06-24 — TDD passthrough: RED (`test/claude-passthrough.test.ts`) → GREEN (`src/writer.ts` `writeOutputs`, `src/adapters/claude.ts` `claudeAdapter`). Byte-identity asserted via `Buffer.equals`. 2 tests pass.
- 2026-06-24 — TDD CLI: RED (`test/cli.test.ts`) → GREEN (`src/cli.ts` `buildProgram`/`run` with `list` + `install` commands; `src/index.ts` public API). 3 tests pass.
- 2026-06-24 — Full sweep green: `vitest run` → 8 passed (3 files); `tsc --noEmit` → exit 0 clean; `npx tsup` → build success; `npx . --version/--help/list` work; e2e `npx . install <tmp>` writes 4 byte-identical SKILL.md files.

## Current WIP / next action
- Order 01 scope complete and green; **handed to the pass for Maître D' verification** (chef-de-rang does not self-mark Served).
- Next course (Order 02 / Phase 1): Codex + Gemini adapters and conflict-policy/atomic writes in `src/writer.ts`, both implementing the existing `Adapter` contract.

## Decisions
- `Adapter` interface defined here (not Phase 1) so the passthrough adapter implements the same contract every later adapter will — avoids reworking it in 02. (Cross-cutting → also logged in plan ADR.)
- **Passthrough reads raw source bytes, not the normalized `Skill`.** `claudeAdapter.translate` re-reads each vendored `SKILL.md` via `skillSourcePath()` so output is byte-for-byte identical; re-serializing parsed frontmatter+body would not round-trip exactly. The normalized `Skill` model is still produced by the registry for adapters (Codex/Gemini) that transform content.
- **`skillsDir` resolves one level up from the module dir** (`resolve(moduleDir, "..", "skills")`), which holds for both `src/registry.ts` (dev/vitest) and `dist/registry.js` (built), since `skills/` is shipped at package root via `package.json#files`.
- **`bin` points at the built `dist/cli.js`**, so `npx .` requires a prior `npx tsup`. Acceptable for the skeleton; a `prepare`/`prepublish` build can be added when publishing (Phase 3).
- **Writer is minimal for now**: always writes (mkdir -p + writeFileSync); conflict-policy honoring (skip/overwrite/merge) + atomic writes are explicitly deferred to Phase 1 per the Development Plan.
- CLI version is currently a literal (`0.1.0`) matching `package.json`; a build-time inject can replace it later.

## Blockers / escalations
- none

## Pass verification (Maître D')
- 2026-06-24 — Verified independently: `vitest run` → 8 passed (3 files); `tsc --noEmit` → exit 0; `npx tsup` → build ok; `node dist/cli.js --version` → 0.1.0; `list` → 4 skills; e2e `install` + my own `md5sum` → all four SKILL.md byte-identical to source. **Served.**

## Tests  (all passing — `vitest run` → 8 passed, 3 files)
- `test/registry.test.ts` (3): returns all four vendored skills; normalizes name/description/frontmatter/body (body has no leading `---`); exposes `skillsDir`.
- `test/claude-passthrough.test.ts` (2): emits one `.claude/skills/<name>/SKILL.md` per skill; installs all four byte-identical to source (`Buffer.equals`).
- `test/cli.test.ts` (3): reports package version; has name + description; wires up the `list` command.
