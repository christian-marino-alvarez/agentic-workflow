---
id: artifacts.index
owner: architect-agent
version: 1.0.0
severity: PERMANENT
---

# INDEX — Artifacts

## Agent identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## Objective
List artifact aliases and their expected paths.

## Aliases (YAML)
```yaml
artifacts:
  candidate:
    dir: .agent/artifacts/candidate/
    init: .agent/artifacts/candidate/init.md
    bootstrap: .agent/artifacts/candidate/bootstrap.md
    task: .agent/artifacts/candidate/task.md
```

## Rules
- Any new artifact alias MUST be added here.
