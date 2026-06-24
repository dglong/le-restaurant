# Phases · Status: Draft

Skeleton → MVP → polish; each phase ships something demoable.

## Phase 0 — Walking skeleton
- **Goal:** a runnable CLI that does the simplest real thing end-to-end.
- **Deliverables:** TS project (`tsup` + `vitest`), `bin` entry, `npx`-runnable; reads the bundled skills via the registry; Claude Code passthrough adapter installs all four skills into `.claude/skills/`.
- **Exit criteria:** `npx .` (local) installs the four skills into a fresh test dir for Claude Code, verified by a test.

## Phase 1 — Translation layer (the core value)
- **Goal:** real multi-agent translation.
- **Deliverables:** Codex adapter (merge into `AGENTS.md` with managed markers) and Gemini adapter (`.gemini/skills/*` + `@import` into `GEMINI.md`); idempotent re-runs; conflict handling (skip/overwrite/merge); golden-file tests per adapter.
- **Exit criteria:** installing for each of the three agents produces correct files; re-running updates in place without duplication. Depends on Phase 0.

## Phase 2 — Interactive UX
- **Goal:** the friendly front-of-house experience.
- **Deliverables:** `@clack/prompts` wizard (pick agent → tick skills), `commander` non-interactive flags (`--agent`, `--skills`, `--yes`), post-install summary explaining what landed and how to use it (incl. the always-on caveat for Codex/Gemini).
- **Exit criteria:** both interactive and scripted flows work; summary is clear. Depends on Phase 1.

## Phase 3 — Front door & ship
- **Goal:** make it discoverable and publishable.
- **Deliverables:** README introducing the brigade workflow, per-skill blurbs, install/usage docs; source-skill sync check (vendored vs `.claude/skills/`); npm publish via CI.
- **Exit criteria:** `npx le-restaurant` works from the published package; README tells the story. Depends on Phase 2.

## Sequencing notes
- Phase 0 proves the pipeline with the easy adapter before tackling the hard ones.
- The riskiest assumption (Codex/Gemini translation actually loads) is validated early in Phase 1 — spike one adapter first and manually load it in the real agent before polishing.

← [Home](./Home.md)
