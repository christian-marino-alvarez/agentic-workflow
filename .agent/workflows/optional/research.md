---
id: workflow.optional.research
name: Research
description: "Deep technical research for unfamiliar technologies, complex integrations, or alternative approaches."
owner: researcher-agent
trigger: ["research"]
type: dynamic
objective: "Conduct exhaustive technical research and produce a findings report with recommendations."
context:
  - .agent/artifacts/<TASK>/task.md
input:
  - .agent/artifacts/<TASK>/task.md
output:
  - .agent/artifacts/<TASK>/researcher/research-v1.md
---

# WORKFLOW: optional.research

## Input
- Task context from init artifact.

## Output
- Artifact: `.agent/artifacts/<TASK>/researcher/research-v1.md`

## Objective
Conduct exhaustive technical research when the task involves unfamiliar technologies, complex integrations, or when multiple alternatives need evaluation.

## Instructions
1. **Identify research questions**: Based on the task, define 3-5 specific questions.
2. **Investigate alternatives**: For each question, research solutions, libraries, patterns.
3. **Evaluate trade-offs**: Compare on complexity, performance, compatibility.
4. **Create research report**: Document findings in `research.md`.

## Gate
1. All research questions investigated.
2. `research.md` artifact created.

## Pass
- Return to parent phase with findings.

## Fail
- Insufficient research or missing recommendations.