---
id: 14
title: Re-implement Setup/Config (D1)
owner: architect-agent
strategy: long
---

# Task (Definitive)

## Identification
- id: 14
- title: Re-implement Setup/Config (D1)
- scope: current
- owner: architect-agent

## Origin
- created_from:
  - workflow: tasklifecycle-long
  - source: init
  - candidate_path: artifacts.candidate.task

## Task Description
Re-implement the Setup and Configuration domain (D1) as a **Standalone Module**.
The App Shell must be refactored to support a **Tab-based Module System** (Settings, Chat, History, Agents).
The Settings Module will be responsible for its own data (LLM Registry, Keys) and UI, exposing only necessary state (Active Model) to the system.

## Objective
1. Define `Module` Interface in Core.
2. Implement Tab-based Navigation in App Shell.
3. Implement `SettingsModule` with Lit+Material UI.
4. implementations must use **Scaffolding Skill**.

## Lifecycle State (SINGLE SOURCE OF TRUTH)

```yaml
task:
  id: "14"
  title: "Re-implement Setup/Config (D1)"
  strategy: "long"
  artifacts:
    supplemental: []
  phase:
    current: "phase-4-implementation"
    validated_by: "architect-agent"
    updated_at: "2026-02-16T18:30:00+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-16T12:14:51+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-16T12:18:19+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-16T16:02:19+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-16T18:18:27+01:00"
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
        create: []
        refactor: []
        delete: []
```

---

## 2. Definition and Scope (Contract)
- **Acceptance Criteria**: [acceptance.md](file:///.agent/artifacts/14-re-implement-setup-config-d1/acceptance.md)
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
