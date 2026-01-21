# Task (Template)

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## Identification
- id: {{task.id}}
- title: {{task.title}}
- scope: candidate | current
- owner: architect-agent

## Source
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Task Description
{{task.description}}

## Objective
{{task.goal}}

## Lifecycle Status (SINGLE SOURCE OF TRUTH)

```yaml
task:
  id: "{{task.id}}"
  title: "{{task.title}}"
  strategy: "{{task.strategy}}"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "phase-0-acceptance-criteria"
    validated_by: "architect-agent"
    updated_at: "{{timestamp}}"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: false
        validated_by: null
        validated_at: null
      phase-1-research:
        completed: false
        validated_by: null
        validated_at: null
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
      drivers:
        create:
          - name: <driver-name>
            completed: false
            validated_by: null
            validated_at: null
        refactor:
          - name: <driver-name>
            completed: false
            validated_by: null
            validated_at: null
        delete:
          - name: <driver-name>
            completed: false
            validated_by: null
            validated_at: null
      modules:
        create:
          - name: <module-name>
            completed: false
            validated_by: null
            validated_at: null
        refactor:
          - name: <module-name>
            completed: false
            validated_by: null
            validated_at: null
        delete:
          - name: <module-name>
            completed: false
            validated_by: null
            validated_at: null
      pages:
        create:
          - name: <page-name>
            completed: false
            validated_by: null
            validated_at: null
      shards:
        create:
          - name: <shard-name>
            completed: false
            validated_by: null
            validated_at: null
      short-phase-1-brief:
        completed: false
        validated_by: null
        validated_at: null
      short-phase-2-implementation:
        completed: false
        validated_by: null
        validated_at: null
      short-phase-3-closure:
        completed: false
        validated_by: null
        validated_at: null
```

---

## 2. Definition and Scope (Contract)
- **Acceptance Criteria**: [acceptance.md](file:///{{task.acceptance_path}})
- **Alias**: `task.acceptance`

---

## Contractual Rules
- This file is the **single source of truth** for the task status.
- The `task.phase.current` field **ONLY can be modified by `architect-agent`**.
- The `task.lifecycle.phases.*` field **ONLY can be marked as completed by `architect-agent`**.
- A phase **cannot be marked as completed** if it is not the current phase.
- Advancing to the next phase requires:
  1. Marking the current phase as `completed: true`
  2. Explicit validation from the architect
  3. Updating `task.phase.current` to the next phase
