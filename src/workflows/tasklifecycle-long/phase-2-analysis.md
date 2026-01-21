---
id: workflow.tasklifecycle.phase-2-analysis
description: Task cycle Phase 2. Deep analysis based on previous research, covers acceptance criteria and defines agents, responsibilities, and impact. Requires developer approval.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["phase2", "phase-2", "analysis"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-2-analysis

## Input (REQUIRED)
- Current task created in Phase 0 exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- Approved research report exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/researcher/research.md`
- `task.md` **MUST** include:
  - Description
  - Objective
  - Defined acceptance criteria
  - `task.phase.current == aliases.taskcycle-long.phases.phase_2.id`

> [!IMPORTANT]
> **Active Constitution (MANDATORY)**:
> - Load `constitution.project_architecture` before starting
> - Load `constitution.agents_behavior` (Section 7: Gates, Section 8: Constitution)

## Output (REQUIRED)
- Create analysis artifact **based on template**:
  - `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`
- Status update in current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objective (ONLY)
Create a deep **analysis** report that:
- Covers **all** acceptance criteria from `task.md`
- Respects project architecture and rules
- Defines agents, sub-areas, and task impact
- Identifies if the task requires creating, modifying, or deleting system components
- Serves as **contractual input** for Phase 3 (Planning)

> This phase **DOES NOT implement code**.
> This phase **DOES NOT plan detailed execution**.
> This phase **REQUIRES explicit developer approval**.

## Template (MANDATORY)
- The report **MUST** be created using the template:
  - `templates.analysis`
- If the template doesn't exist or cannot be loaded → **FAIL**.

## Reasoning (MANDATORY)
- Before executing, the responsible agent must explain to the developer what will be done and why.
- No document is required for this step.

## Mandatory Steps
0. **Role Activation and Prefix (MANDATORY)**
   - The `architect-agent` **MUST** begin its intervention by identifying itself.
   - Message: `🏛️ **architect-agent**: Starting Phase 2 - Analysis.`

1. Verify inputs
   - `.agent/artifacts/<taskId>-<taskTitle>/task.md` exists
   - `.agent/artifacts/<taskId>-<taskTitle>/researcher/research.md` exists
   - `task.phase.current == aliases.taskcycle-long.phases.phase_2.id`
   - Research is developer-approved (YES)
   - If fails → go to **Step 10 (FAIL)**.

2. Load analysis template
   - Load `templates.analysis`
   - If it doesn't exist or cannot be read → go to **Step 10 (FAIL)**.

3. Create analysis instance
   - Copy template to:
     - `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`
   - Fill sections according to the specific task.

4. Analyze project state
   - Review structure, drivers, modules, and previous tasks if applicable.
   - Document findings in `analysis.md`.

5. Integrate approved research
   - Base alternatives, risks, and compatibility on `research.md`.

6. Acceptance criteria coverage
   - Map **every acceptance criteria** to its analysis, verification, and risks.

7. Define agents and sub-areas
   - List required agents.
   - Define responsibilities and handoffs.

8. Request developer approval (MANDATORY, via console)
   - The developer **MUST** issue a binary decision:
     - **YES** (Approved)
     - **NO** (Rejected)
   - Record in `analysis.md`:
     ```yaml
     approval:
       developer:
         decision: YES | NO
         date: <ISO-8601>
         comments: <optional>
     ```
   - If `decision != YES` → go to **Step 10 (FAIL)**.

9. PASS
   - Update `.agent/artifacts/<taskId>-<taskTitle>/task.md` (using prefix):
     - Mark Phase 2 as completed
     - Set `task.lifecycle.phases.phase-2-analysis.validated_at = <ISO-8601>`
     - Update `task.phase.updated_at = <ISO-8601>`
     - Advance `task.phase.current = aliases.taskcycle-long.phases.phase_3.id`

## FAIL (MANDATORY)
10. Declare Phase 2 as **NOT completed**.
    - Specify exactly what failed.
    - End blocked: do not advance phase.

## Pass
- All required artifacts are created from templates.
- Developer approval is recorded where required.

## Gate (REQUIRED)
Requirements (all mandatory):
1. `.agent/artifacts/<taskId>-<taskTitle>/analysis.md` exists.
2. The file follows the `templates.analysis` template structure.
3. Covers all acceptance criteria from `task.md`.
4. Explicit developer approval is recorded in `analysis.md`:
   - `approval.developer.decision == YES`
5. `task.md` reflects timestamps and state:
   - `task.phase.current == aliases.taskcycle-long.phases.phase_3.id`
   - `task.lifecycle.phases.phase-2-analysis.completed == true`
   - `task.lifecycle.phases.phase-2-analysis.validated_at` not null
   - `task.phase.updated_at` not null

If Gate FAIL:
- Execute **Step 10 (FAIL)**.
