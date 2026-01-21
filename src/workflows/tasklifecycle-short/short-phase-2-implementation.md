---
id: workflow.tasklifecycle-short.short-phase-2-implementation
description: Phase 2 of the Short cycle. Executes implementation according to the approved brief.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["short-phase-2", "implementation"]
blocking: true
---

# WORKFLOW: tasklifecycle-short.short-phase-2-implementation

## Input (REQUIRED)
- Approved `brief.md` exists.
- Current task exists.
- `task.phase.current == aliases.taskcycle-short.phases.short_phase_2.id`.

## Output (REQUIRED)
- Implementation report:
  - `.agent/artifacts/<taskId>-<taskTitle>/architect/implementation.md` (use `templates.subtask_implementation`).

## Reasoning (MANDATORY)
- Before executing, the architect-agent must explain to the developer what will be done and why.
- No document is required for this step.

## Mandatory Steps

0. **Role Activation and Prefix (MANDATORY)**
   - The `architect-agent` **MUST** begin its intervention by identifying itself.
   - Message: `🏛️ **architect-agent**: Starting Phase 2 Short - Implementation.`

1. Pre-Flight Validation Protocol (MANDATORY)
   - Physically read `brief.md`.
   - **Explicitly cite** approval: `decision: YES`.

2. Execute implementation according to `brief.md`.
   - **Gate A (Activation)**: The agent must wait to be activated by the developer.
   - **Gate B (Reasoning)**: The agent must present its reasoning before execution.
   - **FORBIDDEN**: Do not use tools without passing Gates.

3. Architectural Review (MANDATORY)
   - The `architect-agent` **MUST** verify compliance with AC and architecture.

4. Create implementation report.
   - Create `.agent/artifacts/<taskId>-<taskTitle>/architect/implementation.md` using `templates.subtask_implementation`.

5. Request developer approval (MANDATORY, via console)
   - Require binary decision **YES**.
   - Record in `architect/implementation.md`: `decision: YES`.

6. PASS
   - Update `task.md` (using prefix):
     - Mark phase as completed.
     - Set timestamps and advance to Phase 3 Short.

## Pass
- Implementation report is created from `templates.subtask_implementation`.
- Developer approval is recorded in `architect/implementation.md`.

## Gate (REQUIRED)
Requirements (all mandatory):
1. Implementation report exists with APPROVED status.
2. Explicit developer approval is recorded in `architect/implementation.md`:
   - `approval.developer.decision == YES`
3. `task.md` reflects timestamps and state:
   - `task.lifecycle.phases.short-phase-2-implementation.completed == true`
   - `task.lifecycle.phases.short-phase-2-implementation.validated_at` is not null
   - `task.phase.updated_at` is not null

If Gate FAIL:
- Block until resolved.
