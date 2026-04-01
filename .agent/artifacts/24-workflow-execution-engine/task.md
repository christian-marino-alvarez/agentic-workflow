---
id: 24
title: workflow-execution-engine
owner: architect-agent
strategy: long
---

# Task: Workflow Execution Engine

## Identification
- id: 24
- title: workflow-execution-engine
- scope: current
- owner: architect-agent

## Origin
- created_from:
  - workflow: tasklifecycle-long
  - source: init
  - candidate_path: artifacts.candidate.task

## Task Description
Implementar un **Workflow Execution Engine** en el Runtime Server que interprete los workflows definidos en `.agent/workflows/`, los ejecute según la estrategia elegida (long/short), gestione gates de aprobación del desarrollador con UI interactiva (botones SI/NO, radio buttons), y exponga un panel dedicado para metadatos de workflow (constituciones cargadas, ficheros de contexto requeridos, workflow activo).

## Objective
Que el sistema agéntico sea capaz de leer, interpretar y ejecutar los workflows automáticamente desde el servidor runtime, siguiendo la cadena de PASS entre fases, identificando el agente owner de cada workflow, y con el architect orquestando las delegaciones. El chat solo mostrará resúmenes de tarea e informes con links a artefactos.

## Lifecycle State (SINGLE SOURCE OF TRUTH)

```yaml
task:
  id: "24"
  title: "workflow-execution-engine"
  strategy: "long"
  artifacts:
    supplemental: []
  phase:
    current: "phase-4-implementation"
    validated_by: "architect-agent"
    updated_at: "2026-02-22T12:43:23+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-21T23:22:12+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-21T23:29:03+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-21T23:46:18+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-22T12:43:23+01:00"
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
```

---

## 2. Definition and Scope (Contract)
- **Acceptance Criteria**: [acceptance.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/24-workflow-execution-engine/acceptance.md)
- **Alias**: `task.acceptance`

---

## Contractual Rules
- This file is the **single source of truth** of the task state.
- The `task.phase.current` field can **ONLY be modified by `architect-agent`**.
- The `task.lifecycle.phases.*` field can **ONLY be marked as completed by `architect-agent`**.
- A phase **CANNOT be marked as completed** if it is not the current phase.
- Phase advancement requires:
  1. Marking the current phase as `completed: true`
  2. Explicit architect validation
  3. Updating `task.phase.current` to the next phase
