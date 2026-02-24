---
id: "25"
title: "normalize-workflow-markdown-structure"
owner: architect-agent
strategy: long
---

# Task — 25-normalize-workflow-markdown-structure

## Identification
- id: 25
- title: normalize-workflow-markdown-structure
- scope: current
- owner: architect-agent

## Origin
- created_from:
  - workflow: tasklifecycle-long
  - source: init
  - candidate_path: artifacts.candidate.task

## Task Description
Normalizar la estructura de todos los archivos markdown de workflows en `.agent/workflows/` para que sigan un formato estándar y consistente. Incluye YAML frontmatter unificado, secciones de cuerpo obligatorias en orden fijo, y revisión de naming conventions.

## Objective
Estandarizar los 18 workflows existentes con un schema YAML frontmatter y secciones de cuerpo uniformes, eliminando inconsistencias de formato, nombres de secciones y estructura.

## Lifecycle State (SINGLE SOURCE OF TRUTH)

```yaml
task:
  id: "25"
  title: "normalize-workflow-markdown-structure"
  strategy: "long"
  artifacts:
    supplemental: []
  phase:
    current: "completed"
    validated_by: "architect-agent"
    updated_at: "2026-02-23T20:59:18+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-23T20:18:53+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-23T20:25:39+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-23T20:44:50+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-23T20:46:27+01:00"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-23T20:56:09+01:00"
      phase-5-verification:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-23T20:56:44+01:00"
      phase-6-results-acceptance:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-23T20:57:15+01:00"
      phase-7-evaluation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-23T20:58:02+01:00"
      phase-8-commit-push:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-23T20:59:18+01:00"
```

---

## 2. Definition and Scope (Contract)
- **Acceptance Criteria**: [acceptance.md](./acceptance.md)
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
