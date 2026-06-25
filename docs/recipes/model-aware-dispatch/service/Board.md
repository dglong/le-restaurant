# Model-Aware Dispatch & Skill Versioning — Service Board
**Plan:** ../plan/Home.md

## Course order (sequential — one at a time)
1. [[order-01-shared-foundations]] — Phase 0: `Skill.version`, skill frontmatter, ticket-template fields, sync green
2. [[order-02-version-stamping-manifest]] — A1: stamp version + write `.le-restaurant.json` manifest (depends 01)
3. [[order-03-check-local-drift]] — A2: `le-restaurant check` vs bundled package (depends 02)
4. [[order-04-check-npm-freshness]] — A3: add npm-registry freshness to `check` (depends 03)
5. [[order-05-portable-dispatch-layer]] — B1: mise-en-place tags + maître-d copy/HITL pause, all agents (depends 01)
6. [[order-06-claude-model-selection]] — B2: Claude agent-def emission + maître-d model pick/escalation (depends 05)
7. [[order-07-cross-agent-degradation]] — B3: Codex/Gemini no-op notice + installer summary (depends 06)

| # | Feature | Status | Depends on |
|---|---------|--------|------------|
| 01 | Shared foundations (Phase 0) | Served | — |
| 02 | Version stamping & manifest (A1) | Served | 01 |
| 03 | `check` — local drift (A2) | Served | 02 |
| 04 | `check` — npm freshness (A3) | Served | 03 |
| 05 | Portable dispatch layer (B1) | Served | 01 |
| 06 | Claude model selection (B2) | Served | 05 |
| 07 | Cross-agent degradation (B3) | Served | 06 |

Status flow: To fire → Firing → At the pass → Served   ( 86'd = dropped )

## Shared surfaces the Maître D' holds
- **`src/types.ts` — `Skill.version`** — established in order 01; every later ticket consumes it. No one else redefines it.
- **`.le-restaurant.json` manifest shape** — schema pinned in order 02 (see its Decisions); orders 03/04 read it as given.
- **Adapter files touched by two tracks** — `codex.ts`/`gemini.ts` edited by **02** (version stamp) then **07** (no-op notice); `claude.ts` changes strategy in **06** (passthrough → also emit an agent definition). Later ticket builds on the earlier state; never re-resolve.
- **`.claude/skills/ ↔ skills/` sync** — cross-cutting rule for every skill-markdown ticket (01, 05, 06): edit canonical `.claude/skills/`, mirror to vendored `skills/`, and `npm run check:sync` must be green before the plate passes.
