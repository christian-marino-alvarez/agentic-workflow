🏛️ **architect-agent**: Implementation Plan — 21-openai-agents-sdk-refactoring

---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 21-openai-agents-sdk-refactoring
---

# Implementation Plan — 21-openai-agents-sdk-refactoring

## 1. Plan Summary
- **Context**: Replace the current custom `LiveAgent`/`GhostAgent` orchestration completely with the `@openai/agents` SDK, moving the `Runner` to the backend sidecar.
- **Expected result**: The `llm` backend hosts the SDK `Runner`, executing `Agent` instances dynamically built from `.agent/rules/roles/*.md`. Multi-provider support remains via custom adapters (`GeminiProvider`, etc.). The Extension Host just sends prompts and receives streaming events.
- **Scope**: Includes refactoring `llm` backend and `agent`/`chat` background layers. Excludes UI structure changes (only state streaming alignment).

---

## 2. Contractual Inputs
- **Task**: `.agent/artifacts/21-openai-agents-sdk-refactoring/task.md`
- **Analysis**: `.agent/artifacts/21-openai-agents-sdk-refactoring/analysis.md`
- **Acceptance Criteria**: AC-1 (Delete old instances), AC-2 (OpenAI SDK exclusive), AC-3 (Backend Runner), AC-4 (Role markdowns), AC-5 (Multi-provider adapters).

**Domain dispatch (MANDATORY if applicable)**
```yaml
plan:
  workflows:
    - domain: llm
      action: refactor
      workflow: coding-backend
    - domain: agent
      action: refactor
      workflow: coding-background
    - domain: chat
      action: refactor
      workflow: coding-background

  dispatch:
    - domain: llm
      action: verify
      workflow: null
```

---

## 3. Implementation Breakdown (steps)

### Step 1: Cleanup & Setup
- **Description**: Delete `LiveAgent`, `GhostAgent`, `AgentFactory`, and `AgentOrchestrator`. Add `@openai/agents` to dependencies if not already. Create a `RoleParser` util to read `.agent/rules/roles/*.md` and extract frontmatter.
- **Dependencies**: None.
- **Deliverables**: Clean slate, parser utility ready.
- **Responsible agent**: `backend-agent`

### Step 2: Custom Model Providers
- **Description**: Update `src/extension/modules/llm/backend/adapters/` (`GeminiProvider`, `ClaudeProvider`) to strictly implement `@openai/agents-core` `Model` and `ModelProvider` interfaces. Ensure the translation of `ModelRequest` to native formats supports tool calls.
- **Dependencies**: Step 1.
- **Deliverables**: SDK-compliant provider adapters.
- **Responsible agent**: `backend-agent`

### Step 3: LLM Virtual Backend (Runner Host)
- **Description**: Refactor `src/extension/modules/llm/backend/index.ts`. Create the `/run` endpoint to instantiate a `Runner` with the target `Agent` (built from `RoleParser`). Stream the `ResponseStreamEvent` back over HTTP/Fastify to the Extension Host.
- **Dependencies**: Step 2.
- **Deliverables**: Working SDK runner endpoint in the sidecar.
- **Responsible agent**: `backend-agent`

### Step 4: Background Orchestration Refactor
- **Description**: Refactor `src/extension/modules/agent/background/index.ts` and `src/extension/modules/chat/background/index.ts`. The `ChatBackground` will now send the `role` and `input` directly to the `llm` backend stream endpoint, listen for `RunEvent`, and dispatch state updates to the view.
- **Dependencies**: Step 3.
- **Deliverables**: Extension host successfully communicating with the Sidecar Runner.
- **Responsible agent**: `background-agent`

### Step 5: Verification & Tests
- **Description**: Rewrite unit tests for `llm/backend` to verify `ModelProvider` translation and `RoleParser`. Ensure the mock backend correctly mocks Fastify.
- **Dependencies**: Step 4.
- **Deliverables**: Passing test suite (≥ coverage).
- **Responsible agent**: `qa-agent`

---

## 4. Responsibility Assignment (Agents)

- **Architect-Agent**
  - Oversees the plan execution, dispatches tasks, and validates completion against ACs.
- **backend-agent**
  - Refactors `llm/backend`: Providers, Runner endpoint, and Role Parser.
- **background-agent**
  - Refactors `agent/background` and `chat/background` bridging Extension Host to the new API.
- **qa-agent**
  - Rewrites tests for the new SDK implementations.

**Handoffs**
- `backend-agent` finishes Step 3 → hands off to `background-agent` for Step 4.
- `background-agent` finishes Step 4 → hands off to `qa-agent` for Step 5.

**Components**
- `LiveAgent`/`GhostAgent`/`Factory`: DELETE (backend-agent).
- `src/extension/modules/llm/backend/roles.ts`: CREATE (backend-agent). Reads markdowns.
- `src/extension/modules/llm/backend/index.ts`: MODIFY (backend-agent). Implements `Runner`.
- `src/extension/modules/chat/background/index.ts`: MODIFY (background-agent). Parses streaming events.

---

## 5. Testing and Validation Strategy

- **Unit tests**
  - Scope: The `RoleParser` must correctly parse VSCode YAML frontmatter. The `GeminiModel` must correctly map OpenAI `run_step` tool calls to Gemini `functionCall`.
  - Tools: Mocha/Chai (project standard).
- **Integration tests**
  - Scope: `LLMVirtualBackend` fastify endpoints must stream SDK events properly.
- **E2E / Manual**
  - Key scenarios: Chat with a specialized agent (e.g., `qa-agent`), switch model to Gemini, verify the response comes from Gemini using the instructions from `.agent/rules/roles/qa.md`.

**Traceability**
- `RoleParser` unit tests ↔ AC-4.
- `GeminiModel` unit tests ↔ AC-5.
- `LLMVirtualBackend` integration tests ↔ AC-3.

---

## 6. Estimations and Implementation Weights
- **Step 1 (Cleanup/Parser)**: Low (1-2 hours)
- **Step 2 (Custom Providers)**: High (3-4 hours) due to precise type mapping.
- **Step 3 (Runner Endpoint)**: Medium (2 hours).
- **Step 4 (Background Refactor)**: Medium (2 hours).
- **Step 5 (Tests)**: High (3 hours).
- **Assumptions**: The OpenAI Agents SDK types strictly match the documentation, and Fastify streaming works with standard Node.js AsyncIterables.

---

## 7. Critical Points and Resolution

- **Critical point 1**: Mapping OpenAI Tool Calls to Google Generative AI in the custom provider.
  - Risk: Function calling fails, breaking handoffs.
  - Impact: High.
  - Resolution strategy: Implement strict type tests in `gemini-adapter.test.ts` verifying the conversion from `ModelRequest` tools to Gemini `FunctionDeclaration`.
- **Critical point 2**: Streaming `ResponseStreamEvent` over HTTP.
  - Risk: Chunks are fragmented or JSON malformed.
  - Impact: UI Chat breaks.
  - Resolution strategy: Use `fastify.raw.writeHead` with `Transfer-Encoding: chunked` and line-delimited JSON (NDJSON) exactly as the current implementation does.

---

## 8. Dependencies and Compatibility
- **Internal dependencies**: The `SecretStorageService` in Extension Host must pass API keys down to the Sidecar dynamically per request (since the sidecar is stateless).
- **External dependencies**: `@openai/agents` and `@openai/agents-core`.
- **Relevant architectural constraints**: The Sidecar MUST NOT import VSCode modules (strict modularity).

---

## 9. Completion Criteria
- [ ] All custom proxy agents deleted.
- [ ] `@openai/agents` manages the run loop in the Sidecar.
- [ ] Changing a model in the UI persists to `.agent/rules/roles/<role>.md`.
- [ ] Multi-provider tool-calling works (at least one handoff).
- [ ] Tests pass locally (`npm run test`).

---

## 10. Developer Approval (MANDATORY)
This plan **requires explicit and binary approval**.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-19T21:29:00+01:00"
    comments: null
```
