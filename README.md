# @christianmaf80/agentic-workflow

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
npm install @christianmaf80/agentic-workflow
```

## 🛠️ CLI Commands

### `init`
Initializes the agentic system in the current directory.
- Detects legacy systems and offers migration with automatic backups.
- Creates/refreshes the `.agent/` structure with the core files.
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
- Backups are stored as `.agent.backup_<timestamp>` in the project root.
- Allows selecting versions before a destructive change.
```bash
npx agentic-workflow restore
```

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

### Architecture by Install
To ensure stability, the framework's core logic (rules and workflows) is installed into your project's `.agent` folder. This provides a clean, local copy that can be extended without touching the published package.

## ⚖️ Governance

This framework is built on the principle of **Maximum Discipline**. Agents are required to:
1. Identify themselves with a mandatory prefix.
2. Submit a reasoning plan before any modification.
3. Obtain explicit developer approval (`YES`) for every transition.

## 📄 License

ISC License. See [LICENSE](./LICENSE) for details.
