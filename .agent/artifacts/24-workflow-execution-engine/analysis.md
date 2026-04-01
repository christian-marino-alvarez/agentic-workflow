🏛️ **architect-agent**: Analysis — T24 Workflow Execution Engine

---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 24-workflow-execution-engine
---

# Analysis — 24-workflow-execution-engine

## 1. Executive Summary

**Problem**
The agentic workflow system currently relies on the LLM (Gemini, Claude, etc.) to manually interpret workflow `.md` files at runtime. This is unreliable, costly in tokens, and produces inconsistent results. The system needs a deterministic workflow execution engine that parses and follows workflows programmatically.

**Objective**
Build a Workflow Execution Engine in the Runtime Server (sidecar 2) that:
- Parses `.md` workflow files with `gray-matter` (already installed)
- Executes workflow steps sequentially, following PASS/FAIL chains
- Presents gates to the developer via interactive UI components
- Persists execution state durably
- Exposes a metadata panel separate from the chat

**Success Criterion**
All 7 acceptance criteria from `acceptance.md` must be met: parse workflows, follow PASS chains, interactive gates, dedicated panel, chat shows only summaries, persistent state, and `npm run compile` passes.

---

## 2. Project State (As-Is)

### Relevant Structure
```
src/extension/modules/
├── runtime/
│   ├── backend/           ← RuntimeServer (Fastify + JSON-RPC, port 3001)
│   │   ├── index.ts       ← Current sidecar: ping, status, initialize
│   │   └── index-parser.ts ← IndexParser: resolves .agent/index.md aliases
│   ├── background/        ← RuntimeBackground: spawns sidecar, PermissionEngine
│   │   ├── index.ts
│   │   └── permission-engine.ts
│   └── constants.ts       ← NAME='Runtime', MESSAGES
├── chat/
│   ├── background/index.ts ← 560-line ChatBackground: sessions, messaging, delegation
│   └── view/              ← Chat UI (Lit component)
├── core/
│   ├── backend/           ← AbstractBackend (Fastify server base class)
│   ├── background/        ← Background base class
│   ├── messaging/         ← Message bridge primitives
│   └── view/              ← View base class (Lit)
├── llm/                   ← LLM adapters, delegation tools
├── settings/              ← Settings module
├── app/                   ← App shell (tabs, navigation)
└── auth/                  ← Authentication module
```

### Existing Components
- **RuntimeServer**: Extends `AbstractBackend` (Fastify). Has JSON-RPC over stdio + HTTP on port 3001. Currently handles: `ping`, `status`, `initialize` (which triggers IndexParser).
- **IndexParser**: Already parses `.agent/index.md`, resolves aliases to paths. Uses `js-yaml` for YAML parsing within markdown code blocks.
- **RuntimeBackground**: Spawns the sidecar, has `PermissionEngine`. Listens for `EXECUTE_ACTION` messages.
- **ChatBackground**: Handles message sending, session management, delegation. Communicates with LLM sidecar for agent responses.

### Core/Base Layers
- `AbstractBackend`: Provides Fastify server lifecycle, health check, `/command` endpoint. All backends extend this.
- `Background`: VS Code extension host orchestrator. Provides `runBackend()` for sidecar spawning, `postMessage()` for webview communication.
- `View`: Lit-based base class for webview components.

### Detected Limitations
1. **RuntimeServer has no workflow handling** — only IndexParser for alias resolution
2. **No section-level markdown parser** — gray-matter extracts frontmatter but not body sections (steps, gates)
3. **No dedicated UI panel for Runtime/Workflow** — Runtime has no view component
4. **Chat has no structured gate interaction** — only free-text message exchange
5. **No persistence layer** — state is ephemeral (in-memory or `globalState`)

---

## 3. Acceptance Criteria Coverage

### AC-1: Runtime Server can load, parse, and interpret a workflow .md
- **Interpretation**: The RuntimeServer receives a workflow path, uses `gray-matter` to parse frontmatter, then a custom section parser to extract steps, gates, PASS/FAIL actions.
- **Verification**: Unit test parsing a sample workflow file. Integration test via JSON-RPC `workflow.load` request.
- **Risks**: Workflow `.md` has no formal schema — parser must handle variations robustly.

### AC-2: On PASS, automatically advance to the next workflow
- **Interpretation**: The PASS step in each workflow references the next phase. The engine reads this and loads the next workflow. The `task.md` state is updated automatically.
- **Verification**: Integration test simulating PASS → next workflow load.
- **Risks**: Circular references, missing PASS targets.

### AC-3: Gates presented with interactive buttons in the chat
- **Interpretation**: When a gate requires developer approval, the engine sends a gate request to the RuntimeBackground → ChatBackground → ChatView. The view renders `md-filled-button` (SI/NO) or `md-radio` components. Developer response flows back.
- **Verification**: E2E test clicking gate buttons. Unit test for message flow.
- **Risks**: Asynchronous flow — engine must wait indefinitely for gate responses without blocking.

### AC-4: Dedicated panel for workflow metadata
- **Interpretation**: A new view component (possibly a new module or injected into the AppView as a panel) that displays: current workflow name, loaded constitutions, required context files, phase progress.
- **Verification**: Visual verification of panel content. Unit test for panel component.
- **Risks**: Panel integration with existing tab system — must not break current UX.

### AC-5: Chat shows only progress, summaries, and links to artifacts
- **Interpretation**: Workflow interpretation happens silently in the engine. Chat receives only: phase transitions, gate prompts, summary messages, and artifact links. No raw workflow content.
- **Verification**: Review chat output during workflow execution. No raw `.md` content visible.
- **Risks**: Clear boundary between engine logs and chat messages.

### AC-6: Workflow state persisted in Runtime Server between sessions
- **Interpretation**: The current phase, gate responses, timestamps, and task metadata are stored durably. On restart, the engine can resume from the last state.
- **Verification**: Test: execute to phase 2, restart extension, verify state is recovered.
- **Risks**: Persistence choice impacts packaging and portability.

### AC-7: `npm run compile` passes without errors
- **Interpretation**: All new TypeScript code compiles cleanly.
- **Verification**: Run `npm run compile` after implementation.
- **Risks**: Low — standard build gate.

---

## 4. Technical Research

### Workflow Engine: XState v5 (DECIDED)
- **Description**: Full statechart library with actor model. Each workflow `.md` is parsed by `WorkflowParser` (gray-matter + custom section parser) into a `WorkflowDef`, which is then auto-converted to an XState machine config via `generateMachine()`.
- **Why XState over custom**: The project roadmap includes T043 (Async Delegation), T033 (Flow Engine), and multi-agent orchestration. XState provides built-in: deterministic state management, `snapshot()`/`restore()` persistence, actor model (each agent = actor), guards for gates, and visual debugging via Stately Inspector. A custom executor would require reimplementing these features as the system grows.
- **Architecture**: XState lives in the **RuntimeServer** (sidecar 2). The md→XState bridge:
  1. `WorkflowParser` reads `.md` → `WorkflowDef` (structured object)
  2. `generateMachine(def)` → XState machine config
  3. `createActor(machine)` → running workflow instance
  4. Gates = states that wait for `GATE_APPROVE` / `GATE_REJECT` events
  5. PASS = `final` state → parent lifecycle machine loads next phase
- **Complement with OpenAI Agents SDK**: XState orchestrates *when* agents are invoked (deterministic). The LLM agents do the *intelligent work* (research, analysis, code generation). XState = director, Agents = musicians.
- **New dependency**: `xstate` (~50KB, zero native addons, pure JS/TS)

### Reload Strategy (DECIDED)
- **Default behavior**: Workflows NOT in execution are always read fresh from disk (no cache). Changes apply immediately on next load.
- **Workflow in execution**: Changes do NOT auto-apply. A `FileSystemWatcher` (`vscode.workspace.createFileSystemWatcher('**/.agent/workflows/**/*.md')`) detects modifications and shows a warning in the metadata panel: "⚠️ File modified externally — [🔄 Reload] [Ignore]"
- **Manual reload button**: The developer consciously decides when to reload. On reload, the engine re-parses the `.md`, recreates the XState machine, and attempts to maintain the current state position.

### Persistence: lowdb (DECIDED)
- **Description**: JSON file-based database. Pure JavaScript, ESM-compatible, zero native dependencies.
- **Why lowdb**: No binary compilation issues for VS Code packaging. Simple API. Atomic writes. Workflow state is very small data (~few KB). Stores XState snapshots via `actor.getPersistedSnapshot()` → JSON → lowdb.
- **Rejected**: better-sqlite3 (native addon → packaging complexity), level (single-process lock + native addon).

### UI Components: @material/web (DECIDED — already installed v2.4.1)
- **Description**: Material Design 3 web components. Covers: `md-filled-button` (SI/NO), `md-radio` (clarification questions), `md-dialog` (gate modals), `md-linear-progress` (phase progress), `md-icon`.
- **Theme integration**: Map CSS custom properties to VS Code theme tokens (existing pattern in project).

### Parser: gray-matter + custom section parser (DECIDED — already installed v4.0.3)
- **Description**: gray-matter extracts YAML frontmatter. Custom section parser extracts Steps, Gates, PASS/FAIL from the markdown body using regex/heading-based parsing.

---

## 5. Participating Agents

### 🧠 engine-agent
- **Responsibilities**: Implement the Workflow Engine in the Runtime Server backend.
  - Workflow Parser (frontmatter + sections)
  - Workflow Executor (step execution, PASS/FAIL handler)
  - Persistence layer (lowdb integration)
  - JSON-RPC handlers for workflow operations
- **Sub-areas**: `src/extension/modules/runtime/backend/`

### ⚙️ background-agent (background layer specialist)
- **Responsibilities**: Wire the RuntimeBackground to communicate with the engine and the Chat.
  - New message types for workflow events
  - Gate request/response bridging
  - Event bus emissions for panel updates
- **Sub-areas**: `src/extension/modules/runtime/background/`

### 🎨 view-agent (view layer specialist)
- **Responsibilities**: Build the Workflow Metadata Panel UI.
  - New Lit component for panel
  - Gate interaction components (buttons, radio)
  - Integration with Chat view for gate prompts
- **Sub-areas**: `src/extension/modules/runtime/view/` (NEW), chat view updates

### 🏛️ architect-agent
- **Responsibilities**: Orchestrate, validate, maintain architectural coherence.

**Handoffs**:
1. engine-agent → background-agent: Engine exposes JSON-RPC API, Background consumes it
2. background-agent → view-agent: Background sends workflow state via postMessage, View renders
3. background-agent → chat-background: Gate requests forwarded to chat for developer interaction

**Required Components**:
- **CREATE**: `runtime/backend/workflow-parser.ts` — gray-matter + section parser → `WorkflowDef`
- **CREATE**: `runtime/backend/workflow-engine.ts` — XState machine factory + lifecycle orchestrator
- **CREATE**: `runtime/backend/persistence.ts` — lowdb state store (XState snapshots)
- **CREATE**: `runtime/view/` — NEW view layer: metadata panel (index.ts + templates/)
- **MODIFY**: `runtime/background/index.ts` — Workflow message handlers + FileSystemWatcher
- **MODIFY**: `runtime/constants.ts` — New message types (GATE_REQUEST, GATE_RESPONSE, STATE_UPDATE, etc.)
- **MODIFY**: `chat/background/index.ts` — Gate interaction handlers (forward to ChatView)
- **MODIFY**: `chat/view/templates/html.ts` — Gate UI components (@material/web buttons, radio)

**Demo**: Not required — this is an internal engine. Verification through unit/integration tests.

---

## 6. Task Impact

### Architecture
- **New module layer**: Runtime gets a View layer (previously headless → now with metadata panel)
- **New inter-module communication**: Runtime ↔ Chat for gate interaction
- **New persistence layer**: lowdb in runtime sidecar

### APIs / Contracts
- **New JSON-RPC methods**: `workflow.load`, `workflow.start`, `workflow.gate.respond`, `workflow.status`
- **New message types**: `WORKFLOW_GATE_REQUEST`, `WORKFLOW_GATE_RESPONSE`, `WORKFLOW_STATE_UPDATE`

### Compatibility
- No breaking changes to existing modules
- Chat continues to function as-is; gate interactions are additive
- lowdb is a new dependency (pure JS, no native addons)

### Testing / Verification
- Unit tests: WorkflowParser, WorkflowEngine, Persistence
- Integration tests: JSON-RPC workflow operations
- E2E tests: Gate interaction flow through chat

---

## 7. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Workflow `.md` has no formal schema — parser may break on edge cases | Medium | Define a strict grammar for workflow sections. Add validation with `zod`. |
| Gate async wait could timeout or deadlock | Medium | Implement timeout with configurable duration. Use Promise + EventEmitter pattern. |
| lowdb performance with concurrent reads/writes from multiple sidecar instances | Low | Single sidecar instance guaranteed by architecture. lowdb atomic writes handle this. |
| Runtime View panel integration could conflict with existing tab navigation | Medium | Panel as a collapsible side panel, not a new tab. Or use VS Code's secondary sidebar. |
| @material/web theming mismatch with VS Code dark/light mode | Low | Map CSS custom properties to VS Code theme tokens (existing pattern in project). |
| js-yaml only in devDependencies — runtime sidecar needs it for IndexParser | Medium | Verify `js-yaml` is bundled in `dist/`. If not, add explicit dependency or use gray-matter's built-in YAML parser. |

---

## 8. Open Questions

None — all questions resolved in Phase 0.

---

## 9. TODO Backlog (Mandatory Consultation)

**Reference**: `.agent/todo/`

**Current state**: Directory does not exist (empty).

**Items relevant to this task**: None.

**Impact on analysis**: No backlog items affect this analysis.

---

## 10. Approval
This analysis **requires explicit developer approval**.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-21T23:46:18+01:00"
    comments: "XState v5 confirmed. Reload manual with FileSystemWatcher."
```

> Without approval, this phase **CANNOT be considered completed** nor advance to Phase 3.
