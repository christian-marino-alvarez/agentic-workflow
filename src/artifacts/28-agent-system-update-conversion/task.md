# Task: 28-Agent System Update & Conversion System

## Identificación
- id: 28
- title: Agent System Update & Conversion System
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: .agent/artifacts/candidate/task.md

## Descripción de la tarea
Necesitamos crear en el sistema de agentic portable un sistema de actualización del sistema de agentes, así como detectar si existe un sistema ya existente en .agent y adaptarlo al nuevo flow de la última versión.

## Objetivo
Implementar un mecanismo de actualización y migración para el sistema agéntico que garantice la coherencia con los nuevos estándares de identidad y disciplina de agentes, permitiendo la adaptación de instalaciones antiguas al nuevo framework portable.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "28"
  title: "Agent System Update & Conversion System"
  strategy: "long"
  artifacts:
    supplemental: []
  phase:
    current: "completed"
    validated_by: "architect-agent"
    updated_at: "2026-01-20T00:25:00+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T00:10:00+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T00:15:00+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T00:16:00+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T00:17:00+01:00"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T00:20:30+01:00"
      phase-5-verification:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T00:21:30+01:00"
      phase-6-results-acceptance:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T00:22:00+01:00"
      phase-7-evaluation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T00:24:00+01:00"
      phase-8-commit-push:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T00:25:00+01:00"
    subflows:
      drivers:
        create: []
        refactor: []
        delete: []
      modules:
        create: []
        refactor: []
        delete: []
      pages:
        create: []
      shards:
        create: []
```

---

## 2. Definición y Alcance (Contrato)
- **Acceptance Criteria**: [.agent/artifacts/28-agent-system-update-conversion/acceptance.md](.agent/artifacts/28-agent-system-update-conversion/acceptance.md)
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
