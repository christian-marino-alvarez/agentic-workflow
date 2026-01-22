# init bootstrap

- command: {{command}}
- role.architect: {{architectAgentId}}
- bootstrap.path: {{bootstrapPath}}
- constitution.loaded.in_context: true
- constitution.loaded.from_bootstrap: true

## Bootstrap (initial load)
- path: {{bootstrapPath}}

## Constitution (load order)
1. {{constitutionPaths[0]}}
2. {{constitutionPaths[1]}}
3. {{constitutionPaths[2]}}

```yaml
bootstrap:
  done: true
  path: {{bootstrapPath}}
roles:
  architect: {{architectAgentId}}
constitution:
  loaded_from_bootstrap: true
  loaded:
    - {{constitutionPaths[0]}}
    - {{constitutionPaths[1]}}
    - {{constitutionPaths[2]}}
