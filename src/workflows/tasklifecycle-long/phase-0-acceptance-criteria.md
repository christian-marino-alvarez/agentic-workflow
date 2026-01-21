---
id: workflow.tasklifecycle.phase-0-acceptance-criteria
description: Converts the task candidate into a final task. The architect defines acceptance criteria through 5 mandatory questions based on the task and its objective, and creates the current task needed to start the lifecycle.
owner: architect-agent
version: 1.3.0
severity: PERMANENT
trigger:
  commands: ["phase0", "phase-0", "acceptance", "acceptance-criteria"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-0-acceptance-criteria

## Input (REQUIRED)
- Task candidate created by `workflow.tasklifecycle-long`:
  - `artifacts.candidate.task`
- The candidate `task.md` **MUST** include:
  - Task description
  - Task objective

> [!IMPORTANT]
> **Active Constitution (MANDATORY)**:
> - Load `constitution.project_architecture` before starting
> - Load `constitution.agents_behavior` (Section 7: Gates, Section 8: Constitution)

## Output (REQUIRED)
- Current task (final) with complete acceptance criteria:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Template (MANDATORY)
- The current task **MUST** be created using the template:
  - `templates.task`
- If the template doesn't exist or cannot be loaded → **FAIL**.

## Objective (ONLY)
- Move from **task candidate** to **current task** (final).
- **Calculate the final `taskId`**.
- Define **mandatory** acceptance criteria based on 5 clarifying questions to the developer.
- Record acceptance criteria within the current task file.

## Reasoning (MANDATORY)
- Before executing, the responsible agent must explain to the developer what will be done and why.
- No document is required for this step.

## Mandatory Steps
0. **Role Activation and Prefix (MANDATORY)**
   - The `architect-agent` **MUST** begin its intervention by identifying itself.
   - Message: `🏛️ **architect-agent**: Starting Phase 0 - Acceptance Criteria.`

1. Load and read task candidate:
   - `artifacts.candidate.task`
   - Extract:
     - Task description
     - Task objective
   - If missing → go to **Step 10 (FAIL)**.

2. Load task contractual template:
   - Load `templates.task`
   - If it doesn't exist or cannot be loaded → go to **Step 10 (FAIL)**.

3. **Calculate `taskId` (MANDATORY – Architect)**
   - The `architect-agent` **MUST** execute the following command:
     ```bash
     ls .agent/artifacts/ | grep -E "^[0-9]" | sort -n | tail -1 | cut -d'-' -f1
     ```
   - The output shows the last taskId (e.g., "8").
   - New `taskId = output + 1` (e.g., if output is "8", new taskId is "9").
   - If no output (no previous tasks) → `taskId = 1`.
   - The final value of `taskId` is **mandatory** to continue.

4. Define `taskTitle` (Architect)
   - Derive `taskTitle` from the developer's request (candidate).
   - Normalize for filesystem:
     - Lowercase
     - Spaces → `-`
     - No special characters

5. Formulate clarifying questions (MANDATORY, task-adaptive)
   - The `architect-agent` **MUST** analyze:
     - `task.description`
     - `task.goal`
   - Based on that analysis, it **MUST formulate exactly 5 questions** aimed at:
     - Eliminating ambiguities
     - Completing missing information
     - Allowing the definition of verifiable acceptance criteria
   - The questions:
     - **MUST NOT** duplicate information already explicit
     - **MUST** be directly related to the specific task
     - **MAY** vary according to task context

6. Validate responses and close definition (MANDATORY)
   - Confirm that the 5 formulated questions have explicit answers.
   - Based on the answers, the `architect-agent` **MUST**:
     - Consolidate a complete definition of the task
     - Derive verifiable acceptance criteria
   - If any answer is missing or ambiguity persists → go to **Step 10 (FAIL)**.

7. Create current task (MANDATORY)
   - Create the task directory (if missing):
     - `.agent/artifacts/<taskId>-<taskTitle>/`
   - Create status file:
     - `.agent/artifacts/<taskId>-<taskTitle>/task.md` (using `templates.task`)
   - Create acceptance file:
     - `.agent/artifacts/<taskId>-<taskTitle>/acceptance.md` (using `templates.acceptance`)
   - The `task.md` **will only contain**:
     - Metadata (id, title, owner, strategy)
     - Phase history
     - `task.acceptance` alias pointing to the new file
   - The `acceptance.md` **will contain**:
     - Consolidated definition
     - Detailed 5 answers
     - Checklist of verifiable criteria (AC)
   - If creation/writing fails → go to **Step 10 (FAIL)**.

8. Request developer approval (MANDATORY, via console)
   - The developer **MUST** explicitly approve:
     - Acceptance criteria
     - Created current task
   - Record the decision in `acceptance.md`:
     ```yaml
     approval:
       developer:
         decision: YES | NO
         date: <ISO-8601>
         comments: <optional>
     ```
   - If `decision != YES` → go to **Step 10 (FAIL)**.

9. PASS
   - Inform that Phase 0 is completed successfully.
   - The `architect-agent` **MUST explicitly perform** the following actions (using prefix):
     - Mark Phase 0 as completed in `task.md`.
     - Set `task.lifecycle.phases.phase-0-acceptance-criteria.validated_at = <ISO-8601>`.
     - Update `task.phase.updated_at = <ISO-8601>`.
     - Update status:
       - `task.phase.current = aliases.taskcycle-long.phases.phase_1.id`

10. FAIL (mandatory)
    - Declare Phase 0 as **NOT completed**.
    - Specify exactly what failed.
    - End blocked: do not advance the phase.

## Pass
- All required artifacts are created from templates.
- Developer approval is recorded where required.

## Gate (REQUIRED)
Requirements (all mandatory):
1. `.agent/artifacts/<taskId>-<taskTitle>/task.md` and `acceptance.md` exist.
2. The current task includes complete and verifiable acceptance criteria.
3. Explicit developer approval is recorded in `acceptance.md`:
   - `approval.developer.decision == YES`
4. The `architect-agent` has explicitly marked:
   - Phase 0 as completed
   - `task.lifecycle.phases.phase-0-acceptance-criteria.completed == true`
   - `task.lifecycle.phases.phase-0-acceptance-criteria.validated_at` not null
   - `task.phase.updated_at` not null
   - `task.phase.current == aliases.taskcycle-long.phases.phase_1.id`

If Gate FAIL:
- Execute **FAIL**.
