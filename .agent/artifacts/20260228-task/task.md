---
artifact: task
phase: phase-1-init
owner: architect-agent
status: active
---

# Task — 20260228-task

## Task Definition

```yaml
task:
  id: "20260228-task"
  title: "Untitled"
  description: ""
  created_at: "2026-02-28T13:57:55.210Z"
  language: "Español"
```

## Acceptance Criteria

```yaml
acceptance_criteria:
  - id: AC-1
    description: "{{criterion-1}}"
    status: pending
  # ... repeat for each criterion (3-7 total)
```

**Status values**: `pending` | `met` | `not_met`

## Lifecycle State

```yaml
lifecycle:
  current_phase: "phase-1-init"
  phases:
    phase-1-init:
      status: in_progress
      completed_at: null
    phase-2-analysis:
      status: pending
      completed_at: null
    phase-3-planning:
      status: pending
      completed_at: null
    phase-4-implementation:
      status: pending
      completed_at: null
    phase-5-review:
      status: pending
      completed_at: null
```

**Phase status values**: `pending` | `in_progress` | `completed`

## Subtasks

```yaml
subtasks: []
# Populated in Phase 2 (analysis) with format:
#   - id: ST-1
#     name: "<name>"
#     type: backend | background | view | integration | generic
#     agent: "<agent>"
#     status: pending | in_progress | completed | failed
```

## Artifact Registry

Tracks all artifacts generated during the task lifecycle.

| Phase | Agent | Artifact | Version |
|-------|-------|----------|---------|
| Phase 1 | architect | task.md | - |

> [!NOTE]
> This table is updated by agents as they create artifacts during the lifecycle.
> Each row records: which phase, which agent, what artifact, and its current version.
