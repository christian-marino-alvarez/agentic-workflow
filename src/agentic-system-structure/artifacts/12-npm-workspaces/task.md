---
id: 12
title: npm-workspaces
owner: architect-agent
strategy: long
---

# Task

## Identificación
- id: 12
- title: npm-workspaces
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle-long
  - source: init
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Convertir el proyecto en un monorepo con npm workspaces donde cada módulo se convierte en un package npm independiente con su propio `package.json`.

## Objetivo
Reestructurar el proyecto para que los módulos `app`, `core` y `cli` sean packages npm privados y las dependencias entre ellos se gestionen a través de referencias de workspace, con build unificado desde el root.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "12"
  title: "npm-workspaces"
  strategy: "long"
  artifacts:
    supplemental: []
  phase:
    current: "phase-8-commit-push"
    validated_by: "architect-agent"
    updated_at: "2026-02-16T07:54:25+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-02-16T07:32:24+01:00"
      phase-1-research:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-02-16T07:35:37+01:00"
      phase-2-analysis:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-02-16T07:39:57+01:00"
      phase-3-planning:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-02-16T07:42:30+01:00"
      phase-4-implementation:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-02-16T07:50:00+01:00"
      phase-5-verification:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-02-16T07:54:25+01:00"
      phase-6-results-acceptance:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-02-16T07:54:25+01:00"
      phase-7-evaluation:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-02-16T07:54:25+01:00"
      phase-8-commit-push:
        completed: false
        validated_by: null
        validated_at: null
    subflows:
      components:
        create: []
        refactor:
          - name: app-module-to-package
            completed: true
            validated_by: architect-agent
            validated_at: "2026-02-16T07:54:25+01:00"
          - name: core-module-to-package
            completed: true
            validated_by: architect-agent
            validated_at: "2026-02-16T07:54:25+01:00"
          - name: cli-to-package
            completed: true
            validated_by: architect-agent
            validated_at: "2026-02-16T07:54:25+01:00"
        delete: []
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
- **Acceptance Criteria**: [acceptance.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/12-npm-workspaces/acceptance.md)
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
