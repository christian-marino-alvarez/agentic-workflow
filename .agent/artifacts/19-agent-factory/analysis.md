🏛️ **architect-agent** (Final): Deep analysis for T019 — Agent Factory & Role-Model Binding

---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 19-agent-factory
---

# Analysis — 19-agent-factory

## 1. Executive Summary

**Problem**
- Los modelos LLM en Settings son configuración estática. Falta orquestación de agentes, abstracción de cliente, streaming, tools, y binding dinámico de roles.

**Objective**
- Implementar el Agent Factory usando **OpenAI Agents SDK (`@openai/agents`)** como núcleo.
- Módulo `llm` con VirtualBackend en sidecar (Node 22+).
- **Role-Model Binding** dinámico en Settings UI con descubrimiento de roles desde filesystem.
- Soporte multi-provider (Gemini, Claude) mediante adaptadores `ModelProvider`.

**Success Criterion**
- Módulo `llm` operativo con Agents SDK loop.
- Roles `.agent/rules/roles/*.md` cargados dinámicamente como `instructions`.
- Settings UI permite asignar roles a modelos.
- Streaming SSE y tool execution funcionales.

---

## 2. Project State (As-Is)

### Backend Architecture
```
Physical Server                    Virtual Server
─────────────────                  ─────────────────
AbstractBackend                    AbstractVirtualBackend
  └── AppServer (:3000)              └── (ninguno aún — primer uso)
```

### Components
- `AppServer`: Sidecar Fastify.
- `SettingsBackground`: Extension Host logic (CRUD, secrets).
- `Roles`: 10 archivos markdown en `.agent/rules/roles/`.

---

## 3. Acceptance Criteria Coverage

### AC-1: Extensibilidad de Providers
- **Interpretation**: Agents SDK `ModelProvider` interface + Vercel AI SDK adapters.
- **Verification**: `LLMFactory` instancia `Agent` con el adapter correcto según la config del binding.

### AC-2: Ubicación en Sidecar (VirtualBackend)
- **Interpretation**: Agents SDK corre en Node.js sidecar (`llm/backend`). Endpoint `/llm/run` invoca `Runner.run()`.
- **Verification**: Rutas `/llm/*` en sidecar.

### AC-3: Streaming SSE
- **Interpretation**: `Runner.run()` soporta streaming events. Sidecar los re-emite como SSE.
- **Verification**: `POST /llm/stream` devuelve events `text/event-stream`.

### AC-4: Role → Model Binding (Dinámico)
- **Interpretation**:
  1. `settings` background lee `./rules/roles/*.md`.
  2. UI muestra lista. Usuario asigna modelo.
  3. Al ejecutar, `Factory` lee el archivo `.md` y lo pasa como `instructions`.
- **Verification**: Modificar rol en disco → `refresh` → nuevo prompt en ejecución.

### AC-5: Function Calling / Tool Use
- **Interpretation**: Agents SDK tools con Zod schema.
- **Verification**: Definir tool simple, ejecutar agente, verificar invocación automática.

### AC-6: Compile + E2E sin regresión
- **Verification**: Build + tests.

---

## 4. Technical Research

### Decisión: Adoptar `@openai/agents` SDK
- **Why**: Provee agent loop, tool management, handoffs, guardrails y streaming out-of-the-box. TypeScript-first. Model-agnostic capable.
- **Architecture**:
  - `llm/backend/agents/`: Definición de agentes usando el SDK.
  - `llm/backend/adapter/`: `ModelProvider` para Gemini/Claude.
  - `llm/backend/server.ts`: VirtualBackend endpoints wrapping `Runner.run()`.

---

## 5. Participating Agents

| Agent | Responsibilities |
|:--|:--|
| 🏛️ architect | Diseño, supervisión contracts |
| 🤖 backend | Implementar módulo `llm` con Agents SDK, adapters, VirtualBackend |
| 🔧 background | `llm/background` gateway, `settings` role discovery |
| 🎨 view | Settings UI Role Binding section |
| 🛡️ qa | Tests E2E |

---

## 6. Task Impact

- **Dependency**: `@openai/agents`, `zod`.
- **Runtime**: Require Node.js ≥ 22 in sidecar (controlled environment).
- **Pattern**: Agents-as-Tools (Manager) para orquestación.

---

## 7. Risks and Mitigations

| Risk | Mitigation |
|:--|:--|
| OpenAI SDK coupling | Usar `ModelProvider` interface para abstracción |
| Node version mismatch | Enforce Node 22+ check in sidecar startup |
| Complex tracing | Disable default tracing initially |

---

## 8. Open Questions
- None.

---

## 9. TODO Backlog (Mandatory Consultation)
- N/A.

---

## 10. Approval
This analysis **requires explicit developer approval**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-18
    comments: Approved architecture with OpenAI Agents SDK, VirtualBackend, and Dynamic Role Discovery.
```
