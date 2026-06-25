---
name: mise-en-place
description: Turns a confirmed product idea into a buildable plan — a small cross-linked wiki of scope, architecture, phases, and a development plan — and refines it across repeated runs. The natural follow-up to an idea-validation session such as the sous-chef skill — once an idea is "cooked," this gets everything in place before you build, and you can re-run it to harden the plan over time. Use this skill whenever the user has a settled idea and wants to plan or refine the build — "how should I build this?", "design the architecture", "break this into phases", "write a dev plan", "scope this out", "tighten up the plan", "solidify the architecture", or when they hand over a recipe/idea doc and ask what's next. Trigger it even without the words "architecture" or "plan" when the user is moving from *what* to build toward *how*.
version: 1.0.0
---

# Mise en Place

*Everything in its place before service.* Takes a confirmed idea and plates a **wiki**: scope, architecture, phases, dev plan. Re-run it any time to harden the plan. Serious engineering content; keep the kitchen flavor to a pinch.

Done well = the user can start building without re-deciding the fundamentals.

## Service mode (tempo)

Two tempos. **Prep** (default) explains its reasoning in short, direct turns. **Service** is the rush: flip to it on "service mode," "we're in the weeds," "serious mode," or "just the answer"; flip back on "prep," "family meal," or "normal."

In service:
- No preamble or rationale prose unless asked — confirmations and outputs only.
- Acknowledge in one or two words and move.
- Gate prompts shrink to essentials ("Scope — in/out/non-goals below. Yes?"); rationale collapses to the one-line-per-choice the stack table already carries.

What does **not** change is the two gates. Scope and stack still get a yes before you plate, and you still don't guess a stack. Service trims the talk, not the method.

## Pick the mode first

1. **Refine** — a plan wiki already exists (`<docs-root>/recipes/<idea-slug>/plan/`, or a `*-plan/` folder from an older run) → load it, don't regenerate. Ask which page to harden, update it in place, bump its status (see below). Leave the rest untouched.
2. **Fresh** — no plan yet → run the full flow below.

Either way, check the dish is cooked. **Find it by scanning the docs root for `recipes/*/recipe.md`** (sous-chef output) — don't guess the slug. If several turn up, confirm which idea; if the user named one, match its folder. Failing that, take any `recipe*.md` or idea doc in the working dir. Read it as the source of truth.

Two stop conditions before you plan anything:
- **No usable idea** (missing or half-baked) → send it back to cook: suggest the `sous-chef` skill or ask 2–3 quick questions. Never plan a fuzzy idea.
- **The recipe's Verdict isn't a go** (it reads *pivot the dish* or *back in the fridge*) → don't plan a shelved or redirected idea. Surface the Verdict, point back to `sous-chef` to re-cook or pivot first, and only proceed if the chef explicitly overrides with a go.

## Fresh flow

Two gates, then plate. Don't generate pages before both pass — wrong scope or stack wastes the prep.

1. **Read the dish.** If the idea's `recipe.md` exists (in `<docs-root>/recipes/<idea-slug>/`), pull its **Problem / Solution / Users & context / Constraints / Verdict** straight in — that's the handoff contract. If there's only a loose idea doc or nothing, reconstruct those inputs with 2–3 quick questions (the Verdict is just the go/pivot/shelve call — for a fresh build it's an implicit "go"). Either way, restate the build in one line and confirm.
2. **Gate A — scope.** Draft the MVP boundary: in / out / non-goals. Show a tight list, get a yes. While here, note two things that decide the page set: does it handle **sensitive/regulated data, auth, or payments**? Does it need **hosting, CI/CD, or infra**?
3. **Gate B — stack & page set.** Inspect the repo (`package.json`, configs, `Dockerfile`) and the idea's real needs, propose a stack with one-line rationale per choice, flag uncertainties. Confirm before committing; research genuine unknowns via a line cook, don't guess. Then confirm which pages to plate: the four **core** pages always, plus any **optional** pages the Gate A answers call for (see the page list). Don't bolt a compliance page onto a weekend tool — but don't skip one on something handling health or payment data either.
4. **Plate the wiki.** Generate the chosen pages, cross-linked, share the folder path.

## Refine loop

On a re-run: load the wiki, ask what to deepen (or infer from the request — "tighten the data model" → Architecture). Update only that page, keep links intact, bump its `Status`. Note new decisions in that page's decisions section so the history stays visible. Stop when the user's satisfied — they drive the loop.

## Line cook (delegated search)

In agentic environments, delegate lookups (lib comparisons, "still maintained?", patterns, pricing) to a cheaper subagent — don't research in the main kitchen. First time, ask which model and remember it; default to the quick prep cook (e.g. Haiku). Spawn via Task with a tight query, ask for distilled findings, fold a 2–3 line synthesis into the relevant page. No subagents available? Say so, offer to look it up inline.

## The wiki

**Where it goes:** keep outputs organized and colocated with the recipe. Find the **docs root** — an existing `docs/`, `documentation/`, Obsidian vault, or the repo's docs dir; else create `docs/`. Inside it, every recipe lives under one `recipes/` container. The wiki lives at `<docs-root>/recipes/<idea-slug>/plan/`, right beside the idea's `recipe.md`, so everything about one idea sits in one folder. Ask once only if the location is genuinely unclear.

Cross-link with `[[Page Name]]` (Obsidian / GitHub wiki) or relative `./Page.md` for a plain repo — match where the user keeps docs. Every page links back to `[[Home]]`. Each page header carries `Status: Draft|Firm`. Fill only what the session produced; mark gaps `TBD`.

**Core pages (always):** Home, Scope, Architecture, Phases, Development Plan, Decisions & Glossary.
**Optional pages (include only when warranted):** Security & Compliance (sensitive/regulated data, auth, payments); Deployment & Ops (needs hosting, CI/CD, or infra). When you include one, add its row to the Home table.

**Tag each feature.** In `Phases.md` and `Development-Plan.md`, author a `Difficulty: tidy|hard` and `HITL: yes|no` tag on every phase or feature entry. Rubric — deterministic; two readers should reach the same answer: `Difficulty: hard` if **any** of — touches a shared surface (routing, shared types/services, build config); has unresolved decisions or open unknowns; deep dependency chain (depends on two or more incomplete items); or non-trivial logic/algorithm; else `tidy`. `HITL: yes` if architecturally consequential, ambiguous in scope, or security/data-sensitive; else `no`.

For diagrams, pick the type that earns its place: `flowchart` for components/flow, `sequenceDiagram` for a request path, `erDiagram` for the data model. Don't ship the placeholder below unchanged.

### `Home.md`
```markdown
# <Idea name> — Build Plan
**In one line:** <the build in a sentence>
**Why:** <the craving this serves — plus the edge, if the recipe had one. Pulled from the recipe's Problem / Differentiation; skip if it wasn't captured.>
**Stack:** <one-line summary>

| Page | Status |
|------|--------|
| [[Scope]] | Draft |
| [[Architecture]] | Draft |
| [[Phases]] | Draft |
| [[Development Plan]] | Draft |
| [[Decisions & Glossary]] | Draft |
<!-- add when included: [[Security & Compliance]] · [[Deployment & Ops]] -->

**Source:** <recipe link / note>
```

### `Scope.md`
```markdown
# Scope · Status: Draft
## Goal & success criteria
## In scope (MVP)
## Out of scope / non-goals
## Users & primary flows
## Constraints & assumptions
← [[Home]]
```

### `Architecture.md`
```markdown
# Architecture · Status: Draft
## Overview — components and responsibilities
## Diagram
\`\`\`mermaid
flowchart LR
  Client --> API --> DB[(Database)]
\`\`\`
## Tech stack — <layer>: <choice> — <why>
## Data model — key entities & relationships
## Key decisions & tradeoffs — decision · why · what we gave up
## Cross-cutting — auth, errors, observability, testing
## External integrations
← [[Home]]
```

### `Phases.md`
```markdown
# Phases · Status: Draft
Skeleton → MVP → beyond; each phase ships something demoable.
## Phase 0 — Walking skeleton — goal / deliverables / exit criteria
**Difficulty:** tidy|hard  **HITL:** yes|no
## Phase 1 — <core value> — goal / deliverables / exit / depends on
**Difficulty:** tidy|hard  **HITL:** yes|no
## Phase 2+ — ...
## Sequencing notes
← [[Home]]
```

### `Development-Plan.md`
```markdown
# Development Plan · Status: Draft
## Tasks — per phase, epics → shippable tasks with S/M/L size
### Phase 0
**Difficulty:** tidy|hard  **HITL:** yes|no
- [ ] <task> — S
  - **Done when:** <observable acceptance criteria — how you'd verify it>
  - **Touches:** <files / areas / components>
## Test strategy — what to test at which level (unit / integration / e2e), what "tested enough" means per phase, and (if the repo has no runner yet) standing up the test tooling as an explicit Phase 0 task
## Risks & mitigations
## Definition of done — applies to every task before it's considered complete
## Definition of ready — what a task needs (criteria + touched areas + no blocking unknowns) before an implementer or agent can pick it up
## Start here — first 1–3 tasks
← [[Home]]
```

### `Decisions-and-Glossary.md`
The page that keeps the *why* alive once building starts. Seed it from the recipe (its Verdict and the craving) and Architecture (key decisions), then it grows: the service layer appends decisions here as the build makes them, so context never thins out to a bare dependency graph. Right-size it — a weekend tool might be a short glossary plus the recipe's Verdict as the single decision; a real product earns a running log.
```markdown
# Decisions & Glossary · Status: Draft

## Glossary — the project's words, used the same way by humans and agents
- **<term>** — <what it means here, precisely. The one word that replaces a sentence.>

## Decision log (ADRs) — append-only, newest last
### <date> · <decision in a line>
- **Context:** <what forced the choice>
- **Decision:** <what was chosen>
- **Consequences:** <what it buys, what it gives up>
← [[Home]]
```

### `Security-and-Compliance.md`  *(optional — sensitive/regulated data, auth, payments)*
```markdown
# Security & Compliance · Status: Draft
## Data sensitivity — what data, how sensitive, where it lives
## Authn / authz — identity, sessions, permission model
## Regulatory — applicable rules (e.g. health data, PII, PCI) and what they require
## Threats & mitigations — top risks · mitigation
## Secrets & keys — how they're stored and rotated
← [[Home]]
```

### `Deployment-and-Ops.md`  *(optional — needs hosting, CI/CD, or infra)*
```markdown
# Deployment & Ops · Status: Draft
## Environments — local / staging / prod
## Hosting & infra — where it runs, key services
## CI/CD — build, test, deploy pipeline
## Observability — logs, metrics, alerts
## Cost — rough monthly estimate & main drivers
← [[Home]]
```

## Style

- Concise, direct, short turns. Light kitchen flavor; plain professional content.
- Opinionated, not dictatorial — recommend and say why, defer to the user.
- Size with S/M/L, not invented hours. Right-size the plan to the idea — a weekend tool isn't a 12-phase roadmap.

## Anti-patterns

- Generating the wiki before scope and stack are confirmed.
- Regenerating from scratch on a re-run instead of refining in place.
- Assuming a stack instead of inferring + confirming.
- Planning a vague idea — send it back to `sous-chef`.
- Planning an idea whose recipe Verdict was *pivot* or *shelve*, without an explicit override.
- Bloated plans or fake estimates.
- Skipping security/deploy planning on a project that clearly needs it — or bolting those pages onto a throwaway tool.
- Dev-plan tasks with no acceptance criteria, so nobody (human or agent) can tell when they're done.
- Researching in the main kitchen instead of via a line cook.
- Scattering the plan away from the recipe instead of colocating under one `<docs-root>/recipes/<idea-slug>/` folder.
- Treating service mode as license to skip a gate.
- Pages that don't link back to `[[Home]]`.
