# Roadmap Backlog - Advanced Agentic Workflow

## 🌍 Global Status
| Domain | Status | Completed | Total |
|---|---|---|---|
| **D1: Settings & OAuth** | 🏗️ Architecture | 3 | 8 |
| **D2: UI (Chat/Workflows)** | 🏗️ Concept | 1 | 7 |
| **D3: Backend (Agents)** | 🏗️ Concept | 1 | 5 |
| **D4: Runtime & Execution** | 🏗️ Concept | 0 | 2 |
| **D7: Release/CI-CD** | ✅ Stable | 3 | 3 |
| **D8: E2E Testing** | ✅ Stable | 4 | 4 |

**Total**: 12/29 tasks completed

## 🎯 Priority High - Critical Path
- [x] **T017**: D1 - OAuth Authentication Provider (vscode.authentication)
- [x] **T018**: D1 - Model Registry UI (API Key + OAuth Tokens)
- [x] **T010**: D3 - Chat Session Endpoint
- [ ] **T019**: D3 - Agent Factory & Role-Model Binding
- [ ] **T032**: D4 - Runtime Server (File I/O & Sandbox)
- [ ] **T020**: D2 - Chat Filters (Agent/Thread)

---

## 📅 Backlog by Domain

### D1: Settings & Configuration (OAuth)
> Focus: Secure token management and Model Registry.
- [x] **T017**: OAuth Provider Implementation
  - Implement `AuthenticationProvider` for Google OAuth + PKCE. ✅
  - Integration with `vscode.authentication`. ✅
  - ⚠️ OpenAI does NOT support third-party OAuth (API keys only).
  - OAuth timeout fix: 10s → 120s for browser login flows.
- [x] **T018**: Model Registry UI
  - CRUD for LLM Models (Name, Provider, AuthType). ✅
  - Secure storage of API Keys vs OAuth Tokens. ✅
- [ ] **T021**: Settings Migration
  - Migrate current `settings.json` to new Registry format.
- [ ] **T022**: Profile Management
  - Allow switching between "Work" (Codex) and "Research" (Claude) profiles.
- [x] **T023**: Settings Validation
  - Verify API Keys/Tokens on save. ✅ (Test Connection for API key + OAuth)
- [ ] **T034**: Default Model per Task Type
  - Allow assigning a default model per workflow phase/agent role.
- [ ] **T035**: Import/Export Configuration
  - Export model registry to JSON/YAML. Import from file.
- [ ] **T036**: Advanced Validation
  - Model capability detection (vision, code, etc.).
  - Token limit warnings on model selection.

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
- [x] **T037**: App Version & Footer Refactor
  - Centralize version logic in App class. ✅
  - Move footer to AppView template. ✅

### D3: Backend & Agent Orchestration
> Focus: Dynamic Agent Instantiation.
- [x] **T010**: Chat Session Endpoint
  - Ensure `ChatBackendClient` targets correct `/sessions` endpoint. ✅
  - Functional chat flow restored. ✅
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
- [x] **T038**: Fix CI Build Errors
  - Resolved TypeScript errors in CI. ✅

---

## 🚀 Next Suggested Steps
1.  **T019 (Agent Factory)**: Required to actually use the models.
2.  **T020 (Chat Filters)**: Quick win for UI usability.
3.  **T022 (Profile Management)**: Work/Research profile switching.

**Last Updated**: 2026-02-19 by architect-agent (T010, T037, T038 completed)
