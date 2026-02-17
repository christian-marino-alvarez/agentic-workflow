---
name: scaffolding
description: "Capability to generate project structures using Yeoman."
version: 1.0.0
---

# Scaffolding Skill

This skill allows agents (typically `devops-agent`) to generate project structures using Yeoman generators.

## Capabilities
- **Generate Module**: Create a new Agentic Module with standard structure (View, Backend, Index).

## Usage

### Generate a Module
To generate a new module, use the `run_command` tool to execute the local generator.

```bash
# scaffolding/generators/module is a local generator
npx yo ./.agent/skills/scaffolding/generators/module --name <module-name>
```

## Structure
- `generators/module/`: Contains the Yeoman generator for modules.
  - `index.js`: Generator logic.
  - `templates/`: Boilerplate files.
