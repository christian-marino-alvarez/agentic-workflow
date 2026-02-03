# @christianmaf80/agentic-workflow

[English] | [Español](./README.es.md)

> Portable agentic workflow orchestration system with strict identity and gate discipline.

## 🚀 Overview

**Agentic Workflow** is a lightweight, language-agnostic orchestration framework designed to enforce discipline and safety in AI-agent-assisted development. It provides a structured lifecycle for tasks, mandatory human-in-the-loop gates, and a robust architecture-by-reference model.

## ✨ Key Features

- **AHRP (Agentic Handover & Reasoning Protocol)**: Enforces a strict Triple-Gate flow for every task (Activation, Reasoning Approval, and Results Acceptance).
- **Runtime Governance & MCP**: Deep integration with an MCP server for lifecycle tracking, gate validation, and tamper-proof logging.
- **Agentic Skills**: Modular capabilities for agents, including localized and specialized governance skills (e.g., `skill.runtime-governance`).
- **Local Core Snapshot**: Copies core rules and workflows into `.agent/` so runtime no longer depends on `node_modules` access.
- **Standalone & Portable**: Works in any project provided the IDE agent can read Markdown files.

## 📦 Installation

```bash
npm install @christianmaf80/agentic-workflow
```

## 🤖 Start with AI Assist

If you are using this framework with an AI coding assistant (like Cursor, Windsurf, or Copilot), you can bootstrap the entire system directly from the chat:

> **You:** "Please run the `init` command for agentic-workflow"

The agent will use its terminal tools to set up the environment, create the `.agent` structure, and prepare the project for governed cycles without you typing a single command.

## 🛠️ CLI Commands

### `init`
Initializes the agentic system in the current directory.
- Detects legacy systems and offers migration with automatic backups.
- Creates/refreshes the `.agent/` structure with the core files.
- Generates `AGENTS.md`, the entry point for IDE assistants.
```bash
npx agentic-workflow init
```

### `create <role|workflow|skill> <name>`
Scaffolds a new project-specific component.
- **role**: Creates a new agent role with mandatory identification rules.
- **workflow**: Creates a custom work cycle template.
- **skill**: Creates a new modular skill with its own `SKILL.md` template.
```bash
npx agentic-workflow create role neo
```

### `restore`
Recovers the `.agent/` configuration from a previous backup.
```bash
npx agentic-workflow restore
```

### `clean`
Removes legacy or temporary configuration files (e.g., outdated MCP setups).
```bash
npx agentic-workflow clean
```

### `mcp`
Starts the local MCP Runtime server (stdio mode).
```bash
npx agentic-workflow mcp
```

### `register-mcp`
Automatically registers the local server in the Antigravity/Gemini config.
```bash
npx agentic-workflow register-mcp
```

## ⚙️ Advanced Configuration

### MCP Runtime Integration
The system relies on an MCP server to track the workflow state. To connect it with your IDE assistant (like Antigravity):
1. Run `npx agentic-workflow register-mcp`.
2. Ensure `mcp_config.json` (or equivalent) points to the local CLI binary.
3. The Runtime logs are stored in `agentic-runtime.log` for debugging.

## 🧠 Core Concepts

### Lifecycles
The framework supports two main workflows depending on task complexity:

#### 1. Long Lifecycle (9 Phases)
Designed for complex features, architectural changes, or tasks with high risk. It ensures maximum reasoning before a single line of code is written.
- **Phase 0: Acceptance Criteria**: Eliminates ambiguity by defining exactly what success looks like.
- **Phase 1: Research**: Context gathering. Necessary to understand existing code or external APIs.
- **Phase 2: Analysis**: Impact evaluation. Identifies risks and architectural constraints.
- **Phase 3: Planning**: Detailed implementation plan. Crucial for developer alignment before execution.
- **Phase 4: Implementation**: The actual coding process.
- **Phase 5: Verification**: Rigorous testing and validation of the implemented changes.
- **Phase 6: Results Acceptance**: Final developer sign-off on the delivered value.
- **Phase 7: Evaluation**: Retrospective on the agent's performance and process efficiency.
- **Phase 8: Commit & Push**: Safely persisting the changes to the repository.

#### 2. Short Lifecycle (3 Phases)
Optimized for quick fixes, simple documentation updates, or low-risk changes.
- **Phase 1: Brief**: Merges Acceptance, Analysis, and Planning into a single step for speed.
- **Phase 2: Implementation**: Combined coding and verification.
- **Phase 3: Closure**: Results acceptance and final cleanup.

### AHRP Protocol
Every agent task follows the **Agentic Handover & Reasoning Protocol**:
1. **Gate A (Activation)**: The agent is assigned but blocked. Developer must say `YES`.
2. **Gate B (Reasoning)**: The agent proposes a plan. Developer must approve with `YES`.
3. **Gate C (Results)**: The agent completes the work. Developer validates with `YES`.

### Architecture by Install
To ensure stability, the framework's core logic (rules and workflows) is installed into your project's `.agent` folder. This provides a clean, local copy that can be extended without touching the published package.

### Domain Indexing System
The system uses a **Cascading Indexing Architecture** for absolute traceability:
1. **Root Index** (`.agent/index.md`): Declares the entry points for all system domains (rules, workflows, templates, skills, artifacts).
2. **Domain Indexes**: Each folder contains its own `index.md` where files are assigned **aliases**.
3. **Reference Model**: Agents never use absolute paths. They resolve references through the alias system (e.g., `skill.runtime-governance` → `.agent/skills/runtime-governance/SKILL.md`), ensuring that logic can be moved or updated without breaking workflows.

### Runtime Accountability
All lifecycle transitions are recorded through a dedicated MCP Runtime. Actions performed without a corresponding "Governance Trace" (MCP logs) are considered invalid and subject to reversal.

## 📄 License

ISC License. See [LICENSE](./LICENSE) for details.
