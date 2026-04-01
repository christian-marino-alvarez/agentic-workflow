---
id: 19
title: agent-factory
owner: architect-agent
strategy: long
---

# Task: Agent Factory & Role-Model Binding

## Identification
- id: 19
- title: agent-factory
- scope: current
- owner: architect-agent

## Origin
- created_from:
  - workflow: tasklifecycle-long
  - source: init
  - candidate_path: artifacts.candidate.task

## Task Description
Crear la capa de servicio que transforma los modelos LLM registrados en Settings en clientes funcionales capaces de realizar llamadas a APIs de IA, con soporte para streaming, function calling y tool use. Incluye binding de roles (agentes) a modelos.

## Objective
Implementar el Agent Factory: LLM client abstraction layer con provider clients extensibles, factory dispatch, streaming, y role-model binding dentro del sidecar backend.

## Lifecycle State (SINGLE SOURCE OF TRUTH)

```yaml
task:
  id: "19"
  title: "agent-factory"
  strategy: "long"
  artifacts:
    supplemental: []
  phase:
    current: "phase-3-planning"
    validated_by: "architect-agent"
    updated_at: "2026-02-18T17:43:04+01:00" # Keeping original timestamp as no new one was provided
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-18T17:37:14+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-18T17:43:04+01:00"
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
```

---

## 2. Definition and Scope (Contract)
- **Acceptance Criteria**: [acceptance.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/19-agent-factory/acceptance.md)
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
