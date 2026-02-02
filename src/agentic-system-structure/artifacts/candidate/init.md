---
kind: artifact
name: init
source: agentic-system-structure
---

# init bootstrap

- command: init
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
    - .agent/rules/constitution/clean-code.md
    - .agent/rules/constitution/agents-behavior.md
language:
  value: Español
  confirmed: true
strategy: short
```
