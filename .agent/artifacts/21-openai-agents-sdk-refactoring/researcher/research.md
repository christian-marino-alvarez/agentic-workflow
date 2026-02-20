🔬 **researcher-agent**: Research Report — OpenAI Agents SDK Integration

---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 21-openai-agents-sdk-refactoring
---

# Research Report — 21-openai-agents-sdk-refactoring

> [!CAUTION]
> **PERMANENT RULE**: This document is ONLY documentation.
> The researcher-agent documents findings WITHOUT analyzing, WITHOUT recommending, WITHOUT proposing solutions.
> Analysis belongs to Phase 2.

## 1. Executive Summary
- **Problem investigated**: How to replace the current custom agent system (LiveAgent/GhostAgent/Factory/Orchestrator) with the OpenAI Agents SDK (`@openai/agents`) as the core engine
- **Research objective**: Document the SDK's API surface, multi-provider support, handoff mechanism, and integration patterns for a VSCode extension sidecar architecture
- **Key findings**: The SDK provides `Agent`, `Runner`, custom `ModelProvider`, handoffs, tools, guardrails, and context injection — all directly applicable to the project's requirements

---

## 2. Detected Needs
- **N1**: Replace custom agent orchestration with SDK-native `Runner` and `Agent`
- **N2**: Support multi-provider (Gemini, Claude, OpenAI) through custom `ModelProvider` implementations
- **N3**: Handoffs between agents for sub-task delegation (1 agent = 1 task)
- **N4**: Agent instructions loaded from role markdown files (`.agent/rules/roles/*.md`)
- **N5**: Model assignment persisted in role markdown frontmatter
- **N6**: Runner execution in backend/sidecar (process isolation from Extension Host)

---

## 3. Technical Findings

### 3.1 `@openai/agents` Package
- **Installed version**: `0.4.12`
- **State**: Stable, production-ready (successor to experimental Swarm)
- **NPM**: `@openai/agents` (main entry), `@openai/agents-core` (low-level types)
- **Exports**: `Agent`, `Runner`, `run`, `handoff`, `tool`, `setTracingExportApiKey`
- **Core types from `@openai/agents-core`**: `Model`, `ModelProvider`, `ModelRequest`, `ModelResponse`, `ResponseStreamEvent`

### 3.2 Agent Class
- **Constructor**: `new Agent({ name, instructions, model, tools, handoffs, modelSettings, handoffDescription })`
- **Generic Context**: `Agent<TContext, TOutput>` — context is dependency-injection
- **Model assignment**: `model` property accepts a `string` (model name) or a `Model` instance
- **Dynamic instructions**: `instructions` can be a string or a function `(ctx, agent) => string`
- **Handoff description**: Used when this agent is a handoff target (describes when to hand off to it)
- **Static factory**: `Agent.create()` for proper TypeScript inference with handoffs

### 3.3 Runner Class
- **Constructor**: `new Runner({ model?, modelProvider?, maxTurns? })`
- **Execution methods**:
  - `Runner.run(agent, input, { context })` — async, returns `RunResult`
  - `Runner.run_sync()` — synchronous
  - `Runner.run_streamed()` — streaming via AsyncIterable
- **Model fallback**: If no model set on Agent, Runner's `model` is used; if neither, falls back to `gpt-4.1`
- **Environment variable**: `OPENAI_DEFAULT_MODEL` overrides the default model globally

### 3.4 Custom ModelProvider Interface
- **`ModelProvider`**: Interface with method `getModel(modelName?: string): Promise<Model> | Model`
- **`Model`**: Interface with:
  - `name: string`
  - `getResponse(request: ModelRequest): Promise<ModelResponse>`
  - `getStreamedResponse(request: ModelRequest): AsyncIterable<ResponseStreamEvent>`
- **Usage**: Pass custom provider to `new Runner({ modelProvider: new CustomProvider() })`
- **Per-agent model**: Set `model` property on Agent to a `Model` instance directly
- **Imports**: Types come from `@openai/agents-core`

### 3.5 Handoffs
- **Basic**: `Agent.create({ handoffs: [agentA, agentB] })`
- **Customized**: `handoff(agent, { toolNameOverride, toolDescriptionOverride, onHandoff, inputType, inputFilter })`
- **Mechanism**: Handoffs are treated as tools that the LLM can call
- **Tool name**: Auto-generated as `transfer_to_<agent_name>`
- **History transfer**: Conversation history is passed to the next agent
- **Input filter**: `inputFilter` controls what history the next agent sees
- **Callback**: `onHandoff(ctx: RunContext, input?)` fired when handoff occurs

### 3.6 Tools
- **Function tools**: `tool({ name, description, parameters: z.ZodSchema, execute: (args) => result })`
- **Agents as tools**: `agent.asTool({ toolName, toolDescription })` — manager pattern
- **MCP servers**: Supported via `mcpServers` property
- **Tool choice**: `toolChoice: 'auto' | 'required' | 'none' | { type: 'function', name: string }`

### 3.7 Guardrails
- Input and output validation hooks
- Can abort execution if validation fails
- Documented at `openai.github.io/openai-agents-js/guides/guardrails`

### 3.8 Tracing
- Built-in tracing with `setTracingExportApiKey('sk-...')`
- Sends traces to OpenAI dashboard
- Can be disabled or customized

### 3.9 Existing Project Adapters
The project already has custom `ModelProvider` implementations in `src/extension/modules/llm/backend/adapters/`:
- **`GeminiProvider`** (`gemini-adapter.ts`): Uses `@google/generative-ai`, implements `ModelProvider` and `Model`
- **`ClaudeProvider`** (`claude-adapter.ts`): Anthropic adapter
- **`OpenAIProvider`**: Native from `@openai/agents`
- **`LLMFactory`** (`factory.ts`): Routes by provider name to correct adapter

---

## 4. Relevant APIs

| API / Interface | Package | State |
|:--|:--|:--|
| `Agent` | `@openai/agents` | Stable (v0.4.12) |
| `Runner` | `@openai/agents` | Stable |
| `run()` | `@openai/agents` | Stable (shorthand for Runner.run) |
| `handoff()` | `@openai/agents` | Stable |
| `tool()` | `@openai/agents` | Stable |
| `ModelProvider` | `@openai/agents-core` | Stable |
| `Model` | `@openai/agents-core` | Stable |
| `ModelRequest` | `@openai/agents-core` | Stable |
| `ModelResponse` | `@openai/agents-core` | Stable |
| `ResponseStreamEvent` | `@openai/agents-core` | Stable |
| `setTracingExportApiKey` | `@openai/agents` | Stable |
| `GoogleGenerativeAI` | `@google/generative-ai` | Stable |

---

## 5. Compatibility

| Component | Current State | SDK Compatibility |
|:--|:--|:--|
| Extension Host (VSCode) | Runs in Node.js | SDK is Node.js native |
| Sidecar (Fastify) | Separate process, port 3000 | Runner can execute in sidecar |
| Gemini adapter | Custom `GeminiModel` implements `Model` | Compatible — needs minor interface alignment |
| Claude adapter | Custom `ClaudeModel` implements `Model` | Compatible — needs minor interface alignment |
| Role markdowns | `.agent/rules/roles/*.md` with YAML frontmatter | Instructions can be loaded as strings |
| Webview (Lit) | Sends messages via Background | No SDK dependency needed in view layer |

---

## 6. Detected AI-first Opportunities
- **`Agent.asTool()`**: Enables Manager pattern where architect agent can call specialist agents as tools
- **`handoffs`**: Native sub-task delegation matching the project's 1-agent-1-task workflow pattern
- **`context` generics**: Can inject VSCode workspace state, file system access, tool definitions per agent
- **`dynamic instructions`**: Functions as instructions allow runtime-resolved role content from markdown files
- **`guardrails`**: Can enforce output format constraints per agent role

---

## 7. Identified Risks

| Risk | Severity | Source |
|:--|:--|:--|
| SDK version 0.x — breaking changes possible in minor versions | Medium | NPM version `0.4.12` |
| Custom ModelProvider requires implementing `getResponse` and `getStreamedResponse` per the exact `ModelResponse` type | Medium | SDK docs |
| OAuth token for Gemini may not be compatible with `@google/generative-ai` API key parameter | Medium | Current project testing |
| Handoffs send full conversation history — large conversations could exceed token limits | Medium | SDK handoffs docs |
| Tracing exporter requires OpenAI API key — will fail silently for non-OpenAI models | Low | SDK tracing docs |
| YAML frontmatter parsing in role markdowns — must handle edge cases and encoding | Low | Project architecture |

---

## 8. Sources
- [OpenAI Agents SDK — Official Docs (JS)](https://openai.github.io/openai-agents-js/)
- [Agents Guide](https://openai.github.io/openai-agents-js/guides/agents/)
- [Models Guide](https://openai.github.io/openai-agents-js/guides/models/)
- [Handoffs Guide](https://openai.github.io/openai-agents-js/guides/handoffs/)
- [Custom Model Providers](https://openai.github.io/openai-agents-js/guides/models/#custom-model-providers)
- [NPM: @openai/agents](https://www.npmjs.com/package/@openai/agents)
- [GitHub: openai/openai-agents-js](https://github.com/openai/openai-agents-js)
- [Vercel AI SDK integration](https://openai.github.io/openai-agents-js/extensions/ai-sdk)

---

## 9. Developer Approval (MANDATORY)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-19T21:24:36+01:00"
    comments: null
```
