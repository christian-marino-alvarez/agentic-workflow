# AGENTS & Project Context

Este fichero es el punto de entrada para asistentes del IDE y contiene el contexto crítico para el desarrollo de **Agentic Workflow**.

## 🚀 Project Overview

**Agentic Workflow** is a lightweight, language-agnostic orchestration framework designed to enforce discipline and safety in AI-agent-assisted development. It provides a structured lifecycle for tasks, mandatory human-in-the-loop gates, and a robust architecture-by-reference model.

This project uses a **"Dogfooding" approach**: the system itself is used to build the system. This creates a circular dependency that requires specific development workflows.

## 🛠️ Development Setup & Workflow

### 🚨 The Golden Rule (Dogfooding)
You **MUST** link your local source code to become the global executable to avoid version mismatches between the CLI and the source.

### Setup
Run this immediately after cloning or pulling changes:
```bash
npm run dev:setup
```
*This compiles the source and symlinks the global `agentic-workflow` command to your local `bin/cli.js`.*

### Daily Development
- **Refresh/Rebuild:** When modifying TypeScript code (`src/`), recompile to update the CLI:
  ```bash
  npm run dev:refresh
  ```
- **Verify Version:** Ensure you are running the local version:
  ```bash
  agentic-workflow --version
  ```
  *(Should match `package.json` version)*

### Build & Test Scripts
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Test:** `npm run test` | `npm run test:e2e` | `npm run test:coverage`

## 📂 Project Structure

- **`.agent/`**: **CRITICAL**. Local core snapshot of rules, workflows, and skills.
- **`src/`**: TypeScript source code.
  - `agentic-system-structure/`: Blueprint for the `.agent` folder.
  - `backend/`, `cli/`, `extension/`, `infrastructure/`, `mcp/`, `runtime/`.
- **`bin/`**: CLI entry point.

## 🧠 Core Concepts

- **AHRP**: Enforces a strict Triple-Gate flow.
- **MCP Integration**: Uses MCP server for state and governance traces.
- **Reference Model**: Verify files via the `index.md` alias system.

## 🤖 CLI Commands
- `agentic-workflow init` | `agentic-workflow mcp` | `agentic-workflow create`

---

## 🚀 Arranque del Sistema (OBLIGATORIO)

Para cualquier asistente que inicie una sesión en este repositorio:

1. Leer `.agent/index.md` (root index local).
2. Cargar el indice de workflows en `agent.domains.workflows.index`.
3. Cargar `workflows.init`.
4. Ejecutar el workflow `init` y seguir sus Gates.
