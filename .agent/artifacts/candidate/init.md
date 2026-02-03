# init bootstrap

- command: /init
- role.architect: architect-agent
- constitution.loaded.in_context: true

## Constitution (load order)
1. .agent/rules/constitution/clean-code.md
2. .agent/rules/constitution/agents-behavior.md

```yaml
bootstrap:
  done: true
roles:
  architect: architect-agent
constitution:
  loaded:
    - constitution.clean_code
    - constitution.agents_behavior
language:
  value: español
  confirmed: true
strategy: short
traceability:
  verified: true
  mcp_tool: runtime_chat
  response: "status: ok"
  timestamp: "2026-02-03T08:21:09+01:00"
```
