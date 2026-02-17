---
description: Scaffold a new Agentic Module using the scaffolding skill.
trigger: /scaffold-module <module-name>
---

# Workflow: Scaffold Module

## Input
- Module Name (from argument or prompt).

## Steps

1. **Invoke Skill**
   - Use `run_command` to execute the Yeoman generator from `src/cli/scaffolding`.
    "CommandLine": "npx yo ./src/cli/scaffolding/generators/module {{ module_name }} --force"

2. **Validation**
   - Verify creation of:
     - `src/extension/modules/<module-name>/index.ts`
     - `src/extension/modules/<module-name>/view/index.ts`
     - `src/extension/modules/<module-name>/view/templates/main/html.ts`
     - `src/extension/modules/<module-name>/view/templates/main/css.ts`
     - `src/extension/modules/<module-name>/background/index.ts`
     - `src/extension/modules/<module-name>/backend/index.ts`

3. **TypeScript Compilation**
   - Run `npm run compile` to verify no TypeScript errors.
   - **CRITICAL**: Module MUST compile without errors.
   - If compilation fails, fix errors before proceeding.

4. **ESLint Validation**
   - Run `npm run lint` (or equivalent) to verify no linting errors.
   - **CRITICAL**: Module MUST pass linting.
   - If linting fails, fix errors before proceeding.

5. **Report**
   - Confirm successful generation and validation to the user.
   - Report any errors encountered during validation.
