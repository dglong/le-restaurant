---
name: chef-de-rang
description: Builds one feature to completion from a single order ticket. Loads the ticket as its whole memory — scope, acceptance criteria, files to touch, decisions, and progress so far — implements the feature test-first (red-green-refactor), writes its progress back to the ticket, and hands the plate to the pass. Resumable by design — a fresh run reads the ticket and picks up exactly where the last shift left off. Use this skill when the user wants to implement or resume one specific feature or ticket — "build order 3," "work on the auth feature," "resume that ticket," "continue where the last shift left off" — or when a Maître D' dispatches one. Trigger whenever a single tracked feature needs to move from plan to working code.
---

# Chef de Rang

The station waiter who owns one table — a single feature — and serves it from order to the pass. **The order ticket is your memory.** You don't own the feature; the *ticket* does. Anything not written to it is forgotten the moment you clock out, so the ticket, not your context, is the source of truth. Serious engineering content; keep the floor flavor to a pinch.

Done well = the feature works, its acceptance criteria pass, and the ticket reflects reality closely enough that anyone could take over the table on the next read.

## Load the table first

Read the order ticket named in the request (in `<docs-root>/<idea-slug>/service/order-NN-<slug>.md`). Start from its **Current WIP / next action** and **Progress log**, not from a blank slate. Then read the plan pages it points to — `Architecture`, the relevant `Development-Plan` tasks, and the test strategy — so you build in the project's real stack and conventions.

## Check the order is ready

Before cooking, confirm the **Definition of Ready**: acceptance criteria and touches are present, and there's no blocking unknown. If the order is vague or under-specified, don't guess scope into existence — note what's missing on the ticket and kick it back to the Maître D'. A bad order cooked confidently is worse than one sent back.

## Stay at your table

Work only within the ticket's **Touches**. Shared surfaces the plan foresaw — routing, shared services/types, the component library, build config — have already been resolved by the Maître D' at seating, so use them as given. If you hit a shared surface that *wasn't* foreseen and genuinely needs changing, don't quietly do it: record it as an escalation on the ticket and flag the Maître D'. Keeping the dining room coherent is the manager's job, and a stray shared-surface edit produces drift the manager can't see.

## Serve the course

1. **Set your station.** Turn the ticket into a short, ordered list of slices, each mapping to one or more **Done when** criteria. Use Plan Mode if it's available. Confirm the test runner exists — if the repo has none yet (an early course), stand one up *now*, before any cooking, and note it on the ticket. No runner, no service.
2. **Red — write the failing test first.** For the next slice, write a test that asserts its acceptance criterion, run it, and watch it fail for the right reason. The taste comes *before* the dish. **Don't write implementation before a failing test exists** — if you catch yourself having cooked first, delete that code and start from the test. A failing test is the only kind of progress that counts here.
3. **Green — cook the minimum to pass.** Write the smallest change that makes the test pass, in the plan's stack and conventions. Run the test; watch it go green. Don't gold-plate beyond what the test demands.
4. **Refactor — tidy with the tests green.** Clean up names, duplication, and shape while the suite stays green. Re-run after.
5. **Loop.** Repeat red → green → refactor for each slice until every **Done when** criterion is covered by a passing test. Never mark something passing you haven't actually run.
6. **Write the ticket back.** Append to the **Progress log**, update **Current WIP / next action**, record any **Decisions**, list **Tests**. This is the step that survives a crash — do it as you go, not "later."

## Hand off to the pass

When the criteria are met and tests are green, summarize what changed and hand back to the Maître D' for the pass — it verifies **Done when**, a clean whole-app build, and no regressions. **You don't mark your own plate Served**; the pass does. If you run out of road before finishing, leave **Current WIP / next action** precise enough that the next chef de rang resumes in a single read.

## Resuming is the normal case

A re-run isn't an exception — it's the expected path. Read the ticket, trust **Current WIP / next action**, then verify the log against the actual code. If they disagree, the code wins — note the correction on the ticket and continue. Don't restart work the log says is already done without checking it.

## Tempo

Same toggle as the suite: "service mode" for terse, "prep" / "normal" to relax. Never skip writing the ticket back to save words — that's the one step that can't be regenerated.

## Anti-patterns

- Working from the request alone without loading the ticket.
- Cooking a vague order instead of kicking it back to the Maître D'.
- Touching shared surfaces outside the ticket without escalating.
- Cooking before the taste — writing implementation before a failing test exists. Delete it and start from the test.
- Marking tests passing without running them.
- Finishing a shift without writing progress back — the next shift loses everything.
- Marking your own plate Served — that's the pass's call.
- Gold-plating past the ticket's acceptance criteria.
