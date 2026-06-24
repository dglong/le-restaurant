---
name: maitre-d
description: Front-of-house orchestrator for building a planned project. Reads a mise-en-place plan wiki, cuts it into per-feature "order tickets," and runs service one course at a time — fires the next ready ticket, sends a chef-de-rang to build it, then works the pass to verify the feature is done before moving on. The natural follow-up once a build plan exists. Use this skill whenever the user wants to start or continue implementing a planned project — "let's build this," "start development," "what's next to build," "continue the build," "run the implementation," "work through the plan" — or hands over a plan folder and asks to execute it. Trigger it even without the word "build" when the user is moving from a finished plan toward shipping code.
---

# Maître D'

Front-of-house manager for the build. The kitchen (`sous-chef`, `mise-en-place`) settled *what* and *how*; the Maître D' runs **service** — turning the plan into features served one course at a time, and checking every plate at the pass before it leaves the floor. Serious engineering content; keep the floor flavor to a pinch.

Done well = features ship from the plan in dependency order, each verified against its acceptance criteria, with state that survives any interruption.

## Default: one course at a time

Fire a single ticket, see it through the pass, mark it **Served**, then fire the next. Sequential service is slower but precise — no parallel writes to trip over, every plate checked before the next is started, and the whole floor resumable from disk. Parallel brigade service is intentionally out of scope for now; don't fake it.

## Check the kitchen first

Find the plan: scan the docs root for a `<slug>/plan/` wiki (`mise-en-place` output).
- **No plan, or only a `recipe.md`** → don't improvise service. Send it back to the kitchen — suggest `mise-en-place` to plan the build first.
- **Plan exists but the fundamentals are still `Draft`** (no real scope or stack) → flag it and offer to firm those up via `mise-en-place` before firing anything.

## The service layer

Everything lives in `<docs-root>/<idea-slug>/service/`, beside `plan/` and `recipe.md`, so one idea stays in one folder:
- `Board.md` — the floor at a glance: every ticket, its status, and the course order.
- `order-NN-<slug>.md` — one ticket per feature/phase. The unit of work **and** its memory.

## Flow

### 1. Seat the room (first run)
From `Phases.md` and `Development-Plan.md`, cut the work into tickets — usually one per phase or coherent feature. Seed each ticket straight from the plan: its tasks, their **Done when** criteria, and **Touches** list. Write `Board.md` with the course order, respecting dependencies.

**Resolve shared surfaces up front.** Scan every ticket's **Touches** for shared surfaces the plan already names — routing, shared services/types, the component library, build config. Don't leave these to be discovered mid-cook: pre-own or pre-stub them now (e.g. register a route placeholder, declare a shared interface) so a chef-de-rang is never blocked halfway through a course by something the plan already foresaw. Only genuinely *unforeseen* shared needs should surface as a mid-cook escalation.

Show the breakdown — tickets, course order, and the shared surfaces you're holding — and confirm before firing.

### 2. Own the dining room
Some surfaces are shared — routing, shared services/types, the component library, build config. The Maître D' holds these. When a ticket needs a cross-cutting change, it's made deliberately (at seating or at the pass), not buried inside one feature. Note shared touches on the ticket so nothing collides. When a shared decision is non-obvious, log it in the plan's `Decisions & Glossary` (ADR log) so the *why* outlives the build — a ticket's local **Decisions** are fine for feature-scoped choices, but cross-cutting ones graduate to the plan.

### 3. Fire the next ticket
Pick the next ticket whose dependencies are **Served** and whose **Definition of Ready** is met (criteria + touches present, no blocking unknown). If it isn't ready, fix the ticket first — never fire a vague order. Set Status → **Firing**, then send a `chef-de-rang` with the ticket path and the plan pages it points to.

### 4. Work the pass
When the chef-de-rang hands back, check the plate before it ships. **Proof, not claims** — a plate is passed on shown command output, never on a "tests pass" assertion. For each check, *run the command yourself*, read the actual output, and only then judge:
- Every **Done when** criterion on the ticket is verifiably met.
- The tests the plan's test strategy names for this work pass — run them, don't take it on faith.
- The whole app still builds and the existing suite stays green — no regressions.
- Lint is clean.

Record the verification on the ticket's **Tests** section: the commands run and their result (e.g. `vitest run → 12 passed`, `tsc --noEmit → clean`). An "I'm done" with no command output behind it is not done.

A plate that fails goes back to the same ticket with notes; Status stays **Firing**, it does not ship. Only when the output proves it: Status → **Served**, update `Board.md`, fire the next.

### 5. Last orders
When every ticket is Served, say so plainly and point at what the plan parked under "beyond MVP." Don't invent new courses.

## The order ticket

One per feature, at `service/order-NN-<slug>.md`. This is the durable memory — a chef-de-rang owns the *ticket*, not the feature, so anything not written here is lost between shifts.

```markdown
# Order NN · <feature name> · Status: To fire
**Covers:** <plan phase / tasks this ticket delivers>
**Depends on:** <other tickets, or none>

## Done when  (acceptance — checked at the pass)
- [ ] <criterion, observable>

## Touches
- <files / areas> · shared surfaces: <routing / services / types, or none>

## Progress log  (append-only, newest last)
- <date> — <what was done>

## Current WIP / next action
- <the single resume pointer: exactly what to do next>

## Decisions
- <choice · why>

## Blockers / escalations
- <anything needing the Maître D' or the user; or none>

## Tests
- <which tests written / passing>
```

## Board.md

```markdown
# <Idea name> — Service Board
**Plan:** ../plan/Home.md

## Course order
1. [[order-01-<slug>]] — <feature>
2. [[order-02-<slug>]] — <feature> (depends on 01)

| # | Feature | Status | Depends on |
|---|---------|--------|------------|
| 01 | <feature> | To fire | — |

Status flow: To fire → Firing → At the pass → Served   ( 86'd = dropped )
```

## Resuming

A re-run is normal. Don't re-decompose — read `Board.md` for where service stands, read the in-flight ticket's **Current WIP / next action**, and continue from there.

## Re-seat when the plan moves

Tickets copy **Done when** and **Touches** from the plan at seating, so a later `mise-en-place` refine can leave them stale. Before firing on a resumed build, check whether `plan/` changed since the tickets were cut. If it did, **reconcile**: update the not-yet-Served tickets to match the new plan (criteria, touches, course order), leave **Served** tickets alone but note any drift they now carry, and confirm the reconciled board before firing. Never fire a ticket you know contradicts the current plan.

## Tempo

Same toggle as the rest of the suite: "service mode" / "in the weeds" for terse, "prep" / "family meal" / "normal" to relax. It trims the talk, never the pass checks.

## Right-size

A weekend tool might be two or three tickets with no shared-surface ceremony. A multi-feature app earns the full floor. Don't seat twelve tables for a one-course meal.

## Anti-patterns

- Improvising service with no plan — send it to `mise-en-place`.
- Firing more than one ticket at a time (not supported yet — keep it sequential).
- Passing a plate that fails its **Done when** or breaks the app build.
- Marking a plate Served on a claim of green instead of shown command output.
- Letting a feature rewrite shared routing/services/types on its own.
- Tickets without acceptance criteria — a vague order can't be cooked or checked.
- Leaving a plan-named shared surface to be discovered mid-cook instead of resolving it at seating.
- Firing tickets that contradict a plan that changed under you — reconcile first.
- Re-decomposing from scratch on resume instead of reading the board.
