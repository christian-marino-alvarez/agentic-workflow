# @christian-marino-alvarez/agentic-workflow

[English] | [Español](./README.es.md)

> Portable agentic workflow orchestration system with strict identity and gate discipline.

## 🚀 Overview

**Agentic Workflow** is a lightweight, language-agnostic orchestration framework designed to enforce discipline and safety in AI-agent-assisted development. It provides a structured lifecycle for tasks, mandatory human-in-the-loop gates, and a robust architecture-by-reference model.

## ✨ Key Features

- **AHRP (Agentic Handover & Reasoning Protocol)**: Enforces a strict Triple-Gate flow for every task (Activation, Reasoning Approval, and Results Acceptance).
- **Architecture by Reference**: Keeps your project clean by referencing core rules and workflows from `node_modules`.
- **Zero-Tolerance Governance**: Automatic performance penalties for protocol violations.
- **Standalone & Portable**: Works in any project provided the IDE agent can read Markdown files.

## 📦 Installation

```bash
npm install @christian-marino-alvarez/agentic-workflow
```

## 🛠️ CLI Commands

### `init`
Initializes the agentic system in the current directory.
- Detects legacy systems and offers migration with automatic backups.
- Creates the `.agent/` structure (indexes, proxy directories).
- Generates `AGENTS.md`, the entry point for IDE assistants.
```bash
npx agentic-workflow init
```

### `create <role|workflow> <name>`
Scaffolds a new custom component.
- **role**: Creates a new agent role with mandatory identification rules.
- **workflow**: Creates a custom work cycle template.
```bash
npx agentic-workflow create role neo
```

### `restore`
Recovers the `.agent/` configuration from a previous backup.
- Backups are stored in `.agent-backups/`.
- Allows selecting versions before a destructive change.
```bash
npx agentic-workflow restore
```

## 🔌 MCP Server Configuration

To use the framework with IDEs that support the Model Context Protocol (e.g., Cursor, Windsurf), you must add the server to your settings.

### Recommended (via NPX)
Use `npx` to ensure you are always using the correct version from your project:
- **Command**: `npx agentic-workflow mcp`

### Manual (Global/Local)
If you have the package installed locally, you can point to the local binary:
- **Command**: `node ./node_modules/.bin/agentic-workflow mcp`

## 🧠 Core Concepts

### Lifecycles
The framework supports two main workflows depending on task complexity:
1. **Long Lifecycle (9 Phases)**: For complex features requiring Research, Analysis, Planning, and formal Architectural Review.
2. **Short Lifecycle (3 Phases)**: For quick fixes or simple updates, merging Acceptance, Implementation, and Closure.

### AHRP Protocol
Every agent task follows the **Agentic Handover & Reasoning Protocol**:
1. **Gate A (Activation)**: The agent is assigned but blocked. Developer must say `YES`.
2. **Gate B (Reasoning)**: The agent proposes a plan. Developer must approve with `YES`.
3. **Gate C (Results)**: The agent completes the work. Developer validates with `YES`.

### Architecture by Reference
To ensure stability, the framework's core logic (rules and workflows) resides inside `node_modules`. Your project's `.agent/index.md` uses absolute paths to reference these immutable assets, protecting the framework from accidental local modifications.

## ⚖️ Governance

This framework is built on the principle of **Maximum Discipline**. Agents are required to:
1. Identify themselves with a mandatory prefix.
2. Submit a reasoning plan before any modification.
3. Obtain explicit developer approval (`YES`) for every transition.

## 📄 License

ISC License. See [LICENSE](./LICENSE) for details.
