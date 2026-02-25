---
id: workflow.tasklifecycle-long.phase-6-results-acceptance
owner: architect-agent
description: "Phase 6 of the task lifecycle. Presents the final results report and requires explicit developer acceptance (SI/NO)."
version: 1.0.0
trigger: ["phase6", "phase-6", "results", "acceptance"]
type: static
context:
  - .agent/rules/constitution/architecture/index.md
  - .agent/rules/constitution/backend.md
  - .agent/rules/constitution/background.md
  - .agent/rules/constitution/view.md
---

# WORKFLOW: tasklifecycle.phase-6-results-acceptance

## Input
- The verification report exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/verification.md`
- The current task exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- The `task.md` **MUST** reflect:
  - `task.phase.current == aliases.tasklifecycle-long.phases.phase_6.id`

> [!IMPORTANT]
> **Active constitution**:
> - Load `constitution.clean_code` before starting
> - Load `constitution.agents_behavior` (section 7: Gates, section 8: Constitution)

- Template: `templates.results_acceptance` (if it does not exist or cannot be loaded → FAIL)

## Output
- Create the results acceptance report:
  - `.agent/artifacts/<taskId>-<taskTitle>/results-acceptance.md`
- Final developer decision:
  - **SI / NO**
- State update in:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objective
- Present a **final results report** based on the verification.
- Provide the developer with a **complete and clear vision** of the work performed.
- Obtain an **explicit final acceptance (SI/NO)** from the developer.

> This phase **DOES NOT implement code**.
> This phase **CLOSES the results evaluation**.

## Instructions

0. Activate `architect-agent` and use the mandatory prefix in every message.

1. Verify inputs
   - `verification.md` exists
   - `task.md` exists
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_6.id`
   - If it fails → FAIL.

2. Load results template
   - Load `templates.results_acceptance`
   - If it does not exist or cannot be read → FAIL.

3. Create results report
   - Create:
     - `.agent/artifacts/<taskId>-<taskTitle>/results-acceptance.md`
   - The report **MUST** include:
     - verification summary
     - final acceptance criteria status

4. Present results to the developer
   - The `architect-agent` **MUST** present the `results-acceptance.md` report.
   - Resolve questions without modifying scope or documented results.

5. Request final developer acceptance (via console)
   - The developer **MUST** issue a binary decision:
     - **SI** → accepts the results
     - **NO** → does not accept the results
   - Record the decision in `results-acceptance.md`:
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
1. `.agent/artifacts/<taskId>-<taskTitle>/results-acceptance.md` exists.
2. The report summarizes verification and final acceptance criteria status.
3. The `results-acceptance.md` starts with the `architect-agent` prefix.
4. All acceptance criteria are marked as ✅ in the report.
5. Explicit final developer acceptance exists (via console):
   - `approval.developer.decision == SI`
6. `task.md` reflects:
  - Phase 6 completed
  - `task.phase.current == aliases.tasklifecycle-long.phases.phase_7.id`
  - `task.lifecycle.phases.phase-6-results-acceptance.completed == true`
  - `task.lifecycle.phases.phase-6-results-acceptance.validated_at` not null
  - `task.phase.updated_at` not null

## Pass
- Report that Phase 6 is correctly completed.
- Mark the results report as **ACCEPTED**.
- The `architect-agent` **MUST explicitly perform** the following actions:
  - Mark Phase 6 as completed in `task.md`.
  - Set `task.lifecycle.phases.phase-6-results-acceptance.completed = true`.
  - Set `task.lifecycle.phases.phase-6-results-acceptance.validated_at = <ISO-8601>`.
  - Update `task.phase.updated_at = <ISO-8601>`.
  - Update the state:
    - `task.phase.current = aliases.tasklifecycle-long.phases.phase_7.id`
- This update is **NOT automatic** and **CANNOT be inferred**.
- Until this change is reflected in `task.md`, **Phase 7 cannot be started**.
- Indicate paths:
  - `results-acceptance.md`
  - `task.md` updated

## Fail
- Declare Phase 6 as **NOT completed**.
- FAIL cases:
  - missing required report
  - incorrect phase
  - failure creating `results-acceptance.md`
  - developer acceptance = NO or missing
- Mandatory actions:
  - analyze the indicated non-compliances
  - **iterate to resolve detected issues**
- Terminate blocked: do not advance phase.
