🔬 **researcher-agent**: Research Report — OpenAI Agents SDK & Gemini Integration

---
artifact: research-gemini
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 21-openai-agents-sdk-refactoring
---

# Research Report — Gemini Integration for OpenAI Agents SDK

> [!CAUTION]
> **PERMANENT RULE**: This document is ONLY documentation.
> The researcher-agent documents findings WITHOUT analyzing, WITHOUT recommending, WITHOUT proposing solutions.
> Analysis belongs to Phase 2.

## 1. Executive Summary
- **Problem investigated**: How to seamlessly integrate Google's Gemini models into the `@openai/agents` SDK multi-agent system.
- **Research objective**: Document the specific approaches, APIs, and potential limitations when using Gemini as a provider within the OpenAI native SDK.
- **Key findings**: Gemini can be integrated into the SDK through two primary methods: 1) Using Google's native OpenAI-compatible API endpoint directly, or 2) Implementing a custom `ModelProvider` adapter that wraps `@google/generative-ai`.

---

## 2. Detected Needs
- **N1**: Agnostic execution of Gemini models (e.g., `gemini-1.5-pro`, `gemini-1.5-flash`) within the OpenAI SDK's `Runner`.
- **N2**: Support for tool calling and handoffs when using Gemini.
- **N3**: Proper mapping of conversational roles between the OpenAI format and Gemini's format.

---

## 3. Technical Findings

### 3.1 Method A: OpenAI-Compatible Endpoint (Native Google API)
- **Description**: Google recently introduced an OpenAI-compatible API endpoint (`https://generativelanguage.googleapis.com/v1beta/openai/`).
- **Mechanism**: The `@openai/agents` SDK can be configured to point to this `baseURL`, and the `apiKey` is set to the Gemini API Key. The SDK handles requests natively exactly as it would for OpenAI, but the requests are routed to Gemini API.
- **Support**: Supports standard Chat Completions API format, including function calling (tools) and structured outputs.

### 3.2 Method B: Custom `ModelProvider` Adapter (Current Approach)
- **Description**: Utilizing the `@openai/agents-core` interfaces `ModelProvider` and `Model` to wrap the official `@google/generative-ai` SDK.
- **Mechanism**:
  - Implement `Model.getResponse(request)` and translate `ModelRequest` (OpenAI format) to Gemini's `Content` format.
  - Translate Gemini's tool calls to OpenAI's tool call format in the `ModelResponse`.
- **Support**: Total control over the specific Gemini API features, but requires manual mapping of all types (messages, system prompts, tool calls).

### 3.3 Handoffs with Gemini
- **Mechanism**: Handoffs in `@openai/agents` are implemented as forced tool calls (`transfer_to_<agent>`).
- **Compatibility**: Gemini supports forced tool calling via `toolConfig: { functionCallingConfig: { mode: "ANY" } }`. The OpenAI-compatible API handles this translation automatically.

---

## 4. Relevant APIs

| API / Interface | Package | State |
|:--|:--|:--|
| `ModelProvider` | `@openai/agents-core` | Stable |
| `GoogleGenerativeAI` | `@google/generative-ai` | Stable |
| OpenAI-Compatible API | Google Gemini API | Beta (`v1beta`) |

---

## 5. Multi-browser / Environment Compatibility
- **Environment**: Node.js backend (Extension's Sidecar).
- **Network**: The OpenAI-compatible endpoint uses standard HTTPS REST calls.
- **SDK**: Tested with `@google/generative-ai` in Node.js.

---

## 6. Detected AI-first Opportunities
- **Zero-code adapter**: Using the `base_url` parameter points to Gemini without writing a complex custom `Model` adapter, simplifying the codebase drastically.
- **Native Context**: Gemini 1.5 Pro's 2M token context window can be leveraged seamlessly through the standard SDK without adapter truncation.

---

## 7. Identified Risks

| Risk | Severity | Source |
|:--|:--|:--|
| The Google OpenAI-compatible endpoint is in `v1beta` and may have missing edge-case integrations (like specific streaming formats). | Medium | Google Docs |
| Handoff `tool_call` format might be strict in Gemini compared to OpenAI's native handling. | Medium | Community feedback |
| OAuth tokens (which the project uses for Gemini) might not be natively supported by the OpenAI-compatible endpoint, which typically expects pure API Keys in the `Authorization: Bearer` header. | High | Project Context |

---

## 8. Sources
- [Google AI for Developers: OpenAI Compatibility](https://developers.google.com/gemini-api/docs/openai)
- [OpenAI Agents SDK: Custom Model Providers](https://openai.github.io/openai-agents-js/guides/models/#custom-model-providers)

---

## 9. Developer Approval (MANDATORY)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-19T21:24:36+01:00"
    comments: null
```
