---
id: 3
title: migracion-sistema-agentes
owner: architect-agent
strategy: long
acceptance_path: .agent/artifacts/3-migracion-sistema-agentes/acceptance.md
---

# Task (3) — migracion-sistema-agentes

## Identificación
- id: 3
- title: migracion-sistema-agentes
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle-long
  - source: init
  - candidate_path: .agent/artifacts/candidate/task-migracion.md

## Descripción de la tarea
Migración selectiva de componentes core del sistema de agentes (cli, runtime, structure, mcp) a un repositorio destino, excluyendo la extensión de VS Code. El proceso se realizará mediante un script temporal y se completará con la creación de diagramas explicativos para una presentación.

## Objetivo
Migración exitosa de componentes core del sistema de agentes mediante un script de exportación automatizado y creación de documentación visual técnica (diagramas).

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

<!-- RUNTIME:START task-state -->
```yaml
task:
  id: "3"
  title: "migracion-sistema-agentes"
  strategy: "long"
  artifacts:
    supplemental: []
  phase:
    current: "phase-8-commit-push"
    validated_by: "architect-agent"
    updated_at: "2026-02-09T20:09:42Z"
  delegation:
    active_agent: "architect-agent"
    history: []
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T19:51:23Z"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T19:54:28Z"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T19:56:31Z"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T19:57:45Z"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T20:10:00Z"
      phase-5-verification:
        completed: false
        validated_by: null
        validated_at: null
      phase-6-results-acceptance:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T20:09:42Z"
      phase-7-evaluation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T20:09:42Z"
      phase-8-commit-push:
        completed: false
        validated_by: null
        validated_at: null
```
<!-- RUNTIME:END -->

---

## Registro de delegación
- (Sin registros previos)

---

## 2. Definición y Alcance (Contrato)
- **Acceptance Criteria**: [.agent/artifacts/3-migracion-sistema-agentes/acceptance.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/3-migracion-sistema-agentes/acceptance.md)
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
