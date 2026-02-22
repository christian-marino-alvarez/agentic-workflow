🔬 **researcher-agent**: Research Report — T24 Workflow Execution Engine

---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 24-workflow-execution-engine
---

# Research Report — 24-workflow-execution-engine

> [!CAUTION]
> **PERMANENT RULE**: This document is ONLY documentation.
> The researcher-agent documents findings WITHOUT analyzing, WITHOUT recommending, WITHOUT proposing solutions.
> Analysis belongs to Phase 2.

## 1. Executive Summary
- **Problem investigated**: How to build a workflow execution engine in the existing Runtime Server sidecar that parses `.md` workflow files, manages phase transitions, gates, persistence, and exposes interactive UI for developer approval.
- **Research objective**: Document all technical alternatives for: (A) markdown+YAML parsing, (B) state machine / workflow engine patterns, (C) embedded persistence, (D) interactive UI components for VS Code webviews, (E) existing project architecture and dependencies.
- **Key findings**: The project already has `gray-matter` (v4.0.3), `@material/web` (v2.4.1), `Lit` (v3.3.2), `Fastify` (v5.7.4), and `vscode-jsonrpc` (v8.2.1) installed. This significantly constrains the solution space toward leveraging existing dependencies.

---

## 2. Detected Needs

1. **Workflow Parser**: Parse `.md` files with YAML frontmatter to extract metadata (id, owner, version, severity, trigger, blocking) and body sections (steps, gates, PASS/FAIL).
2. **Workflow Execution Engine**: A mechanism to execute parsed workflows sequentially, handle PASS/FAIL transitions, identify the owner agent, and follow the workflow chain.
3. **Persistence Layer**: Store workflow execution state (current phase, gate approvals, timestamps) durably in the Runtime Server.
4. **Interactive Gate UI**: Present gates (SI/NO confirmations, radio buttons for clarification) to the developer via the VS Code webview.
5. **Metadata Panel**: A dedicated UI panel (not in chat) showing active workflow, loaded constitutions, required context files.
6. **Communication Bridge**: Message passing between RuntimeServer ↔ RuntimeBackground ↔ Chat for gate prompts and progress updates.

---

## 3. Technical Findings

### 3.1 Markdown Frontmatter Parsing

#### gray-matter (v4.0.3) — ALREADY INSTALLED
- **Description**: Parses YAML/TOML/JSON frontmatter from strings. Returns `{ data, content, excerpt }`.
- **Status**: Stable, widely used (30M+ weekly npm downloads).
- **Documentation**: https://github.com/jonschlinkert/gray-matter
- **Known limitations**: Does not parse the markdown body into sections — only separates frontmatter from content.

#### front-matter (npm)
- **Description**: Focused YAML frontmatter extraction. Returns `{ attributes, body }`.
- **Status**: Stable, lightweight.
- **Documentation**: https://github.com/jxson/front-matter
- **Known limitations**: Fewer features than gray-matter. No excerpt support.

#### remark + remark-frontmatter
- **Description**: Part of the Unified ecosystem. Full markdown AST parsing with frontmatter plugin.
- **Status**: Stable, actively maintained.
- **Documentation**: https://github.com/remarkjs/remark-frontmatter
- **Known limitations**: Heavy dependency tree for just frontmatter parsing. Better suited when full AST transformation is needed.

#### marked (v17.0.3) — ALREADY INSTALLED
- **Description**: Fast markdown-to-HTML compiler. Already used in the project (likely for chat message rendering).
- **Status**: Stable.
- **Documentation**: https://marked.js.org/
- **Known limitations**: Does not parse frontmatter natively. Would need gray-matter as preprocessor.

### 3.2 Workflow / State Machine Libraries

#### XState (v5)
- **Description**: Full-featured finite state machines and statecharts library for TypeScript. Actor model, event-driven, deterministic.
- **Status**: Stable (v5.x, 2025), major rewrite from v4. ~1.5M weekly npm downloads.
- **Documentation**: https://stately.ai/docs
- **Known limitations**: Significant learning curve. Adds ~50KB bundle. May be over-engineered for linear phase workflows.

#### Custom Sequential Executor (no library)
- **Description**: A simple `WorkflowExecutor` class that reads a parsed workflow, iterates through steps, pauses on gates, and follows PASS/FAIL transitions.
- **Status**: Pattern, not a library.
- **Known limitations**: Requires manual implementation of error handling, retries, timeouts.

#### @datarster/workflow-engine (npm, 2025)
- **Description**: TypeScript workflow engine with task/decision/parallel/loop/wait/switch steps. Uses Redis for state, MongoDB for logging.
- **Status**: New (mid-2025), lower adoption.
- **Documentation**: https://www.npmjs.com/package/@datarster/workflow-engine
- **Known limitations**: Redis/MongoDB dependencies are heavy for a VS Code extension sidecar.

### 3.3 Embedded Persistence for Node.js

#### better-sqlite3
- **Description**: Synchronous SQLite3 binding for Node.js. ACID, single-file, zero-config.
- **Status**: Stable, actively maintained. ~2M weekly npm downloads.
- **Documentation**: https://github.com/WiseLibs/better-sqlite3
- **Known limitations**: Native C++ addon — requires platform-specific binaries. May complicate VS Code extension packaging (need `vsce` prebuild support). Synchronous API (could block event loop for large operations).

#### lowdb (v7)
- **Description**: JSON-file-based database. Pure JavaScript, no native dependencies. Atomic writes.
- **Status**: Stable. ESM-only (v7+).
- **Documentation**: https://github.com/typicode/lowdb
- **Known limitations**: Performance degrades with large datasets (reads/writes entire JSON file). Not suitable for high-frequency writes. No query language.

#### level (LevelDB for Node.js)
- **Description**: Key-value store backed by LevelDB (C++ via N-API). Lexicographic key ordering, range scans.
- **Status**: Stable, maintained by Level organization.
- **Documentation**: https://github.com/Level/level
- **Known limitations**: Native addon (same packaging concerns as better-sqlite3). Key-value only — no relational queries. Single-process lock.

#### JSON files (fs.readFile / fs.writeFile)
- **Description**: Direct JSON serialization to `.json` files using Node.js built-in `fs` module.
- **Status**: Built-in, zero dependencies.
- **Known limitations**: No ACID guarantees (risk of data corruption on crash). No query capabilities. Manual concurrency handling needed.

### 3.4 VS Code Webview UI Components

#### @material/web (v2.4.1) — ALREADY INSTALLED
- **Description**: Material Design 3 web components. Includes: `md-filled-button`, `md-outlined-button`, `md-radio`, `md-checkbox`, `md-dialog`, `md-list`, `md-icon`, `md-progress-indicator`, etc.
- **Status**: Stable (GA since 2024). Official Google project.
- **Documentation**: https://material-web.dev/
- **Known limitations**: Theming requires CSS custom properties. Does not automatically match VS Code themes without manual mapping.

#### @vscode/webview-ui-toolkit (DEPRECATED)
- **Description**: Was the official VS Code webview component library. Deprecated January 1, 2025.
- **Status**: Deprecated.
- **Documentation**: https://github.com/microsoft/vscode-webview-ui-toolkit
- **Known limitations**: No longer maintained. Should not be adopted.

#### @bendera/vscode-webview-elements
- **Description**: LitElement-based components styled to match VS Code. Buttons, checkboxes, inputs, tabs, etc.
- **Status**: Active, community-maintained.
- **Documentation**: https://bendera.github.io/vscode-webview-elements/
- **Known limitations**: Smaller community. May not cover all Material Design 3 patterns.

#### Custom Lit Components
- **Description**: Build custom components using Lit (already project framework) with CSS custom properties mapped to VS Code theme variables.
- **Status**: Pattern, not a library.
- **Known limitations**: Requires manual implementation. But offers full control over design.

### 3.5 Existing Project Architecture

#### Runtime Module Structure
```
src/extension/modules/runtime/
├── backend/
│   ├── index.ts          (RuntimeServer - Fastify + JSON-RPC, port 3001)
│   └── index-parser.ts   (IndexParser - parses .agent/index.md aliases)
├── background/
│   ├── index.ts          (RuntimeBackground - spawns sidecar, PermissionEngine)
│   └── permission-engine.ts
├── constants.ts          (NAME='Runtime', MESSAGES)
```

#### Communication Flow (Existing)
```
Extension Host (Background) → spawn → Sidecar (Backend)
Background ↔ Sidecar: JSON-RPC (stdio) + HTTP (Fastify, port 3001)
View ↔ Background: postMessage (webview messaging)
Module ↔ Module: Event Bus
```

#### Key Existing Dependencies
| Dependency | Version | Relevance |
|---|---|---|
| `gray-matter` | 4.0.3 | Workflow frontmatter parsing |
| `@material/web` | 2.4.1 | Gate UI buttons, radio buttons |
| `lit` | 3.3.2 | View component framework |
| `fastify` | 5.7.4 | HTTP server in sidecar |
| `vscode-jsonrpc` | 8.2.1 | RPC between extension host and sidecar |
| `marked` | 17.0.3 | Markdown rendering |
| `js-yaml` | (types installed) | Used in IndexParser for YAML parsing |
| `zod` | 4.3.6 | Schema validation |

---

## 4. Relevant APIs

### VS Code Extension API
- `vscode.ExtensionContext.globalState` — key-value storage that survives extension restarts.
- `vscode.Webview.postMessage()` / `vscode.Webview.onDidReceiveMessage()` — message passing between extension host and webview.
- `vscode.window.showInformationMessage()` — native VS Code notifications.
- `vscode.workspace.fs` — file system API for reading workflow files.

### Node.js Built-in APIs
- `fs.promises.readFile()` / `fs.promises.readdir()` — for reading `.agent/workflows/*.md` from disk in sidecar.
- `child_process.fork()` — alternative for spawning additional background workers.
- `process.stdin` / `process.stdout` — used by `vscode-jsonrpc` for JSON-RPC over stdio.

### JSON-RPC Protocol (existing)
- `connection.onRequest(method, handler)` — register request handlers.
- `connection.onNotification(method, handler)` — register notification handlers.
- `connection.sendRequest(method, params)` — send request to sidecar.
- `connection.sendNotification(method, params)` — send fire-and-forget notification.

---

## 5. Multi-browser Compatibility

Not directly applicable — this feature runs within VS Code (Electron-based), which uses a single Chromium version. However:

| Feature | Chromium (VS Code) | Notes |
|---|---|---|
| Lit 3 Web Components | ✅ Supported | Custom Elements v1 fully supported |
| `@material/web` | ✅ Supported | Targets modern browsers |
| ES Modules | ✅ Supported | Project uses ESM |
| `fs` module | ✅ (Node.js side) | Available in extension host and sidecar |
| JSON-RPC over stdio | ✅ Supported | Node.js native |

---

## 6. Detected AI-first Opportunities

- **Workflow interpretation by LLM**: The workflows are structured markdown documents. An LLM could be used to interpret ambiguous steps or generate implementation plans dynamically.
- **Automatic gate evaluation**: For non-blocking gates (e.g., code compilation checks), the engine could invoke `npm run compile` and auto-evaluate PASS/FAIL.
- **Agent delegation via tool calls**: The existing `delegateTask` tool in the LLM backend could be extended to interact with the workflow engine for phase delegation.

---

## 7. Identified Risks

| Risk | Severity | Source |
|---|---|---|
| Native addon packaging (SQLite, LevelDB) complicates VS Code extension bundling | High | VS Code extension packaging docs |
| `@material/web` theming does not auto-match VS Code dark/light themes | Medium | Material Web documentation |
| JSON file persistence has no ACID guarantees — crash during write could corrupt state | Medium | Node.js fs documentation |
| XState v5 adds significant complexity and bundle size for linear workflows | Low | XState documentation |
| Multiple sidecar processes could compete for file locks on persistence DB | Medium | LevelDB / SQLite docs |
| Workflow `.md` structure is not formally validated (no schema) | Medium | Project observation |
| `js-yaml` is only in devDependencies (types), actual `yaml` parsing in sidecar needs verification | Low | package.json analysis |

---

## 8. Sources

1. **gray-matter**: https://github.com/jonschlinkert/gray-matter
2. **front-matter**: https://github.com/jxson/front-matter
3. **remark-frontmatter**: https://github.com/remarkjs/remark-frontmatter
4. **marked**: https://marked.js.org/
5. **XState v5**: https://stately.ai/docs
6. **better-sqlite3**: https://github.com/WiseLibs/better-sqlite3
7. **lowdb**: https://github.com/typicode/lowdb
8. **level**: https://github.com/Level/level
9. **@material/web**: https://material-web.dev/
10. **@bendera/vscode-webview-elements**: https://bendera.github.io/vscode-webview-elements/
11. **VS Code Webview API**: https://code.visualstudio.com/api/extension-guides/webview
12. **vscode-jsonrpc**: https://github.com/microsoft/vscode-languageserver-node
13. **Fastify**: https://fastify.dev/
14. **zod**: https://zod.dev/
15. **@datarster/workflow-engine**: https://www.npmjs.com/package/@datarster/workflow-engine
16. **VS Code Webview UI Toolkit (deprecated)**: https://github.com/microsoft/vscode-webview-ui-toolkit

---

## 9. Developer Approval (MANDATORY)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-21T23:29:03+01:00"
    comments: null
```
