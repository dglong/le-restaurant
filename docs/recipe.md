# Le Restaurant — a front door for the kitchen skill set

**The dish in one line:** A themed repo that introduces the four kitchen skills and installs them into any project with one interactive command — translating them into each agent's native format.

## Problem
- Four kitchen-themed skills (sous-chef → mise-en-place → maître-d → chef-de-rang) exist but have no front door: no easy way to discover them, no easy way to install them, and they're locked to Claude Code's `SKILL.md` format.
- Today they just live in a `.claude/skills/` folder — fine for the author, invisible to everyone else.

## Users & context
- Primarily **me** — a fun personal project to give a themed skill set a proper home and reuse it across my own future projects.
- Secondarily **curious strangers** who stumble on the repo and want to try the skills. A bonus, not the goal — no venture pressure.

## Solution
- A `le-restaurant` repository that introduces the four skills as one coherent, themed workflow (the kitchen brigade: idea → plan → orchestrate → build).
- An **interactive installer** (npm install/add): the user picks their agent, and the installer translates each selected skill into that agent's native format and drops it into the project.
- Agent picker kept simple — the popular ones: **Claude Code, Codex, Gemini** (checkbox-style selection).

## Inspiration
- A fun, personal project with a theme. The craving is "these four deserve a real front door," not solving a market need. Strangers benefiting is a happy side effect.

## Constraints
- Keep it simple — focus on the most popular agents (Claude Code, Codex, Gemini) rather than trying to cover everything.
- Distribution via npm (`install`/`add`).
- Source of truth is the existing Claude Code skills in `.claude/skills/`.

## Key assumptions
- Each target agent (Codex, Gemini) can meaningfully consume a *translated* version of a Claude Code skill — i.e. there's a native convention (e.g. `AGENTS.md`, `GEMINI.md`, context files) to map onto.
- The four skills' chained workflow can be expressed in those formats, not just standalone tools.
- An npm package is an acceptable delivery vehicle for "install skills into a project."

## Risks & open questions
- **The translation layer is the undercooked part** — Codex/Gemini have no `SKILL.md` system, so "translate and drop in" must actually produce something those agents can load and trigger.
- The skills are a **chained workflow**, which is harder to map than four independent tools — handoffs and triggering conventions differ per agent.
- Open: what exactly does each agent expect, and how faithfully can the chain survive translation?
- **→ Handed to `mise-en-place` to dig deeper.**

## Riskiest assumption to test next
- That a single skill can be translated into one other agent's format and actually work. Cheap taste: hand-translate **one** skill (e.g. sous-chef) into Codex's convention and try triggering it before building any installer.

## Verdict
- **Cook it.** Clear craving, low stakes, fun. The translation layer is the real engineering question — to be scoped in planning, not a blocker.

## Next steps
1. Run `mise-en-place` to scope the architecture — especially the translation layer and the installer CLI.
2. Pin down each target agent's native skill/context format (Claude Code, Codex, Gemini).
3. Spike one hand-translated skill into one non-Claude agent to validate feasibility.
