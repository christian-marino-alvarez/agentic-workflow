---
id: workflow.tasklifecycle.phase-4-implementation
description: Task cycle Phase 4. Executes implementation through granular task delegation to agents with developer approval Gate for each task. Only proceeds if all tasks are approved.
owner: architect-agent
version: 3.1.0
severity: PERMANENT
trigger:
  commands: ["phase4", "phase-4", "implementation", "implement"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-4-implementation

## Input (REQUIRED)
- Approved implementation plan exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`
- Current task exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- `task.md` **MUST** reflect:
  - `task.phase.current == aliases.taskcycle-long.phases.phase_4.id`

> [!IMPORTANT]
> **Active Constitution (MANDATORY)**:
> - Load `constitution.project_architecture` before starting
> - Load `constitution.agents_behavior` (Section 7: Gates, Section 8: Constitution)

## Output (REQUIRED)
- For **each agent task**:
  - `.agent/artifacts/<taskId>-<taskTitle>/agent-tasks/<N>-<agent>-<taskName>.md`
- Architect review report:
  - `.agent/artifacts/<taskId>-<taskTitle>/architect/review.md`
- Status update in:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objective (ONLY)
- Execute **all implementation tasks** defined in the approved plan through **granular delegation**.
- Each task requires **explicit developer approval** (YES).

---

## Reasoning (MANDATORY)
- Before executing, the responsible agent must explain to the developer what will be done and why.
- No document is required for this step.

## Mandatory Steps

0. **Role Activation and Prefix (MANDATORY)**
   - The `architect-agent` **MUST** begin its intervention by identifying itself.
   - Message: `🏛️ **architect-agent**: Starting Phase 4 - Implementation.`

1. Verify inputs
   - Approved `plan.md` exists.
   - `task.phase.current == aliases.taskcycle-long.phases.phase_4.id`.

2. Extract tasks from plan
   - Read `plan.md`.
   - Create directory: `.agent/artifacts/<taskId>-<taskTitle>/agent-tasks/`

3. Delegation Loop (SYNCHRONOUS - AHRP Protocol)
   For each task `N`:
   3.1 **Preparation**: Create task file using `templates.agent_task`. Initial status is `blocked`.
   3.2 **Assignment**: The `architect-agent` presents the task.
   3.3 **Gate A (Activation)**: The assigned agent must wait for the developer to sign with `decision: YES` in the activation block.
       - **FORBIDDEN**: The agent cannot use tools until Gate A PASS.
   3.4 **Gate B (Reasoning)**: Once activated, the agent must present its `Reasoning`.
       - The developer must sign the reasoning with `decision: YES`.
       - **FORBIDDEN**: The agent cannot modify code until Gate B PASS.
   3.5 **Execution**: The agent develops the task following the approved plan.
   3.6 **Gate C (Results)**: The developer validates the final result with `decision: YES`.
   3.7 **Closure**: If all gates are PASS, mark as `completed` and update `task.md`.

4. Implementation Consolidation
   - Verify that all tasks have complied with the AHRP protocol (A, B, and C).

5. Create Architectural Review Report (MANDATORY)
   - Create: `.agent/artifacts/<taskId>-<taskTitle>/architect/review.md` (using `templates.review`).

6. Final Developer Gate (MANDATORY, via console)
   - Global confirmation with **YES**.
   - Record in `architect/review.md`: `decision: YES`.

7. PASS
   - Update `.agent/artifacts/<taskId>-<taskTitle>/task.md` (using prefix):
     - Mark Phase 4 as completed
     - Set `task.lifecycle.phases.phase-4-implementation.validated_at = <ISO-8601>`
     - Update `task.phase.updated_at = <ISO-8601>`
     - Advance to Phase 5.

## Pass
- All required artifacts are created from templates.
- Developer approval is recorded where required.

## Gate (REQUIRED)
Requirements (all mandatory):
1. All tasks have Gate PASS (`approval.developer.decision == YES`).
2. `architect/review.md` exists with final Gate PASS (YES).
3. `task.md` reflects timestamps and state:
   - `task.phase.current == aliases.taskcycle-long.phases.phase_5.id`
   - `task.lifecycle.phases.phase-4-implementation.completed == true`
   - `task.lifecycle.phases.phase-4-implementation.validated_at` not null
   - `task.phase.updated_at` not null

If Gate FAIL:
- Execute **FAIL**.
