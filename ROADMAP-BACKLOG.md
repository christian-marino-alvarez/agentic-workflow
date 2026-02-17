# Roadmap Backlog - Advanced Agentic Workflow

## 🌍 Global Status
| Domain | Status | Completed | Total |
|---|---|---|---|
| **D1: Settings & OAuth** | 🏗️ Architecture | 1 | 5 |
| **D2: UI (Chat/Workflows)** | 🏗️ Concept | 0 | 6 |
| **D3: Backend (Agents)** | 🏗️ Concept | 0 | 4 |
| **D4: Runtime & Execution** | 🏗️ Concept | 0 | 2 |
| **D7: Release/CI-CD** | ✅ Stable | 2 | 2 |
| **D8: E2E Testing** | ✅ Stable | 4 | 4 |

**Total**: 7/21 tasks completed

## 🎯 Priority High - Critical Path
- [x] **T017**: D1 - OAuth Authentication Provider (vscode.authentication)
- [ ] **T018**: D1 - Model Registry UI (API Key + OAuth Tokens)
- [ ] **T019**: D3 - Agent Factory & Role-Model Binding
- [ ] **T032**: D4 - Runtime Server (File I/O & Sandbox)
- [ ] **T020**: D2 - Chat Filters (Agent/Thread)

---

## 📅 Backlog by Domain

### D1: Settings & Configuration (OAuth)
> Focus: Secure token management and Model Registry.
- [x] **T017**: OAuth Provider Implementation
  - Implement `AuthenticationProvider` for GitHub/Auth0.
  - Integration with `vscode.authentication`.
- [ ] **T018**: Model Registry UI
  - CRUD for LLM Models (Name, Provider, AuthType).
  - Secure storage of API Keys vs OAuth Tokens.
- [ ] **T021**: Settings Migration
  - Migrate current `settings.json` to new Registry format.
- [ ] **T022**: Profile Management
  - Allow switching between "Work" (Codex) and "Research" (Claude) profiles.
- [ ] **T023**: Settings Validation
  - Verify API Keys/Tokens on save.

### D2: UI & User Experience (Advanced)
> Focus: Visual Workflows and Enhanced Chat.
- [ ] **T024**: Workflow Viewer (Litegraph)
  - Integrate **Litegraph.js** into a Lit Component.
  - Read-only view of `.agent/workflows/*.md` (parsed to graph).
- [ ] **T025**: Workflow Editor (Litegraph)
  - Drag & Drop interface for creating workflows.
  - Serialize to JSON/YAML.
- [ ] **T020**: Chat Filters
  - Filter messages by specific Agent (e.g., "Show only Architect").
  - Filter by Thread/Task.
- [ ] **T026**: Task Timeline
  - Visualize Agent execution history using **vis-timeline**.
  - Interactive zoom/pan.
- [ ] **T027**: Agent Status Widget
  - Real-time status in VS Code Status Bar.
- [ ] **T028**: Theme Synchronization
  - Ensure all Lit components (Graph/Timeline) match VS Code Theme.

### D3: Backend & Agent Orchestration
> Focus: Dynamic Agent Instantiation.
- [ ] **T019**: Agent Factory
  - Logic to instantiate Agents based on `Role + Model` configuration.
  - `LLMService` router extension.
- [ ] **T029**: Role Definition Schema
  - Enhance `roles.yaml` to support forced model capabilities (e.g., "Requires Vision").
- [ ] **T030**: Agent Lifecycle Events
  - Emit events (Start/Think/Tool/End) for the Timeline UI.
- [ ] **T031**: Context Windows Management
  - Dynamic context pruning based on Agent-Model limits.

### D4: Runtime & Execution Engine
> Focus: Flow Control and Safe Action Execution.
- [ ] **T032**: Runtime Server (Action Runner)
  - Dedicated server/process to execute Agent actions (File Read/Write, Command Exec).
  - Sandboxing and permission control (Allow/Deny prompts).
- [ ] **T033**: Flow Engine
  - Interpreter to execute Litegraph workflows (JSON).
  - Orchestrates data flow between nodes and calls Agent Actions.

### D7 & D8 (Maintenance)
- [x] CI/CD Pipelines (Done)
- [x] E2E Base Suite (Done)

---

## 🚀 Next Suggested Steps
1.  **T017 (OAuth)**: Fundamental for secure model access.
2.  **T019 (Factory)**: Required to actually use the models.
3.  **T020 (Filters)**: Quick win for UI usability.

**Last Updated**: 2026-02-17 by architect-agent (Task 17)
