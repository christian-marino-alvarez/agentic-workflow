---
kind: artifact
name: task
source: agentic-system-structure
---

# Task (Template)

## Identificacion
- id: 1
- title: scaffold-extension-vscode-agentinc
- scope: candidate | current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Descripcion de la tarea
Crear el scaffolding de una extension de VS Code en una carpeta dentro del proyecto para que sea la aplicacion exportable al publicar. La extension se llamara vscode-agentinc e incluye validar si ese nombre existe en el marketplace.

## Objetivo
Dejar una base funcional de extension publicable y confirmar disponibilidad del nombre en el marketplace de VS Code.

## Estado del ciclo de vida (FUENTE UNICA DE VERDAD)

```yaml
task:
  id: "1"
  title: "scaffold-extension-vscode-agentinc"
  strategy: "long"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "phase-8-commit-push"
    validated_by: "architect-agent"
    updated_at: "2026-01-24T21:23:07Z"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-24T15:59:05Z"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-24T16:04:11Z"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-24T21:06:36Z"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-24T21:08:08Z"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-24T21:19:57Z"
      phase-5-verification:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-24T21:21:07Z"
      phase-6-results-acceptance:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-24T21:22:00Z"
      phase-7-evaluation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-24T21:23:07Z"
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
- **Acceptance Criteria**: [acceptance.md](file:///.agent/artifacts/1-scaffold-extension-vscode-agentinc/acceptance.md)
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
