---
artifact: agent_task
phase: phase-4-implementation
owner: {{agent}}
status: pending | in-progress | completed | failed
related_task: {{taskId}}-{{taskTitle}}
task_number: {{N}}
---

# Agent Task — {{N}}-{{agent}}-{{taskName}}

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## Input (REQUIRED)
- **Objective**: {{objective}}
- **Scope**: {{scope}}
- **Dependencies**: {{dependencies}}

---

## Reasoning (MANDATORY)

> [!IMPORTANT]
> The agent **MUST** complete this section BEFORE executing.
> Documenting the reasoning improves quality and allows early error detection.

### Objective analysis
- What is being asked exactly?
- Are there ambiguities or dependencies?

### Options considered
- **Option A**: (description)
- **Option B**: (description)
- *(add more if applicable)*

### Decision made
- Chosen option: (A/B/...)
- Justification: (why this option)

---

## Output (REQUIRED)
- **Deliverables**:
  - {{deliverables}}
- **Required evidence**:
  - {{evidence}}

---

## Execution

```yaml
execution:
  agent: "{{agent}}"
  status: pending | in-progress | completed | failed
  started_at: null
  completed_at: null
```

---

## Implementation Report

> This section is completed by the assigned agent during execution.

### Changes made
- (Modified files, added functions, etc.)

### Technical decisions
- (Key decisions and justification)

### Evidence
- (Logs, screenshots, tests executed)

### Deviations from objective
- (If any, justification)

---

## Gate (REQUIRED)

The developer **MUST** approve this task before the architect assigns the next one.

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <optional>
```

---

## Contractual Rules

1. This task **CANNOT be marked as completed** without Gate PASS (`decision: SI`).
2. If Gate FAIL (`decision: NO`):
   - The architect defines corrective actions.
   - A new correction task is generated if applicable.
3. The assigned agent **CANNOT modify** the Input or Output defined by the architect.
4. The Gate is **synchronous and blocking**: the flow stops until a developer response is obtained.
