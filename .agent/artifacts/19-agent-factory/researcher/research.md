🔬 **researcher-agent**: Research report for T019 — Agent Factory

---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 19-agent-factory
---

# Research Report — 19-agent-factory

## 1. Executive Summary
- **Problem investigated**: How to build a provider-agnostic LLM client layer with function calling, tool use, and streaming that serves as the Agent Factory backbone.
- **Research objective**: Document the API contracts, authentication patterns, streaming protocols, and function calling schemas for OpenAI, Google Gemini, and Anthropic Claude.
- **Key findings**: All 3 providers support chat completions, SSE streaming, and function/tool calling, but with different schemas, constraints, and naming conventions.

---

## 2. Detected Needs
- Provider-agnostic LLM client interface (chat, stream, tool use)
- Extensible factory dispatch (not hardcoded to 3 providers)
- SSE streaming for all providers
- Function calling / tool use support for agentic workflows
- Role → Model binding configuration
- Authentication: API key (Bearer) or OAuth access token

**Assumptions:**
- The sidecar process (Fastify :3000) has no access to VS Code APIs or vscode.authentication
- OAuth tokens must be passed from Extension Host to sidecar per request
- The sidecar runs in a Node.js child process

---

## 3. Technical Findings

### 3.1 OpenAI Chat Completions API
- **Endpoint**: `POST https://api.openai.com/v1/chat/completions`
- **Status**: Stable, production
- **Auth**: `Authorization: Bearer <api_key>`
- **Request body**:
  ```json
  {
    "model": "gpt-4o",
    "messages": [{ "role": "system|user|assistant|tool", "content": "..." }],
    "tools": [{ "type": "function", "function": { "name": "...", "description": "...", "parameters": { JSON Schema } }}],
    "tool_choice": "auto|none|required|{ type: function, function: { name } }",
    "max_tokens": 4096,
    "temperature": 0.7,
    "stream": true
  }
  ```
- **Tool call response**: Model returns `tool_calls` array in assistant message:
  ```json
  { "role": "assistant", "tool_calls": [{ "id": "call_xxx", "type": "function", "function": { "name": "...", "arguments": "{ JSON }" }}]}
  ```
- **Tool result**: Send back as `{ "role": "tool", "tool_call_id": "call_xxx", "content": "result" }`
- **Streaming**: SSE with `data: { JSON }` lines, `data: [DONE]` terminal
- **Parallel function calls**: Supported (multiple tool_calls in one response)
- **Known limitations**: max_tokens required for Claude but optional for OpenAI

### 3.2 Google Gemini API
- **Endpoint**: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- **Streaming endpoint**: `:streamGenerateContent?alt=sse`
- **Status**: Stable (v1beta), production
- **Auth**: API key as query param (`?key=...`) OR `Authorization: Bearer <oauth_token>`
- **Request body**:
  ```json
  {
    "contents": [{ "role": "user|model", "parts": [{ "text": "..." }] }],
    "systemInstruction": { "parts": [{ "text": "..." }] },
    "tools": [{ "functionDeclarations": [{ "name": "...", "description": "...", "parameters": { "type": "OBJECT", "properties": {...} }}]}],
    "toolConfig": { "functionCallingConfig": { "mode": "AUTO|ANY|NONE" }},
    "generationConfig": { "maxOutputTokens": 4096, "temperature": 0.7 }
  }
  ```
- **Tool call response**: Model returns `functionCall` in parts:
  ```json
  { "role": "model", "parts": [{ "functionCall": { "name": "...", "args": { ... } }}]}
  ```
- **Tool result**: Send as `{ "role": "user", "parts": [{ "functionResponse": { "name": "...", "response": { ... } }}]}`
- **Streaming**: SSE format, `data: { JSON }` per chunk
- **System instruction**: Separate top-level field (NOT in messages)
- **Known limitations**: No `tool` role; function responses go through `user` role with `functionResponse` part

### 3.3 Anthropic Claude API
- **Endpoint**: `POST https://api.anthropic.com/v1/messages`
- **Status**: Stable, production
- **Auth**: `x-api-key: <api_key>` + `anthropic-version: 2023-06-01`
- **Request body**:
  ```json
  {
    "model": "claude-sonnet-4-20250514",
    "system": "System prompt text",
    "messages": [{ "role": "user|assistant", "content": "..." }],
    "tools": [{ "name": "...", "description": "...", "input_schema": { "type": "object", "properties": {...} }}],
    "tool_choice": { "type": "auto|any|tool", "name": "specific_tool" },
    "max_tokens": 4096,
    "temperature": 0.7,
    "stream": true
  }
  ```
- **Tool call response**: Model returns `tool_use` content block:
  ```json
  { "role": "assistant", "content": [{ "type": "tool_use", "id": "toolu_xxx", "name": "...", "input": { ... } }]}
  ```
- **Tool result**: Send as message with `tool_result` content block:
  ```json
  { "role": "user", "content": [{ "type": "tool_result", "tool_call_id": "toolu_xxx", "content": "result" }]}
  ```
- **Streaming**: SSE with event types: `content_block_start`, `content_block_delta`, `content_block_stop`, `message_stop`
- **System prompt**: Top-level `system` field (NOT in messages array)
- **Known limitations**: `max_tokens` is REQUIRED (not optional); no "function" keyword — uses "tool" terminology only

---

## 4. Relevant APIs

### API Comparison Table

| Feature | OpenAI | Gemini | Claude |
|:--|:--|:--|:--|
| **Chat endpoint** | `/v1/chat/completions` | `:generateContent` | `/v1/messages` |
| **Stream endpoint** | Same + `stream: true` | `:streamGenerateContent?alt=sse` | Same + `stream: true` |
| **Auth** | Bearer token | API key (query) or Bearer (OAuth) | x-api-key header |
| **Messages format** | `role` + `content` | `role` + `parts[{text}]` | `role` + `content` |
| **System prompt** | In messages (role: system) | Separate `systemInstruction` field | Separate `system` field |
| **Tool definition** | `tools[{type, function}]` | `tools[{functionDeclarations}]` | `tools[{name, input_schema}]` |
| **Tool call response** | `tool_calls[]` in message | `functionCall` in parts | `tool_use` content block |
| **Tool result role** | `role: "tool"` | `role: "user"` + `functionResponse` | `role: "user"` + `tool_result` |
| **Parallel calls** | ✅ | ✅ (AUTO mode) | ✅ |
| **max_tokens** | Optional | Optional (`maxOutputTokens`) | **Required** |
| **Stream format** | `data: {JSON}` + `[DONE]` | `data: {JSON}` per chunk | event types (delta) |

---

## 5. Multi-browser Compatibility
> N/A — This is a server-side (Node.js sidecar) implementation. No browser compatibility concerns.

---

## 6. Detected AI-first Opportunities
- All 3 providers now support **parallel function calling**, enabling multi-tool agent workflows
- OpenAI's **Responses API** (2025) provides a more agent-native interface
- Gemini supports **multi-tool use** in a single request (code execution + search)
- Claude's **programmatic tool calling** (Nov 2025) enables Python script generation for complex tool orchestration

---

## 7. Identified Risks

| Risk | Severity | Source |
|:--|:--|:--|
| API format divergence between providers (different schemas for tools, messages, streaming) | High | API documentation |
| OAuth tokens have limited TTL — need refresh before forwarding to sidecar | Medium | Auth module implementation |
| Gemini's `v1beta` may change | Medium | Google API versioning policy |
| Claude's `max_tokens` is required — different from other providers | Low | Anthropic API docs |
| Streaming SSE parsing differs subtly between providers | Medium | API documentation |
| Rate limits vary significantly across providers and plans | Medium | Provider pricing pages |

---

## 8. Sources
- OpenAI Chat Completions API: https://platform.openai.com/docs/api-reference/chat
- OpenAI Function Calling: https://platform.openai.com/docs/guides/function-calling
- Google Gemini API: https://ai.google.dev/gemini-api/docs
- Google Gemini Function Calling: https://ai.google.dev/gemini-api/docs/function-calling
- Anthropic Claude Messages API: https://docs.anthropic.com/en/api/messages
- Anthropic Claude Tool Use: https://docs.anthropic.com/en/docs/build-with-claude/tool-use

---

## 9. Developer Approval (MANDATORY)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-18T17:43:04+01:00"
    comments: null
```
