🔬 **researcher-agent**: Research report for T032 — Agent Tools & Action Sandbox.

> [!CAUTION]
> **PERMANENT RULE**: This document is ONLY documentation.
> The researcher-agent documents findings WITHOUT analyzing, WITHOUT recommending, WITHOUT proposing solutions.
> Analysis belongs to Phase 2.

## 1. Executive Summary
- **Problem**: Agents currently operate as text-in/text-out chatbots. They cannot interact with the filesystem, terminal, or web.
- **Research objective**: Document the available APIs, SDK capabilities, and UX patterns from existing AI coding tools for implementing agent tools with permission controls.
- **Key findings**: The `@openai/agents` SDK provides native tool infrastructure (`FunctionTool`, `shellTool`, `applyPatchTool`) with built-in approval mechanisms (`needsApproval` + `interruption` flow). Cursor and Cline have established UX patterns for human-in-the-loop approval.

---

## 2. Detected Needs
- Tool execution engine in the sidecar (Python or Node)
- Permission system integrated with the existing sandbox/full toggle in Chat UI
- Visual feedback for tool calls in the chat interface
- Tools: `readFile`, `writeFile`, `runCommand`, `listDir`, `searchFiles`, `searchWeb`

---

## 3. Technical Findings

### 3.1 `@openai/agents` SDK — Tool System (TypeScript)
- **`tool()` function** (`@openai/agents-core/dist/tool.d.ts` line 660): Creates a `FunctionTool` from options.
- **`FunctionTool` type** (line 123-177):
  - `name: string` — unique identifier
  - `description: string` — LLM reads this to decide when to use
  - `parameters: JsonObjectSchema | ZodObjectLike` — Zod schemas auto-validate input
  - `invoke(runContext, input, details?)` — execution function
  - **`needsApproval: ToolApprovalFunction`** — function returning boolean; if true → run produces `interruption`
  - `timeoutMs?: number` — per-tool timeout
  - `isEnabled: ToolEnabledFunction` — can dynamically disable tools per run
- **SDK version**: `@openai/agents@0.0.25` (installed in project)

### 3.2 Built-in SDK Tools
| Tool | Type | Description |
|:--|:--|:--|
| `shellTool()` | `ShellTool` | Executes shell commands with approval support. Has `onApproval` callback |
| `applyPatchTool()` | `ApplyPatchTool` | Applies diffs/patches to files with approval. Uses an `Editor` interface |
| `computerTool()` | `ComputerTool` | Desktop/browser automation. Not relevant for this task |
| `hostedMcpTool()` | `HostedMCPTool` | Connects to remote MCP servers |

### 3.3 Approval / Interruption Mechanism
- When `needsApproval` returns `true`, the SDK **pauses the run** and produces a `RunToolApprovalItem` (type: `function_approval`)
- The caller (our sidecar) must then either approve or reject the tool call
- On approval, the run resumes with the tool's output
- On rejection, the run continues without the tool call
- The `FunctionToolResult` union has three variants: `function_output`, `function_approval`, `hosted_mcp_tool_approval`

### 3.4 Tool Input Validation
- Zod schemas are the preferred method for input validation
- `strict: true` mode forces the model to follow the schema exactly
- Non-strict mode accepts JSON schema directly (useful for dynamic tools)

---

## 4. Relevant APIs

### 4.1 Node.js / Sidecar APIs for Tools
| API | Purpose | Status |
|:--|:--|:--|
| `fs.readFile()` / `fs.writeFile()` | File operations | Stable (Node.js core) |
| `child_process.exec()` | Command execution | Stable (Node.js core) |
| `fs.readdir()` | Directory listing | Stable (Node.js core) |
| `grep` / `ripgrep` via `exec` | File content search | Stable (CLI tools) |
| Web search | External API required | Depends on provider (SerpAPI, Tavily, etc.) |

### 4.2 VS Code Webview APIs for UI
| API | Purpose | Status |
|:--|:--|:--|
| `postMessage` / `onMessage` | View ↔ Background communication | Stable (VS Code API) |
| Lit `html` / `unsafeHTML` | Dynamic component rendering in webview | Stable (Lit 2.x) |

---

## 5. UX Patterns from Existing AI Coding Tools

### 5.1 Cursor
- **Model**: Changes applied directly, tracked as "pending edits"
- **Display**: Inline diff view (GitHub PR-style)
- **Actions**: "Keep" (accept) / "Undo" (reject) per edit
- **Navigation**: Editor overlay with next/prev controls
- **Chat integration**: Files list with "awaiting review" status
- **Auto-accept**: `chat.tools.edits.autoApprove` setting available
- **Sensitive files**: Explicit approval dialog with scope options (once, session, workspace, always)
- **Multi-file**: "Composer" feature for batch edits with consolidated diff

### 5.2 Cline
- **Model**: Human-in-the-loop — approval required for EVERY action (file + command)
- **Display**: Plan outline → per-step approval
- **Actions**: "Approve" / "Reject" buttons in chat sidebar
- **Auto-approve**: "Safe commands" toggle (read-only operations auto-approved)
- **Terminal**: Commands execute in user's terminal, output captured and streamed
- **Security**: Workspace root restriction, exclude folders, permission gating
- **CLI mode**: Headless mode for CI/CD automation (no approval)

### 5.3 VS Code Copilot (Native)
- **Model**: "Pending edits" system — changes saved to disk but tracked
- **Display**: Inline diff with hover actions
- **Actions**: Individual Keep/Undo per change, or bulk accept/reject
- **Chat**: Lists edited files centrally
- **Sensitive files**: Separate confirmation dialog for config/env files

---

## 6. Detected AI-first Opportunities
- The `@openai/agents` SDK's `needsApproval` + `interruption` flow is purpose-built for human-in-the-loop scenarios
- The existing Chat UI toggle (sandbox/full) maps directly to the `needsApproval` conditional: sandbox mode → always require approval; full mode → approve automatically
- The `shellTool` and `applyPatchTool` are ready-to-use SDK primitives — zero custom code needed for basic shell/patch operations
- Zod schemas enable type-safe tool parameter validation at the SDK level

---

## 7. Identified Risks
| Risk | Severity | Source |
|:--|:--|:--|
| Sidecar runs as a child process — file operations execute with the same permissions as VS Code | High | Node.js process model |
| `runCommand` without timeout can hang the sidecar indefinitely | High | `child_process.exec` docs |
| `searchWeb` requires external API key/service — adds setup friction | Medium | External dependency |
| `writeFile` outside workspace could affect system files in full-access mode | High | Node.js `fs` module |
| Large file reads could exhaust LLM context window | Medium | Token limits per model |
| Approval UI in chat requires bidirectional async communication (view → background → sidecar → background → view) | Medium | Architecture complexity |

---

## 8. Sources
- [`@openai/agents-core/dist/tool.d.ts`](file:///Users/milos/Documents/workspace/agentic-workflow/node_modules/@openai/agents-core/dist/tool.d.ts) — SDK tool types and API
- [`@openai/agents-core/dist/run.d.ts`](file:///Users/milos/Documents/workspace/agentic-workflow/node_modules/@openai/agents-core/dist/run.d.ts) — Runner and RunConfig types
- [OpenAI Agents SDK TypeScript docs](https://openai.github.io/openai-agents-js/) — Official documentation
- [Cline VS Code Extension](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev) — Human-in-the-loop UX
- [Cursor AI](https://www.cursor.com/) — Inline diff and approval UX
- [VS Code Copilot Agent Mode](https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode) — Pending edits system
- [A2UI Protocol](https://a2ui.org/) — Google declarative UI for agents

---

## 9. Developer Approval (MANDATORY)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-20T11:49:12+01:00"
    comments: null
```
