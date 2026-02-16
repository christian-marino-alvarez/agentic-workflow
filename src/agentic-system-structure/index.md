---
id: agent.index
owner: architect-agent
version: 1.1.1
severity: PERMANENT
description: "UNIFIED ROOT INDEX. Lists ALL system aliases in a single file."
---

# UNIFIED INDEX — .agent

## Objective
This file is the **Single Source of Truth** for file locations in the `.agent` system.
It contains **ALL** aliases for Rules, Workflows, Templates, and Artifacts.

## Aliases (YAML)
```yaml
agent:
  version: 1.1.1

  rules:
    constitution:
      clean_code: .agent/rules/constitution/clean-code.md
      agents_behavior: .agent/rules/constitution/agents-behavior.md
      vscode_extensions: .agent/rules/constitution/vscode-extensions.md
      backend: .agent/rules/constitution/backend.md
      background: .agent/rules/constitution/background.md
      view: .agent/rules/constitution/view.md

    roles:
      architect: .agent/rules/roles/architect.md
      qa: .agent/rules/roles/qa.md
      researcher: .agent/rules/roles/researcher.md
      neo: .agent/rules/roles/neo.md
      engine: .agent/rules/roles/engine.md
      vscode-specialist: .agent/rules/roles/vscode-specialist.md
      backend: .agent/rules/roles/backend.md
      background: .agent/rules/roles/background.md
      view: .agent/rules/roles/view.md

  workflows:
    init: .agent/workflows/init.md
    tasklifecycle-long: .agent/workflows/tasklifecycle-long/index.md
    tasklifecycle-short: .agent/workflows/tasklifecycle-short/index.md
    coding:
      backend: .agent/workflows/coding/coding-backend.md
      background: .agent/workflows/coding/coding-background.md
      view: .agent/workflows/coding/coding-view.md
      integration: .agent/workflows/coding/coding-integration.md

  templates:
    task: .agent/templates/task.md
    acceptance: .agent/templates/acceptance.md
    init: .agent/templates/init.md
    analysis: .agent/templates/analysis.md
    planning: .agent/templates/planning.md
    subtask_implementation: .agent/templates/subtask-implementation.md
    review: .agent/templates/review.md
    verification: .agent/templates/verification.md
    results_acceptance: .agent/templates/results-acceptance.md
    task_metrics: .agent/templates/task-metrics.md
    agent_scores: .agent/templates/agent-scores.md
    research: .agent/templates/research.md
    agent_task: .agent/templates/agent-task.md
    todo_item: .agent/templates/todo-item.md
    changelog: .agent/templates/changelog.md
    supplemental_report: .agent/templates/supplemental-report.md
    brief: .agent/templates/brief.md
    closure: .agent/templates/closure.md
    coding:
      layer_report: .agent/templates/coding/coding-layer-report.md
      integration_report: .agent/templates/coding/coding-integration-report.md

  artifacts:
    candidate:
      dir: .agent/artifacts/candidate
      init: .agent/artifacts/candidate/init.md
      task: .agent/artifacts/candidate/task.md
```

## Rules
- **No valid sub-indexes exist**. Everything must be here.
- If you add a file to the system, you **MUST** register it here.
