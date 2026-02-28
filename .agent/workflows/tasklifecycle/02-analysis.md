---
id: workflow.tasklifecycle.02-analysis
name: Analysis
description: "Phase 2: Technical analysis of the task scope, affected modules, complexity, and feasibility."
owner: architect-agent
trigger: ["phase-02", "analysis"]
type: static
objective: "Produce a complete technical analysis identifying scope, affected modules, complexity, and risks."
context:
  - .agent/artifacts/<TASK>/task.md
  - .agent/rules/constitution/architecture.md
  - .agent/rules/constitution/layers/backend.md
  - .agent/rules/constitution/layers/background.md
  - .agent/rules/constitution/layers/view.md
input:
  - .agent/artifacts/<TASK>/task.md
output:
  - .agent/artifacts/<TASK>/architect/analysis-v1.md
---

# WORKFLOW: tasklifecycle.02-analysis

## Input
- Task definition: `.agent/artifacts/<TASK>/task.md`
- Architecture constitutions loaded as context.

## Output
- Artifact: `.agent/artifacts/<TASK>/architect/analysis-v1.md`
  - Includes **Subtask Identification** (section §6) with formal list of subtasks for implementation.

## Objective
Produce a thorough technical analysis that identifies task scope, affected modules/layers, current project state, complexity assessment, risks, and **a formal list of subtasks** for the implementation phase. The architect may optionally invoke the `research` subtask if deep technical investigation is needed.

## Instructions
1. **Activate architect-agent** (the UI handles identification — do NOT prefix responses).
2. **Read task.md**: Load the task definition and acceptance criteria.
3. **Optional: Invoke research subtask**: If the task requires deep technical investigation (new technologies, complex integrations, or unfamiliar patterns), invoke the `optional/research` workflow. Output goes to `<TASK>/researcher/research-v1.md`.
4. **Create technical analysis**: Based on acceptance criteria and architecture constitutions, create `analysis-v1.md` in `<TASK>/architect/` covering: scope, affected modules, current state, complexity, risks, and recommendations.
5. **Identify subtasks (MANDATORY)**: Decompose the task into concrete subtasks using the `analysis.md` template section §6. Each subtask must have: id, name, type (backend | background | view | integration | generic), assigned agent, scope, dependencies, and optional workflows.
6. **Update task.md**: Set `current_phase` to `phase-2-analysis` and update subtasks list with identified subtasks (status: `pending`).
7. **Present Analysis (Gate)**: You MUST include artifact reference and gate components in `ui_intent`:

"ui_intent": [
  {
    "type": "artifact",
    "id": "analysis-doc",
    "label": "analysis-v1.md",
    "path": ".agent/artifacts/<TASK>/architect/analysis-v1.md",
    "content": "Technical analysis with subtask identification"
  },
  {
    "type": "gate",
    "id": "gate-eval",
    "label": "Technical Analysis — Review and Approve",
    "options": ["SI", "NO"]
  }
]
8. **On revision**: If gate is rejected, create `analysis-v2.md` (increment version). Never overwrite previous versions.

## Gate
1. Analysis artifact created with complete scope and module assessment.
2. Subtask identification (§6) is complete with at least one subtask defined.
3. Developer has approved the analysis via gate.

## Pass
- Update `task.md`: set `phase-2-analysis` status to `completed`, `current_phase` to `phase-3-planning`.
- Advance to planning phase.

## Fail
- Analysis incomplete or rejected.
- Address developer feedback and re-present with incremented version.