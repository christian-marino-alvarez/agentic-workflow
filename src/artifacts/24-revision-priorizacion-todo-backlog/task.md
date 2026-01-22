# Task (Template)

## Identificación
- id: 24
- title: Revision y Priorizacion del Backlog de TODOs
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Revisión profunda y técnica del backlog de tareas pendientes (TODOs) del sistema agéntico, priorizando la portabilidad del sistema y reevaluando ítems previamente marcados como realizados.

## Objetivo
Actualizar el backlog de TODOs con un análisis profundo de cada ítem, priorizar el desarrollo del sistema portable, replanificar la sección 'reasoning', definir fases para el sistema portable y proponer nuevas mejoras estructurales.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "24"
  title: "revision-priorizacion-todo-backlog"
  strategy: "long"
  phase:
    current: "aborted"
    validated_by: "architect-agent"
    updated_at: "2026-01-19T17:35:30+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T17:28:45+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T17:30:15+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T17:31:15+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T17:33:05+01:00"
      phase-4-implementation:
        completed: false
        status: "aborted"
        validated_by: "architect-agent"
        validated_at: "2026-01-19T17:35:30+01:00"
      phase-5-verification:
        completed: false
        validated_by: null
        validated_at: null
      phase-6-results-acceptance:
        completed: false
        validated_by: null
        validated_at: null
      phase-7-evaluation:
        completed: false
        validated_by: null
        validated_at: null
      phase-8-commit-push:
        completed: false
        validated_by: null
        validated_at: null
```

---

## 2. Definición y Alcance (Contrato)
- **Acceptance Criteria**: [acceptance.md](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/24-revision-priorizacion-todo-backlog/candidate/acceptance.md)
- **Alias**: `task.acceptance`

---

## Reglas contractuales
- Este fichero es la **fuente única de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- El campo `task.lifecycle.phases.*` **SOLO puede ser marcado como completed por `architect-agent`**.
- Una fase **NO puede marcarse como completed** si no es la fase actual.
- El avance de fase requiere:
  1. Marcar la fase actual como `completed: true`
  2. Validación explícita del architect
  3. Actualización de `task.phase.current` a la siguiente fase
