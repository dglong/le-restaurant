# Decisions & Glossary · Status: Draft

## Glossary
- **The brigade** — the four skills as one workflow: **sous-chef** (validate idea) → **mise-en-place** (plan) → **maître-d** (orchestrate the build) → **chef-de-rang** (build one feature).
- **Skill** — a self-contained markdown instruction file (`SKILL.md` + frontmatter) that an agent loads to gain a capability.
- **Source skill** — the canonical version under `.claude/skills/`, vendored into the package as the source of truth.
- **Adapter** — per-agent translator: normalized skills → that agent's native files.
- **Passthrough** — Claude Code strategy: copy skills verbatim (full fidelity, on-demand triggering preserved).
- **Merge** — Codex strategy: fold skills into a single `AGENTS.md` as delimited sections.
- **Import** — Gemini strategy: separate skill files referenced via `@file.md` from `GEMINI.md`.
- **Managed markers** — `<!-- le-restaurant:start/end -->` comments bounding tool-owned content in a shared file, so re-runs update safely without touching user content.
- **Always-on vs on-demand** — Claude Code invokes skills on demand by description; Codex/Gemini load translated skills as always-on context (no triggering). Accepted fidelity loss.

## Decision log (ADRs) — append-only, newest last

### 2026-06-24 · Build it — themed multi-agent skill installer
- **Context:** four kitchen skills exist but have no front door and are locked to Claude Code (recipe Verdict: *Cook it*).
- **Decision:** ship an npm/`npx` CLI that installs the skills into a project for Claude Code, Codex, or Gemini.
- **Consequences:** buys discoverability + reuse; commits us to maintaining per-agent translation as conventions evolve.

### 2026-06-24 · Adapter-per-agent translation, accept fidelity loss
- **Context:** line-cook research confirmed only Claude Code has modular on-demand skills; Codex = single monolithic `AGENTS.md`; Gemini = hierarchical `GEMINI.md` with `@imports`, always-on.
- **Decision:** three distinct strategies — Claude passthrough, Codex merge, Gemini import — behind one `Adapter` interface; accept that Codex/Gemini lose on-demand triggering rather than fake a skill system.
- **Consequences:** honest, shippable, easy to extend per agent; users on Codex/Gemini get always-on context, communicated explicitly. Sources: [Claude skills](https://code.claude.com/docs/en/skills) · [Codex AGENTS.md](https://developers.openai.com/codex/guides/agents-md) · [Gemini GEMINI.md](https://geminicli.com/docs/cli/gemini-md/).

### 2026-06-24 · Managed markers for shared-file edits
- **Context:** Codex/Gemini write into files users may also own (`AGENTS.md`, `GEMINI.md`).
- **Decision:** wrap tool-written content in managed markers; only ever touch content between them; atomic writes + backups.
- **Consequences:** idempotent re-runs; strong guarantee against clobbering user content; slightly more writer complexity.

← [Home](./Home.md)
