---
id: workflow.tasklifecycle-short.short-phase-1-brief
description: Phase 1 of the Short lifecycle. Merges Acceptance + Analysis + Planning. Includes 5 mandatory questions and complexity detection.
owner: architect-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["short-phase-1", "brief"]
blocking: true
---

# WORKFLOW: tasklifecycle-short.short-phase-1-brief

## Input (REQUIRED)
- Task candidate exists with `task.strategy: short`.
- The developer has provided a title and objective.

> [!IMPORTANT]
> **Active constitution (MANDATORY)**:
> - Load `constitution.clean_code` before starting
> - Load `constitution.agents_behavior` (section 7: Gates, section 8: Constitution)

## Output (REQUIRED)
- Artifact: `.agent/artifacts/<taskId>-<taskTitle>/brief.md`
- Artifact: `.agent/artifacts/<taskId>-<taskTitle>/acceptance.md` (NEW)
- Task updated with current phase = `short-phase-1-brief`

## Objective (ONLY)
- Execute the **5 mandatory questions** to define acceptance criteria.
- Perform a **deep analysis** to detect complexity.
- Create a **simplified implementation plan**.
- If high complexity is detected, **offer to abort** and restart in Long mode.

> This phase **DOES NOT implement code**.  
> This phase **REQUIRES explicit developer approval (SI/NO)**.

---

## Mandatory Steps

0. Activate `architect-agent` and use the mandatory prefix in every message.

### 1. Verify inputs
- Task candidate exists.
- `task.strategy == "short"`.
- If it fails → **FAIL**.

### 2. Execute 5 mandatory questions
The architect-agent **MUST** formulate 5 specific questions based on the task:
- Questions vary depending on the specific task.
- Without complete answers, the phase DOES NOT advance.

### 3. Complexity analysis
Evaluate complexity indicators:
- Does it affect more than 3 packages/modules? → High
- Does it require external API research? → High
- Does it introduce breaking changes? → High
- Does it need complex E2E tests? → High

**If complexity is HIGH**:
- Notify the developer.
- Offer the option to abort and create a new task in Long mode.
- If the developer decides to abort → terminate the phase with "aborted" status.
### 4. Create artifacts (brief.md and acceptance.md)
- Use templates `templates.brief` and `templates.acceptance`.
- In `acceptance.md` include:
  - Acceptance criteria derived from the 5 questions.
- In `brief.md` include:
  - Simplified analysis of the current state.
  - Implementation plan with executable steps.
  - Complexity evaluation.
  - **Agent Evaluation**: Performance and improvement proposals.

### 5. Request developer approval (via console)
```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <optional>
```
- If `decision != SI` → **FAIL**.

### 6. PASS
- Report that Phase 1 (Brief) is correctly completed.
- The `architect-agent` **MUST explicitly perform** the following actions:
  - Mark the phase as completed in `task.md`.
  - Set `task.lifecycle.phases.short-phase-1-brief.completed = true`.
  - Set `task.lifecycle.phases.short-phase-1-brief.validated_at = <ISO-8601>`.
  - Update `task.phase.updated_at = <ISO-8601>`.
  - Update the state:
    - `task.phase.current = short-phase-2-implementation`
- This update is **NOT automatic** and **CANNOT be inferred**.
- Until this change is reflected in `task.md`, **Phase 2 cannot be started**.
- Indicate paths:
  - `brief.md`
  - `acceptance.md`
  - `task.md` updated

---

## Gate (REQUIRED)
Requirements (all mandatory):
1. `brief.md` and `acceptance.md` exist with correct templates.
2. The `brief.md` starts with the `architect-agent` prefix.
3. All 5 questions have been answered.
4. The complexity evaluation is documented.
5. Explicit developer approval exists.
6. task.md reflects the phase as completed.
7. task.md reflects timestamp and state:
   - `task.lifecycle.phases.short-phase-1-brief.completed == true`
   - `task.lifecycle.phases.short-phase-1-brief.validated_at` not null
   - `task.phase.updated_at` not null

If Gate FAIL:
- Indicate which requirement is missing.
- Block until resolved.
