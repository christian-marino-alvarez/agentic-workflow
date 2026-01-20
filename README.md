# @cmarino/agentic-workflow

> Portable agentic workflow orchestration system with strict identity and gate discipline.

## 🚀 Overview

**Agentic Workflow** is a lightweight, language-agnostic orchestration framework designed to enforce discipline and safety in AI-agent-assisted development. It provides a structured lifecycle for tasks, mandatory human-in-the-loop gates, and a robust architecture-by-reference model.

## ✨ Key Features

- **AHRP (Agentic Handover & Reasoning Protocol)**: Enforces a strict Triple-Gate flow for every task (Activation, Reasoning Approval, and Results Acceptance).
- **Architecture by Reference**: Keeps your project clean by referencing core rules and workflows from `node_modules`.
- **Zero-Tolerance Governance**: Automatic performance penalties for protocol violations.
- **CLI Utility**: Easy initialization and recovery tools.
- **Standalone & Portable**: Works in any project provided the IDE agent can read Markdown files.

## 📦 Installation

```bash
npm install @cmarino/agentic-workflow
```

## 🛠️ Quick Start

1. **Initialize the system** in your project root:
   ```bash
   npx agentic-workflow init
   ```

2. **Start a session**:
   Point your AI assistant (e.g., Cursor, GitHub Copilot, Antigravity) to read `AGENTS.md` and follow the instructions.

## ⚖️ Governance

This framework is built on the principle of **Maximum Discipline**. Agents are required to:
1. Identify themselves with a mandatory prefix.
2. Submit a reasoning plan before any modification.
3. Obtain explicit developer approval (`SI`) for every transition.

## 📄 License

ISC License. See [LICENSE](./LICENSE) for details.
