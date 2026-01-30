# Task (Template)

## Identificación
- id: 3
- title: new-vscode-agentic-activitybar-chat
- scope: candidate | current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Crear un nuevo proyecto `vscode-agentic` al mismo nivel que `agentic-workflow`, con un icono en Activity Bar que abre una vista con chat nativo (Chat Participant API) y un panel inferior (webview) para sesion, tareas y estadisticas.

## Objetivo
Base funcional de extension VS Code con Chat Participant y panel inferior en sidebar, con respuesta mock y estructura lista para evolucionar.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "3"
  title: "new-vscode-agentic-activitybar-chat"
  strategy: "long"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "phase-8-commit-push"
    validated_by: "architect-agent"
    updated_at: "2026-01-25T13:37:12Z"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-25T11:29:04Z"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-25T11:32:00Z"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-25T11:33:45Z"
      phase-3-planning:
        completed: false
        validated_by: null
        validated_at: null
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-25T11:49:46Z"
      phase-5-verification:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-25T11:53:00Z"
      phase-6-results-acceptance:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-25T11:54:10Z"
      phase-7-evaluation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-25T13:35:15Z"
      phase-8-commit-push:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-25T13:37:12Z"
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
- **Acceptance Criteria**: [acceptance.md](file:///.agent/artifacts/3-new-vscode-agentic-activitybar-chat/acceptance.md)
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
