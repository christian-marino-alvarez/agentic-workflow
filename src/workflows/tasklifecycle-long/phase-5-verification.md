---
id: workflow.tasklifecycle.phase-5-verification
description: Task cycle Phase 5. Verifies the implementation with tests (unit and E2E if applicable) and reports metrics and coverage. DOES NOT fix code; if errors occur, it delegates a new fix task to the responsible agent.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["phase5", "phase-5", "verification", "verify"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-5-verification

## Input (REQUIRED)
- Architect review report created in Phase 4 exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/architect/review.md`
- Current task exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- `task.md` **MUST** reflect:
  - `task.phase.current == aliases.taskcycle-long.phases.phase_5.id`

> [!IMPORTANT]
> **Active Constitution (MANDATORY)**:
> - Load `constitution.project_architecture` before starting
> - Load `constitution.agents_behavior` (Section 7: Gates, Section 8: Constitution)

## Output (REQUIRED)
- Detailed verification and testing report:
  - `.agent/artifacts/<taskId>-<taskTitle>/verification.md`
- Status update in:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objective (ONLY)
- Verify the implementation through tests (unit and E2E if applicable).
- Obtain explicit developer approval (YES) to move forward.

## Reasoning (MANDATORY)
- Before executing, the responsible agent must explain to the developer what will be done and why.
- No document is required for this step.

## Mandatory Steps

0. **Role Activation and Prefix (MANDATORY)**
   - The `architect-agent` **MUST** begin its intervention by identifying itself.
   - Message: `🏛️ **architect-agent**: Starting Phase 5 - Verification.`

1. Assign verification role
   - The `qa-agent` **MUST** execute this phase.
   - Message: `🧪 **qa-agent**: Starting technical verification...`

2. Verify inputs
   - `architect/review.md` exists.
   - `task.phase.current == aliases.taskcycle-long.phases.phase_5.id`.

3. Load verification template (`templates.verification`).

4. Execute testing and create report (`verification.md`).

5. Request developer approval (MANDATORY, via console)
   - Require binary decision **YES**.
   - Record in `verification.md`: `decision: YES`.

6. PASS
   - Update `.agent/artifacts/<taskId>-<taskTitle>/task.md` (using prefix):
     - Mark Phase 5 as completed
     - Set timestamps and advance to Phase 6.

## Pass
- All required artifacts are created from templates.
- Developer approval is recorded where required.

## Gate (REQUIRED)
Requirements (all mandatory):
1. `verification.md` exists with Gate PASS (`decision: YES`).
2. `task.md` reflects timestamps and state:
   - `task.phase.current == aliases.taskcycle-long.phases.phase_6.id`
   - `task.lifecycle.phases.phase-5-verification.completed == true`
   - `task.lifecycle.phases.phase-5-verification.validated_at` not null
   - `task.phase.updated_at` not null

If Gate FAIL:
- Execute **FAIL**.
