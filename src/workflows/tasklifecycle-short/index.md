---
id: workflow.tasklifecycle-short
owner: architect-agent
version: 1.1.0
severity: PERMANENT
description: Orchestrates the simplified (Short) lifecycle of a task starting from a valid init.
trigger:
  commands: ["tasklifecycle-short", "/tasklifecycle-short"]
blocking: true
---

# WORKFLOW: tasklifecycle-short (Index)

## 0. Role Activation and Prefix (MANDATORY)
- The `architect-agent` **MUST** begin its intervention by identifying itself.
- Message: `🏛️ **architect-agent**: Starting Short lifecycle.`

## Required Indexes (MANDATORY)
This workflow does **NOT** define aliases outside its domain (`taskcycle-short`).
To use artifacts and templates, global indexes **MUST** be loaded:

- Artifacts index: `.agent/artifacts/index.md`
- Templates index: `.agent/templates/index.md`

## Domain Aliases: `taskcycle-short` (MANDATORY)
This workflow defines aliases **only** for the `taskcycle-short` (task lifecycle short) domain.
There is **one unique namespace** `aliases.taskcycle-short.phases.*` containing:
- `id`: Phase ID
- `workflow`: Path to the phase workflow file

## Aliases (YAML)
```yaml
aliases:
  taskcycle-short:
    phases:
      short_phase_1:
        id: short-phase-1-brief
        workflow: .agent/workflows/tasklifecycle-short/short-phase-1-brief.md
      short_phase_2:
        id: short-phase-2-implementation
        workflow: .agent/workflows/tasklifecycle-short/short-phase-2-implementation.md
      short_phase_3:
        id: short-phase-3-closure
        workflow: .agent/workflows/tasklifecycle-short/short-phase-3-closure.md
```

## Input (REQUIRED)
- `init` artifact exists with `task.strategy == "short"`.
- The developer has defined the task title and objective.

## Output (REQUIRED)
- Task candidate with `task.strategy: short`.

## Objective (ONLY)
- Execute a simplified 3-phase cycle for low-complexity tasks.

## Pass
- `artifacts.candidate.task` exists with `task.strategy: short`.
- All phase workflows for the `taskcycle-short` domain are available.

## Gate (REQUIRED)
Requirements (all mandatory):
1. `artifacts.candidate.task` exists with `task.strategy: short`.
2. All phase workflows for the `taskcycle-short` domain are available.

If Gate FAIL:
- Block until resolved.
