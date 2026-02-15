/**
 * UNIFIED INDEX — Agentic System Structure
 *
 * This file provides a typed, single source of truth for all file paths
 * within the .agent system. It mirrors the structure of .agent/index.md.
 */

export const AGENT_INDEX = {
  version: "1.1.0",
  rules: {
    constitution: {
      clean_code: ".agent/rules/constitution/clean-code.md",
      agents_behavior: ".agent/rules/constitution/agents-behavior.md",
      vscode_extensions: ".agent/rules/constitution/vscode-extensions.md",
      class_oriented: ".agent/rules/constitution/class-oriented.md",
      external_html: ".agent/rules/constitution/external-html.md",
      lit_decorators: ".agent/rules/constitution/lit-decorators.md",
      backend: ".agent/rules/constitution/backend.md",
      background: ".agent/rules/constitution/background.md",
      view: ".agent/rules/constitution/view.md"
    },
    roles: {
      architect: ".agent/rules/roles/architect.md",
      qa: ".agent/rules/roles/qa.md",
      researcher: ".agent/rules/roles/researcher.md",
      neo: ".agent/rules/roles/neo.md",
      devops: ".agent/rules/roles/devops.md",
      engine: ".agent/rules/roles/engine.md",
      vscode_specialist: ".agent/rules/roles/vscode-specialist.md",
      backend: ".agent/rules/roles/backend.md",
      background: ".agent/rules/roles/background.md",
      view: ".agent/rules/roles/view.md"
    }
  },
  workflows: {
    init: ".agent/workflows/init.md",
    tasklifecycle_long: ".agent/workflows/tasklifecycle-long/index.md",
    tasklifecycle_short: ".agent/workflows/tasklifecycle-short/index.md"
  },
  templates: {
    task: ".agent/templates/task.md",
    acceptance: ".agent/templates/acceptance.md",
    init: ".agent/templates/init.md",
    analysis: ".agent/templates/analysis.md",
    planning: ".agent/templates/planning.md",
    subtask_implementation: ".agent/templates/subtask-implementation.md",
    review: ".agent/templates/review.md",
    verification: ".agent/templates/verification.md",
    results_acceptance: ".agent/templates/results-acceptance.md",
    task_metrics: ".agent/templates/task-metrics.md",
    agent_scores: ".agent/templates/agent-scores.md",
    research: ".agent/templates/research.md",
    agent_task: ".agent/templates/agent-task.md",
    todo_item: ".agent/templates/todo-item.md",
    changelog: ".agent/templates/changelog.md",
    supplemental_report: ".agent/templates/supplemental-report.md",
    brief: ".agent/templates/brief.md",
    closure: ".agent/templates/closure.md"
  },
  artifacts: {
    candidate: {
      dir: ".agent/artifacts/candidate",
      init: ".agent/artifacts/candidate/init.md",
      task: ".agent/artifacts/candidate/task.md"
    }
  }
} as const;

export type AgentIndex = typeof AGENT_INDEX;
