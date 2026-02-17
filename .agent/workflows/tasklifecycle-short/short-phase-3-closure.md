---
id: workflow.tasklifecycle-short.short-phase-3-closure
description: Phase 3 of the Short lifecycle. Merges Verification + Results + Commit.
owner: architect-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["short-phase-3", "closure"]
blocking: true
---

# WORKFLOW: tasklifecycle-short.short-phase-3-closure

## Input (REQUIRED)
- Approved implementation report exists.
- task.md reflects `task.phase.current == "short-phase-3-closure"`

> [!IMPORTANT]
> **Active constitution (MANDATORY)**:
> - Load `constitution.clean_code` before starting
> - Load `constitution.agents_behavior` (section 7: Gates, section 8: Constitution)

## Output (REQUIRED)
- Closure artifact: `.agent/artifacts/<taskId>-<taskTitle>/closure.md`
- Commits performed (if applicable).
- Task completed.

## Objective (ONLY)
- Verify the implementation through tests (if applicable).
- Present results to the developer.
- Obtain final acceptance.
- Consolidate and perform commit.

> This phase **DOES NOT implement new code**.  
> This phase **CLOSES the task lifecycle**.

---

## Mandatory Steps

0. Activate `architect-agent` and use the mandatory prefix in every message.

### 1. Pre-Flight Validation Protocol (MANDATORY)
- The agent **MUST** physically read the approved implementation report: `.agent/artifacts/<taskId>-<taskTitle>/architect/implementation.md`.
- **Explicitly cite** the approval decision (e.g.: "Status: APPROVED").
- If the report does not exist or is not approved, the process **MUST** stop immediately (FAIL).
- Verify that the phase in `task.md` is correct.

### 2. Execute verification
- **ALWAYS** validate unit tests and E2E tests if applicable.
- Run tests according to `constitution.clean_code`.
- Document results.

If tests are not required (justified exception):
- Document robust justification.

### 3. Create closure.md artifact
- Use template `templates.closure`.
- Include:
  - Verification summary.
  - Status of each acceptance criterion (✅/❌).
  - Test evidence (if applicable).

### 4. Present results to the developer
- Show closure.md.
- Resolve questions.
- Request final acceptance via console (SI/NO) and record it in `closure.md`.

### 6. Evaluate agents (MANDATORY)
- Request score (1-10) from the developer for each agent that participated.
- **MANDATORY GATE**: Without scores, the task CANNOT be closed.
- Record the scores in `closure.md`.

### 7. Consolidate commits
If there are code changes:
- Prepare commits following Conventional Commits.
- Request developer approval for push.

### 8. PASS
- Report that Phase 3 (Closure) is correctly completed.
- The `architect-agent` **MUST explicitly perform** the following actions:
  - Mark the task as **COMPLETED** in `task.md`.
  - Set `task.lifecycle.phases.short-phase-3-closure.completed = true`.
  - Set `task.lifecycle.phases.short-phase-3-closure.validated_at = <ISO-8601>`.
  - Update `task.phase.updated_at = <ISO-8601>`.
  - Mark the task as **technically closed**.
- This update is **NOT automatic** and **CANNOT be inferred**.
- Generate changelog (if applicable).
- Indicate paths:
  - `closure.md`
  - `task.md` updated

---

## Gate (REQUIRED)
Requirements (all mandatory):
1. closure.md exists with correct template.
2. The `closure.md` starts with the `architect-agent` prefix.
3. All acceptance criteria are marked.
4. Final developer acceptance exists.
5. Agent scores have been recorded in `closure.md`.
6. Commits performed (if applicable).
7. task.md reflects the task as completed.
8. task.md reflects timestamp and state:
   - `task.lifecycle.phases.short-phase-3-closure.completed == true`
   - `task.lifecycle.phases.short-phase-3-closure.validated_at` not null
   - `task.phase.updated_at` not null

If Gate FAIL:
- Indicate which requirement is missing.
- Block until resolved.
