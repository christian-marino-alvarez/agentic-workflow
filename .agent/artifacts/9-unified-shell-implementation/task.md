---
id: "9"
title: "9-Unified Tabbed Shell Implementation"
owner: architect-agent
strategy: "long"
---

# Task (Template)

## Identificación
- id: "9"
- title: "Unified Tabbed Shell Implementation"
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: tasklifecycle
  - candidate_path: .agent/artifacts/candidate/task.md

## Descripción de la tarea
Migrar la arquitectura de la extensión de una estructura de 4 WebviewViewProviders independientes (Chat, Workflow, History, Security) a una arquitectura unificada de Host único (`agw.mainView`). Se implementará el componente `<agw-unified-shell>` para gestionar la navegación entre pestañas y se centralizará el registro en el Core Controller.

## Objetivo
Unificar las vistas de la extensión en un solo panel lateral con pestañas, optimizando el rendimiento y permitiendo una gestión de estado centralizada.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

<!-- RUNTIME:START task-state -->
```yaml
task:
  id: "9"
  title: "Unified Tabbed Shell Implementation"
  strategy: "long"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "phase-4-implementation"
    validated_by: "architect-agent"
    updated_at: "2026-02-11T08:17:00Z"
  delegation:
    active_agent: "architect-agent"
    history: []
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-11T07:35:00Z"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-11T08:14:00Z"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-11T08:16:00Z"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-11T08:17:00Z"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-11T08:20:00Z"
      phase-5-verification:
        completed: false
        validated_by: null
        validated_at: null
      phase-6-results-acceptance:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-11T10:17:00Z"
      phase-7-evaluation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-11T10:17:00Z"
      phase-8-commit-push:
        completed: false
        validated_by: null
        validated_at: null
```
<!-- RUNTIME:END -->

---

## Registro de delegación
- Cualquier cambio de agente **DEBE** registrarse en `task.delegation.history`.

---

## 2. Definición y Alcance (Contrato)
- **Acceptance Criteria**: [acceptance.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/9-unified-shell-implementation/acceptance.md)
- **Alias**: `task.acceptance`
