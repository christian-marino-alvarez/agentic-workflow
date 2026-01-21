---
id: workflow.tasklifecycle.phase-8-commit-push
description: Task cycle Phase 8. Consolidates and publishes changes to the target branch through normalized commits (Conventional Commits), generates changelog, and requires explicit developer approval before final push.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["phase8", "phase-8", "commit", "push"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-8-commit-push

## Input (REQUIRED)
- Agent evaluation report exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/metrics.md`
- Current task exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- `task.md` **MUST** reflect:
  - `task.phase.current == aliases.taskcycle-long.phases.phase_8.id`

> [!IMPORTANT]
> **Active Constitution (MANDATORY)**:
> - Load `constitution.project_architecture` before starting
> - Load `constitution.agents_behavior` (Section 7: Gates, Section 8: Constitution)

## Output (REQUIRED)
- Create changelog:
  - `.agent/artifacts/<taskId>-<taskTitle>/changelog.md`
- Status update in `task.md`.

## Objective (ONLY)
- Consolidate and publish changes.
- Obtain developer approval (YES) for the final push.

---

## Reasoning (MANDATORY)
- Before executing, the responsible agent must explain to the developer what will be done and why.
- No document is required for this step.

## Mandatory Steps

0. **Role Activation and Prefix (MANDATORY)**
   - The `architect-agent` **MUST** begin its intervention by identifying itself.
   - Message: `🏛️ **architect-agent**: Starting Phase 8 - Commit & Push.`

1. Verify inputs (`task.md`, `metrics.md`).

2. Prepare and execute commits following **Conventional Commits**.

3. Generate changelog (`changelog.md`).

4. Request developer approval (MANDATORY, via console)
   - Require binary decision **YES**.
   - Record approval in history or changelog if applicable.

5. Push to the target branch.

6. PASS
   - Update `.agent/artifacts/<taskId>-<taskTitle>/task.md` (using prefix).
   - Mark phase completed and task technically closed.

## Pass
- All required artifacts are created from templates.
- Developer approval is recorded where required.

## Gate (REQUIRED)
Requirements (all mandatory):
1. All commits comply with **Conventional Commits**.
2. `changelog.md` exists.
3. Developer has explicitly approved (YES).
4. `task.md` reflects timestamps and final state:
   - Task technically closed
   - `task.lifecycle.phases.phase-8-commit-push.completed == true`
   - `task.lifecycle.phases.phase-8-commit-push.validated_at` not null
   - `task.phase.updated_at` not null

If Gate FAIL:
- Execute **FAIL**.
