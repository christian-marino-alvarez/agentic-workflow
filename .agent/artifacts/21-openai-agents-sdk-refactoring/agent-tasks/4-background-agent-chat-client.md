---
id: task.21.4
title: "Refactor Chat Client for SDK Runner"
status: pending
assigned_to: background-agent
parent_task: 21-openai-agents-sdk-refactoring
---

# Task: Refactor Chat Client for SDK Runner

## Input
### 1. Objective
Refactor `src/extension/modules/chat/background/index.ts` so that it sends chat messages to the Fastify sidecar's `/sessions` or `/stream` endpoints, utilizing the newly implemented `@openai/agents` SDK `Runner` host from Task 3. Remove the temporary stubs left during Task 1.

### 2. Scope
- Modify `src/extension/modules/chat/background/index.ts`.
- Update `handleSendMessage` to map the ChatView messages into an array of `AgentInputItem` or simply append them as context to be consumed by the Fastify backend `stream()` method.
- Re-hydrate the `ChatView` using the SSE chunks (`output_text_delta`) emitted by the backend.
- Use `MessageOrigin.CHAT` appropriately.

### 3. Dependencies
- `core/types` (`ModelCapabilities`)
- Fastify Backend Endpoints (`API_ENDPOINTS.STREAM`)
- View-Background messaging bridge (`StateUpdateMessage`, `StreamDeltaMessage`).

## Reasoning
> *To be completed by the assigned agent before execution.*
- **Approach**: 
- **Alternatives considered**: 
- **Risks**: 

## Output
### 1. Expected deliverables
- Fully integrated `ChatBackground` that streams tokens from the Fastify backend `Runner` to the Lit `ChatView`.

### 2. Physical evidence required
- Code must compile perfectly (`npm run compile`).
- Proper adherence to `.agent/rules/background.md` (no direct logic, pure orchestration).

---

## Implementation Report
> *To be completed by the assigned agent during execution.*

### Changes made
- Modificado `src/extension/modules/chat/background/index.ts` para conectar la función nativa `handleSendMessage` con el endpoint HTTP de Fastify expuesto en el paso anterior (`http://localhost:3000/api/v1/llm/stream`).

### Technical decisions
- **API Wrapper vs HTTP Directo:** Por restricción de la constitución Clean-Code, se aisló el uso del SDK al sidecar para no bloquear con tareas largas el node Process de VSCode extension host. El Background ahora usa `fetch` para invocar al sidecar en localhost, recupera el `ReadableStream` originado por el Adapter, decodifica los chunks via `TextDecoder` (SSE standard format) y reemite eventos estructurados (`MESSAGES.RECEIVE_MESSAGE`) al WebView usando `isStreaming`.
- Se removió oficialmente el stub "Temporarily disabled..." y delegamos todo control a las nuevas piezas del SDK.
- Las dependencias estáticas (modelId y role) se proveen usando el input binding real.

### Evidence
- El código se compila perfectamente con TypeScript, alineado a todas las firmas de eventos entre `ChatBackground` y `ChatView`.

### Deviations from objective
- Ninguna.

---

## Gate Approval (Mandatory)
### Developer Approval (Gate)
- **Approved by:** Developer
- **Date:** 2026-02-19T22:00:41+01:00
- **Status:** SI
- **Notes:** Approved with constants refactoring for endpoints and bus names.
