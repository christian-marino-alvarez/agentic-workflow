---
description: Scaffold a new Agentic Module using the scaffolding skill.
trigger: /scaffold-module <module-name>
---

# Workflow: Scaffold Module

## Input
- Module Name (from argument or prompt).

## Steps

1. **Invoke Skill**
   - Use `run_command` to execute the Yeoman generator from `.agent/skills/scaffolding`.
   - Command: `npx yo ./.agent/skills/scaffolding/generators/module --name <module-name>`

2. **Validation**
   - Verify creation of:
     - `src/extension/modules/<module-name>/index.ts`
     - `src/extension/modules/<module-name>/view/index.ts`
     - `src/extension/modules/<module-name>/backend/service.ts`

3. **Report**
   - Confirm successful generation to the user.
