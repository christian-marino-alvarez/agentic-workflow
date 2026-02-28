---
id: workflow.subtask-execution
name: Subtask Execution
owner: architect-agent
description: "Generic subtask execution workflow with mini-cycle: plan → [optional] → implement → validate → report → gate."
version: 2.0.0
trigger: ["subtask-execution"]
type: dynamic
objective: "Execute a single subtask following its individual plan, with optional workflow invocation and developer gate."
context:
  - .agent/artifacts/<TASK>/architect/<subtaskId>-<subtaskName>.md
  - .agent/rules/constitution/architecture.md
  - .agent/rules/constitution/clean-code.md
input:
  - .agent/artifacts/<TASK>/architect/<subtaskId>-<subtaskName>.md
output:
  - .agent/artifacts/<TASK>/<agent>/<subtaskId>-<subtaskName>-v1.md
---

# WORKFLOW: subtask-execution

> [!IMPORTANT]
> **This is the unified subtask execution workflow.** It is invoked by `architect-agent` during Phase 4 for ALL subtask types. The subtask plan contains domain-specific constitutions, constraints, and validation checklists.

## Input
- Subtask plan: `.agent/artifacts/<TASK>/architect/<subtaskId>-<subtaskName>.md`
- Agent task file (created by architect): `.agent/artifacts/<TASK>/<agent>/<subtaskId>-<subtaskName>-v1.md`

## Output
- Completed agent task file with Implementation Report

## Objective
Execute a single subtask following its individual plan. The workflow provides a generic mini-cycle that any agent can follow, regardless of the subtask's domain.

## Instructions

### 0. Orchestration entry (architect-agent)
- The `architect-agent` reads the subtask plan from `<TASK>/architect/`.
- Creates the agent task file using `templates.agent_task` at `<TASK>/<agent>/<subtaskId>-<subtaskName>-v1.md`.
- Populates the Input section with objective, scope, and dependencies from the subtask plan.
- Assigns the agent designated in the subtask plan.
- **Optionally invokes optional workflows** (research, qa, performance) as specified in the subtask plan BEFORE delegating to the agent.

### 1. Activate role
- The assigned agent activates its role and uses its mandatory prefix.

### 2. Verify inputs
- Agent task file exists with Input section completed by architect.
- Subtask plan is accessible for reference.
- Relevant constitutions loaded (as specified in subtask plan).
- If missing → FAIL.

### 3. Analyze the subtask
- Read the agent task Input and the subtask plan.
- Complete the "Reasoning" section of the agent task:
  - Analyze objective
  - Consider options
  - Document decision and justification

### 4. Implement
- Execute the work described in the subtask plan.
- Follow the technical specifications and constraints from the plan.
- Respect all applicable constitutions.
- Follow `constitution.clean_code` principles.

### 5. Self-validate
- Verify all subtask-specific acceptance criteria (from subtask plan §4) are met:
  - [ ] AC-ST-1 met
  - [ ] AC-ST-2 met
  - [ ] AC-ST-N met
- If code changes: run `npm run compile`.
- If compilation fails → fix before proceeding.
- Verify no constitution violations.

### 6. Generate implementation report
- Complete the "Implementation Report" section of the agent task file:
  - **Changes made**: Files modified, functions added, etc.
  - **Technical decisions**: Key decisions and justification.
  - **Evidence**: Logs, compilation output, test results.
  - **Deviations**: Any deviations from the subtask plan (with justification).

### 7. Present to developer (Gate)
- Present the completed subtask with implementation report.
- Include artifact references and the gate UI element as the **single approval point** using `ui_intent`:

"ui_intent": [
  {
    "type": "artifact",
    "id": "subtask-plan-ref",
    "label": "<subtaskId>-<subtaskName>.md",
    "path": ".agent/artifacts/<TASK>/architect/<subtaskId>-<subtaskName>.md",
    "content": "Subtask plan reference"
  },
  {
    "type": "artifact",
    "id": "agent-task-ref",
    "label": "<subtaskId>-<subtaskName>-v1.md",
    "path": ".agent/artifacts/<TASK>/<agent>/<subtaskId>-<subtaskName>-v1.md",
    "content": "Implementation report"
  },
  {
    "type": "gate",
    "id": "gate-eval",
    "label": "Subtask Implementation — Review and Approve",
    "options": ["SI", "NO"]
  }
]
- **Do NOT request additional textual SI / NO approval.** The gate UI element is the only approval mechanism.
- Once the developer responds via gate, record the decision in the agent task file:
  ```yaml
  approval:
    developer:
      decision: SI | NO
      date: <ISO-8601>
      comments: <optional>
  ```
- **On revision**: If gate is rejected, create a new version (`-v2.md`). Never overwrite previous versions.

## Gate
Requirements (all mandatory):
1. All subtask-specific acceptance criteria met.
2. Implementation report is complete.
3. Code compiles without errors (if code changes involved).
4. No constitution violations.
5. Developer Gate PASS (`decision == SI`).

## Pass
- Mark agent task as `completed`.
- Update agent task file:
  ```yaml
  execution:
    status: completed
    completed_at: <ISO-8601>
  ```
- **Architect optionally invokes post-execution optional workflows** (qa, performance) if specified in subtask plan.
- Return control to `architect-agent` for next subtask in the sequence.

## Fail
- Declare workflow as NOT completed.
- Cases:
  - Missing inputs or subtask plan.
  - Acceptance criteria not met.
  - Compilation failure not resolved.
  - Constitution violation detected.
  - Gate = NO without resolution.
- Actions:
  - Identify the failure point.
  - Define corrective actions.
  - Create new version and iterate until Gate PASS.
