# Scope · Status: Draft

## Goal & success criteria
Two independent subsystems, bundled for shared surfaces:

- **Model-Aware Dispatch** — *Success:* on a Claude-Code build, the Maître D' fires tidy tickets to a Sonnet chef-de-rang and hard/edge-case tickets to Opus, pauses for a human on HITL-flagged tickets, and escalates a bounced plate Sonnet→Opus — all driven by a difficulty tag the plan author wrote. On Codex/Gemini the HITL gate still works; the model switch is a documented no-op.
- **Skill Versioning & Staleness** — *Success:* every skill carries a per-skill semver; after install a project has a manifest of what it got, and `le-restaurant check` reports per skill whether it's up-to-date, stale vs the installed package (local drift), or behind the newest npm release — degrading to local-only when offline.

## In scope (MVP)

### Model-Aware Dispatch
- `mise-en-place` authors a `Difficulty: tidy|hard` and `HITL: yes|no` tag per phase/feature, with a deterministic rubric.
- `maître-d` copies the tag onto each ticket at seating; at fire-time selects the model (Claude only), pauses for HITL (all agents), and escalates Sonnet→Opus on a pass-bounce.
- `chef-de-rang` is dispatched as a Sonnet-default subagent; manual invocation still uses the session model (documented).
- Claude adapter additionally emits `.claude/agents/chef-de-rang.md` (default `model: sonnet`) generated from the skill body.
- Codex/Gemini adapters document model-selection as a no-op, keep the HITL guidance.

### Skill Versioning
- `version: x.y.z` in every skill's frontmatter (per-skill semver).
- Parse version into the `Skill` model; adapters stamp it into emitted output.
- Write a uniform install **manifest** (`.le-restaurant.json`) in the target recording per-skill installed versions + package version.
- New `le-restaurant check` CLI command: reports per-skill `up-to-date | stale (local) | update available (npm)`; offline → local-only with a notice.

### Shared
- All edits land in canonical `skills/`, re-synced to `.claude/skills/` so `check-skills-sync.ts` stays green.
- Tests for tag parsing, version parsing, manifest write/read, adapter stamping, the check command, and the Claude agent-definition emission.

## Out of scope / non-goals
- Per-subagent model selection on Codex/Gemini (not expressible in those formats).
- Auto-update / auto-reinstall of stale skills — `check` reports, never mutates.
- Version ranges or pinning; any version UI beyond the CLI report.
- A feedback loop that rewrites the plan's difficulty tag from runtime results.
- Model selection for sous-chef / mise-en-place / maître-d themselves (they run inline by design).
- Parallel brigade service (already out of scope upstream).

## Users & primary flows
- **Primarily me**, running the brigade on my own projects and installing the skills across agents.
- *Flow A (dispatch):* plan a build → mise-en-place tags difficulty → run maître-d → it fires cheap/expensive/HITL per ticket.
- *Flow B (versioning):* `npx le-restaurant` installs skills + writes manifest → later `le-restaurant check` says what's stale.

## Constraints & assumptions
- Brigade is **prompt-orchestrated** — no runtime dispatcher; skill behavior is instructions the host model follows, translated per agent by the installer.
- Only Claude Code exposes subagents + a per-dispatch model override; Codex (one always-on `AGENTS.md`) and Gemini (always-on modular imports) cannot express it.
- The npm-registry lookup is the only new network touch; it must degrade gracefully offline.
- No sensitive data / auth / payments; no new hosting, CI, or infra.

← [Home](./Home.md)
