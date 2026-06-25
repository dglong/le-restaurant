# Le Restaurant — Build Plan

**In one line:** An npm-installable CLI that introduces the four kitchen skills and installs them into a project for the agent you pick (Claude Code, Codex, Gemini), translating each skill into that agent's native format.

**Why:** Four kitchen-themed skills (sous-chef → mise-en-place → maître-d → chef-de-rang) have no front door — hard to discover, hard to install, and locked to Claude Code. This gives them a real home and a one-command install across agents. A fun, themed project; strangers benefiting is a bonus.

**Stack:** TypeScript/Node CLI · `@clack/prompts` + `commander` · `gray-matter` for skill parsing · `tsup` build · `vitest` tests · shipped via npm/`npx`.

| Page | Status |
|------|--------|
| [Scope](./Scope.md) | Draft |
| [Architecture](./Architecture.md) | Draft |
| [Phases](./Phases.md) | Draft |
| [Development Plan](./Development-Plan.md) | Draft |
| [Decisions & Glossary](./Decisions-and-Glossary.md) | Draft |
| [Deployment & Ops](./Deployment-and-Ops.md) | Draft |

**Source:** [recipe.md](../recipe.md)
