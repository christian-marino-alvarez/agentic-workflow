---
id: workflow.tasklifecycle-short.short-phase-1-brief
description: Phase 1 of the Short cycle. Merges Acceptance + Analysis + Planning. Includes 5 mandatory questions and complexity detection.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["short-phase-1", "brief"]
blocking: true
---

# WORKFLOW: tasklifecycle-short.short-phase-1-brief

## Input (REQUIRED)
- Task candidate exists.
- `task.strategy == "short"`.

## Output (REQUIRED)
- Create `brief.md` using `templates.brief`.
- Create `acceptance.md` using `templates.acceptance`.

## Reasoning (MANDATORY)
- Before executing, the architect-agent must explain to the developer what will be done and why.
- No document is required for this step.

## Mandatory Steps

0. **Role Activation and Prefix (MANDATORY)**
   - The `architect-agent` **MUST** begin its intervention by identifying itself.
   - Message: `🏛️ **architect-agent**: Starting Phase 1 Short - Brief.`

1. Verify inputs
   - Task candidate exists.
   - `task.strategy == "short"`.

2. Execute 5 mandatory questions.
   - Generate them dynamically from the task description to clarify scope, inputs, outputs, constraints, and success criteria.

3. Complexity analysis.

4. Create artifacts (`brief.md` and `acceptance.md`) using templates.

5. Request developer approval (via console)
   - Require binary decision **YES**.
   - Record in `brief.md`: `decision: YES`.

6. PASS
   - Update `task.md` (using prefix):
     - Mark phase as completed.
     - Set timestamps and advance to Phase 2 Short.

## Pass
- `brief.md` and `acceptance.md` are created from templates.
- Developer approval is recorded in `brief.md`.

## Gate (REQUIRED)
Requirements (all mandatory):
1. `brief.md` and `acceptance.md` exist with correct templates.
2. Explicit developer approval is recorded in `brief.md`:
   - `approval.developer.decision == YES`
3. `task.md` reflects timestamps and state:
   - `task.lifecycle.phases.short-phase-1-brief.completed == true`
   - `task.lifecycle.phases.short-phase-1-brief.validated_at` is not null
   - `task.phase.updated_at` is not null

If Gate FAIL:
- Block until resolved.
