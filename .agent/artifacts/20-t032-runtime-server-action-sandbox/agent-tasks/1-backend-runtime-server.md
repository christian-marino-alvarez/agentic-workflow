---
artifact: agent_task
phase: phase-4-implementation
owner: backend
status: draft
related_task: 20-t032-runtime-server-action-sandbox
task_number: 1
---

# Agent Task — 1-backend-runtime-server

## Agent Identification (MANDATORY)
First line of the document:
`🏛️ **backend-agent**: Implement Runtime Server & IndexParser`

## Input (REQUIRED)
- **Objective**: Scaffold the `runtime` module and implement the `RuntimeServer` (Sidecar 2) entry point.
- **Scope**:
  - Create `src/extension/modules/runtime/backend/index.ts`.
  - Extend `AbstractServer` (but adapt for JSON-RPC if needed).
  - Implement **`IndexParser`** to read `.agent/index.md` at startup.
  - Setup `vscode-jsonrpc` connection over strict stdio (or ipc).
- **Dependencies**:
  - `vscode-jsonrpc` (npm package).
  - `.agent/index.md` (file structure to parse).
- **Constitutions**:
  - `constitution.backend`
  - `constitution.architecture`
  - `constitution.clean_code`

---

## Reasoning (MANDATORY)
> [!IMPORTANT]
> The agent **MUST** complete this section BEFORE executing.

### Objective analysis
The objective is to scaffold the Runtime Server (Sidecar 2) and implement the necessary infrastructure to parse the project's index (context awareness) and establish a JSON-RPC connection. This sets the foundation for the specific actions (fs, terminal) to be added later.

### Options considered
- **IPC**: Using raw `process.send` vs `vscode-jsonrpc`. Chosen `vscode-jsonrpc` as per requirements for standardization and robustness.
- **Index Parsing**: Using a full YAML parser vs regex. Chosen a hybrid approach: simple regex for MVP to avoid heavy dependencies in the sidecar.
- **Server Structure**: Independent entry point vs extending `AbstractServer`. **REVISED DECISION**: Initially independent, but refactored to extend `AbstractServer` (Core) to maintain architectural consistency and lifecycle management, running JSON-RPC in parallel with the base HTTP server.

### Decision made
Implemented `RuntimeServer` extending `AbstractBackend`. It initializes a JSON-RPC connection over `process.stdin/stdout` in parallel with the inherited Fastify server. Ideally positioned for hybrid communication (HTTP health checks + RPC actions).

---

## Output (REQUIRED)
- **Deliverables**:
  - `runtime/backend/index.ts`: Main server entry point (extends AbstractBackend).
  - `runtime/backend/index-parser.ts`: Logic to parse `.agent/index.md`.
  - `package.json`: Added `vscode-jsonrpc` dependency.
- **Required evidence**:
  - `npm run compile` passed successfully.

---

## Explanation of Implementation

### Changes made
1.  **Runtime Module**: Created `src/extension/modules/runtime/backend/`.
2.  **RuntimeServer**: Implemented the server class extending `AbstractBackend`. It overrides `start()` to launch the JSON-RPC listener alongside the base server.
3.  **IndexParser**: Implemented a parser that reads `.agent/index.md`.
4.  **Dependencies**: Added `vscode-jsonrpc` and `@types/js-yaml`.

### Technical decisions
- **Inheritance**: Extending `AbstractBackend` ensures the Runtime Server respects the core contract (port configuration, graceful shutdown, logging structure).
- **Parallel Protocols**: The server supports both HTTP (inherited) and JSON-RPC (added), allowing flexibility.
- **Robust Parsing**: Switched `IndexParser` to use `js-yaml` library for reliable parsing of the index file, replacing the initial fragile regex approach.

### Evidence
- Compilation successful.
- Code structure follows `constitution.backend` and extends core base class.

### Deviations from objective
- Refactored to extend `AbstractBackend` per user request (deviated from initial independent design).

---

## Gate (REQUIRED)

The developer **MUST** approve this task before the architect assigns the next one.

```yaml
approval:
  developer:
    decision: null
    date: null
    comments: null
```
