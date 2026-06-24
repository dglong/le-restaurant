# Le Restaurant — Service Board
**Plan:** ../plan/Home.md

## Course order
1. [[order-01-walking-skeleton]] — Walking skeleton: scaffold + registry + Claude passthrough
2. [[order-02-translation-layer]] — Codex & Gemini adapters + conflict policy (depends on 01)
3. [[order-03-interactive-ux]] — Wizard, non-interactive flags, post-install summary (depends on 02)
4. [[order-04-front-door-ship]] — README, skill-sync check, npm publish CI (depends on 03)

| # | Feature | Status | Depends on |
|---|---------|--------|------------|
| 01 | Walking skeleton | Served | — |
| 02 | Translation layer (Codex + Gemini) | Served | 01 |
| 03 | Interactive UX | Served | 02 |
| 04 | Front door & ship | Served | 03 |

Status flow: To fire → Firing → At the pass → Served   ( 86'd = dropped )

## Shared surfaces (Maître D'-held)
- **Core types** (`src/types.ts`) — `Skill`, `Agent`, `InstallContext`, `FileOutput`. Created in 01.
- **`Adapter` interface** (`src/adapters/types.ts`) — **pulled forward into 01** so the passthrough adapter and all later adapters implement one stable contract. (ADR logged in plan.)
- **Writer** (`src/writer.ts`) — created in 01 (passthrough), extended in 02 (conflict policy/atomic writes). Owned here; 02 extends, doesn't rewrite.
- **CLI entry** (`src/cli.ts`) — created in 01, extended in 02/03. Owned here.
