---
id: workflow.tasklifecycle-short.short-phase-2-implementation
name: Short Phase 2 - Implementation
owner: architect-agent
description: "Phase 2 of the Short lifecycle. Executes implementation according to the approved brief."
version: 3.0.0
trigger: ["short-phase-2", "implementation"]
type: static
models:
  default: gemini-2.5-pro
  routing: gemini-2.5-flash
context:
  - .agent/artifacts/<taskId>-<taskTitle>/planning.md
  - .agent/rules/constitution/architecture/index.md
  - .agent/rules/constitution/backend.md
  - .agent/rules/constitution/background.md
  - .agent/rules/constitution/view.md
---

# WORKFLOW: tasklifecycle-short.short-phase-2-implementation

## Input
- Approved planning from Phase 1: `.agent/artifacts/<taskId>-<taskTitle>/planning.md`

## Output
> ⚠️ **All artifacts MUST be created under the active task path: `.agent/artifacts/<taskId>-<taskTitle>/`**

- One implementation artifact per subtask: `.agent/artifacts/<taskId>-<taskTitle>/subtask-<n>.md` (using `templates.subtask_implementation`)

## Objective
Carry out the implementation defined in the Phase 1 planning.

## Instructions
1. All artifacts created during this phase MUST be saved under `.agent/artifacts/<taskId>-<taskTitle>/`. Never create artifacts outside this path.
2. Read the Phase 1 planning (`planning.md`). You MUST use the `list_dir` and `view_file` tools to proactively read the directory `.agent/artifacts/<taskId>-<taskTitle>/` and load all approved subtask plans (`subtask-<n>-plan.md`) to identify each subtask and its **designated agent owner**.
3. Execute subtasks in sequential order. For each subtask:
   a. **Delegate to the designated agent**: The architect MUST activate the agent assigned as owner in the subtask plan (e.g. `backend-agent`, `view-agent`, etc.) and provide the subtask plan as context.
   b. **Agent implements**: The designated agent executes the implementation following the subtask plan scope and acceptance criteria.
   c. **Agent presents results**: After completing the implementation, the designated agent presents what was done — explaining the changes made, files modified, and how the subtask acceptance criteria were met.
   d. **Developer validates**: Present the results for developer approval using `<a2ui type="choice" id="approve-subtask-<n>" label="Subtask <n> — Results (by <agent-name>)">` with `SI` and `NO`, and include the acceptance criteria checklist in the body.
4. **Present Implementation Results (Gate)**: After ALL subtasks have been implemented and individually accepted, present the final gate using `<a2ui type="gate" id="gate-eval" label="Phase 2 Implementation — Final Review">` summarizing the completed subtasks in its body. This is MANDATORY — the developer must approve (SI) to pass the gate and trigger the lifecycle engine to advance to Phase 3.

## Gate
1. All subtasks defined in the Phase 1 planning have been executed.
2. All subtask implementations have been validated and accepted individually.
3. The overall implementation has been approved by the developer via `<a2ui type="gate">`.

## Pass
- All subtasks have been accepted by the developer.
- The lifecycle engine will automatically advance to `workflow.tasklifecycle-short.short-phase-3-closure`.

## Fail
- If any gate requirement is not met, display a warning using `<a2ui type="info">` clearly stating which subtask or requirement is pending.
