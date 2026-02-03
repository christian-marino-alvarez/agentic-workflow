---
id: task-20260203-publicar-cambios-beta
title: Publicar cambios y beta nueva
owner: architect-agent
strategy: short
---

# Task (Template)

## Identificación
- id: task-20260203-publicar-cambios-beta
- title: Publicar cambios y beta nueva
- scope: candidate | current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle-short
  - source: init
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Publicar los cambios realizados en la rama actual y crear una nueva versión beta.

## Objetivo
Validar que los cambios están correctos, añadirlos, versionar una nueva beta y publicar.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "task-20260203-publicar-cambios-beta"
  title: "Publicar cambios y beta nueva"
  strategy: "short"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "short-phase-3-closure"
    validated_by: "architect-agent"
    updated_at: "2026-02-03T11:29:15Z"
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
        validated_at: "2026-02-03T11:17:41Z"
        runtime_validated: true
        validation_id: "runtime.validate_gate@2026-02-03T11:17:41Z"
      short-phase-2-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-03T11:24:01Z"
        runtime_validated: true
        validation_id: "runtime.validate_gate@2026-02-03T11:23:17Z"
      short-phase-3-closure:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-03T11:29:15Z"
        runtime_validated: true
        validation_id: "runtime.validate_gate@2026-02-03T11:24:53Z"
```

---

## 2. Definición y Alcance (Contrato)
- **Acceptance Criteria**: [acceptance.md](file:///.agent/artifacts/task-20260203-publicar-cambios-beta/acceptance.md)
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
