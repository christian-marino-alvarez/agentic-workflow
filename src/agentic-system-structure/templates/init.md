---
id: task.init
title: Initialization
owner: {{architectAgentId}}
phase:
  current: init
---
# init bootstrap

- command: {{command}}
- role.architect: {{architectAgentId}}
- constitution.loaded.in_context: true

## Constitution (load order)
1. {{constitutionPaths[0]}}
2. {{constitutionPaths[1]}}
3. {{constitutionPaths[2]}}

```yaml
bootstrap:
  done: true
roles:
  architect: {{architectAgentId}}
constitution:
  loaded:
    - {{constitutionPaths[0]}}
    - {{constitutionPaths[1]}}
    - {{constitutionPaths[2]}}
