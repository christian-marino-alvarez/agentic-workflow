---
id: workflow.tasklifecycle-short.short-phase-1-brief
owner: architect-agent
description: "Phase 1 of the Short lifecycle. Creates analysis and planning based on the approved acceptance criteria."
version: 3.0.0
trigger: ["short-phase-1", "brief"]
type: static
models:
  default: gemini-2.5-pro
  routing: gemini-2.5-flash
context:
  - .agent/artifacts/candidate/init.md
  - .agent/artifacts/<taskId>-<taskTitle>/acceptance.md
  - .agent/rules/constitution/architecture/index.md
  - .agent/rules/constitution/backend.md
  - .agent/rules/constitution/background.md
  - .agent/rules/constitution/view.md
---

# WORKFLOW: tasklifecycle-short.short-phase-1-brief

## Input
- Approved acceptance criteria from Phase 0: `.agent/artifacts/<taskId>-<taskTitle>/acceptance.md`
- Task candidate with `task.strategy: short`.
- The project's modular architecture constitution is loaded as context.

## Output
- Artifact: `.agent/artifacts/<taskId>-<taskTitle>/analysis.md` (using `templates.analysis`)
- Artifact: `.agent/artifacts/<taskId>-<taskTitle>/planning.md` (using `templates.planning`)
- Artifacts: `.agent/artifacts/<taskId>-<taskTitle>/subtask-<n>-plan.md` (one per subtask)

## Objective
Create a technical analysis identifying task scope and complexity, and create a detailed implementation plan with subtask delegation. If the task is too complex for the Short strategy, warn the user and recommend switching to the Long strategy.

## Instructions
1. **Activate architect-agent** and use the mandatory prefix `🏛️ architect-agent:` in every response.
2. **Read acceptance criteria**: Load the `acceptance.md` artifact from Phase 0. This contains the verifiable acceptance criteria approved by the developer.
3. **Create technical analysis**: Based on the acceptance criteria and the architecture constitution, create the `analysis.md` artifact following the `templates.analysis` structure. Identify the task scope, affected modules, current project state, and evaluate complexity. If the task is too large for the Short strategy, warn the developer and offer to switch.
4. **Create implementation plan with subtask delegation**: Create the `planning.md` artifact following the `templates.planning` structure. For each subtask:
   - Create an individual subtask plan artifact: `.agent/artifacts/<taskId>-<taskTitle>/subtask-<n>-plan.md`
   - Each subtask plan MUST include: **owner** (the designated agent, e.g. `backend-agent`, `view-agent`, `background-agent`), scope, files affected, and acceptance criteria for that subtask.
5. **Present Implementation Plan (Gate)**: After the analysis, planning, and all subtask plans are created, present the overall planning for approval using `<a2ui type="gate" id="gate-eval" label="Implementation Plan — Review and Approve">`, including a summary of the analysis and all subtasks in its body. This is MANDATORY — it triggers the lifecycle engine to advance to Phase 2.

## Gate
1. All output artifacts have been created successfully (`analysis.md`, `planning.md`, `subtask-<n>-plan.md`).
2. The developer has accepted the overall planning and analysis via the Gate evaluation `<a2ui type="gate">`.

## Pass
- Analysis and planning have been accepted by the developer.
- The lifecycle engine will automatically advance to `workflow.tasklifecycle-short.short-phase-2-implementation`.

## Fail
- The output artifacts have not been created.
- The analysis has not been accepted by the developer.
- The planning has not been accepted by the developer.
