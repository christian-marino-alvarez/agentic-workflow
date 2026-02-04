---
id: 20260204-mejorar-flow-init
title: Mejorar el flow de init y creacion de task candidate
owner: architect-agent
strategy: long
---

# Task (Template)

## Identificacion
- id: 20260204-mejorar-flow-init
- title: Mejorar el flow de init y creacion de task candidate
- scope: candidate | current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Descripcion de la tarea
Revisar y mejorar el arrancado de tarea mediante comando init, evitando errores por rutas inexistentes y definiendo un flujo con init candidates timestamp.

## Objetivo
Ajustar el arranque para que init genere un candidate con timestamp y la tarea se cree desde ese init al aportar titulo/objetivo; actualizar el Gate de init.

## Estado del ciclo de vida (FUENTE UNICA DE VERDAD)

```yaml
task:
  id: "20260204-mejorar-flow-init"
  title: "Mejorar el flow de init y creacion de task candidate"
  strategy: "long"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "phase-0-acceptance-criteria"
    validated_by: "architect-agent"
    updated_at: "2026-02-04T11:51:40Z"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: false
        validated_by: null
        validated_at: null
      phase-1-research:
        completed: false
        validated_by: null
        validated_at: null
      phase-2-analysis:
        completed: false
        validated_by: null
        validated_at: null
      phase-3-planning:
        completed: false
        validated_by: null
        validated_at: null
      phase-4-implementation:
        completed: false
        validated_by: null
        validated_at: null
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
    subflows:
      components:
        create:
          - name: <component-name>
            completed: false
            validated_by: null
            validated_at: null
        refactor:
          - name: <component-name>
            completed: false
            validated_by: null
            validated_at: null
        delete:
          - name: <component-name>
            completed: false
            validated_by: null
            validated_at: null
      short-phase-1-brief:
        completed: false
        validated_by: null
        validated_at: null
      short-phase-2-implementation:
        completed: false
        validated_by: null
        validated_at: null
      short-phase-3-closure:
        completed: false
        validated_by: null
        validated_at: null
```

---

## 2. Definicion y Alcance (Contrato)
- **Acceptance Criteria**: [acceptance.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/20260204-mejorar-flow-init/acceptance.md)
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
