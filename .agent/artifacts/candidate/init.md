# init bootstrap

- command: /init
- role.architect: role.architect-agent
- constitution.loaded.in_context: true

## Constitution (load order)
1. .agent/rules/constitution/clean-code.md
2. .agent/rules/constitution/agents-behavior.md
3. .agent/rules/constitution/modular-architecture.md

```yaml
bootstrap:
  done: true
roles:
  architect: role.architect-agent
constitution:
  loaded:
    - .agent/rules/constitution/clean-code.md
    - .agent/rules/constitution/agents-behavior.md
    - .agent/rules/constitution/modular-architecture.md
language:
  value: Español
  confirmed: true
strategy: long
```
