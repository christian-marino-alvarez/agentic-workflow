---
id: workflow.tasklifecycle-long.phase-5-verification
description: Phase 5 of the task lifecycle. Verifies the implementation with tests (unit and E2E if applicable) and reports metrics and coverage. DOES NOT fix code; if errors are found, delegates a new correction task to the responsible agent.
owner: architect-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["phase5", "phase-5", "verification", "verify"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-5-verification

## Input (REQUIRED)
- The architect's review report created in Phase 4 exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/architect/review.md`
- The current task exists:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- The `task.md` **MUST** reflect:
  - `task.phase.current == aliases.tasklifecycle-long.phases.phase_5.id`

> [!IMPORTANT]
> **Active constitution (MANDATORY)**:
> - Load `constitution.clean_code` before starting
> - Load `constitution.agents_behavior` (section 7: Gates, section 8: Constitution)

## Output (REQUIRED)
- Detailed verification and testing report:
  - `.agent/artifacts/<taskId>-<taskTitle>/verification.md`
- State update in:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

---

## Objective (ONLY)
- Verify the implementation through tests (unit and E2E if applicable).
- **ALWAYS** validate unit tests and E2E tests if applicable.
- Report testing results, coverage, and performance metrics (if applicable).
- Confirm compliance with testing percentages defined in the plan when they exist.
- Obtain explicit developer approval (SI/NO) to advance.

> This phase **DOES NOT implement code**.  
> This phase **DOES NOT fix errors**; it delegates corrections as new tasks.  
> This phase **DOES NOT redefine scope**.

---

## Template (MANDATORY)
- The results report **MUST** be created using the template:
  - `templates.verification`
- If the template does not exist or cannot be loaded → **FAIL**.

---

## Mandatory Steps

0. Activate `qa-agent` and use the mandatory prefix in every message.

1. Assign verification role
   - The `qa-agent` **MUST** execute this verification phase.
   - The `architect-agent` **MUST** supervise and validate the result.

2. Verify inputs
   - `architect/review.md` exists
   - `task.md` exists
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_5.id`
   - If it fails → go to **Step 11 (FAIL)**.

3. Load verification template
   - Load `templates.verification`
   - If it does not exist or cannot be read → go to **Step 11 (FAIL)**.

4. Execute testing
   - Run tests according to the mandatory strategy defined in:
     - `constitution.clean_code`
   - Collect coverage and performance metrics if applicable.

5. Create verification report
   - Create:
     - `.agent/artifacts/<taskId>-<taskTitle>/verification.md`
   - The report **MUST** include:
     - test results (pass/fail)
     - coverage (percentage and scope)
     - performance metrics (if applicable)
     - evidence of compliance with thresholds defined in the plan
   - If there are no tests in the task, the report **MUST** reflect:
     - reviewed reports
     - available evidence
     - justification for the absence of tests

6. Validate plan thresholds (if applicable)
   - Confirm that test percentages defined in `plan.md` are met when they exist.
   - If not met → go to **Step 11 (FAIL)**.

7. Request developer approval (MANDATORY, via console)
   - The developer **MUST** issue a binary decision:
     - **SI** → approved
     - **NO** → rejected
   - Record the decision in `verification.md` with the format:
     ```yaml
     approval:
       developer:
         decision: SI | NO
         date: <ISO-8601>
         comments: <optional>
     ```
   - If `decision != SI` → go to **Step 11 (FAIL)**.

8. PASS
   - Report that Phase 5 is correctly completed.
   - The `architect-agent` **MUST explicitly perform** the following actions:
     - Mark Phase 5 as completed in `task.md`.
     - Set `task.lifecycle.phases.phase-5-verification.completed = true`.
     - Set `task.lifecycle.phases.phase-5-verification.validated_at = <ISO-8601>`.
     - Update `task.phase.updated_at = <ISO-8601>`.
     - Update the state:
       - `task.phase.current = aliases.tasklifecycle-long.phases.phase_6.id`
   - This update is **NOT automatic** and **CANNOT be inferred**.
   - Until this change is reflected in `task.md`, **Phase 6 cannot be started**.
   - Indicate paths:
     - `verification.md`
     - `task.md` updated

---

## FAIL (MANDATORY)

### 11. Declare Phase 5 as **NOT completed**

FAIL cases:
- Non-existent review report.
- Incorrect phase.
- Failure creating `verification.md`.
- Testing thresholds not met (if applicable).
- Failed tests.
- Developer approval = NO or missing.

### 12. Delegate correction (DO NOT fix code)

> [!CAUTION]
> Phase 5 **NEVER fixes code**. It only notifies and delegates.

If test errors are detected:
1. Identify the Phase 4 task responsible for the failed code.
2. Identify the agent that executed that task.
3. Create a **new correction task** in:
   - `.agent/artifacts/<taskId>-<taskTitle>/agent-tasks/fix-<N>-<agent>-<issue>.md`
4. The correction task **MUST** use `templates.agent_task`.
5. The flow returns to Phase 4 to execute the correction task.
6. Only when the correction passes Gate, Phase 5 is re-executed.

Terminate blocked: do not advance phase.

---

## Gate (REQUIRED)

Requirements (all mandatory):
1. `.agent/artifacts/<taskId>-<taskTitle>/verification.md` exists.
2. The report reflects complete and traceable testing results.
3. The `verification.md` starts with the `qa-agent` prefix.
4. The report contains **evidence of test execution**:
   - Test command output logs (`npm test`, `pnpm test`, etc.)
   - Or E2E screenshots/recordings
   - Or documented justification if the task does not require tests
5. Test percentages defined in the plan are met (if applicable).
6. Explicit developer approval exists:
   - `approval.developer.decision == SI`
7. `task.md` reflects:
   - Phase 5 completed
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_6.id`
   - `task.lifecycle.phases.phase-5-verification.completed == true`
   - `task.lifecycle.phases.phase-5-verification.validated_at` not null
   - `task.phase.updated_at` not null

If Gate FAIL:
- Execute **Step 11 (FAIL)**.
