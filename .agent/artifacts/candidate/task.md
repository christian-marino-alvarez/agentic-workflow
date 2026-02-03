---
id: 20260203-5
title: mcp-resources-templates-list
owner: architect-agent
strategy: short
---

# Task (Template)

## Identificacion
- id: 20260203-5
- title: mcp-resources-templates-list
- scope: candidate | current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Descripcion de la tarea
Implementar soporte para resources/templates/list en el servidor MCP.

## Objetivo
Responder al metodo resources/templates/list con el listado de templates existentes.

## Estado del ciclo de vida (FUENTE UNICA DE VERDAD)

```yaml
task:
  id: "20260203-5"
  title: "mcp-resources-templates-list"
  strategy: "short"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "short-phase-3-closure"
    validated_by: "architect-agent"
    updated_at: "2026-02-03T13:39:50.210Z"
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
        validated_at: "2026-02-03T13:37:30Z"
        runtime_validated: true
        validation_id: "gate-20260203-5-short-1"
      short-phase-2-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-03T13:39:50Z"
        runtime_validated: true
        validation_id: "gate-20260203-5-short-2"
      short-phase-3-closure:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-03T13:41:47Z"
        runtime_validated: true
        validation_id: "gate-20260203-5-short-3"
```

---

## 2. Definicion y Alcance (Contrato)
- **Acceptance Criteria**: [acceptance.md](file:///{{task.acceptance_path}})
- **Alias**: `task.acceptance`

---

## Reglas contractuales
- Este fichero es la **fuente unica de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- El campo `task.lifecycle.phases.*` **SOLO puede ser marcado como completed por `architect-agent`**.
- Una fase **NO puede marcarse como completed** si no es la fase actual.
- El avance de fase requiere:
  1. Marcar la fase actual como `completed: true`
  2. Validacion explicita del architect
  3. Actualizacion de `task.phase.current` a la siguiente fase
