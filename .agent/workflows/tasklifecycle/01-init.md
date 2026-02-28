---
id: workflow.tasklifecycle.01-init
name: Init Phase
description: "Phase 1: Task setup with acceptance criteria already defined from init workflow."
owner: architect-agent
trigger: ["phase-01", "init-phase"]
type: static
objective: "Validate candidate artifact exists, create task folder and task.md, then transition to analysis."
context:
  - .agent/artifacts/candidate/<TS>-candidate.md
input:
  - .agent/artifacts/candidate/<TS>-candidate.md
output:
  - .agent/artifacts/<TASK>/task.md
---

# WORKFLOW: tasklifecycle.01-init

## Input
- Candidate artifact created and approved by the init workflow.

## Output
- Task folder: `.agent/artifacts/<TS>-<title-short>/`
- Central task file: `.agent/artifacts/<TS>-<title-short>/task.md`

## Objective
Validate the candidate artifact exists and is valid. Create the task folder using the candidate's timestamp and title. Generate `task.md` as the central task state tracker. This phase serves as the entry point for the lifecycle.

## Instructions
1. **Validate candidate artifact**: Confirm the latest `<TS>-candidate.md` exists in `.agent/artifacts/candidate/` with: language, task title, task objective, title-short, and 3-7 acceptance criteria.
2. **Create task folder**: Create `.agent/artifacts/<TS>-<title-short>/` using the timestamp and title-short from the candidate.
3. **Create task.md**: Generate `task.md` inside the task folder with:
   - Task identification (id, title, description, created_at)
   - Acceptance criteria (copied from candidate, all status: `pending`)
   - Lifecycle state (current_phase: `phase-1-init`, phase-1-init status: `in_progress`)
   - Empty subtasks list (populated in Phase 3)
4. **Present confirmation gate**: Present a brief summary using `ui_intent`:

"ui_intent": [
  {
    "type": "artifact",
    "id": "task-doc",
    "label": "task.md",
    "path": ".agent/artifacts/<TS>-<title-short>/task.md",
    "content": "Task definition and lifecycle state"
  },
  {
    "type": "gate",
    "id": "gate-eval",
    "label": "Task Setup Confirmation",
    "options": ["SI", "NO"]
  }
]
5. **Update task.md on Pass**: Set `phase-1-init` status to `completed` and `current_phase` to `phase-2-analysis`.

## Gate
1. Task folder created successfully.
2. `task.md` exists with complete task definition and lifecycle state.

## Pass
- Advance to analysis phase.

## Fail
- Report missing or incomplete candidate artifact.