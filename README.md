# Swarm Orchestrator

A meta-orchestration pattern for AI coding agents. Analyzes tasks, selects optimal agent(s), determines execution topology, dispatches the swarm, and delivers a unified result.

Works with any AI coding agent that supports multi-agent dispatch.

## The Problem

You have multiple specialized agents (backend, frontend, QA, security, ops). For every task, you manually decide:
- Which agent(s) to use
- Whether to run them in parallel or sequence
- How to pass context between them
- When to stop and report

**Swarm Orchestrator automates all of that.** Give it a task, it figures out the rest.

## How It Works

```
You: "add user avatars to the feed"

Swarm Orchestrator:
  1. Analyzes → backend + frontend change (P2 feature)
  2. Routes  → backend-expert + frontend-expert
  3. Topology → CHAIN (API first, then UI)
  4. Dispatches → backend-expert builds route
  5. Collects  → handoff report, feeds to frontend-expert
  6. Quality   → runs typecheck/lint/build
  7. Reports   → unified result with all files changed
```

## Core Concepts

### Execution Topologies

| Topology | When | Example |
|----------|------|---------|
| **SINGLE** | One domain, simple fix | "fix typo in header" |
| **PARALLEL** | Multiple domains, independent work | "polish CSS + optimize DB queries" |
| **CHAIN** | Multiple domains, dependent work | "add API route → build UI → QA" |
| **FAN-OUT** | Audit/review across many files | "security audit all routes" |

### Priority Routing

| Priority | Signal | Behavior |
|----------|--------|----------|
| P0 — Incident | "down", "broken in prod" | Single agent, immediate, no planning |
| P1 — Bug | "bug", "error", "fix" | Single or chain, skip planning |
| P2 — Feature | "add", "build", "new" | Chain or parallel, plan if complex |
| P3 — Polish | "polish", "audit", "clean up" | Parallel swarm or fan-out |

### Decision Engine (3-step routing)

1. **File path routing** — strongest signal. Map repo directories to agents.
2. **Keyword classification** — fallback when no paths mentioned.
3. **Priority override** — urgency changes topology (P0 = single agent, no planning).

### Handoff Protocol

Every agent produces a structured handoff:

```
STATUS: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_HANDOFF
SUMMARY: what was accomplished
FILES_CHANGED: list of modified files
CONCERNS: issues found but not resolved
```

This lets the orchestrator chain agents reliably — each one gets exactly the context it needs from the previous.

## Files

```
├── agents/
│   └── swarm-orchestrator.md    # The orchestrator brain (routing, topology, dispatch)
├── commands/
│   └── swarm.md                 # Entry point / slash command
├── rules/
│   └── handoff-protocol.md      # Agent handoff format spec
└── README.md
```

## Setup

Copy into your agent's config directory:

```bash
cp agents/swarm-orchestrator.md <your-agents-dir>/
cp commands/swarm.md <your-commands-dir>/
cp rules/handoff-protocol.md <your-rules-dir>/
```

The files are framework-agnostic markdown. Any AI coding agent that can read instructions, spawn sub-agents, and collect results can use this pattern. Parse them into your orchestration layer however your tool expects.

## Customization

### 1. Replace the Agent Roster

Edit `swarm-orchestrator.md` and swap the example agents with yours:

```markdown
| Agent | Domain | Model |
|-------|--------|-------|
| `your-backend-agent` | API routes, database | default |
| `your-frontend-agent` | UI components | default |
| `your-qa-agent` | Tests, lint, build | default |
```

### 2. Replace File Path Routes

Map your repo structure to agents:

```markdown
| Path Pattern | Agent |
|-------------|-------|
| `src/api/` | `your-backend-agent` |
| `src/frontend/` | `your-frontend-agent` |
| `infra/` | `your-ops-agent` |
```

### 3. Replace Quality Gate Commands

```markdown
| Files Changed | Verification Command |
|--------------|---------------------|
| `src/api/` | `npm run typecheck && npm test` |
| `src/frontend/` | `npm run build` |
```

### 4. Replace Deploy Commands (optional)

```markdown
| Files Changed | Deploy Command |
|--------------|----------------|
| `src/api/` | `npm run deploy:api` |
```

## Constraints

- **Max 6 agents** per swarm (prevents context exhaustion)
- **Always foreground** — background agents can stall on permission gates
- **Fail-fast chains** — stops on first BLOCKED status
- **No file overlap** in parallel — if two agents need the same file, downgrade to CHAIN

## Common Patterns

### Bug Fix
```
SINGLE: backend-expert → fix → quality gate
```

### Full-Stack Feature
```
CHAIN: backend-expert → frontend-expert → qa-agent → reviewer
```

### Security Audit
```
FAN-OUT: security-reviewer + dependency-auditor + qa-agent → synthesize
```

### Production Incident
```
SINGLE: ops-expert → diagnose + fix (no planning, no report)
```

## Design Principles

- **File paths over keywords** — directory structure is the most reliable routing signal
- **Fail-fast over retry** — stop chains early rather than compounding errors
- **Scoped prompts** — each agent gets < 200 words, focused on its piece
- **Quality gates are mandatory** — never skip typecheck/lint/build
- **Model inheritance** — agents run on whatever model the session uses unless overridden

## License

MIT
