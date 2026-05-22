---
description: Meta-orchestrator — analyzes a task, picks optimal agent(s), dispatches the swarm, collects handoffs, delivers a unified result.
argument-hint: <task description>
---

# /swarm -- Meta-Orchestrator

Dispatches the `swarm-orchestrator` agent. The orchestrator owns agent selection, parallelization vs chaining, swarm sizing, handoff collection, and quality gate.

Use this when:
- The right agent(s) aren't obvious
- The task spans multiple domains
- A full audit or full-stack feature requires fan-out / chain coordination
- You want one entry point and a unified report instead of picking agents yourself

Do NOT use this when:
- You already know the exact agent -- spawn it directly
- The task is a single-file fix in a single domain
- Another orchestrator is already active

## Usage

```
/swarm                                    # prompts for a task
/swarm fix the login redirect bug         # P1 bug -- single or chain
/swarm add user avatars to the feed       # P2 feature -- chain
/swarm full security audit before launch  # P3 audit -- fan-out
```

## Implementation

Based on `$ARGUMENTS`:

- **If empty**: ask the user to describe the task before dispatching. Do not spawn the agent with an empty prompt.
- **Otherwise**: spawn the `swarm-orchestrator` agent via the Agent tool with `subagent_type: swarm-orchestrator` and pass `$ARGUMENTS` as the dispatch task.

### Spawn prompt template

```
Task: $ARGUMENTS

Run your full Execution Protocol:
1. Pre-flight (git status, recent commits)
2. Analyze -- route by file path, classify by keywords, set priority (P0/P1/P2/P3)
3. Announce -- output the Dispatch Plan (priority, topology, agents, file ownership)
4. Dispatch -- SINGLE / PARALLEL / CHAIN / FAN-OUT per the decision engine
5. Collect & synthesize handoffs
6. Quality gate -- run the appropriate typecheck / lint / build for changed files
7. Deploy -- run deploy commands for changed services (if applicable)
8. Final handoff -- STATUS, SUMMARY, FILES_CHANGED, DEPLOY_STATUS, CONCERNS

Foreground only. No background agents. Hard cap: 6 agents per swarm.
```

### Hard rules

- Always run the orchestrator **foreground** -- never `run_in_background: true`
- Never bypass the quality gate
- Never spawn more than 6 agents in a single swarm
- If `$ARGUMENTS` names a specific agent ("use frontend-expert to..."), bypass the orchestrator and spawn that agent directly

## Related

- Agent definition: `agents/swarm-orchestrator.md`
- Handoff format: `rules/handoff-protocol.md`
