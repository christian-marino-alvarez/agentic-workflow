---
id: workflow.tasklifecycle-short.short-phase-3-closure
name: Short Phase 3 - Closure
owner: architect-agent
description: "Phase 3 of the Short lifecycle. Merges Verification + Results + Commit."
version: 3.0.0
trigger: ["short-phase-3", "closure"]
type: static
models:
  default: gemini-2.5-pro
  routing: gemini-2.5-flash
context:
  - .agent/artifacts/<taskId>-<taskTitle>/subtask-1.md
  - .agent/artifacts/<taskId>-<taskTitle>/subtask-2.md
  - .agent/artifacts/<taskId>-<taskTitle>/subtask-n.md
---

# WORKFLOW: tasklifecycle-short.short-phase-3-closure

## Input
- All subtask artifacts from Phase 2: `.agent/artifacts/<taskId>-<taskTitle>/subtask-<n>.md`

## Output
> ⚠️ **All artifacts MUST be created under the active task path: `.agent/artifacts/<taskId>-<taskTitle>/`**

- Results report: `.agent/artifacts/<taskId>-<taskTitle>/closure.md` (using `templates.closure`)

## Objective
Present a consolidated results report covering all subtasks executed in the implementation phase.

## Instructions
1. All artifacts created during this phase MUST be saved under `.agent/artifacts/<taskId>-<taskTitle>/`. Never create artifacts outside this path.
2. Create a document that consolidates and details all subtasks from the implementation phase, including links to each subtask report.
3. The document must be technical and detailed, including all relevant information from each subtask.
4. Compare whether the acceptance criteria defined in Phase 1 have been fulfilled, determining if the objectives were met.
5. Use `<a2ui>` for all results presentation in a visual and graphic format.
6. If the developer accepts, close the task.

## Gate
1. The consolidated document covering all implementation subtasks must be presented.
2. A comparison against the Phase 1 acceptance criteria must be included.
3. The document must be validated and accepted by the developer via `<a2ui type="choice" id="approve-closure" label="Do you accept the final results?">` with options `SI` and `NO`.

## Pass
- If accepted by the developer, the task is closed.

## Fail
- If any gate requirement is not met, display a warning using `<a2ui type="info">` so the developer can review and decide how to proceed.
