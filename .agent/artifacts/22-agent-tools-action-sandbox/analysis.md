---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 22-agent-tools-action-sandbox
---

🏛️ **architect-agent**: Analysis for T032 — Agent Tools & Action Sandbox.

## 1. Executive Summary

**Problem**
Los agentes del Chat son chatbots de solo texto. No pueden leer/escribir archivos, ejecutar comandos, ni buscar información — no son productivos.

**Objective**
Implementar 6 tools ejecutables (`readFile`, `writeFile`, `runCommand`, `listDir`, `searchFiles`, `searchWeb`) con sistema de permisos sandbox/full y UI de aprobación en el chat.

**Success Criterion**
Un agente puede completar tareas del mundo real: leer código, crear archivos, ejecutar builds, buscar contenido — todo controlado por permisos y visible en el chat.

---

## 2. Project State (As-Is)

- **Relevant structure**:
  - `src/extension/modules/llm/backend/` — Sidecar con `LLMFactory`, `Runner`, streaming
  - `src/extension/modules/chat/background/` — Orchestrador Chat ↔ Sidecar
  - `src/extension/modules/chat/view/` — UI del Chat (Lit)
  - `src/extension/modules/settings/` — Toggle sandbox/full por agente

- **Existing components**:
  - `LLMFactory.createAgent()` acepta `tools: ToolDefinition[] = []` — **actualmente siempre vacío**
  - Chat UI tiene toggle sandbox/full (`agentPermissions[role]`)
  - Mensajes en markdown ya renderizan con `marked`

- **Core / base layers**:
  - `@openai/agents` SDK: `tool()`, `shellTool()`, `applyPatchTool()` con `needsApproval`
  - SDK tiene mecanismo de `interruption` para flujos de aprobación

- **Detected limitations**:
  - El sidecar es un proceso Node.js separado — las tools se ejecutan ahí, no en el extension host
  - No hay canal bidireccional sidecar ↔ extensión para pedir aprobación en tiempo real
  - `searchWeb` requiere API externa (no incluida)

---

## 3. Acceptance Criteria Coverage

### AC-1: 6 tools funcionales
- **Interpretation**: Cada tool se registra como `FunctionTool` del SDK con schema Zod, y el LLM las invoca autónomamente
- **Verification**: Test manual — pedir al agente que lea un archivo, escriba uno, ejecute un comando
- **Risks**: `searchWeb` depende de API externa; podría posponerse al MVP+1

### AC-2: Integradas con OpenAI Agents SDK
- **Interpretation**: Se pasan al `Agent()` constructor via `tools[]`. El SDK maneja el function calling loop
- **Verification**: `npm run compile` + verificar que el stream devuelve tool_call events
- **Risks**: Ninguno — el SDK ya soporta esto nativamente

### AC-3: Sistema de permisos sandbox/full
- **Interpretation**: `needsApproval` retorna `true` en sandbox, `false` en full para reads; siempre `true` para writes/commands en sandbox
- **Verification**: Alternar el toggle y verificar comportamiento
- **Risks**: El sidecar necesita recibir el modo de permisos del Chat background

### AC-4: UI Allow/Deny en el chat
- **Interpretation**: Cuando una tool requiere aprobación, el chat muestra un mensaje especial con botones Allow/Deny
- **Verification**: Verificar visualmente que aparecen los botones y que funcionan
- **Risks**: Requiere un nuevo tipo de mensaje en el chat (no solo texto)

### AC-5: Agente puede completar tareas reales
- **Interpretation**: End-to-end: usuario pide → agente usa tools → resultado visible
- **Verification**: Demo: "Lee el package.json y dime la versión"
- **Risks**: Depende de AC-1 a AC-4

### AC-6: `npm run compile` pasa
- **Verification**: Ejecutar `npm run compile` al final
- **Risks**: Ninguno

---

## 4. Technical Analysis

### Alternativa A: Tools en el Sidecar (FunctionTool puro)
- **Descripción**: Definir las tools como `FunctionTool` en el sidecar. Cada tool ejecuta directamente (`fs.readFile`, `child_process.exec`)
- **Ventajas**: Simple, el SDK maneja todo el function calling loop. Las tools se ejecutan donde el Node.js tiene acceso al filesystem
- **Desventajas**: El sidecar no tiene acceso directo al estado de permisos del Chat UI. Necesita recibir `permissionMode` en cada request

### Alternativa B: Tools con puente Extension Host
- **Descripción**: Las tools en el sidecar hacen HTTP callbacks al extension host para ejecutar acciones via VS Code API
- **Ventajas**: Acceso a VS Code API (terminal, workspace, etc.)
- **Desventajas**: Complejidad enorme — doble HTTP, latencia, otro servidor

### **Decisión: Alternativa A**
El sidecar ya tiene acceso `fs` y `child_process`. El Chat background envía `permissionMode` junto con cada request. Para la V1, las tools ejecutan directamente en el sidecar. No necesitamos VS Code API para file I/O básico.

### Modelo de aprobación
- **Flujo síncrono simple**: El sidecar NO pausa para pedir aprobación (evita complejidad de interruptions)
- En su lugar: `needsApproval` se configura según `permissionMode`:
  - **Sandbox**: Tools destructivas (write, command) marcan `needsApproval: true` → el SDK genera `interruption` → el sidecar devuelve un evento especial al Chat → el Chat muestra Allow/Deny → el usuario responde → el Chat reenvía al sidecar para continuar
  - **Full access**: `needsApproval: false` → ejecución directa

### searchWeb (V2)
- Requiere API key para SerpAPI, Tavily o similar
- Se pospone a un siguiente sprint. Las 5 tools filesystem son el MVP

---

## 5. Participating Agents

| Agent | Responsabilidades |
|:--|:--|
| **🏛️ architect-agent** | Diseño, plan, supervisión, gates |
| **backend-agent** | Implementar tools en el sidecar (`llm/backend/tools/`) |
| **background-agent** | Conectar Chat background con permisos y nueva tool call UI flow |
| **view-agent** | Renderizar mensajes de tool call y botones Allow/Deny en el Chat |

**Handoffs**:
1. backend-agent → implementa tools y las exporta
2. background-agent → conecta permisos, maneja interruptions
3. view-agent → renderiza feedback visual de tool calls

**Required Components**:
- [NEW] `src/extension/modules/llm/backend/tools/` — Directorio con tool definitions
- [MODIFY] `src/extension/modules/llm/backend/factory.ts` — Pasar tools al Agent
- [MODIFY] `src/extension/modules/llm/backend/index.ts` — Manejar interruptions en stream
- [MODIFY] `src/extension/modules/chat/background/index.ts` — Enviar permissionMode, manejar approval flow
- [MODIFY] `src/extension/modules/chat/view/templates/html.ts` — Renderizar tool calls + Allow/Deny

---

## 6. Task Impact

- **Architecture**: Nuevo directorio `tools/` en LLM backend. No rompe nada existente
- **APIs / contracts**: Nuevo campo `permissionMode` en el payload del sidecar. Nueva tipología de mensaje en el chat (tool_call)
- **Compatibility**: No hay breaking changes — tools son opt-in
- **Testing**: Test manual end-to-end en primera fase. Unit tests en Phase 5

---

## 7. Risks and Mitigations

| Risk | Impact | Mitigation |
|:--|:--|:--|
| `writeFile` fuera de workspace en full mode | Alto | Validar paths contra workspace root incluso en full mode |
| `runCommand` sin timeout cuelga el sidecar | Alto | Timeout de 30s por defecto, configurable |
| Interruption flow async es complejo | Medio | V1 síncrona: sandbox bloquea tools destructivas completamente. V2: interruptions |
| `searchWeb` sin API configurada | Bajo | Posponer a V2. MVP son 5 tools filesystem |

---

## 8. Open Questions
Ninguna — todas resueltas en Phase 0.

---

## 9. TODO Backlog

**Reference**: `.agent/todo/`
**Current state**: No hay directorio `.agent/todo/`
**Items relevant**: None
**Impact**: None

---

## 10. Approval
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-20T11:55:59+01:00"
    comments: null
```

> Without approval, this phase **CANNOT be considered completed** nor advance to Phase 3.
