# Swarm Orchestrator for Claude Code

A meta-orchestrator agent for [Claude Code](https://claude.ai/code) that analyzes tasks, selects optimal agent(s) from your roster, determines execution topology, dispatches the swarm, and delivers a unified result.

## What It Does

Instead of manually picking which agent to run, `/swarm <task>` figures it out for you:

1. **Routes** — matches file paths and keywords to the right agent(s)
2. **Prioritizes** — classifies urgency (P0 incident → P3 polish)
3. **Topologies** — picks SINGLE / PARALLEL / CHAIN / FAN-OUT based on task shape
4. **Dispatches** — spawns agents with focused, scoped prompts
5. **Collects** — gathers handoff reports, resolves failures
6. **Quality gates** — runs typecheck/lint/build before reporting done
7. **Deploys** — triggers the right deploy commands per changed service

## Installation

### 1. Copy the agent definition

```bash
cp agents/swarm-orchestrator.md .claude/agents/swarm-orchestrator.md
```

### 2. Copy the slash command

```bash
cp commands/swarm.md .claude/commands/swarm.md
```

### 3. (Optional) Copy the handoff protocol

```bash
cp rules/handoff-protocol.md .claude/rules/handoff-protocol.md
```

### 4. Customize

Edit `swarm-orchestrator.md` to:
- Replace the **Agent Roster** tables with your own agents
- Replace the **File Path Routing** table with your repo's directory structure
- Replace the **Quality Gate** and **Deploy** commands with your project's build/deploy steps
- Remove or replace MCP memory references if you don't use a memory server

## Usage

```
/swarm                                    # prompts for a task
/swarm fix the login redirect bug         # P1 bug — single agent
/swarm add user avatars to the feed       # P2 feature — chain
/swarm full security audit before launch  # P3 audit — fan-out
```

## How It Works

### Execution Topology

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

### Model Inheritance

The agent has no `model:` in its frontmatter, so it inherits whatever model your Claude Code session is running — Haiku, Sonnet, or Opus. Your spawned sub-agents also inherit unless their own frontmatter specifies a model.

## File Structure

```
├── agents/
│   └── swarm-orchestrator.md    # Agent definition (the brain)
├── commands/
│   └── swarm.md                 # Slash command (the entry point)
├── rules/
│   └── handoff-protocol.md      # Handoff report format for agent chains
└── README.md
```

## Customization Guide

### Adding Your Own Agents

In `swarm-orchestrator.md`, replace the Agent Roster tables with your agents:

```markdown
### Your Domain
| Agent | Domain | Model |
|-------|--------|-------|
| `your-agent-name` | What it does | Sonnet |
```

### Adding File Path Routes

Replace the routing table with your project structure:

```markdown
| Path Pattern | Agent |
|-------------|-------|
| `src/frontend/` | `frontend-agent` |
| `src/api/` | `backend-agent` |
| `infrastructure/` | `ops-agent` |
```

### Adding Deploy Steps

Replace the deploy phase with your project's commands:

```markdown
| Files Changed | Deploy Command |
|--------------|----------------|
| `src/api/` | `npm run deploy:api` |
| `src/frontend/` | `npm run deploy:frontend` |
```

## Constraints

- Max 6 agents per swarm (prevents context exhaustion)
- Always foreground — background agents can stall on permission gates
- Chain topology uses fail-fast — stops on first BLOCKED status
- Parallel agents must have non-overlapping file ownership

## Requirements

- [Claude Code](https://claude.ai/code) CLI, desktop app, or IDE extension
- At least one custom agent defined in `.claude/agents/`

## License

MIT
