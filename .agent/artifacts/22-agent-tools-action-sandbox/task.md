---
id: "22"
title: "agent-tools-action-sandbox"
owner: architect-agent
strategy: long
---

# Task: T032 — Agent Tools & Action Sandbox

## Identification
- id: 22
- title: agent-tools-action-sandbox
- scope: current
- owner: architect-agent

## Origin
- created_from:
  - workflow: tasklifecycle-long
  - source: init
  - candidate_path: artifacts.candidate.task

## Task Description
Implementar tools ejecutables para los agentes del Chat (readFile, writeFile, runCommand,
listDir, searchWeb, searchFiles) con sistema de permisos sandbox/full y UI interactiva
de confirmación (Allow/Deny) en el chat.

## Objective
Permitir que los agentes pasen de ser chatbots a asistentes productivos capaces de
interactuar con el sistema de archivos, terminal y web, controlados por permisos.

## Lifecycle State (SINGLE SOURCE OF TRUTH)

```yaml
task:
  id: "22"
  title: "agent-tools-action-sandbox"
  strategy: "long"
  artifacts:
    supplemental: []
  phase:
    current: "phase-5-verification"
    validated_by: "architect-agent"
    updated_at: "2026-02-20T12:06:16+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-20T11:45:41+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-20T11:49:12+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-20T11:55:59+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-20T12:06:16+01:00"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-20T12:06:16+01:00"
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
- **Acceptance Criteria**: [acceptance.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/22-agent-tools-action-sandbox/acceptance.md)
- **Alias**: `task.acceptance`

---

## Contractual Rules
- This file is the **single source of truth** of the task state.
- The `task.phase.current` field can **ONLY be modified by `architect-agent`**.
- A phase **CANNOT be marked as completed** if it is not the current phase.
- Phase advancement requires:
  1. Marking the current phase as `completed: true`
  2. Explicit architect validation
  3. Updating `task.phase.current` to the next phase
