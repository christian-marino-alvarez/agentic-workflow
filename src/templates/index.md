---
id: templates.index
owner: architect-agent
version: 1.0.0
severity: PERMANENT
---

# INDEX — Templates

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`
 (Agentic System)

## Objetivo
Enumerar templates contractuales del sistema agéntico.
Deben referenciarse por alias.

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

  # Ciclo Short
  brief: .agent/templates/brief.md
  closure: .agent/templates/closure.md
```

## Reglas
- Cualquier nuevo template **DEBE** añadirse aquí.
