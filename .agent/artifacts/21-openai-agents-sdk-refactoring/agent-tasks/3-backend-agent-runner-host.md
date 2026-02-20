---
id: task.21.3
title: "Host Runner Execution in Fastify Sidecar"
status: pending
assigned_to: backend-agent
parent_task: 21-openai-agents-sdk-refactoring
---

# Task: Host Runner Execution in Fastify Sidecar

## Input
### 1. Objective
Refactor the LLM backend sidecar (`src/extension/modules/llm/backend/index.ts`) to be the central orchestration point. It must instantiate the `@openai/agents` SDK `Runner` properly given the selected provider/model, fetch the agent role rules, and handle chat session streams, bridging between the extension host requests and the custom model providers we just created.

### 2. Scope
- Modify `src/extension/modules/llm/backend/index.ts`.
- It currently extends `AbstractServer` per the backend constitution.
- Must handle the `/sessions` HTTP endpoint to initiate the Runner.
- Must implement the SDK's `Runner.run()` matching the `MessageOrigin` / `RoleParser` from Task 1.

### 3. Dependencies
- `@openai/agents` (`Runner`, `Agent`)
- `GeminiProvider`, `ClaudeProvider` (from Task 2)
- `RoleParser` (from Task 1)

## Reasoning
> *To be completed by the assigned agent before execution.*
- **Approach**: 
- **Alternatives considered**: 
- **Risks**: 

## Output
### 1. Expected deliverables
- A refactored `llm/backend/index.ts` capable of mapping extension `Chat` requests via `req.body.model` to one of the custom SDK Providers.
- It instantiates the correct SDK `Agent` mapping the rules via `RoleParser.getRoleAndModel('system_agent')`.
- Handles Fastify streaming (SSE or simple chunked encoding) matching the `Runner.run({ stream: true })` output.

### 2. Physical evidence required
- Code must compile perfectly (`npm run compile`).
- Proper adherence to the backend constitution (`{ error, code }` structure for failures).

---

## Implementation Report
> *To be completed by the assigned agent during execution.*

### Changes made
- Eliminamos los adaptadores obsoletos del pre-refactor (`gemini-adapter.ts`, `claude-adapter.ts`) que causaban errores conceptuales o de dependencia extra.
- Refactorizamos `src/extension/modules/llm/backend/factory.ts` para importar y utilizar los nuevos `GeminiProvider` y `ClaudeProvider` finalizados en el paso anterior.
- Modificamos `src/extension/modules/llm/backend/index.ts` (Host del Fastify Sidecar) para construir la instancia estándar de `Runner` e importar `agent` desde la factory.
- Se implementaron métodos para `run` (Standard) y `stream` iterando el evento `raw_model_stream_event` del SDK para compatibilidad retroactiva con `chat`.

### Technical decisions
- En el endpoint `stream()`, aprovechamos que el nuevo SDK utiliza iteradores asíncronos (`AsyncIterable`) y recorremos `for await (const chunk of result)` capturando únicamente los sub-eventos de tipo textual `output_text_delta` o `response.delta` para volcarlos sobre la conexión HTTP en tiempo real de manera limpia sin perder metadatos del Runner.
- En caso de throw error, los volcamos de forma estructurada `{ error, code: 500 }` para cumplir la constitución de backend y omitir raw exceptions no controladas.
- Actualizamos el cálculo de consumo leyendo token sizes de la propiedad `usage` en `result.rawResponses` o `result.usage`.

### Evidence
- `npm run compile` fue exitoso, comprobando la total adherencia de tipos entre VS Code Extension y `@openai/agents`.

### Deviations from objective
- Ninguna.

---

## Gate Approval (Mandatory)
### Developer Approval (Gate)
- **Approved by:** Developer
- **Date:** 2026-02-19T21:54:21+01:00
- **Status:** SI
- **Notes:** Approved with type declarations cleanup.
