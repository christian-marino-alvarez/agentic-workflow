---
id: workflow.tasklifecycle.04-implementation
name: Implementation
description: "Phase 4: Execute implementation through subtask delegation via subtask-execution workflow."
owner: architect-agent
trigger: ["phase-04", "implementation"]
type: static
objective: "Execute all planned subtasks by delegating each to the subtask-execution workflow and validating each result."
context:
  - .agent/artifacts/<TASK>/architect/planning-v1.md
  - .agent/rules/constitution/architecture.md
  - .agent/rules/constitution/clean-code.md
input:
  - .agent/artifacts/<TASK>/architect/planning-v1.md
output:
  - Implemented code changes per subtask plans
---

# WORKFLOW: tasklifecycle.04-implementation

## Input
- Approved plan: `.agent/artifacts/<TASK>/architect/planning-v1.md`
- Subtask plans: `.agent/artifacts/<TASK>/architect/ST-N-<name>.md`

## Output
- Agent task files: `.agent/artifacts/<TASK>/<agent>/ST-N-<name>-v1.md`
- Implemented code changes as defined in each subtask plan.

## Objective
Execute all planned subtasks by delegating each to the `subtask-execution` workflow. The architect orchestrates the execution order, manages per-subtask developer gates, invokes optional workflows as specified, and ensures build integrity between subtasks.

## Instructions
1. **Activate architect-agent** (the UI handles identification — do NOT prefix responses).
2. **Update task.md**: Set `current_phase` to `phase-4-implementation`.
3. **Load subtask plans**: Read all subtask plans (`ST-N-*.md`) from `<TASK>/architect/`. Determine execution order from dependencies.
4. **Execute subtasks sequentially**: For each subtask in order:
   a. **Pre-execution optional workflows**: If the subtask plan specifies optional workflows with `when: "before"` (e.g., research), invoke them first. Output goes to the respective agent's domain folder.
   b. **Dispatch to `workflow.subtask-execution`**: All subtask types use the same workflow. The subtask plan contains the specific constitutions, constraints, and validation checklists for the agent to follow. Agent task output goes to `<TASK>/<agent>/ST-N-<name>-v1.md`.
   c. **Per-subtask gate**: Each subtask execution includes its own developer gate. The architect does NOT advance to the next subtask until the current one has Gate PASS.
   d. **Post-execution optional workflows**: If the subtask plan specifies optional workflows with `when: "after"` (e.g., qa, performance), invoke them after gate pass.
   e. **Validate build**: Run `npm run compile` after each subtask to ensure no regressions.
   f. **Update task.md**: Set subtask status to `completed` after Gate PASS.
5. **Present Implementation Summary**: After all subtasks have individual Gate PASS, present a completion summary using `ui_intent`:

"ui_intent": [
  {
    "type": "artifact",
    "id": "planning-ref",
    "label": "planning-v1.md",
    "path": ".agent/artifacts/<TASK>/architect/planning-v1.md",
    "content": "Original plan reference"
  },
  {
    "type": "gate",
    "id": "gate-eval",
    "label": "Implementation Complete — Confirm and Advance",
    "options": ["SI", "NO"]
  }
]

> [!IMPORTANT]
> **No double review**: Each subtask was already individually reviewed and approved by the developer.
> This final gate is a **completion confirmation**, not a re-review. It summarizes all results and confirms readiness to advance to Phase 5.
> The developer should NOT need to re-review individual subtask implementations here.

## Gate
1. All subtasks executed and validated (each with individual Gate PASS).
2. Build succeeds with no errors.
3. Developer has confirmed the implementation summary.

## Pass
- Update `task.md`: set `phase-4-implementation` status to `completed`, `current_phase` to `phase-5-review`.
- Advance to review phase.

## Fail
- Subtask failed or build errors detected.
- Address issues and re-present.