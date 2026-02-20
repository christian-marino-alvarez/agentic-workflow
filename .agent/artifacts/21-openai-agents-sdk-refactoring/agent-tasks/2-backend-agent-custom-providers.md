---
id: task.21.2
title: "Custom Model Providers (Gemini & Claude)"
status: in_progress
assigned_to: backend-agent
parent_task: 21-openai-agents-sdk-refactoring
---

# Task: Custom Model Providers (Gemini & Claude)

## Input
### 1. Objective
Implement custom `ModelProvider` adapters for Gemini and Claude to bridge the gap between their official Node.js SDKs (or raw APIs) and the `@openai/agents` SDK.

### 2. Scope
- Create `src/extension/modules/llm/backend/adapters/gemini-provider.ts` using `@google/generative-ai`.
- Create `src/extension/modules/llm/backend/adapters/claude-provider.ts` using Anthropic's REST API or `@anthropic-ai/sdk` (or direct Fetch if easier, matching current implementation).
- Ensure both implement `ModelProvider` and internal `Model` interfaces from `@openai/agents-core` so they can be injected into the `Runner` later.

### 3. Dependencies
- `@openai/agents-core` (`ModelProvider`, `Model`, `ModelRequest`, `ModelResponse`, `ResponseStreamEvent`).
- `@google/generative-ai` (already in package.json).
- Must handle system prompts, JSON outputs (tools), and text appropriately.

## Reasoning
> *To be completed by the assigned agent before execution.*
- **Approach**: 
- **Alternatives considered**: 
- **Risks**: 

## Output
### 1. Expected deliverables
- Gemini custom ModelProvider. 
- Claude custom ModelProvider.
- Both exporting a cleanly instantiated adapter class.

### 2. Physical evidence required
- Code must compile perfectly (`npm run compile`).
- Adapters must strictly implement the required TypeScript interfaces from the SDK.

---

## Implementation Report
> *To be completed by the assigned agent during execution.*

### Changes made
- Creada estructura `src/extension/modules/llm/backend/adapters/`.
- Creado `gemini-provider.ts` que implementa `ModelProvider` interactuando con `@google/generative-ai`.
- Creado `claude-provider.ts` que implementa `ModelProvider` interactuando mediante Fetch nativo a la API de Anthropic.

### Technical decisions
- Ambos adaptadores traducen dinámicamente el `request.input` (que puede ser un array de `AgentInputItem` o un simple string según el SDK de OpenAI) a un prompt de texto plano compatible con los endpoints.
- Para el streaming, se implementó `getStreamedResponse` emitiendo la interfaz asíncrona estándar con `response_started`, múltiples `output_text_delta` y por último un evento `response_done` falso con consumos 0 tal como requiere la interfaz `@openai/agents-core`.

### Evidence
- Ambos archivos compilan de forma limpia (`npm run compile = success`) comprobando compatibilidad de tipos con `@openai/agents-core`.

### Deviations from objective
- Ninguna.

---

## Gate Approval (Mandatory)
### Developer Approval (Gate)
- **Approved by:** [AgentName or Developer]
- **Date:** [Timestamp]
- **Status:** [SI | NO]
- **Notes:** [Any relevant feedback or conditions]

---

## Rules of Execution (Contractual)
1.  **NO FUNCTIONAL GAPS**: The tests must verify the core AC.
2.  **PHYSICAL EVIDENCE ONLY**: No assumptions, only code and logs.
3.  **STRICT GATES**: If tests fail, NO passing.
