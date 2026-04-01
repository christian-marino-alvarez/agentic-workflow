🏛️ **architect-agent**: Implementation Plan — T24 Workflow Execution Engine

---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 24-workflow-execution-engine
---

# Implementation Plan — 24-workflow-execution-engine

## 1. Plan Summary
- **Context**: Build a deterministic Workflow Execution Engine that replaces manual LLM interpretation of `.agent/workflows/*.md` with a programmatic engine based on XState v5.
- **Expected result**: The RuntimeServer (sidecar 2) can parse, execute, and persist workflows. Gates are presented as interactive buttons in the chat. A metadata panel shows workflow state. The chat shows only summaries.
- **Scope**:
  - ✅ Includes: WorkflowParser, WorkflowEngine (XState), Persistence (lowdb), Gate UI, Metadata Panel, inter-module messaging, **dynamic agent registry** (agents read from `.agent/rules/roles/` at runtime)
  - ❌ Excludes: Workflow visual editor (T025), async delegation (T043), flow engine (T033)

---

## 2. Contractual Inputs
- **Task**: `.agent/artifacts/24-workflow-execution-engine/task.md`
- **Analysis**: `.agent/artifacts/24-workflow-execution-engine/analysis.md`
- **Acceptance Criteria**: AC-1 through AC-7 from `acceptance.md`

```yaml
plan:
  workflows:
    - domain: runtime-backend
      action: create
      workflow: coding-backend
    - domain: runtime-background
      action: refactor
      workflow: coding-background
    - domain: runtime-view
      action: create
      workflow: coding-view
    - domain: chat
      action: refactor
      workflow: coding-integration

  dispatch:
    - domain: runtime-backend
      action: create
      workflow: coding-backend
```

---

## 3. Implementation Breakdown (steps)

### Step 1: Install dependencies
- **Description**: Install `xstate` and `lowdb` as production dependencies.
- **Dependencies**: None
- **Deliverables**: Updated `package.json` and `package-lock.json`
- **Responsible agent**: 🏛️ architect-agent (dependency management)
- **Command**: `npm install xstate lowdb`

### Step 2: WorkflowParser (`runtime/backend/workflow-parser.ts`) — NEW
- **Description**: Parse `.md` workflow files into structured `WorkflowDef` objects.
  1. Use `gray-matter` to extract YAML frontmatter (id, owner, version, severity, trigger, blocking)
  2. Custom section parser: extract `## Mandatory Steps` numbered items, `## Gate` section, `PASS` and `FAIL` step references
  3. Validate with `zod` schema
  4. Return typed `WorkflowDef` interface
- **Dependencies**: Step 1 (gray-matter already installed)
- **Deliverables**: `workflow-parser.ts`, `types.ts` (WorkflowDef, WorkflowStep, GateDef interfaces)
- **Responsible agent**: 🧠 engine-agent + 🔧 backend-agent (server-side logic)
- **Key interfaces**:
  ```typescript
  interface WorkflowDef {
    id: string;
    owner: string;
    version: string;
    blocking: boolean;
    steps: WorkflowStep[];
    gates: GateDef[];
    passTarget: string | null;
    failBehavior: 'block' | 'retry';
    constitutions: string[];  // from > [!IMPORTANT] blocks
  }
  ```

### Step 3: WorkflowEngine (`runtime/backend/workflow-engine.ts`) — NEW
- **Description**: XState v5 machine factory and lifecycle orchestrator.
  1. `generateMachine(def: WorkflowDef)` → XState machine config
  2. `WorkflowEngine` class: manages active workflow actor, handles events
  3. Lifecycle machine: parent machine that chains phase sub-machines
  4. Gate handling: states that wait for `GATE_APPROVE` / `GATE_REJECT`
  5. Event emissions for progress updates
  6. **Dynamic Agent Registry**: On init, scans `.agent/rules/roles/*.md` to build a dynamic registry of available agents. The `owner` field from each workflow frontmatter is validated against this registry. Developers can add/remove/modify roles by editing `.md` files in `roles/`.
- **Dependencies**: Step 2 (WorkflowParser)
- **Deliverables**: `workflow-engine.ts`
- **Responsible agent**: 🧠 engine-agent (XState integration)

### Step 4: Persistence (`runtime/backend/persistence.ts`) — NEW
- **Description**: lowdb-based state store for XState snapshots.
  1. Store via `actor.getPersistedSnapshot()` → JSON → lowdb
  2. Restore via `createActor(machine, { snapshot })` on restart
  3. Store: current taskId, current phase, gate responses, timestamps
  4. File location: `.agent/artifacts/<taskId>/workflow-state.json`
- **Dependencies**: Step 1
- **Deliverables**: `persistence.ts`
- **Responsible agent**: 🧠 engine-agent + 🔧 backend-agent

### Step 5: RuntimeServer integration (`runtime/backend/index.ts`) — MODIFY
- **Description**: Add JSON-RPC handlers to RuntimeServer for workflow operations.
  1. `workflow.load(workflowPath)` → parse and return WorkflowDef
  2. `workflow.start(taskId, strategy)` → create and start lifecycle machine
  3. `workflow.gate.respond(taskId, decision)` → send GATE_APPROVE/REJECT event
  4. `workflow.status(taskId)` → return current state snapshot
  5. `workflow.reload(taskId)` → re-parse current workflow, migrate state
- **Dependencies**: Steps 2, 3, 4
- **Deliverables**: Modified `runtime/backend/index.ts`
- **Responsible agent**: 🔧 backend-agent (server handlers) + 🧠 engine-agent (engine wiring)

### Step 6: Constants update (`runtime/constants.ts`) — MODIFY
- **Description**: Add new message types for workflow communication.
  ```typescript
  export const MESSAGES = {
    EXECUTE_ACTION: 'EXECUTE_ACTION',
    WORKFLOW_LOAD: 'WORKFLOW_LOAD',
    WORKFLOW_START: 'WORKFLOW_START',
    WORKFLOW_GATE_REQUEST: 'WORKFLOW_GATE_REQUEST',
    WORKFLOW_GATE_RESPONSE: 'WORKFLOW_GATE_RESPONSE',
    WORKFLOW_STATE_UPDATE: 'WORKFLOW_STATE_UPDATE',
    WORKFLOW_RELOAD: 'WORKFLOW_RELOAD',
    WORKFLOW_STATUS: 'WORKFLOW_STATUS',
  };
  ```
- **Dependencies**: None
- **Deliverables**: Modified `runtime/constants.ts`
- **Responsible agent**: ⚙️ background-agent

### Step 7: RuntimeBackground wiring (`runtime/background/index.ts`) — MODIFY
- **Description**: Wire RuntimeBackground as the bridge between sidecar and views.
  1. New message handlers matching `constants.MESSAGES.WORKFLOW_*`
  2. JSON-RPC client calls to sidecar for workflow commands
  3. `FileSystemWatcher` on `.agent/workflows/**/*.md` AND `.agent/rules/roles/*.md` — emit change notifications (workflow changes + agent registry updates)
  4. Forward gate requests to ChatBackground via Event Bus
  5. Forward state updates to metadata panel view
- **Dependencies**: Steps 5, 6
- **Deliverables**: Modified `runtime/background/index.ts`
- **Responsible agent**: ⚙️ background-agent + 💻 vscode-specialist (FileSystemWatcher, VS Code APIs)

### Step 8: Chat gate integration (`chat/background/index.ts` + `chat/view/`) — MODIFY
- **Description**: Add structured gate interaction to the Chat.
  1. ChatBackground: listen for `WORKFLOW_GATE_REQUEST` from Event Bus
  2. Forward gate data to ChatView via `postMessage`
  3. ChatView: render `md-filled-button` (SI/NO) or `md-radio` groups
  4. On developer input, send response back: ChatView → ChatBackground → RuntimeBackground → sidecar
- **Dependencies**: Step 7
- **Deliverables**: Modified `chat/background/index.ts`, `chat/view/templates/html.ts`
- **Responsible agent**: 🎨 view-agent (UI components), ⚙️ background-agent (wiring)

### Step 9: Workflow Metadata Panel (`runtime/view/`) — NEW
- **Description**: New Lit component for the metadata panel.
  1. `runtime/view/index.ts` — main Lit component extending Core View
  2. `runtime/view/templates/html.ts` — HTML template
  3. `runtime/view/templates/css.ts` — Styles
  4. Display: active workflow name, current phase, loaded constitutions, context files, progress bar, file-modified warning + reload button
  5. Component rendered as a collapsible panel within the chat area or as a separate tab
- **Dependencies**: Step 7
- **Deliverables**: New `runtime/view/` directory
- **Responsible agent**: 🎨 view-agent

### Step 10: Testing suite — NEW
- **Description**: Create comprehensive test suite.
  1. `workflow-parser.test.ts` — parse ALL existing workflow files, validate output
  2. `workflow-engine.test.ts` — XState state transitions, gate events, PASS/FAIL
  3. `persistence.test.ts` — save/restore XState snapshots via lowdb
- **Dependencies**: Steps 2, 3, 4
- **Deliverables**: Test files in `runtime/backend/test/`
- **Responsible agent**: 🛡️ qa-agent

> Note: Steps 2-4 can be parallelized (no cross-dependencies). Steps 6-7 can start after Step 5. Steps 8-9 depend on Step 7. Step 10 can start after Steps 2-4.

---

## 4. Responsibility Assignment (Agents)

| Agent | Steps | Sub-areas | Role |
|---|---|---|---|
| 🏛️ **architect-agent** | Step 1, orchestration, gates | Dependencies, plan, review | Orchestrator, NEVER implements |
| 🧠 **engine-agent** | Steps 2, 3 | `runtime/backend/` (parser, XState engine) | Runtime/engine domain expert |
| 🔧 **backend-agent** | Steps 2, 4, 5 | `runtime/backend/` (server logic, persistence) | Server-side logic expert |
| ⚙️ **background-agent** | Steps 6, 7, 8 (wiring) | `runtime/background/`, `constants.ts`, `chat/background/` | Extension orchestration |
| 💻 **vscode-specialist** | Step 7 (VS Code APIs) | FileSystemWatcher, webview integration | VS Code API surface expert |
| 🎨 **view-agent** | Steps 8 (UI), 9 | `runtime/view/`, `chat/view/` | Lit UI specialist |
| 🛡️ **qa-agent** | Step 10 | `runtime/backend/test/` | Testing, validation, quality |

**Handoffs**:
1. engine-agent + backend-agent deliver Steps 2-5 → architect validates
2. background-agent + vscode-specialist deliver Steps 6-7 → architect validates
3. view-agent delivers Steps 8-9 → architect validates
4. qa-agent delivers Step 10 → architect validates
5. All steps complete → Phase 5 verification

**Components**:
- **CREATE**: `workflow-parser.ts`, `workflow-engine.ts`, `persistence.ts`, `runtime/view/`, test files — via `/coding-backend` and `/coding-view` workflows
- **MODIFY**: `index.ts` (server), `index.ts` (background), `constants.ts`, chat files — via `/coding-background` and `/coding-integration` workflows
- **Tool**: No scaffolding skill needed (manual file creation follows existing patterns)

---

## 5. Testing and Validation Strategy

### Unit tests
- **Scope**: WorkflowParser, WorkflowEngine (XState machine), Persistence
- **Framework**: Vitest (existing: `vitest run src/extension`)
- **Files**:
  - `runtime/backend/test/workflow-parser.test.ts` — parse real workflow files from `.agent/workflows/`
  - `runtime/backend/test/workflow-engine.test.ts` — state transitions, gate handling, PASS/FAIL
  - `runtime/backend/test/persistence.test.ts` — save/restore XState snapshots with lowdb
- **Run command**: `npx vitest run src/extension/modules/runtime/backend/test/`

### Integration tests
- **Scope**: JSON-RPC workflow operations end-to-end through sidecar
- **Files**: `runtime/test/integration/workflow-flow.test.ts`
- **Run command**: `npx vitest run src/extension/modules/runtime/test/integration/`

### Compilation gate
- **Command**: `npm run compile`
- **Requirement**: Must pass with zero errors (AC-7)

**Traceability**:
| AC | Test |
|---|---|
| AC-1: Parse workflows | `workflow-parser.test.ts` |
| AC-2: PASS chain | `workflow-engine.test.ts` (state transitions) |
| AC-3: Gate buttons | Manual + `workflow-engine.test.ts` (gate events) |
| AC-4: Metadata panel | Manual verification |
| AC-5: Chat shows only summaries | Manual verification |
| AC-6: Persistent state | `persistence.test.ts` (save/restore cycle) |
| AC-7: Compile | `npm run compile` |

---

## 6. Demo Plan
Not applicable — internal engine. Verification through tests.

---

## 7. Estimations and Implementation Weights

| Step | Effort | Estimated Complexity |
|---|---|---|
| 1. Install deps | Low | 1 command |
| 2. WorkflowParser | Medium | ~150 lines, gray-matter + zod |
| 3. WorkflowEngine (XState) | High | ~250 lines, core of the system |
| 4. Persistence | Low | ~80 lines, lowdb wrapper |
| 5. Server integration | Medium | ~100 lines, JSON-RPC handlers |
| 6. Constants | Low | ~20 lines |
| 7. Background wiring | Medium | ~120 lines, message bridge |
| 8. Chat gate UI | Medium | ~100 lines, @material/web components |
| 9. Metadata panel | Medium | ~150 lines, new Lit component |

**Total estimated**: ~970 lines of new/modified code
**Assumptions**: Existing patterns (AbstractBackend, Background, View base classes) are reusable. No architectural surprises.

---

## 8. Critical Points and Resolution

### CP-1: Markdown section parsing reliability
- **Risk**: Workflow `.md` files have no formal schema. Regex-based parsing could break on edge cases.
- **Impact**: Engine loads incorrect workflow definition → wrong state transitions.
- **Resolution**: Define strict `zod` schema for `WorkflowDef`. Parse known headings only (`## Mandatory Steps`, `## Gate`, etc.). Fail loudly on unrecognized structure. Unit test with ALL existing workflow files.

### CP-2: XState v5 learning curve
- **Risk**: Team unfamiliarity with XState actor model and statecharts.
- **Impact**: Implementation delays or incorrect machine definitions.
- **Resolution**: Start with simple linear machine (Phase 0 only). Validate pattern, then replicate for all phases. Use Stately Inspector for visual debugging.

### CP-3: Gate async flow deadlock
- **Risk**: Engine sends gate request, response never arrives (developer disconnects, extension crashes).
- **Impact**: Workflow stuck forever in gate state.
- **Resolution**: XState state is persisted to lowdb. On extension restart, the actor restores from snapshot and resumes waiting. No timeout needed — gates are intentionally blocking (per constitution rules).

---

## 9. Dependencies and Compatibility

### Internal dependencies
- `core/backend/abstract-server.ts` — RuntimeServer extends this
- `core/background/` — RuntimeBackground extends this
- `core/view/` — Metadata panel extends this
- `runtime/backend/index-parser.ts` — alias resolution for workflow paths

### External dependencies (NEW)
| Package | Version | Purpose |
|---|---|---|
| `xstate` | ^5 | Workflow state machine engine |
| `lowdb` | ^7 | JSON file persistence |

### Existing dependencies (leveraged)
| Package | Version | Purpose |
|---|---|---|
| `gray-matter` | 4.0.3 | Markdown frontmatter parsing |
| `@material/web` | 2.4.1 | Gate UI components |
| `zod` | 4.3.6 | Schema validation |
| `lit` | 3.3.2 | View components |
| `vscode-jsonrpc` | 8.2.1 | Sidecar communication |

### Compatibility
- VS Code Chromium: Full support for all web components and ES modules
- No cross-browser concerns (runs exclusively in VS Code)

---

## 10. Completion Criteria

- [ ] `npm install xstate lowdb` succeeds
- [ ] WorkflowParser parses all existing `.agent/workflows/**/*.md` files without errors
- [ ] WorkflowEngine creates XState machines from parsed definitions
- [ ] Gates pause execution and resume on developer input
- [ ] PASS transitions advance to next workflow phase
- [ ] XState snapshot persists and restores correctly via lowdb
- [ ] JSON-RPC handlers respond to workflow operations
- [ ] RuntimeBackground bridges sidecar ↔ views correctly
- [ ] Chat shows gate buttons (SI/NO) using @material/web
- [ ] Metadata panel displays active workflow, constitutions, and context files
- [ ] FileSystemWatcher detects `.md` changes and shows notification
- [ ] `npm run compile` passes with zero errors
- [ ] Unit tests pass for parser, engine, and persistence

---

## 11. Developer Approval (MANDATORY)
This plan **requires explicit and binary approval**.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-22T12:43:23+01:00"
    comments: "Dynamic agent registry confirmed. Runtime = pure code, no LLM in engine."
```
