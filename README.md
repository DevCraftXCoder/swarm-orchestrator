# swarm-orchestrator

A meta-orchestration agent for [Claude Code](https://claude.ai/code) that automatically routes any task to the right agent(s), determines execution topology, and synthesizes a unified result.

## What it does

Given any task, the orchestrator:

1. **Reads the task** and identifies what domains are involved
2. **Selects the minimum effective set of agents** from the workspace roster
3. **Determines execution topology** — single agent, parallel fan-out, sequential chain, or fan-out-fan-in
4. **Spawns the swarm**, monitors handoff reports, and resolves failures
5. **Returns one unified result** — not a pile of individual agent outputs

## Why

Large tasks often need multiple specialists working together — a backend expert, a QA loop, a deployment verifier. Without orchestration, you'd have to manually chain those agents and interpret each handoff yourself. The swarm-orchestrator does that routing automatically.

## Usage

Invoke as a Claude Code agent from any task where the right specialist isn't obvious or the work spans multiple domains.

```
/swarm <describe your task>
```

## Part of the Frxncois stack

Built for the [Frxncois](https://frxncois.com) workspace — an edge-native music platform and tooling ecosystem built on Cloudflare Workers, Next.js 15, and Claude Code multi-agent workflows.

---

Built by [DevCraftXCoder](https://github.com/DevCraftXCoder)
