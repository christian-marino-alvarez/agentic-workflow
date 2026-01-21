---
id: workflow.tasklifecycle-short.short-phase-3-closure
description: Phase 3 of the Short cycle. Merges Verification + Results + Commit.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["short-phase-3", "closure"]
blocking: true
---

# WORKFLOW: tasklifecycle-short.short-phase-3-closure

## Input (REQUIRED)
- Approved implementation report exists.
- Current task exists.
- `task.phase.current == aliases.taskcycle-short.phases.short_phase_3.id`.

## Output (REQUIRED)
- Create `closure.md` using `templates.closure`.

## Reasoning (MANDATORY)
- Before executing, the architect-agent must explain to the developer what will be done and why.
- No document is required for this step.

## Mandatory Steps

0. **Role Activation and Prefix (MANDATORY)**
   - The `architect-agent` **MUST** begin its intervention by identifying itself.
   - Message: `🏛️ **architect-agent**: Starting Phase 3 Short - Closure.`

1. Pre-Flight Validation Protocol (MANDATORY)
   - Physically read the approved implementation report.
   - **Explicitly cite** approval: `decision: YES`.

2. Execute technical verification.

3. Create `closure.md` artifact using `templates.closure`.

4. Request final acceptance via console (YES) and record it in `closure.md`.

5. Evaluate agents (MANDATORY)
   - Request score (1-10) from the developer for each agent.
   - **MANDATORY GATE**: Without scores, the task CANNOT be closed.

6. Consolidate commits following Conventional Commits.

7. PASS
   - Mark task as **COMPLETED** in `task.md` (using prefix).
   - Set final timestamps.

## Pass
- `closure.md` is created from `templates.closure`.
- Final developer acceptance is recorded.

## Gate (REQUIRED)
Requirements (all mandatory):
1. `closure.md` exists with final developer acceptance (**YES**).
2. Agent scores have been recorded.
3. `task.md` reflects the task as completed and closed.
4. `task.md` reflects timestamps and state:
   - `task.lifecycle.phases.short-phase-3-closure.completed == true`
   - `task.lifecycle.phases.short-phase-3-closure.validated_at` is not null
   - `task.phase.updated_at` is not null

If Gate FAIL:
- Block until resolved.
