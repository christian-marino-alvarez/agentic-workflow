---
id: workflow.tasklifecycle-long.phase-4-implementation
description: Phase 4 of the task lifecycle. Executes implementation through granular task delegation to agents with developer approval Gate per task. Only advances if all tasks have been approved.
owner: architect-agent
version: 3.0.0
severity: PERMANENT
trigger:
  commands: ["phase4", "phase-4", "implementation", "implement"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-4-implementation

## Input (REQUIRED)
- The approved implementation plan exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`
- The current task exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- The `task.md` **MUST** reflect:
  - `task.phase.current == aliases.tasklifecycle-long.phases.phase_4.id`

> [!IMPORTANT]
> **Active constitution (MANDATORY)**:
> - Load `constitution.clean_code` before starting
> - Load `constitution.agents_behavior` (section 7: Gates, section 8: Constitution)
> - Load domain-specific constitutions as required by the task

## Output (REQUIRED)
- For **each agent task**:
  - `.agent/artifacts/<taskId>-<taskTitle>/agent-tasks/<N>-<agent>-<taskName>.md`
- Architect review report:
  - `.agent/artifacts/<taskId>-<taskTitle>/architect/review.md`
- State update in:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

---

## Objective (ONLY)
- Execute **all implementation tasks** defined in the approved plan through **granular delegation**.
- Each task is an **independent file** with Input/Output/Gate structure.
- Each task requires **explicit developer approval** (synchronous Gate) before assigning the next one.
- Generate a **mandatory architectural review report** consolidating all tasks.

> This phase **DOES implement code**.  
> This phase **DOES NOT redefine scope or planning**.  
> This phase **CANNOT advance without Gate PASS on all tasks + global confirmation**.

---

## Templates (MANDATORY)
- Each agent task **MUST** use:
  - `templates.agent_task`
- The review report **MUST** use:
  - `templates.review`
- If any template does not exist or cannot be loaded → **FAIL**.

---

## Mandatory Steps
0. Activate `architect-agent` and use the mandatory prefix in every message.

### 1. Verify inputs
- Approved `plan.md` exists.
- `task.md` exists.
- `task.phase.current == aliases.tasklifecycle-long.phases.phase_4.id`.
- If it fails → go to **Step 10 (FAIL)**.

### 2. Extract tasks from the plan
- Read `plan.md`.
- Identify all implementation tasks and their responsible agents.
- Create (if it does not exist) the directory:
  - `.agent/artifacts/<taskId>-<taskTitle>/agent-tasks/`

### 3. Delegation loop (SYNCHRONOUS)

For each task `N` in the plan:

#### 3.1 Create task file
- Create file using `templates.agent_task`:
  - `.agent/artifacts/<taskId>-<taskTitle>/agent-tasks/<N>-<agent>-<taskName>.md`
- Complete:
  - **Input**: Objective, Scope, Dependencies (defined by the architect)
  - **Output**: Deliverables, Required evidence (defined by the architect)

#### 3.2 Assign to agent
- The `architect-agent` **MUST** activate the corresponding agent:
  - `qa-agent`, `researcher-agent`, or other defined roles.
- The agent executes the task and completes the "Implementation Report" section of the file.

#### 3.3 Present to developer
- The `architect-agent` **MUST** present the completed task to the developer.
- Request Gate via console: **SI / NO**.

#### 3.4 Record Gate
- Update the task file with the decision:
  ```yaml
  approval:
    developer:
      decision: SI | NO
      date: <ISO-8601>
      comments: <optional>
  ```

#### 3.5 Evaluate Gate
- If `decision == SI`:
  - Mark task as `completed`.
  - Continue with the next task (N+1).
- If `decision == NO`:
  - Mark task as `failed`.
  - Define corrective actions.
  - Create a new correction task if applicable.
  - **DO NOT advance** until resolved.

### 4. Implementation consolidation
- The `architect-agent` reviews:
  - All completed and approved tasks.
  - Coherence between tasks.
  - Alignment with the approved plan.
  - Compliance with architecture and clean code rules.

### 5. Create architectural review report (MANDATORY)
- Create:
  - `.agent/artifacts/<taskId>-<taskTitle>/architect/review.md`
- The report **MUST**:
  - Use the `templates.review` template.
  - List all tasks and their Gate status.
  - Indicate compliance or deviation from the plan.
  - List detected issues (if any).

### 6. Developer final Gate (MANDATORY, via console)
- Request global confirmation:
  - "All tasks have been executed and approved. Do you confirm that Phase 4 is complete? (SI/NO)"
- Record in `architect/review.md`:
  ```yaml
  final_approval:
    developer:
      decision: SI | NO
      date: <ISO-8601>
      comments: <optional>
  ```
- If `decision != SI` → go to **Step 10 (FAIL)**.

### 7. PASS (only if final Gate approved)
- The `architect-agent` **MUST**:
  - Mark Phase 4 as completed in `task.md`.
  - Set `task.lifecycle.phases.phase-4-implementation.validated_at = <ISO-8601>`.
  - Update `task.phase.updated_at = <ISO-8601>`.
  - Advance:
    - `task.phase.current = aliases.tasklifecycle-long.phases.phase_5.id`
- Indicate paths:
  - `agent-tasks/` directory
  - `architect/review.md`

---

## FAIL (MANDATORY)

### 10. Declare Phase 4 as **NOT completed**
FAIL cases:
- Non-existent or unapproved plan.
- Incorrect phase.
- Incomplete or rejected agent task.
- Individual task Gate = NO without resolution.
- Final Gate = NO.

Mandatory actions:
- Identify the failed task.
- Define corrective actions.
- Create a new correction task if applicable.
- Iterate until Gate PASS.

Terminate blocked: do not advance phase.

---

## Gate (REQUIRED)

Requirements (all mandatory):
1. An agent task exists for each step in the plan.
2. All tasks have Gate PASS (`approval.developer.decision == SI`).
3. `architect/review.md` exists.
4. The `architect/review.md` starts with the `architect-agent` prefix.
5. Each `agent-tasks/*.md` starts with the corresponding agent's prefix.
6. The review report has final Gate PASS.
7. The implementation is coherent with `plan.md`.
8. `task.md` reflects:
   - Phase 4 completed
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_5.id`
   - `task.lifecycle.phases.phase-4-implementation.completed == true`
   - `task.lifecycle.phases.phase-4-implementation.validated_at` not null
   - `task.phase.updated_at` not null

If Gate FAIL:
- Execute **Step 10 (FAIL)**.
