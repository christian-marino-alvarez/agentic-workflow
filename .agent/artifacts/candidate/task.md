# Task (Template)

## Identificación
- id: task-20260130-chatkit-mainview
- title: Integrar ChatKit en mainView
- scope: candidate | current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Integrar OpenAI ChatKit en `mainView` con un ejemplo básico funcional en VS Code, usando backend local en el extension host y agentes dinámicos para el rol Neo.

## Objetivo
Mostrar un ChatKit embebido en `mainView` con un botón “Test” que dispare el mensaje “Hello I am the first agent called Neo”, usando un agente dinámico (gpt-5) creado por sesión y con contexto de rol/constitución.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "task-20260130-chatkit-mainview"
  title: "Integrar ChatKit en mainView"
  strategy: "long"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "phase-8-commit-push"
    validated_by: "architect-agent"
    updated_at: "2026-02-01T11:35:00Z"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-30T00:00:00Z"
      phase-1-research:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-30T00:00:00Z"
      phase-2-analysis:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-30T00:00:00Z"
      phase-3-planning:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-30T00:00:00Z"
      phase-4-implementation:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-02-01T11:16:00Z"
      phase-5-verification:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-02-01T11:20:30Z"
      phase-6-results-acceptance:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-02-01T11:25:00Z"
      phase-7-evaluation:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-02-01T11:35:00Z"
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

## 2. Definición y Alcance (Contrato)
- **Acceptance Criteria**: [acceptance.md](file:///.agent/artifacts/task-20260130-chatkit-mainview/acceptance.md)
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
