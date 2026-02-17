---
id: workflow.tasklifecycle-long.phase-7-evaluation
description: Phase 7 of the task lifecycle. Evaluates agent participation and task execution with objective scores.
owner: architect-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["phase7", "phase-7", "evaluation", "scoring"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-7-evaluation

## Input (REQUIRED)
- The agent implementation report exists (if applicable):
  - `.agent/artifacts/<taskId>-<taskTitle>/<agent>/subtask-implementation.md`
- The architect's review report exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/architect/review.md`
- The current task exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- The `task.md` **MUST** reflect:
  - `task.phase.current == aliases.tasklifecycle-long.phases.phase_7.id`

> [!IMPORTANT]
> **Active constitution (MANDATORY)**:
> - Load `constitution.clean_code` before starting
> - Load `constitution.agents_behavior` (section 7: Gates, section 8: Constitution)

## Output (REQUIRED)
- Create task metrics (per agent and global):
  - `.agent/artifacts/<taskId>-<taskTitle>/metrics.md`
- Record per-agent scores:
  - `.agent/artifacts/<taskId>-<taskTitle>/agent-scores.md`
- State update in:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objective (ONLY)
- Objectively evaluate each participating agent.
- Assess the role adequacy and execution of each agent.

## Templates (MANDATORY)
- Task metrics:
  - `templates.task_metrics`
- Global metrics:
  - `templates.agent_scores`

---

## Mandatory Steps

0. Activate `architect-agent` and use the mandatory prefix in every message.

1. Verify inputs
   - `task.md` exists
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_7.id`
   - `architect/review.md` exists
   - If applicable, agent subtasks exist
   - If it fails → go to **Step 8 (FAIL)**.

2. Load templates
   - Load `templates.task_metrics` and `templates.agent_scores`
   - If they do not exist or cannot be read → go to **Step 8 (FAIL)**.

3. Evaluate agents
   - For each participating agent:
     - review their subtask and review report
     - assign score (0-10)
     - justify the score

4. Calculate global task score
   - Weighted average of agents
   - Record in `metrics.md`

5. Record per-agent scores
   - Update `agent-scores.md` with the current task's score

6. Request mandatory developer feedback and scoring (via console)
   - Present `metrics.md` to the user.
   - Request explicit confirmation (SI/NO).
   - Request developer score (1-10) for EACH participating agent.
   - **MANDATORY GATE**: Without these scores, the task CANNOT be closed.
   - If response is NO → go to **Step 8 (FAIL)**.

7. PASS
   - Report that Phase 7 is correctly completed.
   - Record validation in `metrics.md`.
   - The `architect-agent` **MUST explicitly perform** the following actions:
     - Mark Phase 7 as completed in `task.md`.
     - Set `task.lifecycle.phases.phase-7-evaluation.completed = true`.
     - Set `task.lifecycle.phases.phase-7-evaluation.validated_at = <ISO-8601>`.
     - Update `task.phase.updated_at = <ISO-8601>`.
     - Update the state:
       - `task.phase.current = aliases.tasklifecycle-long.phases.phase_8.id`
   - This update is **NOT automatic** and **CANNOT be inferred**.
   - Until this change is reflected in `task.md`, **Phase 8 cannot be started**.
   - Indicate paths:
     - `metrics.md`
     - `agent-scores.md`
     - `task.md` updated

---

## FAIL (MANDATORY)

8. Declare Phase 7 as **NOT completed**
   - FAIL cases:
     - incorrect phase
     - missing required reports
     - could not create metrics
     - developer rejects the evaluation
   - Minimum action: fix inputs and retry
   - Terminate blocked: do not advance phase.

---

## Gate (REQUIRED)

Requirements (all mandatory):
1. `.agent/artifacts/<taskId>-<taskTitle>/metrics.md` exists.
2. The `metrics.md` starts with the `architect-agent` prefix.
3. `metrics.md` contains the developer's validation (`Approved: SI`).
4. `metrics.md` contains the developer's score (0-5).
5. `.agent/artifacts/<taskId>-<taskTitle>/agent-scores.md` updated exists.
6. `task.md` reflects:
   - Phase 7 completed
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_8.id`
   - `task.lifecycle.phases.phase-7-evaluation.completed == true`
   - `task.lifecycle.phases.phase-7-evaluation.validated_at` not null
   - `task.phase.updated_at` not null

If Gate FAIL:
- Execute **Step 8 (FAIL)**.
