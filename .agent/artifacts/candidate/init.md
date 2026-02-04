---
id: task.init
title: Initialization
owner: architect-agent
phase:
  current: init
---
# init bootstrap

- command: init
- role.architect: architect-agent
- constitution.loaded.in_context: true

## Constitution (load order)
1. .agent/rules/constitution/clean-code.md
2. .agent/rules/constitution/agents-behavior.md
3. .agent/rules/constitution/index.md

```yaml
bootstrap:
  done: true
roles:
  architect: architect-agent
constitution:
  loaded:
    - .agent/rules/constitution/clean-code.md
    - .agent/rules/constitution/agents-behavior.md
    - .agent/rules/constitution/index.md
language:
  value: es
  confirmed: true
strategy: short
traceability:
  verified: true
  mcp_tool: runtime_chat
  response: '{"status":"ok"}'
  timestamp: "2026-02-03T21:21:27Z"
runtime:
  started: true
```
