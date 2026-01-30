# Task (Template)

## Identificación
- id: task-20260130-rol-vscode
- title: Crear rol específico para extensiones VS Code
- scope: candidate | current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Crear un rol específico y detallado para el desarrollo de extensiones de VS Code, y evaluar si es necesario definir una nueva constitution para ese dominio para evitar problemas en el proceso.

## Objetivo
Definir un rol operativo claro (alcance, responsabilidades, límites de autoridad y artefactos) y, si procede, una constitution específica para VS Code que guíe la implementación de extensiones.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "task-20260130-rol-vscode"
  title: "Crear rol específico para extensiones VS Code"
  strategy: "short"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "completed"
    validated_by: "architect-agent"
    updated_at: "2026-01-30T15:02:53Z"
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
        validated_at: "2026-01-30T14:42:29Z"
      short-phase-2-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-30T15:01:47Z"
      short-phase-3-closure:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-30T15:02:53Z"
```

---

## 2. Definición y Alcance (Contrato)
- **Acceptance Criteria**: [acceptance.md](file:///.agent/artifacts/task-20260130-rol-vscode/acceptance.md)
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
