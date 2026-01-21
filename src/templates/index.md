---
id: templates.index
owner: architect-agent
version: 1.0.0
severity: PERMANENT
---

# INDEX — Templates

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`
 (Agentic System)

## Objective
Enumerate the contractual templates of the agentic system.
Must be referenced via aliases.

## Aliases (YAML)
```yaml
templates:
  task: .agent/templates/task.md
  acceptance: .agent/templates/acceptance.md
  init: .agent/templates/init.md
  analysis: .agent/templates/analysis.md
  planning: .agent/templates/planning.md
  subtask_implementation: .agent/templates/subtask-implementation.md
  review: .agent/templates/review.md
  verification: .agent/templates/verification.md
  results_acceptance: .agent/templates/results-acceptance.md
  task_metrics: .agent/templates/task-metrics.md
  agent_scores: .agent/templates/agent-scores.md
  research: .agent/templates/research.md
  agent_task: .agent/templates/agent-task.md
  todo_item: .agent/templates/todo-item.md
  changelog: .agent/templates/changelog.md
  supplemental_report: .agent/templates/supplemental-report.md

  # Short Cycle
  brief: .agent/templates/brief.md
  closure: .agent/templates/closure.md
```

## Rules
- Any new template **MUST** be added here.
