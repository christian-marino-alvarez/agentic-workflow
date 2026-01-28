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
  task: src/agentic-system-structure/templates/task.md
  acceptance: src/agentic-system-structure/templates/acceptance.md
  init: src/agentic-system-structure/templates/init.md
  analysis: src/agentic-system-structure/templates/analysis.md
  planning: src/agentic-system-structure/templates/planning.md
  subtask_implementation: src/agentic-system-structure/templates/subtask-implementation.md
  review: src/agentic-system-structure/templates/review.md
  verification: src/agentic-system-structure/templates/verification.md
  results_acceptance: src/agentic-system-structure/templates/results-acceptance.md
  task_metrics: src/agentic-system-structure/templates/task-metrics.md
  agent_scores: src/agentic-system-structure/templates/agent-scores.md
  research: src/agentic-system-structure/templates/research.md
  agent_task: src/agentic-system-structure/templates/agent-task.md
  todo_item: src/agentic-system-structure/templates/todo-item.md
  changelog: src/agentic-system-structure/templates/changelog.md
  supplemental_report: src/agentic-system-structure/templates/supplemental-report.md

  # Templates del ciclo Short
  brief: src/agentic-system-structure/templates/brief.md
  closure: src/agentic-system-structure/templates/closure.md
```

## Reglas
- Solo declarar templates contractuales del sistema.
- Cualquier nuevo template **DEBE** añadirse aquí antes de ser referenciado.
