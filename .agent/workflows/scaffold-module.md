---
id: workflow.scaffold-module
owner: architect-agent
description: "Scaffold a new Agentic Module using the scaffolding skill."
version: 1.0.0
trigger: ["scaffold-module"]
type: static
---

# WORKFLOW: scaffold-module

## Input
- Module Name (from argument or prompt).

## Output
- Scaffolded module directory with all required files:
  - `src/extension/modules/<module-name>/index.ts`
  - `src/extension/modules/<module-name>/view/index.ts`
  - `src/extension/modules/<module-name>/view/templates/main/html.ts`
  - `src/extension/modules/<module-name>/view/templates/main/css.ts`
  - `src/extension/modules/<module-name>/background/index.ts`
  - `src/extension/modules/<module-name>/backend/index.ts`

## Objective
- Generate a complete module scaffold using the Yeoman generator.
- Validate that all required files are created.
- Ensure the module compiles without TypeScript errors.
- Ensure the module passes ESLint validation.

## Instructions

### 1. Invoke Skill
- Use `run_command` to execute the Yeoman generator from `src/cli/scaffolding`.
  ```
  npx yo ./src/cli/scaffolding/generators/module {{ module_name }} --force
  ```

### 2. Validation
- Verify creation of all files listed in Output.

### 3. TypeScript Compilation
- Run `npm run compile` to verify no TypeScript errors.
- **CRITICAL**: Module MUST compile without errors.
- If compilation fails, fix errors before proceeding.

### 4. ESLint Validation
- Run `npm run lint` (or equivalent) to verify no linting errors.
- **CRITICAL**: Module MUST pass linting.
- If linting fails, fix errors before proceeding.

### 5. Report
- Confirm successful generation and validation to the user.
- Report any errors encountered during validation.

## Gate
Requirements (all mandatory):
1. All files listed in Output exist.
2. TypeScript compilation passes without errors.
3. ESLint validation passes without errors.
4. Module follows the modular architecture constitution.

## Pass
- Report that the module was scaffolded successfully.
- List all created files.
- Confirm compilation and linting status.

## Fail
- Indicate exactly what failed:
  - Missing files from scaffold.
  - TypeScript compilation errors.
  - ESLint violations.
- Request the minimum action to resolve.
- Terminate blocked.
