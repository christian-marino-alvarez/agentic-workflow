---
id: workflow.init
name: Init
owner: architect-agent
description: "Mandatory setup workflow: loads base constitutions and defines the conversation language and Long/Short strategy."
version: 6.0.0
trigger: ["init", "/init", "/agentic-init"]
type: static
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
1. **Present Initial Configuration Form**: Present ALL the following inputs AT ONCE in a single response, so the developer can define them all together. Do NOT wait between them.
   - `<a2ui type="choice" id="language" label="Conversation language">` (Español, English) — Once selected, ALL subsequent dialog MUST be in that language.
   - `<a2ui type="choice" id="strategy" label="Lifecycle strategy">` (Long [9 phases], Short [3 phases])
   - `<a2ui type="input" id="task-title" label="Task title (short, descriptive)">`
   - `<a2ui type="input" id="task-objective" label="Task objective (clear and verifiable)">`
2. **Create and present configuration (Gate)**: Wait for the developer to provide answers to all inputs. Silently create `init.md` at `artifacts.candidate.init` using **exactly** the `templates.init` structure with `language`, `strategy`, task `title` and `objective`. Then present the configuration for developer validation using `<a2ui type="gate" id="gate-eval" label="Task Initialization — Review and Approve">`. **Inside the `<a2ui>` body, you MUST include a markdown list summarizing the selected language, strategy, task title, and task objective.** This is MANDATORY — the developer must approve (SI) to pass the gate, start the task, and advance to the next workflow.

## Gate
1. Conversation language defined and confirmed by the user.
2. Lifecycle strategy selected by the user (long or short).
3. Task title and objective defined by the user.
4. Configuration presented and gate evaluated.

## Pass
- Launch the corresponding lifecycle with the defined task:
  - If `strategy == "long"` → launch `workflows.tasklifecycle-long`
  - If `strategy == "short"` → launch `workflows.tasklifecycle-short`

## Fail
- Explain which requirement failed.
- Request the minimum necessary correction.
- Do not launch any lifecycle.
