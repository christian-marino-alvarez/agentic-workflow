---
id: workflows.index
owner: architect-agent
version: 1.0.0
severity: PERMANENT
---

# INDEX — Workflows

## Agent identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## Objective
List workflow entry points and indexes for the workflow domain.

## Input (REQUIRED)
- None (index).

## Output (REQUIRED)
- Workflow index updated with current aliases.

## Aliases (YAML)
```yaml
workflows:
  init: .agent/workflows/init.md
  tasklifecycle_long: .agent/workflows/tasklifecycle-long/index.md
  tasklifecycle_short: .agent/workflows/tasklifecycle-short/index.md
```

## Pass
- Alias list is up to date and valid.

## Gate (REQUIRED)
Requirements (all mandatory):
1. This index file exists.
2. All aliased workflows resolve to valid paths.

If Gate FAIL:
- Block until resolved.

## Rules
- Any new workflow entry point MUST be added here.
- Phase workflows should be listed in their domain indexes (e.g., tasklifecycle-long).
