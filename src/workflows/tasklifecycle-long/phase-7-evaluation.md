---
id: workflow.tasklifecycle.phase-7-evaluation
description: Task cycle Phase 7. Evaluates agent participation and task execution with objective scores.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["phase7", "phase-7", "evaluation", "scoring"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-7-evaluation

## Input (REQUIRED)
- Architect review report exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/architect/review.md`
- Current task exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- `task.md` **MUST** reflect:
  - `task.phase.current == aliases.taskcycle-long.phases.phase_7.id`

> [!IMPORTANT]
> **Active Constitution (MANDATORY)**:
> - Load `constitution.project_architecture` before starting
> - Load `constitution.agents_behavior` (Section 7: Gates, Section 8: Constitution)

## Output (REQUIRED)
- Create task metrics (per agent and global):
  - `.agent/artifacts/<taskId>-<taskTitle>/metrics.md`
- Status update in `task.md`.

## Objective (ONLY)
- Objectively evaluate each participating agent.
- Obtain developer approval (YES) for the evaluation.

## Templates (MANDATORY)
- Task metrics: `templates.task_metrics`
- Global metrics: `templates.agent_scores`

---

## Reasoning (MANDATORY)
- Before executing, the responsible agent must explain to the developer what will be done and why.
- No document is required for this step.

## Mandatory Steps

0. **Role Activation and Prefix (MANDATORY)**
   - The `architect-agent` **MUST** begin its intervention by identifying itself.
   - Message: `🏛️ **architect-agent**: Starting Phase 7 - Evaluation.`

1. Verify inputs (`task.md`, `review.md`).

2. Load templates and generate `metrics.md`.

3. Evaluate agents and calculate global score.

4. Request developer feedback and mandatory score (via console)
   - Present `metrics.md`.
   - Require explicit confirmation **YES**.
   - Record score (1-10) in the artifact.

5. PASS
   - Update `.agent/artifacts/<taskId>-<taskTitle>/task.md` (using prefix).
   - Mark phase completed and advance to Phase 8.

## FAIL (MANDATORY)
9. Declare Phase 7 as **NOT completed**.
   - End blocked: do not advance phase.

## Pass
- All required artifacts are created from templates.
- Developer approval is recorded where required.

## Gate (REQUIRED)
Requirements (all mandatory):
1. `metrics.md` exists with validation `Approved: YES`.
2. `task.md` reflects timestamps and state:
   - `task.phase.current == aliases.taskcycle-long.phases.phase_8.id`
   - `task.lifecycle.phases.phase-7-evaluation.completed == true`
   - `task.lifecycle.phases.phase-7-evaluation.validated_at` not null
   - `task.phase.updated_at` not null

If Gate FAIL:
- Execute **FAIL**.
