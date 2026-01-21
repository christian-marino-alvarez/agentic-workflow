---
id: workflow.tasklifecycle.phase-3-planning
description: Task cycle Phase 3. Defines the implementation plan based on previous analysis, assigns responsibilities per agent, details testing, demo, estimations, and critical points. Requires explicit developer approval.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["phase3", "phase-3", "planning", "plan"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-3-planning

## Input (REQUIRED)
- Analysis artifact created in Phase 2 exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`
- Current task exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- `task.md` **MUST** reflect:
  - `task.phase.current == aliases.taskcycle-long.phases.phase_3.id`

> [!IMPORTANT]
> **Active Constitution (MANDATORY)**:
> - Load `constitution.project_architecture` before starting
> - Load `constitution.agents_behavior` (Section 7: Gates, Section 8: Constitution)

## Output (REQUIRED)
- Create implementation plan:
  - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`
- Status update in current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objective (ONLY)
Create a **detailed implementation plan** to execute the design defined in Phase 2, which:
- Translates analysis into executable steps
- Assigns clear responsibilities per agent and rule injection
- Defines how the task will be validated (tests and verifications)

> This phase **DOES NOT implement code**.
> This phase **REQUIRES explicit and strict developer approval (YES / NO)**.

## Template (MANDATORY)
- The plan **MUST** be created using the template:
  - `templates.planning`
- If the template doesn't exist or cannot be loaded → **FAIL**.

---

## Reasoning (MANDATORY)
- Before executing, the responsible agent must explain to the developer what will be done and why.
- No document is required for this step.

## Mandatory Steps

0. **Role Activation and Prefix (MANDATORY)**
   - The `architect-agent` **MUST** begin its intervention by identifying itself.
   - Message: `🏛️ **architect-agent**: Starting Phase 3 - Planning.`

1. Verify inputs
   - `.agent/artifacts/<taskId>-<taskTitle>/analysis.md` exists
   - `.agent/artifacts/<taskId>-<taskTitle>/task.md` exists
   - `task.phase.current == aliases.taskcycle-long.phases.phase_3.id`
   - If fails → go to **Step 11 (FAIL)**.

2. Load planning template
   - Load `templates.planning`
   - If it doesn't exist or cannot be read → go to **Step 11 (FAIL)**.

3. Create plan instance
   - Copy template to:
     - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`
   - Fill all sections using `analysis.md` as a contract.

4. Decompress tasks
   - Identify every necessary sub-task.
   - Define responsible agent.

5. Request developer approval (MANDATORY, via console)
   - The developer **MUST** issue a binary decision:
     - **YES** (Approved)
     - **NO** (Rejected)
   - Record the decision in `plan.md`:
     ```yaml
     approval:
       developer:
         decision: YES | NO
         date: <ISO-8601>
         comments: <optional>
     ```
   - If `decision != YES` → go to **Step 11 (FAIL)**.

6. PASS
   - Update `.agent/artifacts/<taskId>-<taskTitle>/task.md` (using prefix):
     - Mark Phase 3 as completed
     - Set `task.lifecycle.phases.phase-3-planning.validated_at = <ISO-8601>`
     - Update `task.phase.updated_at = <ISO-8601>`
     - Advance `task.phase.current = aliases.taskcycle-long.phases.phase_4.id`

## FAIL (MANDATORY)
10. Declare Phase 3 as **NOT completed**.
    - Specify exactly what failed.
    - End blocked: do not advance phase.

## Pass
- All required artifacts are created from templates.
- Developer approval is recorded where required.

## Gate (REQUIRED)
Requirements (all mandatory):
1. `.agent/artifacts/<taskId>-<taskTitle>/plan.md` exists.
2. The plan follows the `templates.planning` template structure.
3. Explicit developer approval is recorded in `plan.md`:
   - `approval.developer.decision == YES`
4. `task.md` reflects timestamps and state:
   - `task.phase.current == aliases.taskcycle-long.phases.phase_4.id`
   - `task.lifecycle.phases.phase-3-planning.completed == true`
   - `task.lifecycle.phases.phase-3-planning.validated_at` not null
   - `task.phase.updated_at` not null

If Gate FAIL:
- Execute **Step 10 (FAIL)**.
