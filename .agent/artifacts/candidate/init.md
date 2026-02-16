# init bootstrap

- command: init
- role.architect: architect-agent
- constitution.loaded.in_context: true

## Constitution (load order)
1. .agent/rules/constitution/clean-code.md
2. .agent/rules/constitution/agents-behavior.md

## Language Configuration
```yaml
language:
  value: español
  confirmed: true
```

## Lifecycle Strategy
```yaml
strategy: long
```

## Bootstrap Status
```yaml
bootstrap:
  done: true
  timestamp: 2026-02-16T07:23:57+01:00
  
roles:
  architect: architect-agent

constitution:
  loaded:
    - .agent/rules/constitution/clean-code.md
    - .agent/rules/constitution/agents-behavior.md

indices:
  loaded:
    - .agent/index.md
    
traceability:
  workflow: workflows.init
  version: 4.0.0
  gate_validated: true
```
