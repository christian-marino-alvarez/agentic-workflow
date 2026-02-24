---
id: workflow.tasklifecycle-short.short-phase-1-brief
owner: architect-agent
description: "Phase 1 of the Short lifecycle. Defines acceptance criteria, creates analysis, and creates planning."
version: 2.1.0
trigger: ["short-phase-1", "brief"]
type: static
models:
  default: gemini-2.5-pro
  routing: gemini-2.5-flash
context:
  - .agent/artifacts/candidate/init.md
---

# WORKFLOW: tasklifecycle-short.short-phase-1-brief

## Input
- Task candidate exists with `task.strategy: short`.
- The developer has provided a title and objective (from init workflow).
- Templates: `artifacts.candidate.init`

## Output
- Artifact: `.agent/artifacts/<taskId>-<taskTitle>/acceptance.md` (using `templates.acceptance`)
- Artifact: `.agent/artifacts/<taskId>-<taskTitle>/analysis.md` (using `templates.analysis`)
- Artifact: `.agent/artifacts/<taskId>-<taskTitle>/planning.md` (using `templates.planning`)

## Objective
Define acceptance criteria through 5 mandatory questions, create a technical analysis identifying task scope and complexity, and create an implementation plan based on that analysis. If the task is too complex for the Short strategy, warn the user and recommend switching to the Long strategy.

## Instructions
1. **Activate architect-agent** and use the mandatory prefix `🏛️ architect-agent:` in every response.
2. **Ask 3 acceptance criteria questions (ONE AT A TIME)**: The task title and objective are already known from the init phase. Ask only the 3 remaining questions needed to define acceptance criteria. Use `<a2ui type="input">` for each. Plain-text questions are FORBIDDEN — every question MUST be wrapped in `<a2ui>`.
   - Q1: `<a2ui type="input" id="q1-success" label="What are the specific success criteria? (How will we know this is done?)"></a2ui>`
   - Q2: `<a2ui type="input" id="q2-scope" label="What is explicitly OUT of scope for this task?"></a2ui>`
   - Q3: `<a2ui type="input" id="q3-constraints" label="Are there any technical constraints or dependencies to consider?"></a2ui>`
3. **Create acceptance criteria**: Using the title, objective, and the developer's 3 answers, create the `acceptance.md` artifact following the `templates.acceptance` structure.
4. **Create technical analysis**: Based on the established acceptance criteria, create the `analysis.md` artifact following the `templates.analysis` structure. Identify the task scope, affected modules, current project state, and evaluate complexity. If the task is too large for the Short strategy, warn the developer and offer to switch via `<a2ui type="choice" id="switch-strategy">`. Present the analysis for inline approval via `<a2ui type="choice" id="approve-analysis" label="Do you approve this analysis?">` with options `SI` and `NO`.
5. **Create implementation plan**: Create the `planning.md` artifact following the `templates.planning` structure. Present for inline approval via `<a2ui type="choice" id="approve-planning" label="Do you approve this plan?">` with options `SI` and `NO`.
6. **Create all output artifacts**: Ensure all artifacts defined in the Output section have been created.

## Gate
1. Acceptance criteria have been defined and `acceptance.md` has been created.
2. All output artifacts have been created successfully (`acceptance.md`, `analysis.md`, `planning.md`).
3. The developer has accepted the analysis via `<a2ui>`.
4. The developer has accepted the planning via `<a2ui>`.

## Pass
- Analysis and planning have been accepted by the developer.
- The lifecycle engine will automatically advance to `workflow.tasklifecycle-short.short-phase-2-implementation`.

## Fail
- The output artifacts have not been created.
- The acceptance criteria have not been accepted.
- The analysis has not been accepted by the developer.
- The planning has not been accepted by the developer.
