---
id: workflow.init
name: Init
description: "Initialize session: define language, task, and acceptance criteria in a single flow."
owner: architect-agent
trigger: ["init", "/init", "/agentic-init"]
type: static
objective: "Set up the agentic session with language, task definition, and verifiable acceptance criteria."
context:
  - .agent/rules/constitution/architecture.md
input: []
output:
  - .agent/artifacts/candidate/<TS>-candidate.md
  - .agent/artifacts/<TS>-<title-short>/task.md
pass:
  nextTarget: tasklifecycle
---

# WORKFLOW: init

## Input
- Developer command: `/init`

## Output
- Artifact: `.agent/artifacts/candidate/<TS>-candidate.md` (language, task, and acceptance criteria)
- Task folder: `.agent/artifacts/<TS>-<title-short>/`
- Central task file: `.agent/artifacts/<TS>-<title-short>/task.md`
- `<TS>` = current date in `YYYYMMDD` format (e.g., `20260226`)

## Objective
Initialize the agentic session: activate architect-agent, confirm conversation language, define the task, and establish verifiable acceptance criteria — all in a single streamlined flow. Create a single candidate artifact that consolidates everything.

## Instructions
1. **Generate timestamp**: Determine `<TS>` as the current date in `YYYYMMDD` format.
2. **Welcome & select language** _(use routing model)_: Present a welcome message followed by the language choice. No other text. Always in English:

"ui_intent": [
  {
    "type": "choice",
    "id": "language",
    "label": "Language Selection",
    "options": ["Español", "English"]
  }
]
   - Wait for response.

> [!IMPORTANT]
> **Language Rule (PERMANENT)**: Once the language is selected, **ALL subsequent content MUST be in that language** — this includes: dialog, questions, acceptance criteria, artifact content, gate descriptions, reports, analysis, planning, subtask plans, agent tasks, and results. This applies to **every phase of the lifecycle**, not just the init. The `language` field is persisted in `task.md` and all agents must respect it.

3. **Define task (in selected language)**: Present the task definition inputs in the selected language using the JSON `ui_intent` array:
   - type: "input", id: "task-title", label: "[Task title — short, descriptive]"
   - type: "input", id: "task-objective", label: "[Task objective — clear and verifiable]"
4. **Generate Dynamic Acceptance Questions (in selected language)**: After receiving answers, analyze the task title and objective in the context of the project architecture. Generate between **3 and 7 contextually relevant questions** about acceptance criteria — the number depends on task complexity. Present ALL questions in a single response using `ui_intent` of type `input`. Questions should cover success criteria, scope, affected modules, edge cases, testing, or performance — chosen dynamically based on the task.
5. **Create candidate artifact and present Gate**: Using all answers, use the `writeFile` tool to create the candidate at `.agent/artifacts/candidate/<TS>-candidate.md` with the following structure:
   - **Language**: selected language
   - **Task**: title and objective
   - **Title Short**: kebab-case short title derived from the task title (e.g., `fix-login-flow`)
   - **Acceptance Criteria**: all criteria derived from the developer's answers

   ⚠️ You MUST use the `writeFile` tool to create the file with the FULL content. Do NOT rely on the `ui_intent` content field for the file content — that field is only a short summary label for the UI card.

   After creating the file via `writeFile`, present the gate for validation. Include an artifact reference component (pointing to the created file) followed by the gate component in `ui_intent`:
   
"ui_intent": [
  {
    "type": "artifact",
    "id": "init-doc",
    "label": "<TS>-candidate.md",
    "path": ".agent/artifacts/candidate/<TS>-candidate.md",
    "content": "Configuration summary"
  },
  {
    "type": "gate",
    "id": "gate-eval",
    "label": "Task Initialization — Review and Approve",
    "options": ["SI", "NO"]
  }
]

   The artifact block enables a "Review" button so the developer can open and inspect the document before approving. This is MANDATORY.

## Gate
1. Conversation language defined and confirmed.
2. Task title and objective defined.
3. Acceptance criteria questions answered (3-7).
4. Candidate artifact created with all information.
5. Configuration gate approved by developer.

## Pass
- Create the task folder: `.agent/artifacts/<TS>-<title-short>/`
- Create `.agent/artifacts/<TS>-<title-short>/task.md` using the candidate data and lifecycle template.
- Launch the unified lifecycle: `workflows.tasklifecycle`

## Fail
- Explain which requirement failed.
- Request the minimum necessary correction.
- Do not launch the lifecycle.
