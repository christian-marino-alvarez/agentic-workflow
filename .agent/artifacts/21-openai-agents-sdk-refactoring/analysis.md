🏛️ **architect-agent**: Analysis Report — 21-openai-agents-sdk-refactoring

---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 21-openai-agents-sdk-refactoring
---

# Analysis — 21-openai-agents-sdk-refactoring

## 1. Executive Summary
**Problem**
- The current bespoke multi-agent system (`LiveAgent`, `GhostAgent`, `AgentFactory`) lacks native orchestrator features like standard handoffs, full tool-calling abstractions, and robust guardrails. It is difficult to scale and maintain.

**Objective**
- Completely replace the bespoke orchestration with the official `@openai/agents` SDK, ensuring multi-provider support, dynamic agent initialization from markdown roles, and executing the `Runner` in the isolated backend/sidecar.

**Success Criterion**
- The new agent module leverages the SDK exclusively. Models can process tasks via their original providers (Gemini, Claude, OpenAI), initialized seamlessly from the `.agent/rules/roles/` markdown frontmatter.

---

## 2. Project State (As-Is)
- **Relevant structure**: `src/extension/modules/agent/` and `src/extension/modules/llm/`
- **Existing components**:
  - `LiveAgent` (HTTP proxy to Sidecar)
  - `GhostAgent` (Offline fallback)
  - `AgentFactory` / `AgentOrchestrator` (creates Agents in Extension Host)
  - `LLMVirtualBackend` (Fastify Server receiving `/run` requests)
  - Custom `GeminiProvider`, `ClaudeProvider`, `OpenAIProvider` in LLM Backend.
- **Detected limitations**:
  - `AgentFactory` in Extension Host resolves the model and API keys manually, sending them to the Sidecar per request. The Sidecar doesn't own the Agent state.
  - No native handoff structure.

---

## 3. Acceptance Criteria Coverage

### AC-1: LiveAgent, GhostAgent, AgentFactory, AgentOrchestrator eliminados
- **Interpretation**: The old proxy-based Agent instances must be deleted.
- **Verification**: Ensure those files are deleted and all dependencies (e.g., `ChatBackground` sending messages) use the new SDK integration via `Runner`.
- **Risks**: High breaking change risk in how the Chat UI interacts with the Background layer if the API contract changes.

### AC-2: Agent module usa `@openai/agents` SDK exclusively
- **Interpretation**: All orchestration (history, tools, handoffs) runs via the SDK.
- **Verification**: Inspect `package.json` and agent execution paths.
- **Risks**: Aligning the custom UI state format (AgentStatus, streams) with the SDK's `RunEvent` output.

### AC-3: LLM Backend refactorizado para ser el host del Runner del SDK
- **Interpretation**: The Sidecar Fastify server (`llm/backend`) becomes the true host of the SDK `Runner`.
- **Verification**: Check `src/extension/modules/llm/backend/index.ts` to see `Runner.run_streamed()` yielding events back to the UI.
- **Risks**: Passing VSCode specific context (like workspace path) to the Sidecar.

### AC-4: Role markdowns definen cada agente
- **Interpretation**: Agents are dynamically initialized parsing `.agent/rules/roles/*.md`.
- **Verification**: Implementation of a Markdown parser in the backend/host that creates an `Agent` object with `instructions` and `model`.
- **Risks**: YAML frontmatter parsing errors.

### AC-5: Multi-provider funciona (Gemini, Claude, OpenAI)
- **Interpretation**: Agents can interact via Gemini and Claude despite using the OpenAI SDK.
- **Verification**: Verify custom `ModelProvider` adapters correctly translate OpenAI `ModelRequest` to native formats.
- **Risks**: Gemini and Claude specific tool-calling formats (handoffs) might clash with OpenAI's format in the custom adapters.

---

## 4. Technical Research & Alternatives

### Integration of Gemini/Claude in `@openai/agents`
- **Alternative A: Custom `ModelProvider` Adapters (Current Base)**
  - Description: Extend `@openai/agents-core` `Model` and `ModelProvider` interfaces wrapping `@google/generative-ai` and `@anthropic-ai/sdk`.
  - Advantages: Total control over the network request, maintains current OAuth flow which requires specific headers.
  - Disadvantages: Requires manual translation of OpenAI's Message/ToolCall format to Gemini/Claude formats.
- **Alternative B: OpenAI-Compatible API Endpoints**
  - Description: Point the SDK's `baseURL` to Gemini's `v1beta/openai/` endpoint.
  - Advantages: Zero-code mapping. SDK handles everything natively.
  - Disadvantages: May not support Enterprise OAuth authentication (often requires pure API Keys), forcing us to rewrite auth.

**Recommended decision**
- **Alternative A**. We must maintain the robust OAuth flows already defined in the project. Creating strict `ModelProvider` adapters is safer for long-term compatibility with VSCode auth sessions.

---

## 5. Participating Agents
- **architect-agent**
  - Responsibilities: Oversee architectural constraints and definitions.
- **backend-agent**
  - Responsibilities: Refactor the `llm/backend` to instantiate the SDK `Runner`, build the `ModelProvider` adapters, and create the endpoint for the Extension Host.
- **background-agent**
  - Responsibilities: Refactor `agent/background` and `chat/background` to proxy user inputs to the Sidecar's new SDK Runner endpoint and parse the streamed `RunEvent`.
- **qa-agent**
  - Responsibilities: Ensure tests are updated to cover the new SDK abstraction and custom providers.

**Required Components**
- **DELETE**: `LiveAgent`, `GhostAgent`, `AgentOrchestrator`.
- **CREATE**: `RoleParser` (to parse markdowns to SDK Agents), updated `ModelProviders` for Gemini/Claude.
- **MODIFY**: `LLMVirtualBackend` (to host `Runner`), `ChatBackground`.

**Demo**
- A demo is essentially the working Chat Webview capable of multi-agent handoffs.

---

## 6. Task Impact
- **Architecture**: Shifts stateful Agent orchestration from the Extension Host into the Sidecar (Backend).
- **APIs**: Internal WebSocket/HTTP contract between Background and Backend must change to accommodate `Runner` streams.
- **Testing**: Complete rewrite of Agent unit tests. Substantial coverage needed for `ModelProvider` translators.

---

## 7. Risks and Mitigations
- **Risk 1**: Translating OpenAI Tool Calls to Gemini/Claude natively for handoffs.
  - Impact: Handoffs fail to execute.
  - Mitigation: The `backend-agent` must test manual format translation carefully in `GeminiModel.getResponse()`.
- **Risk 2**: UI streaming state out-of-sync with SDK.
  - Impact: Chat interface breaks or drops messages.
  - Mitigation: Map the SDK's `RunEvent.type` strictly to the View's expected streaming formats (`content`, `status`).

---

## 8. Open Questions
- None.

---

## 9. TODO Backlog (Mandatory Consultation)
**Reference**: `.agent/todo/`
**Current state**: Directory does not exist. (empty)
**Impact on analysis**: None.

---

## 10. Approval
This analysis **requires explicit developer approval**.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-19T21:27:17+01:00"
    comments: null
```
