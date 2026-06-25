# Model-Aware Dispatch

**The dish in one line:** Let the brigade run the cheap model by default and spend the expensive one only where the work earns it — Sonnet cooks, Opus inspects and handles the hard tickets, with a human gate on the risky ones.

## Problem
- Every skill currently runs on whatever model the session is set to. When that's Opus, *implementation* (chef-de-rang) — the highest-volume, most token-hungry stage — runs on the priciest model even for clearly-scoped, low-risk tickets.
- The orchestration/thinking stages (sous-chef, mise-en-place, maître-d) genuinely benefit from Opus, but the line cook usually doesn't. There's no way today to spend differentially.

## Users & context
- Primarily **me** — running the kitchen brigade on my own projects and watching the Opus bill on long implementation runs.
- Anyone who installs le-restaurant and runs the full brigade on a capable-but-costly default model.

## Solution
- **Difficulty is authored by mise-en-place, enforced by the Maître D'.** Two skills own two halves of one job:
  - **mise-en-place** stamps each phase/feature in the plan (`Phases.md` / `Development-Plan.md`) with a difficulty/risk tag and an optional **HITL** flag — it's the only stage reasoning about intrinsic complexity before tickets exist.
  - **Maître D'** copies that tag onto each order ticket at seating (like it already copies `Done when` / `Touches`), then acts on it at fire-time: picks the model or pauses for a human. It also escalates on **live signal** mise-en-place couldn't know — a plate that bounced once at the pass goes Sonnet→Opus on retry.
- **chef-de-rang** is dispatched as a **subagent** (not inline), so the Maître D' can pin its model per fire. Default Sonnet; override to Opus for hard/edge-case tickets. Its existing "ticket is my whole memory" design makes it a natural fit for an isolated subagent context.
- **Three-tier ladder:**
  | Tier | Authored | Enforced | Action |
  |---|---|---|---|
  | Tidy, well-scoped | mise-en-place tag | Maître D' fire | Sonnet, autonomous |
  | Hard / edge-case but defined | mise-en-place tag | Maître D' fire | Opus, autonomous |
  | Ambiguous / consequential | mise-en-place flag | Maître D' pauses | **HITL** — ask before firing |
- **HITL has two entry points:** *planned* (mise-en-place flag → Maître D' pause) and *reactive* (chef-de-rang hits a wall mid-cook → escalates via the ticket's existing **Blockers / escalations**).

## Inspiration
- Cost. Opus on every implementation course is expensive when most courses don't need it. The craving is "spend the expensive model only where judgment matters."

## Constraints
- Canonical skills live in `le-restaurant/skills/`; `.claude/skills/` is a synced copy guarded by `scripts/check-skills-sync.ts` — edits must keep the two in sync.
- No `model:` frontmatter exists anywhere today — clean slate, but also nothing to build on.
- **Inline skills inherit the session model** and cannot be downgraded per-skill — so the design depends on chef-de-rang being dispatched as a *subagent*, not invoked inline. Manual `/chef-de-rang` will still run the session model; the cost win only applies on Maître-D-orchestrated builds.
- The installer (`src/adapters`) translates skills into Claude Code / Codex / Gemini native formats. Per-subagent model selection must either translate to each target agent's mechanism or degrade gracefully where an agent can't express it.

## Key assumptions
- The target agents (at least Claude Code) support a per-subagent model override at dispatch time (Claude Code: agent-definition `model:` frontmatter and/or a per-call model param).
- Sonnet is good enough for clearly-scoped, test-first ticket implementation, with the Opus pass as the backstop for quality.
- mise-en-place can make a useful difficulty/risk call at plan time from the same signals it already reasons about (architecture, dependencies, scope).

## Risks & open questions
- **Cross-agent translation:** do Codex / Gemini installs have any notion of per-subagent model? If not, what's the graceful degradation — ignore the tag, or document it as Claude-Code-only?
- **Difficulty is a planning-time guess.** The Maître D's live signals (pass bounces, reactive escalations) are the safety net when mise-en-place guessed wrong — is that enough, or does the tag need a feedback loop back into the plan?
- **Inline vs subagent dispatch:** does the Maître D' today fire chef-de-rang inline or as a subagent? If inline, that's the core change and it alters how the ticket/plan context is handed over.
- What exactly does the difficulty/HITL tag look like on the page, and how does the Maître D' read it deterministically (not "vibes")?

## Riskiest assumption to test next
- That chef-de-rang can be dispatched as a Sonnet subagent by the Maître D' *and still get everything it needs from the ticket alone*. Cheap taste: wire one ticket to fire chef-de-rang as a `model: sonnet` subagent on a real small feature and see if the plate passes.

## Verdict
- **Cook it.** Clear cost win, the ownership split is clean, and it leans on machinery the skills already have (ticket copy-down, escalations, the pass). Main unknown is cross-agent translation, not core feasibility.

## Next steps
1. Hand to **mise-en-place** to scope the change across all three skills + the installer adapters.
2. Pin down the on-page tag format and the Maître D's deterministic read rule.
3. Resolve the cross-agent translation question (Claude-Code-first, degrade elsewhere?).
