---
id: workflow.tasklifecycle-long.phase-3-planning
owner: architect-agent
description: "Phase 3 of the task lifecycle. Defines the implementation plan based on prior analysis, assigns responsibilities per agent, details testing, demo, estimations, and critical points. Requires explicit developer approval."
version: 1.0.0
trigger: ["phase3", "phase-3", "planning", "plan"]
type: static
context:
  - .agent/rules/constitution/architecture/index.md
  - .agent/rules/constitution/backend.md
  - .agent/rules/constitution/background.md
  - .agent/rules/constitution/view.md
---

# WORKFLOW: tasklifecycle.phase-3-planning

## Input
- The analysis artifact created in Phase 2 exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`
- The current task exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- The `task.md` **MUST** reflect:
  - `task.phase.current == aliases.tasklifecycle-long.phases.phase_3.id`

> [!IMPORTANT]
> **Active constitution**:
> - Load `constitution.clean_code` before starting
> - Load `constitution.agents_behavior` (section 7: Gates, section 8: Constitution)

- Template: `templates.planning` (if it does not exist or cannot be loaded → FAIL)

## Output
- Create the implementation plan:
  - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`
- Update the state in the current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objective
Create a **detailed implementation plan** to execute the design defined in Phase 2, that:
- translates the analysis into executable steps
- assigns clear responsibilities per agent and sub-area
- defines how the task will be validated (tests and verifications)
- describes the final demo (if applicable)
- estimates implementation effort/weight
- explains how identified critical points will be resolved

> This phase **DOES NOT implement code**.
> This phase **REQUIRES strict explicit developer approval (SI / NO)**.

## Instructions

0. Activate `architect-agent` and use the mandatory prefix in every message.

1. Verify inputs
   - `.agent/artifacts/<taskId>-<taskTitle>/analysis.md` exists
   - `.agent/artifacts/<taskId>-<taskTitle>/task.md` exists
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_3.id`
   - If it fails → FAIL.

2. Load planning template
   - Load `templates.planning`
   - If it does not exist or cannot be read → FAIL.

3. Create plan instance
   - Copy the template to:
     - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`
   - Fill all sections using `analysis.md` as the contract.

4. Define implementation steps
   - Decompose the task into clear and ordered steps.
   - Indicate dependencies and execution order.

5. Assign responsibilities
   - For each step or sub-area:
     - responsible agent
     - **Verify that the agent exists in `.agent/rules/roles/`**.
     - **FAIL** if assigning tasks to a non-existent agent.
     - expected deliverables
   - If the analysis requires creating/modifying/deleting components:
     - define who executes it (responsible agent)
     - define HOW it will be done
     - define the tool or skill to use by alias (if it exists) and the reason
   - If the analysis requires creating a demo:
     - define expected structure (aligned with `constitution.clean_code`)
   - Define the domain dispatch (if applicable) in `plan.workflows.*`
   - Define secondary dispatch (if applicable) in `plan.dispatch[]`

6. Testing and validation strategy
   - Define test types:
     - unit
     - integration
     - end-to-end (if applicable)
   - Indicate mandatory tooling according to:
     - `constitution.clean_code`
   - Relate tests to acceptance criteria.

7. Demo plan (if applicable)
   - What will be shown
   - How it will be validated with the developer/user

8. Estimation and critical points
   - Estimate effort/weight per block
   - Identify critical points
   - Explain how they will be resolved

9. Request developer approval (via console)
   - The developer **MUST** issue a binary decision:
     - **SI** (approved)
     - **NO** (rejected)
   - Record the decision in `plan.md`:
     ```yaml
     approval:
       developer:
         decision: SI | NO
         date: <ISO-8601>
         comments: <optional>
     ```
   - If `decision != SI` → FAIL.

## Gate
Requirements (all mandatory):
1. `.agent/artifacts/<taskId>-<taskTitle>/plan.md` exists.
2. The plan follows the `templates.planning` template structure.
3. The `plan.md` starts with the `architect-agent` prefix.
4. The plan is coherent with `analysis.md`.
5. If the analysis requires creating/modifying/deleting components, the plan defines:
   - responsible
   - how it is implemented
   - best available tool (prefer declared tools; if none exists, justify alternative)
   - chosen tool by alias and reason
6. If applicable, the plan defines `plan.workflows.*` with domain dispatch.
7. If applicable, the plan defines `plan.dispatch[]` with secondary dispatch.
8. If the analysis requires creating a demo, the plan defines:
   - structure aligned with `constitution.clean_code`
9. Explicit developer approval exists:
   - `approval.developer.decision == SI`
10. `task.md` reflects:
   - Phase 3 completed
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_4.id`
   - `task.lifecycle.phases.phase-3-planning.completed == true`
   - `task.lifecycle.phases.phase-3-planning.validated_at` not null
   - `task.phase.updated_at` not null

## Pass
- Report that Phase 3 is correctly completed.
- The `architect-agent` **MUST explicitly perform** the following actions:
  - Mark Phase 3 as completed in `task.md`.
  - Set `task.lifecycle.phases.phase-3-planning.completed = true`.
  - Set `task.lifecycle.phases.phase-3-planning.validated_at = <ISO-8601>`.
  - Update `task.phase.updated_at = <ISO-8601>`.
  - Update the state:
    - `task.phase.current = aliases.tasklifecycle-long.phases.phase_4.id`
- This update is **NOT automatic** and **CANNOT be inferred**.
- Until this change is reflected in `task.md`, **Phase 4 cannot be started**.
- Indicate paths:
  - `plan.md`
  - `task.md` updated

## Fail
- Declare Phase 3 as **NOT completed**.
- Indicate exactly what failed:
  - non-existent analysis.md
  - incorrect phase
  - non-existent planning template
  - failure creating `plan.md`
  - developer approval = NO or missing
- Request the minimum action:
  - complete Phase 2
  - fix current phase
  - fix permissions/paths
  - review the plan and resubmit for approval
- Terminate blocked: do not advance phase.
