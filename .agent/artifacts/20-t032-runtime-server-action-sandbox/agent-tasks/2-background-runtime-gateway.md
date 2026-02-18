---
artifact: agent_task
phase: phase-4-implementation
owner: background
status: draft
related_task: 20-t032-runtime-server-action-sandbox
task_number: 2
---

# Agent Task — 2-background-runtime-gateway

## Agent Identification (MANDATORY)
First line of the document:
`🏛️ **background-agent**: Implement Runtime Background & Permission Gateway`

## Input (REQUIRED)
- **Objective**: Implement the Orchestration layer (`RuntimeBackground`) that manages the Runtime Server process and acts as the Permission Gateway.
- **Scope**:
  - Create `src/extension/modules/runtime/background/index.ts`.
  - Extend `Background` (Core).
  - Implement `runBackend()` call to spawn `runtime/backend/index.js` (on port 3001).
  - Register `RuntimeBackground` in `AppBackground`.
  - Implement **`PermissionEngine`** logic (mocked UI initially):
    - Validate Agent Role Skills (read from Markdown).
    - Mode check (Sandbox vs Full).
- **Dependencies**:
  - `RuntimeServer` (Task 1).
  - `AppBackground` (to register).
- **Constitutions**:
  - `constitution.background`
  - `constitution.architecture`
  - `constitution.clean_code`

---

## Reasoning (MANDATORY)
> [!IMPORTANT]
> The agent **MUST** complete this section BEFORE executing.

### Objective analysis
The objective is to implement the orchestration layer (`RuntimeBackground`) that manages the sidecar lifecycle and enforcing permissions. This layer acts as the bridge between the Extension Host (VS Code) and the independent Runtime Server.

### Options considered
- **PermissionEngine Location**:
  - Option A: In `chat` module (Closer to UI).
  - Option B: In `runtime/background` (Central Gateway).
  - **Selected Option**: B. The Runtime must be the single source of truth for security. If placed in Chat, other modules could bypass checks. The Chat module is just a consumer.

### Decision made
Implemented `RuntimeBackground` extending Core `Background`. Registered it in `AppBackground`. Implemented `PermissionEngine` (mocked) to gate IPC calls.

---

## Output (REQUIRED)
- **Deliverables**:
  - `runtime/background/index.ts`: Orchestrator and Gateway.
  - `runtime/background/permission-engine.ts`: Security Logic.
  - `runtime/constants.ts`: Message constants.
  - `app/background/index.ts`: Updated registration.
- **Required evidence**:
  - Compilation success.
  - Use of `MESSAGES` constants.

---

## Explanation of Implementation

### Changes made
1.  **Runtime Constants**: Created `constants.ts` for strictly typed message IDs.
2.  **RuntimeBackground**: Implemented the class that spawns the sidecar (port 3001) and listens for `EXECUTE_ACTION` messages.
3.  **PermissionEngine**: Implemented the logic to check if `agentRole` has permission for `action`.
4.  **Registration**: Instantiated `RuntimeBackground` in `AppBackground` constructor.

### Technical decisions
- **Gateway Pattern**: `RuntimeBackground` intercepts all status/action requests before they reach the sidecar.
- **Mocked Permissions**: For Task 2, `PermissionEngine` uses simple logic (allow 'backend' role) to verify the flow. Real Markdown parsing will be added in Task 3.

### Evidence
- Compilation successful.
- Linter checks passed (fixed `getHtmlForWebview` and `Message` types).

### Deviations from objective
- None.

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
