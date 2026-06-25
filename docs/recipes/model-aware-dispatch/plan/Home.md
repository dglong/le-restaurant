# Model-Aware Dispatch & Skill Versioning — Build Plan

**In one line:** Two changes to the le-restaurant brigade: (1) let the Maître D' run chef-de-rang on the cheap model by default and escalate to the expensive one (or a human) only where the work earns it, and (2) version every skill so an installed project can tell whether it's running the latest.

**Why:** Running implementation on the priciest model for every ticket wastes spend the brigade doesn't need, and installed skills drift silently with no way to know they're stale. Both ride the same surfaces — skill frontmatter, the installer adapters, and the sync check — so they're planned together.

**Stack:** existing repo, unchanged — TypeScript/Node CLI · `commander` + `@clack/prompts` · `gray-matter` for skill parsing · `tsup` build · `vitest` tests · markdown skills in `skills/`.

| Page | Status |
|------|--------|
| [Scope](./Scope.md) | Draft |
| [Architecture](./Architecture.md) | Draft |
| [Phases](./Phases.md) | Draft |
| [Development Plan](./Development-Plan.md) | Draft |
| [Decisions & Glossary](./Decisions-and-Glossary.md) | Draft |

**Source:** [recipe.md](../recipe.md)
