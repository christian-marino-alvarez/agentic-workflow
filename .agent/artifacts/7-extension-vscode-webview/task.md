# Task (Template)

## Identificación
- id: 7
- title: extension-vscode-webview
- scope: candidate | current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Crear una extensión de VS Code dentro de `src` que cargue un webview en un panel de la activity bar mediante un icono. Debe ser compatible con la última versión estable de VS Code. Las vistas estarán jerarquizadas en `src/extension/views` con un patrón `index.ts` en ESM que exporte cada view creada.

## Objetivo
Implementar la base de la extensión con una vista en activity bar y estructura de vistas exportadas por `src/extension/views/index.ts`, compatible con la última versión estable de VS Code.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "7"
  title: "extension-vscode-webview"
  strategy: "long"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "phase-8-commit-push"
    validated_by: "architect-agent"
    updated_at: "2026-01-30T16:48:22Z"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-30T16:19:16Z"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-30T16:26:01Z"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-30T16:27:33Z"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-30T16:31:46Z"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-30T16:43:10Z"
      phase-5-verification:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-30T16:44:17Z"
      phase-6-results-acceptance:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-30T16:45:36Z"
      phase-7-evaluation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-30T16:48:22Z"
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
- **Acceptance Criteria**: [acceptance.md](file:///.agent/artifacts/7-extension-vscode-webview/acceptance.md)
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
