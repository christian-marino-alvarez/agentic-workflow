---
kind: artifact
name: task
source: agentic-system-structure
---

# Task (Template)

## Identificación
- id: 2
- title: scaffold-vscode-chat-ai-panel
- scope: candidate | current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Migrar la extension de VS Code desde `src/extension` al root de `agentic-workflow`, dejando un unico `package.json` en el root, con `src/` y `out/` en root, y manteniendo el scaffold de Chat Participant y panel inferior.

## Objetivo
Extension integrada en el root del repo, con el scaffold de Chat Participant funcionando, sin dependencias duplicadas ni rutas rotas.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "2"
  title: "scaffold-vscode-chat-ai-panel"
  strategy: "long"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "phase-4-implementation"
    validated_by: "architect-agent"
    updated_at: "2026-01-25T11:18:56Z"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-25T11:01:15Z"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-25T11:12:44Z"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-25T11:16:44Z"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-25T11:18:56Z"
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

## 2. Definición y Alcance (Contrato)
- **Acceptance Criteria**: [acceptance.md](file:///.agent/artifacts/2-scaffold-vscode-chat-ai-panel/acceptance.md)
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
