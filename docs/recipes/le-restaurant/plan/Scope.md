# Scope · Status: Draft

## Goal & success criteria
Give the four kitchen skills a public front door and a one-command, multi-agent installer.

**Success:** a stranger can run `npx le-restaurant`, pick their agent, tick the skills they want, and end up with working skill files in the right place for that agent — and the README makes the brigade workflow obvious.

## In scope (MVP)
- A repo that **introduces** the four skills: README + the "brigade" workflow story (idea → plan → orchestrate → build).
- An **interactive CLI** (`npx le-restaurant`): pick target agent → pick which skills → install into the current project.
- A **non-interactive path** (`--agent codex --skills all --yes`) for scripting.
- A **translation layer**: `SKILL.md` → each agent's native format (Claude Code passthrough · Codex merged `AGENTS.md` · Gemini imported `GEMINI.md`).
- The four skills **bundled as the source of truth**, kept in sync with `.claude/skills/`.

## Out of scope / non-goals
- No GUI, no web app, no hosted service.
- No agents beyond Claude Code / Codex / Gemini (extensible later).
- No auth, accounts, payments, or telemetry.
- **Not** trying to preserve auto-triggering on agents that lack a skill system — best-effort, always-on translation is acceptable (and called out to the user).

## Users & primary flows
- **Author (me):** reuse the skill set across my own projects; keep one source of truth.
- **Curious stranger:** discover via README, run the installer, try the skills in their agent.

**Primary flow:** run CLI → detect/choose agent → choose skills → translate → write files → print a "what got installed & how to use it" summary.

## Constraints & assumptions
- Keep it simple — three agents only.
- Distribution via npm/`npx`; no install required to try.
- Source skills live in the repo and must not drift from the canonical `.claude/skills/` versions.
- Each agent's instruction convention is a moving target — translation adapters must be isolated and easy to update.

← [Home](./Home.md)
