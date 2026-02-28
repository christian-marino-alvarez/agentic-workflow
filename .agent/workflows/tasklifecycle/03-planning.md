---
id: workflow.tasklifecycle.03-planning
name: Planning
description: "Phase 3: Implementation plan with subtask delegation to specialized agents."
owner: architect-agent
trigger: ["phase-03", "planning"]
type: static
objective: "Create a detailed implementation plan with subtask delegation, agent assignment, and execution order."
context:
  - .agent/artifacts/<TASK>/architect/analysis-v1.md
  - .agent/rules/constitution/architecture.md
input:
  - .agent/artifacts/<TASK>/architect/analysis-v1.md
output:
  - .agent/artifacts/<TASK>/architect/planning-v1.md
---

# WORKFLOW: tasklifecycle.03-planning

## Input
- Approved analysis: `.agent/artifacts/<TASK>/architect/analysis-v1.md`
  - Including the Subtask Identification (§6) with formal subtask list.

## Output
- Artifact: `.agent/artifacts/<TASK>/architect/planning-v1.md` (global plan)
- Artifacts: `.agent/artifacts/<TASK>/architect/ST-N-<name>.md` (one subtask plan per subtask)

## Objective
Define the implementation plan based on the approved analysis. Create a global strategy overview and **individual subtask plans** for each subtask identified in the analysis. Each subtask plan details its scope, acceptance criteria, agent assignment, workflow to invoke, and optional workflows.

## Instructions
1. **Activate architect-agent** (the UI handles identification — do NOT prefix responses).
2. **Read analysis subtasks**: Load the subtask list from analysis §6.
3. **Create global plan**: Create `planning-v1.md` in `<TASK>/architect/` with: strategy overview, execution order, agent assignments, and estimated effort.
4. **Create subtask plans (MANDATORY)**: For each subtask in the analysis:
   - Create `.agent/artifacts/<TASK>/architect/ST-N-<name>.md` using `templates.subtask_plan`.
   - Fill in: objective, affected files, subtask-specific acceptance criteria, technical specifications, workflow assignment, and optional workflows.
   - Each subtask plan must be **self-contained** — an agent should be able to execute it without needing to read the global plan.
5. **Update task.md**: Set `current_phase` to `phase-3-planning`.
6. **Present Planning (Gate)**: You MUST include artifact reference and gate components in `ui_intent`:

"ui_intent": [
  {
    "type": "artifact",
    "id": "planning-doc",
    "label": "planning-v1.md",
    "path": ".agent/artifacts/<TASK>/architect/planning-v1.md",
    "content": "Global implementation plan"
  },
  {
    "type": "artifact",
    "id": "subtask-plans",
    "label": "architect/",
    "path": ".agent/artifacts/<TASK>/architect/",
    "content": "Subtask plans (ST-N-*.md)"
  },
  {
    "type": "gate",
    "id": "gate-eval",
    "label": "Implementation Plan — Review and Approve",
    "options": ["SI", "NO"]
  }
]
7. **On revision**: If gate is rejected, create `planning-v2.md` (increment version). Never overwrite previous versions.

## Gate
1. `planning-v1.md` artifact created with complete strategy overview.
2. One subtask plan created per subtask from the analysis.
3. Each subtask plan has: objective, acceptance criteria, agent assignment, and workflow.
4. Developer has approved the plan via gate.

## Pass
- Update `task.md`: set `phase-3-planning` status to `completed`, `current_phase` to `phase-4-implementation`.
- Advance to implementation phase.

## Fail
- Planning incomplete or rejected.
- Address developer feedback and re-present with incremented version.