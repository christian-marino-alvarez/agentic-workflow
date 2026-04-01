🏛️ **architect-agent**: Research — OpenAI Agents SDK JS (`@openai/agents`)

---
artifact: research-addendum
phase: phase-2-analysis
owner: architect-agent
status: complete
related_task: 19-agent-factory
---

# Research: OpenAI Agents SDK for Agent Factory

## 1. Overview

| Property | Value |
|:--|:--|
| Package | `@openai/agents` |
| GitHub | [openai/openai-agents-js](https://github.com/openai/openai-agents-js) |
| Runtime | Node.js ≥ 22 |
| Dependencies | `zod` v4 (schema validation) |
| Language | TypeScript-first |
| License | MIT |
| Predecessor | [Swarm](https://github.com/openai/swarm) (experimental) |

## 2. Core Primitives

### 2.1 Agent
```typescript
const agent = new Agent({
  name: 'architect',
  instructions: 'You are the architect agent...',  // or dynamic fn
  model: 'gpt-4.1',
  tools: [myTool],
  handoffs: [otherAgent],
  modelSettings: { temperature: 0.7 },
});
```
- **Instructions**: Static string or `(ctx) => string` (dynamic, can inject workflows/rules at runtime)
- **Context**: Generic `Agent<TContext>` — dependency injection (DB, secrets, state)
- **Output types**: Text or structured (Zod schema validated)

### 2.2 Agent Loop (`Runner.run()`)
```
Input → LLM → [tool calls?] → execute tools → append results → repeat
                [handoff?]   → switch agent → continue loop
                [final output?] → return result
```
- Built-in loop manages tool invocation, handoffs, and termination
- `maxTurns` for safety
- Streaming via `Runner.run()` events

### 2.3 Tools
```typescript
const readFile = tool({
  name: 'read_file',
  description: 'Read a file from the workspace',
  parameters: z.object({ path: z.string() }),
  execute: async ({ path }) => fs.readFileSync(path, 'utf-8'),
});
```
- Any TypeScript function → tool, with automatic Zod schema generation
- `agent.asTool()` — use an agent **as a tool** (manager pattern)

### 2.4 Handoffs
```typescript
const architectAgent = Agent.create({
  name: 'Architect',
  instructions: '...',
  handoffs: [backendAgent, viewAgent, qaAgent],
});
```
- **Handoff = specialized tool call** that transfers control to another agent
- Full conversation history passed (configurable via `inputFilter`)
- `onHandoff` callback for side effects
- `inputType` for validated handoff data

### 2.5 Guardrails
- Input/output validation running in parallel with agent execution
- Fail-fast on safety violations

### 2.6 Tracing
- Built-in tracking: LLM calls, tool calls, handoffs, guardrails
- Export to OpenAI dashboard for debugging

### 2.7 Sessions
- Persistent memory layer across agent interactions
- Working context maintained between runs

## 3. Multi-Agent Patterns

### Pattern A: Manager (Agents as Tools)
```
Architect Agent (manager)
├── backend-agent.asTool()    → completes and returns to architect
├── view-agent.asTool()       → completes and returns to architect
└── qa-agent.asTool()         → completes and returns to architect
```
- **Manager retains control** — sub-agents are tools, not autonomous
- Manager summarizes final answer
- **Best for**: our workflow lifecycle (architect orchestrates, delegates, validates)

### Pattern B: Handoffs (Delegation)
```
Triage Agent
├── → handoff to Backend Agent  (takes full control)
├── → handoff to View Agent     (takes full control)
└── → handoff to QA Agent       (takes full control)
```
- **Full delegation** — specialist owns the conversation
- Good for customer support, routing scenarios
- **Less suited** for our workflow where architect must maintain control

## 4. Model Flexibility (Provider-Agnostic)

### Built-in
- Any OpenAI model (gpt-4.1, gpt-5.2, etc.)
- Any Chat Completions-compatible API (via `baseURL`)

### Custom Model Provider
```typescript
class GeminiModel implements Model {
  async getResponse(request: ModelRequest): Promise<ModelResponse> { ... }
  async *getStreamedResponse(request: ModelRequest): AsyncIterable<ResponseStreamEvent> { ... }
}

class GeminiProvider implements ModelProvider {
  getModel(modelName?: string): Model { return new GeminiModel(); }
}

const runner = new Runner({ modelProvider: new GeminiProvider() });
```
- Implement `ModelProvider` + `Model` interfaces
- Per-agent model assignment possible

### Vercel AI SDK Adapter
- Ready-made adapter for **any model supported by Vercel AI SDK** (Anthropic, Google, Mistral, etc.)
- `@openai/agents` + `@ai-sdk/anthropic` / `@ai-sdk/google` etc.

## 5. Mapping to Our Architecture

### How it maps to our roles

| Our Concept | Agents SDK Concept |
|:--|:--|
| `.agent/rules/roles/*.md` | `Agent.instructions` (loaded from files) |
| Role → Model binding | `Agent.model` or `Runner.modelProvider` |
| Architect orchestration | Manager pattern (agents-as-tools) |
| Workflow phases | Sequential `run()` calls with context |
| Tools (file read, compile, test) | `tool()` with Zod validation |
| Lifecycle gates | Human-in-the-loop mechanism |

### Where it runs in our architecture
```
Extension Host                         Sidecar (:3000)
───────────────                         ──────────────
LLM Background                         LLM VirtualBackend
  │                                       │
  │── HTTP POST /llm/run ────────────────►│
  │   { agentRole, input, context }       │
  │                                       │── Runner.run(agent, input)
  │                                       │   ├── LLM call (OpenAI/Gemini/Claude)
  │                                       │   ├── Tool execution
  │                                       │   ├── Handoffs
  │                                       │   └── Final output
  │◄── SSE stream / JSON response ───────│
```

## 6. Comparative Analysis

### Option A: Use `@openai/agents` SDK (RECOMMENDED)

| Pro | Con |
|:--|:--|
| Production-ready agent loop | Node 22+ requirement |
| Multi-agent patterns built-in | Dependency on OpenAI SDK |
| Tool system with Zod validation | Some concepts OpenAI-centric (tracing) |
| Handoffs, guardrails, sessions included | Custom providers need interface implementation |
| Streaming built-in | |
| Human-in-the-loop built-in | |
| MCP server integration | |
| TypeScript-first with strong types | |
| Model-agnostic via `ModelProvider` | |

### Option B: Custom Factory (from scratch)
| Pro | Con |
|:--|:--|
| Full control | Must build agent loop, tools, handoffs from scratch |
| No external dependencies | Significant development effort |
| Tailored to our exact needs | Must maintain and evolve ourselves |

### Option C: Hybrid — SDK as Runtime, Custom Orchestration
| Pro | Con |
|:--|:--|
| SDK handles low-level (loop, tools, streaming) | Still depends on `@openai/agents` |
| Our code handles high-level (workflows, lifecycle) | |
| Best of both worlds | |

## 7. Recommendation

**Use Option A: `@openai/agents` SDK** as the foundation for the Agent Factory.

**Rationale:**
1. **Already TypeScript-first** — native fit for our codebase
2. **Agent-as-tools pattern** = our architect orchestration model
3. **Model-agnostic** via `ModelProvider` interface — we can implement providers for Gemini/Claude
4. **Built-in**: agent loop, tools, handoffs, guardrails, streaming, sessions, tracing
5. **Human-in-the-loop** maps to our lifecycle gates
6. **Dynamic instructions** = `(ctx) => readRoleFile(agentRole)` — loads from `.agent/rules/roles/`
7. **Eliminates months of custom development** for agent orchestration primitives

**Node 22+ requirement**: compatible with our sidecar (we control the runtime).

## 8. Architectural Impact on T019

If adopting `@openai/agents`, the Agent Factory simplifies dramatically:

```
BEFORE (custom):
  LLMFactory → LLMClient → fetch() → parse response → manual loop

AFTER (@openai/agents):
  Agent({ instructions, tools, model }) → Runner.run() → result
  ├── Agent loop handled by SDK
  ├── Tools = Zod-validated TypeScript functions
  ├── Multi-agent = agents-as-tools on architect
  └── Streaming = built-in
```

**What we still build ourselves:**
- Role discovery from `.agent/rules/roles/*.md` → dynamic `Agent.instructions`
- Role-Model binding config in Settings
- VirtualBackend endpoints (`/llm/run`, `/llm/stream`)
- `ModelProvider` implementations for Gemini and Claude (via Vercel AI SDK adapter)
- Integration with our Background/View architecture
