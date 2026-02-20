---
id: task.21.5
title: "Adapt Chat UI for Streaming"
status: pending
assigned_to: view-agent
parent_task: 21-openai-agents-sdk-refactoring
---

# Task: Adapt Chat UI for Streaming

## Input
### 1. Objective
Refactor the UI (`src/extension/modules/chat/view/index.ts` and its Lit components) to handle the new streaming format. Instead of just pushing a complete text response, the UI must accumulate chunks (`isStreaming: true`) up to the final chunk (`isStreaming: false`). 

### 2. Scope
- Modify `src/extension/modules/chat/view/`.
- Must handle the struct of `MESSAGES.RECEIVE_MESSAGE` containing `{ text: string, agentRole: string, isStreaming: boolean }`.
- Update the lit templates (e.g. `chat-view.ts` or `chat-container`) so that the active assistant message is mutated in place until streaming finishes, instead of creating a new message bubble per chunk.
- Constitution `view.md` mandates NO business logic, strictly visual rendering.

### 3. Dependencies
- Lit components in `chat/view`
- Global Event Bus (`this.listen(MESSAGES.RECEIVE_MESSAGE)`)

## Reasoning
> *To be completed by the assigned agent before execution.*
- **Approach**: 
- **Alternatives considered**: 
- **Risks**: 

## Output
### 1. Expected deliverables
- Refactored `ChatView` components that render the streaming text character by character as emitted from the sidecar without duplicating message bubbles.

### 2. Physical evidence required
- Code must compile perfectly (`npm run compile`).
- Proper adherence to `.agent/rules/view.md` (no IDE specific logic, just Lit).

---

## Implementation Report
> *To be completed by the assigned agent during execution.*

### Changes made
- Modificada la vista `src/extension/modules/chat/view/index.ts` para manejar la recepción de partes del modelo sin hacer *bubble-duplication*.
- Se actualizó el HTML template `chat/view/templates/html.ts` y estilos `css.ts` para agregar el cursor parpadeante (typewriter effect).
- Se portó `interface.ts` a `types.d.ts` bajo instrucción del Developer.

### Technical decisions
- En el método `listen()`, inspeccionamos si la bandera `isStreaming` viene en true. Si *ya existe* un mensaje final del mismo rol al que le dimos un status ("Contacting sidecar..."), directamente mutamos la propiedad `text` acumulando el bloque en vez de inyectar un container del layout por cada pequeño update.
- El cursor CSS puro (`@keyframes blink`) anexo a la clase `.streaming-cursor` avisa silenciosamente al ojo humano que el backend Sidecar sigue activo transmitiendo chunks HTTP de forma reactiva asíncrona.

### Evidence
- `npm run compile` sin errores posterior al refactor del file naming `types.d.ts` y con `isStreaming?: boolean` inyectado a la firma `history`.

### Deviations from objective
- Ninguna.

---

## Gate Approval (Mandatory)
### Developer Approval (Gate)
- **Approved by:** [AgentName or Developer]
- **Date:** [Timestamp]
- **Status:** [SI | NO]
- **Notes:** [Any relevant feedback or conditions]
