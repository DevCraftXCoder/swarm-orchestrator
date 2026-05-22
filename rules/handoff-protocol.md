# Handoff Protocol

Lightweight agent handoff convention for multi-agent workflows.

---

## Handoff Report Format

Every agent should structure its final message using this format:

```
## Handoff Report
- **STATUS**: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_HANDOFF
- **SUMMARY**: 1-2 sentences of what was accomplished
- **FILES_CHANGED**: list of files modified (or "none" for read-only tasks)
- **NEXT_AGENT**: (if NEEDS_HANDOFF) which agent should continue
- **CONTEXT_FOR_NEXT**: (if NEEDS_HANDOFF) exactly what the next agent needs to know
- **CONCERNS**: any issues discovered but not resolved
```

### Status Definitions

| Status | Meaning | Lead Action |
|--------|---------|-------------|
| `DONE` | Task complete, no issues | Accept result, move on |
| `DONE_WITH_CONCERNS` | Task complete, but something needs attention | Review concerns, decide if follow-up needed |
| `BLOCKED` | Cannot proceed -- missing info, permissions, or dependency | Resolve blocker, retry or reassign |
| `NEEDS_HANDOFF` | Work is out of scope -- another agent should continue | Spawn NEXT_AGENT with CONTEXT_FOR_NEXT |

---

## Common Handoff Patterns

### Scan then Fix
```
qa-agent -> implementation-expert

Lead prompt for fix agent:
"QA found these issues: [paste CONCERNS from QA].
Files affected: [paste FILES].
Fix them. Run typecheck after."
```

### Fix then Review
```
implementation-expert -> code-reviewer

Lead prompt for reviewer:
"Review the changes in: [paste FILES_CHANGED].
Context: [paste SUMMARY].
Check for correctness, security, and style."
```

### Research then Plan then Implement
```
research-lead -> planner -> implementation-expert

Lead prompt for planner:
"Research findings: [paste SUMMARY from research].
Design an implementation plan."

Lead prompt for implementer:
"Plan: [paste planner output].
Implement it. Follow the plan exactly."
```

### Audit then Fix
```
security-reviewer -> implementation-expert

Lead prompt for implementer:
"Audit found these issues: [paste P0/P1 findings].
Fix P0 first, then P1. Run typecheck after each fix."
```

---

## Rules

- Agents should always attempt the handoff format (DONE + SUMMARY is enough for simple tasks)
- The lead orchestrator decides whether to follow NEXT_AGENT suggestions -- they're advisory
- CONTEXT_FOR_NEXT should be self-contained -- the next agent has zero prior context
- Never chain more than 4 agents without lead review -- context degrades with each hop
- If an agent says BLOCKED, resolve the blocker before spawning another agent
