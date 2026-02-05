---
id: templates.index
owner: architect-agent
version: 1.0.0
severity: PERMANENT
---

# INDEX — Templates

## Objetivo
Este fichero enumera los **templates contractuales** del sistema.
Los workflows y agentes **DEBEN** referenciar estas plantillas
por alias en vez de rutas directas.

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

  # Templates del ciclo Short
  analisis: .agent/templates/analisis.md
  plan: .agent/templates/plan.md
  qa_results: .agent/templates/qa-results.md
```

## Reglas
- Solo declarar templates contractuales del sistema.
- Cualquier nuevo template **DEBE** añadirse aquí antes de ser referenciado.
