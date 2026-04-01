---
id: task-beta-release
title: Beta Release of Agentic System Structure
owner: architect-agent
strategy: short
---

# Task (Candidate)

## Identification
- id: task-beta-release
- title: Beta Release of Agentic System Structure
- scope: candidate
- owner: architect-agent

## Origin
- created_from:
  - workflow: tasklifecycle-short
  - source: init
  - candidate_path: .agent/artifacts/candidate/task.md

## Task Description
Create a new beta version to publish the new agent structure and distribute it.
The distribution should NOT include the VSCode extension.
It should only include the CLI and `/src/agentic-system-structure`.
The goal is to certify that it can be installed in any project via the CLI commands and that the structure is copied exactly as it is.

## Objective
Create a beta version of the CLI that distributes the agentic-system-structure, excluding the VSCode extension, and verify that `init` command installs the structure correctly in a target project.

## Lifecycle State (SINGLE SOURCE OF TRUTH)

```yaml
task:
  id: "task-beta-release"
  title: "Beta Release of Agentic System Structure"
  strategy: "short"
  artifacts:
    supplemental: []
  phase:
    current: "short-phase-3-closure"
    validated_by: "architect-agent"
    updated_at: "2026-02-16T11:42:00+01:00"
  lifecycle:
    phases:
      short-phase-1-brief:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-16T11:22:00+01:00"
      short-phase-2-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-16T11:27:00+01:00"
      short-phase-3-closure:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-16T11:42:00+01:00"
```

---

## 2. Definition and Scope (Contract)
- **Acceptance Criteria**: [acceptance.md](file:///.agent/artifacts/candidate/acceptance.md)
- **Alias**: `task.acceptance`
