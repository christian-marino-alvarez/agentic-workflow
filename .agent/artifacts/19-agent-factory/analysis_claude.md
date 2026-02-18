🏛️ **architect-agent**: Deep analysis for T019 — Agent Factory & Role-Model Binding

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
- Los modelos LLM registrados en Settings son solo configuración estática. No existe capa de servicio que los transforme en clientes funcionales capaces de ejecutar llamadas a APIs de IA con streaming, function calling y tool use.

**Objective**
- Implementar el Agent Factory: un nuevo módulo `llm` con VirtualBackend que se registra en el AppServer, proporcionando LLM client abstraction con provider clients extensibles, streaming SSE, function/tool calling, y role-model binding.

**Success Criterion**
- Compile exitoso, E2E sin regresión, al menos 1 provider funcional end-to-end, role→model binding configurable, interface de function/tool calling definida, arquitectura extensible via VirtualBackend.

---

## 2. Project State (As-Is)

### Relevant Structure
```
src/extension/modules/
├── app/
│   ├── backend/index.ts        → AppServer extends AbstractBackend (22L, sidecar :3000)
│   └── background/index.ts     → App Background (Extension Host orchestrator)
├── core/
│   ├── backend/
│   │   ├── abstract-server.ts  → AbstractBackend — Physical Fastify server
│   │   └── virtual-server.ts   → AbstractVirtualBackend — Registers routes on host
│   └── background/index.ts     → Background — Core orchestrator (messaging, sidecar)
├── settings/
│   ├── background/index.ts     → SettingsBackground (model CRUD + verify, Extension Host)
│   ├── types.ts                → LLMModelConfig interface
│   └── constants.ts            → PROVIDERS, AUTH_TYPES, PROVIDER_URLS
└── chat/                       → Chat module (not relevant to this task)
```

### Backend Architecture (Two Types)
1. **Physical Server** (`AbstractBackend`): Only `AppServer` — Fastify process on port 3000
2. **Virtual Server** (`AbstractVirtualBackend`): Registers routes on the physical server via `register(server, prefix)`. No separate process.

### Existing Components
- **`AppServer`** (22L): Minimal sidecar. `listen(command, data)` devuelve mock. Accepts VirtualBackend registration.
- **`AbstractVirtualBackend`**: `register(server, prefix)` → creates scoped Fastify instance at `/<moduleName>`. Subclasses implement `listen(instance)` to define routes.
- **`LLMModelConfig`**: `{ id, name, provider, baseUrl, authType, apiKey, maxTokens, temperature, modelName }`.
- **`PROVIDERS`**: `{ GEMINI, CODEX, CLAUDE }`. **`PROVIDER_HEADERS`**: Auth headers per provider.

### Detected Limitations
- No VirtualBackend implementations exist yet (pattern defined but unused)
- AppServer has no VirtualBackend registration logic
- No LLM client abstraction exists
- OAuth tokens live in Extension Host — sidecar needs them passed per-request

---

## 3. Acceptance Criteria Coverage

### AC-1: Extensibilidad de Providers
- **Interpretation**: Factory → provider dispatch dinámico. Nuevos providers = nueva clase + registro en Settings.
- **Verification**: Verificar que LLMFactory resuelve providers registrados en Settings.
- **Risks**: Schemas muy diferentes entre providers. Mitigación: interface común con per-provider adaption.

### AC-2: Ubicación en Sidecar (VirtualBackend)
- **Interpretation**: LLM clients corren en el sidecar como **VirtualBackend** registrado en AppServer bajo `/llm`. No importa `vscode`. No tiene proceso propio.
- **Verification**: Verificar que el módulo extiende `AbstractVirtualBackend`, no importa vscode, y sus rutas están bajo `/llm/*`.
- **Risks**: OAuth tokens deben pasar del Extension Host al sidecar por request.

### AC-3: Streaming SSE
- **Interpretation**: Endpoint `POST /llm/chat/stream` devuelve `text/event-stream`. Cada provider parsea su propio SSE.
- **Verification**: Llamar a `/llm/chat/stream` y verificar chunks progresivos.
- **Risks**: Formatos SSE distintos per-provider.

### AC-4: Role → Model Binding
- **Interpretation**: Configuración que mapea roles (`architect`, `qa`...) a un `LLMModelConfig.id`.
- **Verification**: Asignar rol a modelo y verificar que factory devuelve el client correcto.
- **Risks**: Fallback si no hay modelo asignado a un rol.

### AC-5: Function Calling / Tool Use
- **Interpretation**: `LLMRequest` acepta tool definitions, `LLMResponse` incluye tool calls. Adapter per-provider.
- **Verification**: Request con tools → response con tool_calls structured.
- **Risks**: Schemas de tools difieren (OpenAI: `function`, Gemini: `functionDeclarations`, Claude: `input_schema`).

### AC-6: Compile + E2E sin regresión
- **Interpretation**: `npm run compile` OK, 28 unit tests OK, E2E Settings sin regresión.
- **Verification**: Build + tests post-implementación.
- **Risks**: Bajo — cambios aislados en nuevo módulo + registro en AppServer.

---

## 4. Technical Research

### Alternative A: VirtualBackend + Factory Pattern (RECOMMENDED)
- **Description**: Nuevo módulo `llm/` con `AbstractVirtualBackend`. Se registra en AppServer. Cada provider tiene su propia clase `LLMClient`. `LLMFactory` resuelve el client correcto.
- **Advantages**: Alineado con la arquitectura (VirtualBackend pattern), SRP, extensible, sin proceso extra.
- **Disadvantages**: Primer uso de VirtualBackend — marca el patrón para futuros módulos.

### Alternative B: Lógica LLM dentro de AppServer
- **Description**: Añadir endpoints y clients directamente a `app/backend/`.
- **Advantages**: Más simple, menos archivos.
- **Disadvantages**: Viola anti-patrón App-as-Module, acopla dominio LLM al App Shell.

**Recommended decision**: **Alternative A** — VirtualBackend + Factory. Alineado con constitución modular, primer uso correcto del patrón VirtualBackend.

---

## 5. Participating Agents

### 🏛️ architect-agent
- **Responsibilities**: Diseño, planificación, supervisión, validación
- **Sub-areas**: Estructura, interfaces, contracts

### 🤖 backend-agent (coding delegation)
- **Responsibilities**: Implementación del módulo LLM
- **Sub-areas**:
  - `llm/backend/index.ts` — VirtualBackend (routes `/llm/chat`, `/llm/chat/stream`)
  - `llm/backend/clients/` — Provider clients (gemini, openai, claude)
  - `llm/backend/types.ts` — Core interfaces
  - `llm/backend/factory.ts` — LLMFactory dispatch
  - `llm/constants.ts` — Module constants
  - `app/backend/index.ts` — Register VirtualBackend

### 🔧 background-agent (coding delegation)
- **Responsibilities**: LLM Background creation
- **Sub-areas**:
  - `llm/background/index.ts` — LLM Background (mandatory per constitution)

### 🛡️ qa-agent
- **Responsibilities**: Verificación en Phase 5

**Handoffs**: architect → backend-agent → architect review → qa-agent

**Required Components**:
- **Create**: `src/extension/modules/llm/` (new module: background + backend)
- **Modify**: `app/backend/index.ts` (register VirtualBackend)
- **No delete**

**Demo**: No — API backend sin UI.

---

## 6. Task Impact

### Architecture
- **First VirtualBackend implementation** — establishes the pattern for future modules
- New module `llm/` with background + backend
- AppServer gains VirtualBackend registration capability

### APIs / Contracts
- `POST /llm/chat` → single completion
- `POST /llm/chat/stream` → SSE streaming
- New interfaces: `LLMClient`, `LLMRequest`, `LLMResponse`, `ToolDefinition`, `ToolCall`

### Compatibility
- No breaking changes — new module, new endpoints
- E2E tests unaffected

### Testing / Verification
- Compile check, unit test regression, structure verification

---

## 7. Risks and Mitigations

| Risk | Impact | Mitigation |
|:--|:--|:--|
| First VirtualBackend usage — pattern untested | Medium | Careful implementation, test registration flow |
| API schema divergence between providers | High | Per-provider clients with common interface |
| OAuth token passing to sidecar | Medium | Background passes fresh token per request |
| AppServer needs registration hooks | Low | Minimal change: import + `register()` call |

---

## 8. Open Questions
- Ninguna.

---

## 9. TODO Backlog (Mandatory Consultation)

**Reference**: `.agent/todo/`
**Current state**: Directorio no existe.
**Items relevant to this task**: Ninguno.
**Impact on analysis**: Sin impacto.

---

## 10. Approval
This analysis **requires explicit developer approval**.

```yaml
approval:
  developer:
    decision: null
    date: null
    comments: null
```

> Without approval, this phase **CANNOT be considered completed** nor advance to Phase 3.
