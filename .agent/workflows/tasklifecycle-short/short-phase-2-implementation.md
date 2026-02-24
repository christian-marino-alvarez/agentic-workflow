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
2. Follow the Phase 1 planning faithfully.
3. Before executing any code, create as many dynamic subtask artifacts as the planning defines, using `templates.subtask_implementation` for each subtask.
4. Execute all subtasks defined in the previous step in sequential order. Each subtask must be approved one after another by the developer via `<a2ui>`.
5. Before delivering results for each subtask, validate that it meets the planning objectives using `<a2ui type="choice" id="validate-subtask-<n>" label="Does subtask <n> meet the planning objectives?">` with options `SI` and `NO`.
6. Validate that each subtask has no code errors using `<a2ui type="choice" id="no-errors-subtask-<n>" label="Is subtask <n> free of code errors?">` with options `SI` and `NO`.
7. Present the results for each subtask using `<a2ui type="results" id="approve-subtask-<n>" path=".agent/artifacts/<taskId>-<taskTitle>/subtask-<n>.md" label="Subtask <n> — Results">` with the acceptance criteria checklist in the body. The `path` attribute is MANDATORY so the developer can open the document before accepting.

## Gate
1. All subtasks defined in the Phase 1 planning have been executed.
2. All results presentations have been validated and accepted by the developer via `<a2ui>`.

## Pass
- All subtasks have been accepted by the developer.
- The lifecycle engine will automatically advance to `workflow.tasklifecycle-short.short-phase-3-closure`.

## Fail
- If any gate requirement is not met, display a warning using `<a2ui type="info">` clearly stating which subtask or requirement is pending.
