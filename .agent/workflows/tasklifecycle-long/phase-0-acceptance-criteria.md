---
id: workflow.tasklifecycle-long.phase-0-acceptance-criteria
owner: architect-agent
description: "Defines acceptance criteria through 5 mandatory questions and creates the definitive task with verifiable criteria."
version: 2.0.0
trigger: ["phase0", "phase-0", "acceptance", "acceptance-criteria"]
type: static
---

# WORKFLOW: tasklifecycle.phase-0-acceptance-criteria

## Input
- Task candidate from init: `artifacts.candidate.task` (must include description and objective)
- Template: `templates.task`

## Output
- `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- `.agent/artifacts/<taskId>-<taskTitle>/acceptance.md`

## Objective
Convert the task candidate into a definitive task with complete, verifiable acceptance criteria derived from 5 mandatory clarification questions.

## Instructions
1. Activate `architect-agent` role.
2. Read the task candidate from `artifacts.candidate.task`. Extract description and objective.
3. Calculate `taskId` (next sequential number from existing artifacts).
4. Derive `taskTitle` from the candidate (lowercase, hyphens, no special chars).
5. Analyze the task description and objective. Formulate exactly 5 clarification questions to eliminate ambiguities and enable verifiable acceptance criteria.
6. Present the 5 questions to the developer **ONE AT A TIME** using `<a2ui>` components. Use `<a2ui type="input">` for open-ended questions and `<a2ui type="choice">` for questions with predefined options. Plain-text questions are FORBIDDEN. Wait for each answer before presenting the next question.
7. Based on the answers, consolidate the task definition and derive verifiable acceptance criteria.
8. Create the task directory and artifacts:
   - `task.md` using `templates.task` (metadata, phase history)
   - `acceptance.md` using `templates.acceptance` (definition, answers, AC checklist)
9. Present the acceptance criteria summary and request developer approval via `<a2ui type="gate" id="gate-acceptance" label="Acceptance Criteria Approval">`. Do NOT use plain text for the approval — use `<a2ui>` exclusively.

## Gate
1. The 5 mandatory questions were asked and answered by the developer.
2. Acceptance criteria are complete and verifiable.
3. Explicit developer approval (SI/NO).

## Pass
- Advance to Phase 1: Research.

## Fail
- Indicate what failed (missing candidate, incomplete answers, rejected criteria).
- Request the minimum correction needed.
