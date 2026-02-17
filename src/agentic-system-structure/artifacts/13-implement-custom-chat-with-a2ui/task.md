---
id: 13
title: Implement Custom Chat with A2UI
owner: architect-agent
strategy: long
---

# Task (Definitive)

## Identification
- id: 13
- title: Implement Custom Chat with A2UI
- scope: current
- owner: architect-agent

## Origin
- created_from:
  - workflow: tasklifecycle-long
  - source: init
  - candidate_path: artifacts.candidate.task

## Task Description
Replace the existing ChatKit integration with a custom chat interface using the A2UI framework (Google's new framework for AI-rendered components). This involves completely removing the `vscode-chatkit` dependency and implementing a new UI that meets the "Spanish chat" requirement while keeping the source code in English.

## Objective
Replace ChatKit with a custom chat interface using A2UI framework/library.

## Lifecycle State (SINGLE SOURCE OF TRUTH)

```yaml
task:
  id: "13"
  title: "Implement Custom Chat with A2UI"
  strategy: "long"
  artifacts:
    supplemental: []
  phase:
    current: "phase-2-analysis"
    validated_by: "architect-agent"
    updated_at: "2026-02-16T12:06:32+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-16T12:00:33+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-16T12:06:32+01:00"
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
    subflows:
      components:
        create: []
        refactor: []
        delete: []
```

---

## 2. Definition and Scope (Contract)
- **Acceptance Criteria**: [acceptance.md](file:///.agent/artifacts/13-implement-custom-chat-with-a2ui/acceptance.md)
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

> **STATUS NOTE**: Task PAUSED at Phase 2 Analysis entry point.
