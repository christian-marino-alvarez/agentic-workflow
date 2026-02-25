---
id: workflow.tasklifecycle-short.short-phase-0-acceptance
owner: architect-agent
description: "Phase 0 of the Short lifecycle. Defines acceptance criteria through 5 dynamic questions based on the task and project architecture."
version: 1.0.0
trigger: ["short-phase-0", "acceptance"]
type: static
models:
  default: gemini-2.5-pro
  routing: gemini-2.5-flash
context:
  - .agent/artifacts/candidate/init.md
  - .agent/rules/constitution/architecture/index.md
---

# WORKFLOW: tasklifecycle-short.short-phase-0-acceptance

## Input
- Task candidate exists with `task.strategy: short`.
- The developer has provided a title and objective (from init workflow).
- The project's modular architecture constitution is loaded as context.

## Output
- Artifact: `.agent/artifacts/<taskId>-<taskTitle>/acceptance.md` (using `templates.acceptance`)

## Objective
Define clear, verifiable acceptance criteria for the task through 5 dynamic questions tailored to the specific task and based on the project's modular architecture.

## Instructions
1. **Activate architect-agent** and use the mandatory prefix `🏛️ architect-agent:` in every response.
2. **Analyze the task context**: Read the task title and objective from the init artifact. Study the project's architecture constitution to understand the modular structure, layers (Background, Backend, View), naming conventions, and communication patterns.
3. **Ask 5 dynamic acceptance criteria questions (AT THE SAME TIME)**: Generate 5 questions that are **specific to this task** and informed by the project architecture. These are NOT fixed questions — they must be contextually relevant. Present ALL 5 questions in a single response using `<a2ui type="input">` for each. Plain-text questions are FORBIDDEN — every question MUST be wrapped in `<a2ui>`.
   - Questions should cover areas like: success criteria, scope boundaries, affected modules/layers, performance expectations, integration points, edge cases, or testing requirements — but chosen dynamically based on what matters most for this particular task.
   - Example format: `<a2ui type="input" id="q<n>-<topic>" label="<Dynamic question based on the task>"></a2ui>`
   - Do NOT stop generation between questions. Output them all together so the user can answer them all. Wait for ALL answers to be provided before proceeding.
4. **Create acceptance criteria artifact**: Using the task title, objective, and ALL 5 developer answers, create the `acceptance.md` artifact following the `templates.acceptance` structure. Each acceptance criterion must be **verifiable** (not vague).
5. **Present Acceptance Criteria (Gate)**: After creating the acceptance criteria artifact, present it for validation using `<a2ui type="gate" id="gate-eval" label="Acceptance Criteria — Review and Approve">` with a summary of all 5 criteria in its body. This is MANDATORY — the developer must approve (SI) to pass the gate, save the criteria, and trigger the lifecycle engine to advance to Phase 1.

## Gate
1. All 5 acceptance criteria questions have been answered by the developer.
2. The `acceptance.md` artifact has been created with verifiable criteria.
3. The developer has approved the acceptance criteria via `<a2ui type="gate">`.

## Pass
- Acceptance criteria have been defined and approved by the developer.
- The lifecycle engine will automatically advance to `workflow.tasklifecycle-short.short-phase-1-brief`.

## Fail
- Not all questions were answered.
- The acceptance criteria artifact was not created.
- The developer rejected the acceptance criteria.
