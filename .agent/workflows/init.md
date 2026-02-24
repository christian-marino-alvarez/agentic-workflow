---
id: workflow.init
name: Init
owner: architect-agent
description: "Mandatory setup workflow: loads base constitutions and defines the conversation language and Long/Short strategy."
version: 5.0.0
trigger: ["init", "/init", "/agentic-init"]
type: static
context:
  - constitution.clean_code
  - constitution.agents_behavior
pass:
  nextTarget:
    long: tasklifecycle-long
    short: tasklifecycle-short
---

# WORKFLOW: init

## Input
- Developer command: `/init`

## Output
- `artifacts.candidate.init` (init.md artifact created using `templates.init`)

## Objective
Initialize the agentic session: activate architect-agent, confirm conversation language, select lifecycle strategy (Long/Short), and define the task to execute.

## Instructions
1. **Language**: Present a `<a2ui type="choice">` with language options (Español, English). Once selected, ALL subsequent dialog MUST be in that language.
2. **Strategy**: Present a `<a2ui type="choice">` with two options: Long (9 phases) and Short (3 phases).
3. **Task title**: Present a `<a2ui type="input" id="task-title" label="Task title (short, descriptive)">` and wait for the answer.
4. **Task objective**: Present a `<a2ui type="input" id="task-objective" label="Task objective (clear and verifiable)">` and wait for the answer.
5. **Create artifact**: Silently create `init.md` at `artifacts.candidate.init` using **exactly** the `templates.init` structure with `language`, `strategy`, task `title` and `objective`. Then present the Gate evaluation.

## Gate
1. Conversation language defined and confirmed by the user.
2. Lifecycle strategy selected by the user (long or short).
3. Task title and objective defined by the user.

## Pass
- Launch the corresponding lifecycle with the defined task:
  - If `strategy == "long"` → launch `workflows.tasklifecycle-long`
  - If `strategy == "short"` → launch `workflows.tasklifecycle-short`

## Fail
- Explain which requirement failed.
- Request the minimum necessary correction.
- Do not launch any lifecycle.
