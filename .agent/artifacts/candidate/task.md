---
id: 20260204-clean-init-legacy
title: Eliminar init legacy en instalaciones nuevas
owner: architect-agent
strategy: short
---

# Task (Template)

## Identificacion
- id: 20260204-clean-init-legacy
- title: Eliminar init legacy en instalaciones nuevas
- scope: candidate | current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Descripcion de la tarea
Eliminar `init.md` legacy en proyectos que instalan la ultima version con el nuevo flow de init. Eliminar cualquier codigo del antiguo flow que referencie `init.md`.

## Objetivo
Modificar el comando `init` y el runtime para borrar `.agent/artifacts/candidate/init.md` legacy cuando se instale o actualice, y remover referencias al flow antiguo.

## Estado del ciclo de vida (FUENTE UNICA DE VERDAD)

```yaml
task:
  id: "20260204-clean-init-legacy"
  title: "Eliminar init legacy en instalaciones nuevas"
  strategy: "short"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "short-phase-3-closure"
    validated_by: "architect-agent"
    updated_at: "2026-02-04T12:57:52Z"
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
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-04T12:49:19Z"
      short-phase-2-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-04T12:55:25Z"
      short-phase-3-closure:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-04T12:57:52Z"
```

---

## 2. Definicion y Alcance (Contrato)
- **Acceptance Criteria**: [acceptance.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/20260204-clean-init-legacy/acceptance.md)
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
