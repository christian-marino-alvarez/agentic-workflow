---
id: workflow.tasklifecycle.phase-6-results-acceptance
description: Task cycle Phase 6. Presents the final results report and requires explicit developer acceptance (YES/NO).
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["phase6", "phase-6", "results", "acceptance"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-6-results-acceptance

## Input (REQUIRED)
- Verification report exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/verification.md`
- Current task exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- `task.md` **MUST** reflect:
  - `task.phase.current == aliases.taskcycle-long.phases.phase_6.id`

> [!IMPORTANT]
> **Active Constitution (MANDATORY)**:
> - Load `constitution.project_architecture` before starting
> - Load `constitution.agents_behavior` (Section 7: Gates, Section 8: Constitution)

## Output (REQUIRED)
- Create results acceptance report:
  - `.agent/artifacts/<taskId>-<taskTitle>/results-acceptance.md`
- Final developer decision (MANDATORY): **YES / NO**
- Status update in `task.md`.

## Objective (ONLY)
- Present a **final results report** based on verification.
- Obtain a **final explicit acceptance (YES)** from the developer.

## Template (MANDATORY)
- The report **MUST** be created using `templates.results_acceptance`.

---

## Reasoning (MANDATORY)
- Before executing, the responsible agent must explain to the developer what will be done and why.
- No document is required for this step.

## Mandatory Steps

0. **Role Activation and Prefix (MANDATORY)**
   - The `architect-agent` **MUST** begin its intervention by identifying itself.
   - Message: `🏛️ **architect-agent**: Starting Phase 6 - Results Acceptance.`

1. Verify inputs
   - `verification.md` and `task.md` exist.

2. Load template and create `results-acceptance.md`.

3. Request final developer acceptance (MANDATORY, via console)
   - Require binary decision **YES**.
   - Record in `results-acceptance.md`: `decision: YES`.

4. PASS
   - Update `.agent/artifacts/<taskId>-<taskTitle>/task.md` (using prefix).
   - Mark phase completed and advance to Phase 7.

## Pass
- All required artifacts are created from templates.
- Developer approval is recorded where required.

## Gate (REQUIRED)
Requirements (all mandatory):
1. `results-acceptance.md` exists with Gate PASS (`decision: YES`).
2. `task.md` reflects timestamps and state:
   - `task.phase.current == aliases.taskcycle-long.phases.phase_7.id`
   - `task.lifecycle.phases.phase-6-results-acceptance.completed == true`
   - `task.lifecycle.phases.phase-6-results-acceptance.validated_at` not null
   - `task.phase.updated_at` not null

If Gate FAIL:
- Execute **FAIL**.
