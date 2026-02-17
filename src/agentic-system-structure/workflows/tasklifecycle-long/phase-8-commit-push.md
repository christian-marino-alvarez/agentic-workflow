---
id: workflow.tasklifecycle-long.phase-8-commit-push
description: Phase 8 of the task lifecycle. Consolidates and publishes changes to the target branch via normalized commits (Conventional Commits), generates changelog, and requires explicit developer approval before final push.
owner: architect-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["phase8", "phase-8", "commit", "push"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-8-commit-push

## Input (REQUIRED)
- The agent evaluation report exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/metrics.md`
- The current task exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- The `task.md` **MUST** reflect:
  - `task.phase.current == aliases.tasklifecycle-long.phases.phase_8.id`

> [!IMPORTANT]
> **Active constitution (MANDATORY)**:
> - Load `constitution.clean_code` before starting
> - Load `constitution.agents_behavior` (section 7: Gates, section 8: Constitution)

## Output (REQUIRED)
- Create changelog:
  - `.agent/artifacts/<taskId>-<taskTitle>/changelog.md`
- State update in:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Commit Rules
Valid examples:
- `feat(core): add caching layer`
- `fix(core): handle cache eviction`
- `refactor(workflows): normalize tasklifecycle phases`
- Not allowed:
- generic messages (`update`, `changes`, `fix stuff`)
- commits without scope
- commits that mix unrelated changes

---

## Mandatory Steps

0. Activate `architect-agent` and use the mandatory prefix in every message.

1. Verify inputs
 - `metrics.md` exists and contains `Approved: SI`.
 - `task.md` exists.
 - `task.phase.current == aliases.tasklifecycle-long.phases.phase_8.id`
 - If it fails → go to **Step 10 (FAIL)**.

2. Prepare commits
 - Review `git status` and `git diff`.
 - Group changes logically.
 - Define number and scope of commits.

3. Create commits (MANDATORY)
 - Execute commits following **Conventional Commits**.
 - Each commit **MUST**:
   - have a clear purpose
   - map to actual changes
 - If any commit does not follow the format → **FAIL**.

4. Generate changelog (MANDATORY)
 - Create:
   - `.agent/artifacts/<taskId>-<taskTitle>/changelog.md`
 - The changelog **MUST** include:
   - list of commits
   - full message of each commit
   - functional summary of the change

5. Request developer approval (MANDATORY, via console)
 - The developer **MUST** explicitly approve:
   - the commit contents
   - the push to the target branch
 - Binary decision:
   - **SI** → continue
   - **NO** → go to **Step 10 (FAIL)**

6. Push to target branch
 - Execute:
   ```bash
   git push <remote> <branch>
   ```
 - Confirm that the push was successful.

7. PASS
 - Report that Phase 8 is correctly completed.
 - The `architect-agent` **MUST explicitly perform** the following actions:
   - Mark Phase 8 as completed in `task.md`.
   - Set `task.lifecycle.phases.phase-8-commit-push.completed = true`.
   - Set `task.lifecycle.phases.phase-8-commit-push.validated_at = <ISO-8601>`.
   - Update `task.phase.updated_at = <ISO-8601>`.
   - Mark the task as **technically closed**.
 - This update is **NOT automatic** and **CANNOT be inferred**.
 - Indicate:
   - target branch
   - commit references
   - `changelog.md`
   - `task.md` updated

---

## FAIL (MANDATORY)

10. Declare Phase 8 as **NOT completed**
  - FAIL cases:
    - results not approved
    - incorrect phase
    - commit does not follow Conventional Commits
    - non-existent or incomplete changelog
    - developer does not approve commit/push
    - `git push` failure
  - Mandatory actions:
    - fix commit messages
    - restructure commits
    - update changelog
    - request approval again
  - Terminate blocked: do not advance.

---

## Gate (REQUIRED)

Requirements (all mandatory):
1. All commits follow **Conventional Commits**.
2. `.agent/artifacts/<taskId>-<taskTitle>/changelog.md` exists.
3. The developer has explicitly approved commit and push.
4. Clean working tree (`git status` with no changes).
5. Changes are correctly pushed to the target branch.
6. `task.md` reflects:
 - Phase 8 completed
 - Task technically closed
 - `task.lifecycle.phases.phase-8-commit-push.completed == true`
 - `task.lifecycle.phases.phase-8-commit-push.validated_at` not null
 - `task.phase.updated_at` not null

If Gate FAIL:
- Execute **Step 10 (FAIL)**.
