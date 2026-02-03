---
id: 20260203-commit-push-branch
title: Comitear y subir cambios de la rama
owner: architect-agent
strategy: short
---

# Task (Template)

## Identificación
- id: 20260203-commit-push-branch
- title: Comitear y subir cambios de la rama
- scope: candidate | current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Crear la rama feature para el refactor MCP, revisar los últimos commits, commitear todos los cambios, ejecutar tests acordados y subir la rama a origin lista para merge a develop.

## Objetivo
Dejar los cambios del refactor MCP versionados y subidos en una rama feature, listos para merge a develop.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "20260203-commit-push-branch"
  title: "Comitear y subir cambios de la rama"
  strategy: "short"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "short-phase-3-closure"
    validated_by: "architect-agent"
    updated_at: "2026-02-03T19:33:54Z"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: false
        validated_by: null
        validated_at: null
        runtime_validated: false
        validation_id: null
      phase-1-research:
        completed: false
        validated_by: null
        validated_at: null
        runtime_validated: false
        validation_id: null
      phase-2-analysis:
        completed: false
        validated_by: null
        validated_at: null
        runtime_validated: false
        validation_id: null
      phase-3-planning:
        completed: false
        validated_by: null
        validated_at: null
        runtime_validated: false
        validation_id: null
      phase-4-implementation:
        completed: false
        validated_by: null
        validated_at: null
        runtime_validated: false
        validation_id: null
      phase-5-verification:
        completed: false
        validated_by: null
        validated_at: null
        runtime_validated: false
        validation_id: null
      phase-6-results-acceptance:
        completed: false
        validated_by: null
        validated_at: null
        runtime_validated: false
        validation_id: null
      phase-7-evaluation:
        completed: false
        validated_by: null
        validated_at: null
        runtime_validated: false
        validation_id: null
      phase-8-commit-push:
        completed: false
        validated_by: null
        validated_at: null
        runtime_validated: false
        validation_id: null
    subflows:
      short-phase-1-brief:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-03T19:06:55Z"
        runtime_validated: true
        validation_id: "10"
      short-phase-2-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-03T19:28:39Z"
        runtime_validated: true
        validation_id: "14"
      short-phase-3-closure:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-03T19:33:54Z"
        runtime_validated: true
        validation_id: "17"
```

---

## 2. Definición y Alcance (Contrato)
- **Acceptance Criteria**: [acceptance.md](file:///{{task.acceptance_path}})
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
