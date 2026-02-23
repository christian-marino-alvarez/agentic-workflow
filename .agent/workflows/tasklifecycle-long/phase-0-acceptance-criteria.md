---
id: workflow.tasklifecycle-long.phase-0-acceptance-criteria
owner: architect-agent
description: "Converts the task candidate into a definitive task. The architect defines acceptance criteria through 5 mandatory questions based on the task and its objective, and creates the current task required to start the lifecycle."
version: 1.2.1
trigger: ["phase0", "phase-0", "acceptance", "acceptance-criteria"]
type: static
---

# WORKFLOW: tasklifecycle.phase-0-acceptance-criteria

## Input
- Task candidate created by `workflows.tasklifecycle-long`:
  - `artifacts.candidate.task`
- The `task.md` candidate **MUST** include:
  - task description
  - task objective

> [!IMPORTANT]
> **Active constitution**:
> - Load `constitution.clean_code` before starting
> - Load `constitution.agents_behavior` (section 7: Gates, section 8: Constitution)

- Template: `templates.task` (if it does not exist or cannot be loaded → FAIL)

## Output
- Current task (definitive) with complete acceptance criteria:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- Acceptance artifact:
  - `.agent/artifacts/<taskId>-<taskTitle>/acceptance.md`

## Objective
- Move from **task candidate** to **current task** (definitive).
- **Calculate the definitive `taskId`**.
- Define **mandatory** acceptance criteria from 5 questions to the developer.
- Record acceptance criteria within the current task file.

## Instructions

0. Activate `architect-agent` and use the mandatory prefix in every message.

1. Load and read the task candidate:
   - `artifacts.candidate.task`
   - Extract:
     - task description
     - task objective
   - If missing → FAIL.

2. Load contractual task template
   - Load `templates.task`
   - If it does not exist or cannot be loaded → FAIL.

3. **Calculate `taskId` (architect)**
   - Execute the following command:
     ```bash
     ls .agent/artifacts/ | grep -E "^[0-9]" | sort -n | tail -1 | cut -d'-' -f1
     ```
   - The output shows the last taskId (e.g.: "8")
   - The new `taskId = output + 1` (e.g.: if output is "8", new taskId is "9")
   - If there is no output (no previous tasks) → `taskId = 1`
   - The final `taskId` value is **mandatory** to continue.

4. Define `taskTitle` (architect)
   - Derive `taskTitle` from the developer's request (candidate).
   - Normalize for filesystem:
     - lowercase
     - spaces → `-`
     - no special characters

5. Formulate clarification questions (adaptive to the task)
   - The `architect-agent` **MUST** analyze:
     - `task.description`
     - `task.goal`
   - Based on that analysis, **MUST formulate exactly 5 questions** whose purpose is to:
     - eliminate ambiguities
     - complete missing information
     - enable defining verifiable acceptance criteria
   - The questions:
     - **MUST NOT** duplicate already explicit information
     - **MUST** be directly related to the specific task
     - **MAY** vary depending on the task context

6. Validate responses and close definition
   - Confirm that all 5 formulated questions have explicit answers.
   - Based on the responses, the `architect-agent` **MUST**:
     - consolidate a complete task definition
     - derive verifiable acceptance criteria
   - If any response is missing or ambiguity persists → FAIL.

7. Create current task
   - Create the task directory (if it does not exist):
     - `.agent/artifacts/<taskId>-<taskTitle>/`
   - Create the state file:
     - `.agent/artifacts/<taskId>-<taskTitle>/task.md` (using `templates.task`)
   - Create the acceptance file:
     - `.agent/artifacts/<taskId>-<taskTitle>/acceptance.md` (using `templates.acceptance`)
   - The `task.md` **will only contain**:
     - metadata (id, title, owner, strategy)
     - phase history
     - alias `task.acceptance` pointing to the new file
   - The `acceptance.md` **will contain**:
     - consolidated definition
     - the 5 detailed answers
     - verifiable acceptance criteria (AC) checklist
   - If it cannot be created/written → FAIL.

8. Request developer approval (via console)
   - The developer **MUST** explicitly approve:
     - Acceptance criteria
     - Current task created
   - Record the decision in `acceptance.md`:
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
1. The directory and state file exist:
   - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
2. The acceptance artifact exists:
   - `.agent/artifacts/<taskId>-<taskTitle>/acceptance.md`
3. Both follow their respective templates.
4. The `acceptance.md` starts with the `architect-agent` prefix.
5. The `taskId` is sequential:
   - Execute: `ls .agent/artifacts/ | grep -E "^[0-9]" | sort -n | tail -1 | cut -d'-' -f1`
   - The taskId of the new directory must be exactly `output + 1`
6. The current task includes complete and verifiable acceptance criteria.
7. Explicit developer approval (via console) is recorded in `acceptance.md`:
   - `approval.developer.decision == SI`
8. The `architect-agent` has explicitly marked:
   - Phase 0 as completed
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_1.id`
9. `task.md` reflects timestamp and state:
   - `task.lifecycle.phases.phase-0-acceptance-criteria.completed == true`
   - `task.lifecycle.phases.phase-0-acceptance-criteria.validated_at` not null
   - `task.phase.updated_at` not null
10. The 5 mandatory questions were asked and answered by the developer.

## Pass
- Report that Phase 0 is correctly completed.
- The `architect-agent` **MUST explicitly perform** the following actions:
  - Mark Phase 0 as completed in `task.md`.
  - Set `task.lifecycle.phases.phase-0-acceptance-criteria.validated_at = <ISO-8601>`.
  - Update `task.phase.updated_at = <ISO-8601>`.
  - Update the state:
    - `task.phase.current = aliases.tasklifecycle-long.phases.phase_1.id`
- This update is **NOT automatic** and **CANNOT be inferred**.
- Until this change is reflected in `task.md`, **Phase 1 cannot be started**.

## Fail
- Declare Phase 0 as **NOT completed**.
- Indicate exactly what failed:
  - missing candidate
  - inaccessible template (`templates.task`)
  - missing description/objective
  - could not calculate `taskId`
  - incomplete responses (fewer than 5)
  - could not create current task
- Request the minimum action:
  - complete candidate data
  - answer missing questions
  - fix artifacts permissions/paths
- Terminate blocked: do not advance phase.
