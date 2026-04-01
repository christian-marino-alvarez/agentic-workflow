🏛️ **architect-agent**: Acceptance Criteria para T019 — Agent Factory

# Acceptance Criteria — 19-agent-factory

## 1. Consolidated Definition

Crear un **Agent Factory** dentro del sidecar backend (Fastify :3000) que:
- Provea una abstracción de **LLM Client** agnóstica al provider
- Soporte **todos los providers registrados en Settings** (no solo los 3 actuales)
- Incluya **streaming** (SSE) desde el inicio
- Ofrezca capacidades completas de agente: **function calling, tool use, system prompts** (no solo chat)
- Implemente **binding role → modelo** para que cada agente del sistema tenga un modelo LLM asignado
- Viva en el **sidecar process** (aislado del Extension Host)

## 2. Answers to Clarification Questions

| # | Question (formulated by architect) | Answer (from developer) |
|---|-----------------------------------|------------------------|
| 1 | ¿Solo 3 providers o extensibilidad para custom? | Debe soportar todos los providers que se registren en Settings. Por OAuth hay 2 fijos, por API key puede haber muchos. Extensible. |
| 2 | ¿LLM client en sidecar o Extension Host? | En el sidecar backend (Fastify). Analizar la mejor opción. |
| 3 | ¿Streaming desde el inicio o después? | Sí, streaming desde el inicio. |
| 4 | ¿Role-Model binding en esta tarea? | Sí, asignación agente → LLM incluida en esta tarea. |
| 5 | ¿Solo chat completions o más? | Todo lo que necesita un agente para ser más que un chat: function calling, tool use, etc. |

---

## 3. Verifiable Acceptance Criteria

1. Scope:
   - LLM client abstraction layer + factory + role-model binding dentro del sidecar backend
   - Extensible a cualquier provider registrado en Settings

2. Inputs / Data:
   - `LLMModelConfig` desde Settings (provider, authType, apiKey, modelName, maxTokens, temperature)
   - Mensajes de chat (`ChatMessage[]`) con roles (system, user, assistant)
   - Definición de tools/functions para function calling
   - Role → Model mapping configuration

3. Outputs / Expected Result:
   - `LLMClient` interface con: `chat()`, `chatStream()`, soporte para tool use
   - `LLMFactory` que crea el client correcto por provider
   - Endpoint `/chat` (command) y `/chat/stream` (SSE) en el sidecar
   - Configuración persistente de role → model binding
   - Streaming funcional para todos los providers

4. Constraints:
   - El LLM client vive en el sidecar (NO en Extension Host)
   - Extensible: no hardcoded a 3 providers
   - Seguir constitución clean_code y modular_architecture
   - El Extension Host pasa tokens OAuth al sidecar (no acceso directo)

5. Acceptance Criterion (Done):
   - [ ] `npm run compile` exitoso
   - [ ] E2E tests pasan sin regresión
   - [ ] Al menos 1 provider funcional end-to-end (chat + stream)
   - [ ] Role → Model binding configurable
   - [ ] Function/tool calling interface definida
   - [ ] Arquitectura extensible para nuevos providers

---

## Approval (Gate 0)

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-18T17:37:14+01:00"
    comments: null
```

---

## Validation History (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "created"
    validated_by: "architect-agent"
    timestamp: "2026-02-18T17:35:43+01:00"
    notes: "Acceptance criteria defined from 5 developer answers"
  - phase: "phase-0-acceptance-criteria"
    action: "approved"
    validated_by: "developer"
    timestamp: "2026-02-18T17:37:14+01:00"
    notes: "Developer approved — SI"
```
