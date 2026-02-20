---
id: 23
title: agent-delegation
owner: architect-agent
strategy: long
---

# Task: Agent Delegation (Inter-Agent Task Routing)

## Identification
- id: 23
- title: agent-delegation
- scope: current
- owner: architect-agent

## Origin
- created_from:
  - workflow: tasklifecycle-long
  - source: init
  - candidate_path: artifacts.candidate.task
  - backlog_ref: T039

## Task Description
Implementar delegación inter-agente donde el architect-agent puede asignar sub-tareas a agentes especializados (qa, backend, view, etc.) sin intervención del desarrollador. El agente coordinador recibe el resultado y lo sintetiza para el usuario.

## Objective
Que el architect-agent pueda delegar tareas a otros agentes dentro de una misma sesión de chat, usando un tool `delegateTask` que invoque internamente otro agente con su personalidad y herramientas, devolviendo el resultado al coordinador.

## Acceptance Criteria
- [acceptance.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/23-agent-delegation/acceptance.md)
- Alias: `task.acceptance`

## Lifecycle State (SINGLE SOURCE OF TRUTH)

```yaml
task:
  id: "23"
  title: "agent-delegation"
  strategy: "long"
  artifacts:
    supplemental: []
  phase:
    current: "phase-5-verification"
    validated_by: "architect-agent"
    updated_at: "2026-02-20T16:52:06+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-20T16:35:23+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-20T16:41:35+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-20T16:44:22+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-20T16:46:54+01:00"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-20T16:52:06+01:00"
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

## Contractual Rules
- This file is the **single source of truth** of the task state.
- The `task.phase.current` field can **ONLY be modified by `architect-agent`**.
- A phase **CANNOT be marked as completed** if it is not the current phase.
