---
id: {{task.id}}
title: {{task.title}}
owner: architect-agent
strategy: {{task.strategy}}
---

# Task (Template)

## Identificación
- id: {{task.id}}
- title: {{task.title}}
- scope: candidate | current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
{{task.description}}

## Objetivo
{{task.goal}}

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "{{task.id}}"
  title: "{{task.title}}"
  strategy: "{{task.strategy}}"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "phase-0-acceptance-criteria"
    validated_by: "architect-agent"
    updated_at: "{{timestamp}}"
  delegation:
    active_agent: "architect-agent"
    history: []
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
      short-phase-1-analisis:
        completed: false
        validated_by: null
        validated_at: null
      short-phase-2-plan:
        completed: false
        validated_by: null
        validated_at: null
      short-phase-3-implementation:
        completed: false
        validated_by: null
        validated_at: null
      short-phase-4-qa-results:
        completed: false
        validated_by: null
        validated_at: null
```

---

## Registro de delegación
- Cualquier cambio de agente **DEBE** registrarse en `task.delegation.history`.
- La entrada mínima incluye: `from`, `to`, `approved_by`, `approved_at`, `reason`.

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
