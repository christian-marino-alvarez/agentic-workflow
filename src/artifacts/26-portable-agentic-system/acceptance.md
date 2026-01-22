# Acceptance Criteria: Portable Agentic System

## Definition
The objective is to decouple the agentic orchestration system from the Extensio framework and package it as `@cmarino/agentic-workflow`. This package will be distributable via npm and allow any project to initialize an agentic workspace with a standard command. The system supports a hybrid customization model where core immutable workflows reside in the package, while project-specific roles and configurations reside in the local `.agent/` directory, linked via the package.

## Clarification Questions & Answers

1. **Package Name**: `@cmarino/agentic-workflow`
2. **Installation**: Standard `npm init` starter (scaffolding/CLI).
3. **Customization**: Hybrid model. Core workflows are immutable in the package. Local `.agent` contains custom parts (roles, constitutions) that link/reference the package where appropriate.
4. **Independence**: Must be fully independent of Extensio framework.
5. **Core Criterion**: Successful installation in an empty repo, running `/init`, and recognition of local roles.

## Acceptance Criteria Checklist

- [ ] **Package Creation**:
  - [ ] Create npm package `@cmarino/agentic-workflow`.
  - [ ] Define `bin` entry point for CLI execution.
  - [ ] dependencies properly defined (minimal bloat).
- **Core Decoupling**:
  - [ ] Extract `rules/constitution` base files (generic ones).
  - [ ] Extract `workflows/tasklifecycle` (generic ones).
  - [ ] Extract `templates` (generic ones).
  - [ ] Ensure no hardcoded imports/paths to Extensio specific files.
- **CLI Implementation**:
  - [ ] `init` command scaffolds `.agent/` directory.
  - [ ] `.agent/index.md` generation pointing to package internals + local overrides.
  - [ ] Support for creating a local `AGENTS.md` (or equivalent) for user agents.
- **Verification**:
  - [ ] **Manual Test**: Run `npm init @cmarino/agentic-workflow` in a completely new/empty directory.
  - [ ] **Functional Test**: In that new directory, run the agent with `/init` and verify it loads the default constitution and prompts for a task.
  - [ ] **Customization Test**: Add a dummy custom role in the new repo's `.agent/rules/roles/` and verify the agent sees it.

## Approval
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-19T21:17:26+01:00
    comments: Aprobado por consola.
```
