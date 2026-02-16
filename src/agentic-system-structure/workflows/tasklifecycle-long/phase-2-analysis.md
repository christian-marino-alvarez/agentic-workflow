---
id: workflow.tasklifecycle-long.phase-2-analysis
description: Phase 2 of the task lifecycle. Deep analysis based on prior research, covers acceptance criteria and defines agents, responsibilities, and impact. Requires developer approval.
owner: architect-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["phase2", "phase-2", "analysis"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-2-analysis

## Input (REQUIRED)
- The current task created in Phase 0 exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- The approved research report exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/researcher/research.md`
- The `task.md` **MUST** include:
  - description
  - objective
  - defined acceptance criteria
  - `task.phase.current == aliases.tasklifecycle-long.phases.phase_2.id`

> [!IMPORTANT]
> **Active constitution (MANDATORY)**:
> - Load `constitution.clean_code` before starting
> - Load `constitution.agents_behavior` (section 7: Gates, section 8: Constitution)

## Output (REQUIRED)
- Create the analysis artifact **from the template**:
  - `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`
- Update the state in the current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objective (ONLY)
Create a deep **analysis** report that:
- covers **all** acceptance criteria from `task.md`
- respects the project's architecture and rules
- analyzes the actual project state (structure, components, and active areas)
- integrates the approved research from Phase 1
- defines agents, sub-areas, and task impact
- identifies whether the task requires creating, modifying, or deleting system components
- identifies whether the task requires creating a demo and its structural impact
- serves as **contractual input** for Phase 3 (Planning)

> This phase **DOES NOT implement code**.  
> This phase **DOES NOT plan detailed execution**.  
> This phase **REQUIRES explicit developer approval**.

## Template (MANDATORY)
- The report **MUST** be created using the template:
  - `templates.analysis`
- The template **MUST NOT** be modified.
- If the template does not exist or cannot be loaded → **FAIL**.

## Mandatory Steps
0. Activate `architect-agent` and use the mandatory prefix in every message.
1. Verify inputs
   - `.agent/artifacts/<taskId>-<taskTitle>/task.md` exists
   - `.agent/artifacts/<taskId>-<taskTitle>/researcher/research.md` exists
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_2.id`
   - `task.md` contains defined acceptance criteria
   - Research is approved by the developer (SI)
   - If it fails → go to **Step 10 (FAIL)**.

2. Load analysis template
   - Load `templates.analysis`
   - If it does not exist or cannot be read → go to **Step 10 (FAIL)**.

3. Create analysis instance
   - Copy the template to:
     - `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`
   - Fill sections according to the specific task.

4. Analyze project state and agent history
   - Review structure, components, and previous tasks.
   - Document findings in `analysis.md`.

5. Integrate approved research
   - Base alternatives, risks, and compatibility on `research.md`.
   - Complement with own architectural analysis.

6. Acceptance criteria coverage
   - Map **each acceptance criterion** to its analysis, verification, and risks.

7. Define agents and sub-areas
   - List required agents.
   - Define responsibilities and handoffs.
   - Identify if creating, modifying, or deleting components is required.
   - Identify if creating a demo is required and its structural impact.

8. Request developer approval (MANDATORY, via console)
   - The developer **MUST** issue a binary decision:
     - **SI** (approved)
     - **NO** (rejected)
   - The decision **MUST** be recorded in `analysis.md` with the format:
     ```yaml
     approval:
       developer:
         decision: SI | NO
         date: <ISO-8601>
         comments: <optional>
     ```
   - If `decision != SI` → go to **Step 10 (FAIL)**.

9. PASS
   - Report that Phase 2 is correctly completed.
   - The `architect-agent` **MUST explicitly perform** the following actions:
     - Mark Phase 2 as completed in `task.md`.
     - Set `task.lifecycle.phases.phase-2-analysis.completed = true`.
     - Set `task.lifecycle.phases.phase-2-analysis.validated_at = <ISO-8601>`.
     - Update `task.phase.updated_at = <ISO-8601>`.
     - Update the state:
       - `task.phase.current = aliases.tasklifecycle-long.phases.phase_3.id`
   - This update is **NOT automatic** and **CANNOT be inferred**.
   - Until this change is reflected in `task.md`, **Phase 3 cannot be started**.
   - Indicate paths:
     - `analysis.md`
     - `task.md` updated

## FAIL (MANDATORY)
10. Declare Phase 2 as **NOT completed**
    - Indicate exactly what failed:
      - non-existent task
      - incorrect phase
      - non-existent or unapproved research
      - non-existent template
      - failure creating `analysis.md`
      - developer approval = NO or missing
    - Request the minimum action to resolve
    - Terminate blocked: do not advance phase.

## Gate (REQUIRED)
Requirements (all mandatory):
1. `.agent/artifacts/<taskId>-<taskTitle>/analysis.md` exists.
2. The file follows the `templates.analysis` template structure.
3. The `analysis.md` starts with the `architect-agent` prefix.
4. Covers all acceptance criteria from `task.md`.
5. Explicit developer approval exists:
   - `approval.developer.decision == SI`
6. `task.md` reflects:
   - Phase 2 completed
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_3.id`
   - `task.lifecycle.phases.phase-2-analysis.completed == true`
   - `task.lifecycle.phases.phase-2-analysis.validated_at` not null
   - `task.phase.updated_at` not null
If Gate FAIL:
- Execute **Step 10 (FAIL)**.
