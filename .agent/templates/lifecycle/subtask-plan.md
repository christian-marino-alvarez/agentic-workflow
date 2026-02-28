---
artifact: subtask_plan
phase: phase-3-planning
owner: architect-agent
status: draft | approved
related_task: {{taskId}}-{{taskTitle}}
subtask_id: {{subtaskId}}
subtask_name: {{subtaskName}}
assigned_agent: {{agent}}
workflow: {{workflowId}}
---

# Subtask Plan — {{subtaskId}}-{{subtaskName}}


## 1. Subtask Overview
- **Subtask ID**: {{subtaskId}}
- **Name**: {{subtaskName}}
- **Type**: backend | background | view | integration | generic
- **Assigned Agent**: {{agent}}
- **Workflow**: {{workflowId}}
- **Dependencies**: (list of subtask IDs this depends on, or "None")

---

## 2. Objective
- **What**: Precise description of what this subtask must achieve.
- **Why**: How this subtask contributes to the overall task objective.
- **Scope boundaries**: What is explicitly included and excluded.

---

## 3. Affected Files and Modules
- **Files to create**:
  - (list)
- **Files to modify**:
  - (list with brief description of changes)
- **Files to delete** (if applicable):
  - (list)
- **Modules impacted**:
  - (module names and nature of impact)

---

## 4. Acceptance Criteria (Subtask-specific)
Conditions that must be met for this subtask to be considered complete.

- [ ] AC-ST-1: (criterion)
- [ ] AC-ST-2: (criterion)
- [ ] AC-ST-N: (criterion)

> [!IMPORTANT]
> These criteria are **specific to this subtask**, not the global task ACs.
> They must be verifiable and binary (met or not met).

---

## 5. Technical Specifications
- **Approach**: How the implementation should be done.
- **Patterns to follow**: Architectural patterns, constitutions, or conventions.
- **Constraints**: Rules that must not be violated.
- **Key decisions**: Pre-made decisions the agent must respect.

---

## 6. Optional Workflows
Workflows the architect may invoke during this subtask's execution.

```yaml
optional_workflows:
  - id: workflow.optional.research
    reason: "<why needed>"
    when: "before | during | after implementation"
  - id: workflow.optional.qa
    reason: "<why needed>"
    when: "after implementation"
  - id: workflow.optional.performance
    reason: "<why needed>"
    when: "after implementation"
```

> If no optional workflows are needed, indicate: `optional_workflows: none`

---

## 7. Expected Output
- **Deliverables**: What the subtask must produce.
- **Evidence required**: What proof of completion is needed.
- **Report format**: The agent must complete the Implementation Report in the agent-task file.

---

## 8. Estimation
- **Effort**: low | medium | high
- **Complexity**: 1-5
- **Risk level**: low | medium | high

---

## 9. Contractual Rules

1. This subtask plan is **created by the architect** and **cannot be modified** by the assigned agent.
2. The assigned agent **MUST** follow the workflow specified in the frontmatter.
3. Each subtask has its own **gate** — the developer must approve before the next subtask begins.
4. If the gate fails, the architect defines corrective actions.
5. Optional workflows are invoked at the architect's discretion during execution.
