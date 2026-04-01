---
id: 15-restore-workspace
title: Restore --workspace command
owner: architect-agent
strategy: short
---

# Task (Template)

## Identification
- id: 15-restore-workspace
- title: Restore --workspace command
- scope: current
- owner: architect-agent

## Origin
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.init

## Task Description
Investigar pérdida de comando y restaurarlo. Confirmado que el comando es `--workspace`, ejecutado desde CLI, y se espera su total restauración.

## Objective
Revisar por qué se ha perdido el comando `--workspace` en `agentic-workflow` y lograr que funcione nuevamente a través del CLI.

## Lifecycle State (SINGLE SOURCE OF TRUTH)

```yaml
task:
  id: "15-restore-workspace"
  title: "Restore --workspace command"
  strategy: "short"
  artifacts:
    supplemental: []
  phase:
    current: "short-phase-3-closure"
    validated_by: "architect-agent"
    updated_at: "2026-04-01T17:11:18+02:00"
  lifecycle:
    phases:
      short-phase-1-brief:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-04-01T17:07:47+02:00"
      short-phase-2-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-04-01T17:11:18+02:00"
      short-phase-3-closure:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-04-01T17:13:30+02:00"
```

---

## 2. Definition and Scope (Contract)
- **Acceptance Criteria**: [acceptance.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/15-restore-workspace/acceptance.md)
- **Alias**: `task.acceptance`
