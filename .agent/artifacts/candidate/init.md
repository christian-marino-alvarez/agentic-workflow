# init bootstrap

- command: /init
- role.architect: architect-agent
- constitution.loaded.in_context: true

## Constitution (load order)
1. .agent/rules/constitution/clean-code.md
2. .agent/rules/constitution/agents-behavior.md
3. .agent/index.md

```yaml
bootstrap:
  done: true
roles:
  architect: architect-agent
constitution:
  loaded:
    - .agent/rules/constitution/clean-code.md
    - .agent/rules/constitution/agents-behavior.md
    - .agent/index.md
language:
  value: spanish
  confirmed: true
strategy: long
```

