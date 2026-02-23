---
id: workflow.tasklifecycle-short.short-phase-2-implementation
owner: architect-agent
description: "Phase 2 of the Short lifecycle. Executes implementation according to the approved brief."
version: 1.0.0
trigger: ["short-phase-2", "implementation"]
type: static
---

# WORKFLOW: tasklifecycle-short.short-phase-2-implementation

## Input
- Approved brief exists: `.agent/artifacts/<taskId>-<taskTitle>/brief.md`
- task.md reflects `task.phase.current == "short-phase-2-implementation"`

> [!IMPORTANT]
> **Active constitution**:
> - Load `constitution.clean_code` before starting
> - Load `constitution.agents_behavior` (section 7: Gates, section 8: Constitution)
> - Load domain-specific constitutions as required by the task

## Output
- Code implemented according to the brief plan.
- Implementation report: `.agent/artifacts/<taskId>-<taskTitle>/architect/implementation.md`
- Task updated.

## Objective
- Execute all implementation subtasks defined in the brief.
- Allow the architect-agent to verify coherence with the plan.
- Generate an architectural review report.

> This phase **DOES implement code**.
> This phase **DOES NOT redefine scope**.

## Instructions

0. Activate `architect-agent` and use the mandatory prefix in every message.

### 1. Pre-Flight Validation Protocol
- The agent **MUST** physically read the previous phase artifact: `.agent/artifacts/<taskId>-<taskTitle>/brief.md`.
- **Explicitly cite** the developer's decision (e.g.: "Approved: SI") and the timestamp if it exists.
- If the file does not exist or does not have an affirmative approval mark, the process **MUST** stop immediately (FAIL).
- Verify that the phase in `task.md` is correct.

### 2. Execute implementation
- Follow the steps defined in `brief.md`.
- Document changes made.
- Document technical decisions.

### 3. Architectural review
The architect-agent **MUST** verify:
- Coherence with the brief plan.
- Compliance with architecture and clean code rules.
- Fulfillment of acceptance criteria.

### 4. Create implementation report
- Create `.agent/artifacts/<taskId>-<taskTitle>/architect/implementation.md`
- Include:
  - Changes made.
  - Modified/created files.
  - Technical decisions.
  - Status: APPROVED | REJECTED.

### 5. Request developer approval (via console)
- The developer **MUST** approve the implementation:
  - **SI** → approved
  - **NO** → rejected
- Record the decision in `architect/implementation.md`:
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
1. Implementation coherent with brief.
2. The `architect/implementation.md` starts with the `architect-agent` prefix.
3. Implementation report exists with APPROVED status.
4. Explicit developer approval recorded in `architect/implementation.md`:
   - `approval.developer.decision == SI`
5. task.md reflects the phase as completed.
6. task.md reflects timestamp and state:
   - `task.lifecycle.phases.short-phase-2-implementation.completed == true`
   - `task.lifecycle.phases.short-phase-2-implementation.validated_at` not null
   - `task.phase.updated_at` not null

## Pass
- Report that Phase 2 (Implementation) is correctly completed.
- The `architect-agent` **MUST explicitly perform** the following actions:
  - Mark the phase as completed in `task.md`.
  - Set `task.lifecycle.phases.short-phase-2-implementation.completed = true`.
  - Set `task.lifecycle.phases.short-phase-2-implementation.validated_at = <ISO-8601>`.
  - Update `task.phase.updated_at = <ISO-8601>`.
  - Update the state:
    - `task.phase.current = short-phase-3-closure`
- This update is **NOT automatic** and **CANNOT be inferred**.
- Until this change is reflected in `task.md`, **Phase 3 cannot be started**.
- Indicate paths:
  - `architect/implementation.md`
  - `task.md` updated

## Fail
- Iterate to fix issues.
- Do not advance until resolved.
