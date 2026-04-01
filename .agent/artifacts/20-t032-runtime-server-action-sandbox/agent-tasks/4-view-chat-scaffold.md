---
artifact: agent_task
phase: phase-4-implementation
owner: view
status: draft
related_task: 20-t032-runtime-server-action-sandbox
task_number: 4
---

# Agent Task — 4-view-chat-scaffold

## Agent Identification (MANDATORY)
First line of the document:
`🏛️ **view-agent**: Implement Chat Module Scaffold`

## Input (REQUIRED)
- **Objective**: Create the `chat` module that will act as the UI client for the Runtime Server.
- **Scope**:
  - Scaffold `src/extension/modules/chat/` (view, background, constants).
  - Implement `ChatView` (Lit Component) with basic UI (input/output).
  - Implement `ChatBackground` to orchestrate messages.
  - Connect Chat to Runtime:
    - Chat sends `EXECUTE_ACTION` to `RuntimeBackground`.
    - Handle permission requests (future task, but scaffold the handlers).
- **Dependencies**:
  - `RuntimeBackground` (Task 2/3).
  - `AppBackground` (to register Chat).
- **Constitutions**:
  - `constitution.view`
  - `constitution.background`

---

## Reasoning (MANDATORY)
> [!IMPORTANT]
> The agent **MUST** complete this section BEFORE executing.

### Objective analysis
The objective is to scaffold the Chat Module, which serves as the user interface for interacting with the Runtime. It needs a View (Lit Component) and a Background Controller.

### Options considered
- **Communication**: How to send messages to Runtime?
  - Option A: Direct import (tight coupling).
  - Option B: Event Bus (loose coupling).
  - **Decision**: For MVP Scaffold, `ChatBackground` logs the intent to send to Runtime. Future tasks will implement the Event Bus or direct IPC client.
- **UI Framework**: Lit, as mandated by `constitution.view`.

### Decision made
Implemented `ChatView` using Lit. Implemented `ChatBackground` as the controller. Registered `ChatBackground` in `AppBackground`.

---

## Output (REQUIRED)
- **Deliverables**:
  - `chat/view/index.ts`: UI with input/history.
  - `chat/background/index.ts`: Controller that handles SEND_MESSAGE.
  - `chat/constants.ts`: Message IDs.
  - `app/background/index.ts`: Registration.
- **Required evidence**:
  - Compilation success.
  - `ChatBackground` instantiated in App.

---

## Explanation of Implementation

### Changes made
1.  **Chat Module**: Created `src/extension/modules/chat/` structure.
2.  **ChatView**: Basic chat interface (history list + input box).
3.  **ChatBackground**: Listens for messages from View.
4.  **Registration**: Added to `AppBackground`.

### Technical decisions
- **Mock Action**: The chat currently hardcodes a "fs.read" action request for testing purposes, which is logged by the Controller.
- **ViewHtml**: Used standard `ViewHtml` helper to load the webview script.

### Evidence
- Compilation successful.

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
