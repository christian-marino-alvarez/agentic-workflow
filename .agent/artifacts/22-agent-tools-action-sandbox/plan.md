---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 22-agent-tools-action-sandbox
---

🏛️ **architect-agent**: Implementation plan for T032 — Agent Tools & Action Sandbox.

## 1. Plan Summary
- **Context**: Los agentes solo hacen text-in/text-out. Necesitan tools para ser productivos.
- **Expected result**: 5 tools funcionales (readFile, writeFile, runCommand, listDir, searchFiles) integradas con el SDK, permisos sandbox/full, y feedback visual en el chat.
- **Scope**:
  - ✅ Incluido: 5 tools filesystem/terminal, permisos, UI feedback
  - ❌ Excluido: searchWeb (V2), interruption flow completo (V2)

---

## 2. Contractual Inputs
- **Task**: `.agent/artifacts/22-agent-tools-action-sandbox/task.md`
- **Analysis**: `.agent/artifacts/22-agent-tools-action-sandbox/analysis.md`
- **Acceptance Criteria**: AC-1 (tools), AC-2 (SDK), AC-3 (permisos), AC-4 (UI), AC-5 (e2e), AC-6 (compile)

```yaml
plan:
  workflows:
    - domain: llm-backend
      action: create
      workflow: coding-backend
    - domain: chat-background
      action: refactor
      workflow: coding-background
    - domain: chat-view
      action: refactor
      workflow: coding-view

  dispatch: []
```

---

## 3. Implementation Breakdown

### Step 1 — Tool Definitions (backend-agent)
- **Description**: Crear 5 `FunctionTool` definitions en `llm/backend/tools/`
- **Dependencies**: Ninguna
- **Deliverables**:
  - `llm/backend/tools/readFile.ts` — Lee archivo, devuelve contenido
  - `llm/backend/tools/writeFile.ts` — Escribe/crea archivo
  - `llm/backend/tools/runCommand.ts` — Ejecuta comando shell (timeout 30s)
  - `llm/backend/tools/listDir.ts` — Lista directorio
  - `llm/backend/tools/searchFiles.ts` — Busca contenido en archivos (grep)
  - `llm/backend/tools/index.ts` — Exporta todas las tools como array
- **Responsible agent**: backend-agent

### Step 2 — Factory Integration (backend-agent)
- **Description**: Modificar `LLMFactory.createAgent()` para importar y pasar las tools
- **Dependencies**: Step 1
- **Deliverables**:
  - `llm/backend/factory.ts` — Import tools, pasar a `Agent({ tools })`
- **Responsible agent**: backend-agent

### Step 3 — Permission Mode Passthrough (background-agent)
- **Description**: El Chat background envía `permissionMode` (sandbox/full) al sidecar en cada request. El sidecar configura `needsApproval` según el modo.
- **Dependencies**: Step 1
- **Deliverables**:
  - `chat/background/index.ts` — Añadir `permissionMode` al payload
  - `llm/backend/index.ts` — Leer `permissionMode`, pasarlo a tools
- **Responsible agent**: background-agent

### Step 4 — Tool Call Visual Feedback (view-agent)
- **Description**: Renderizar tool calls en el chat como bloques colapsables (nombre de tool + argumentos + resultado).
- **Dependencies**: Step 3 (el stream ya incluye tool events)
- **Deliverables**:
  - `chat/view/templates/html.ts` — Nuevo `renderToolCall()` component
  - `chat/view/templates/css.ts` — Estilos para tool-call blocks
- **Responsible agent**: view-agent

### Step 5 — Integration & Compile (architect-agent)
- **Description**: Verificar integración end-to-end. `npm run compile`.
- **Dependencies**: Steps 1-4
- **Deliverables**: Build limpio, demo funcional
- **Responsible agent**: architect-agent

---

## 4. Responsibility Assignment

| Agent | Scope | Deliverables |
|:--|:--|:--|
| **backend-agent** | Steps 1-2 | 6 archivos de tools + factory update |
| **background-agent** | Step 3 | Permission passthrough |
| **view-agent** | Step 4 | Tool call rendering |
| **architect-agent** | Step 5 | Integration, compile, gates |

**Handoffs**:
1. backend-agent entrega tools → background-agent integra permisos
2. background-agent entrega stream events → view-agent renderiza

**Components**: No se crean nuevos módulos. Se añade un directorio `tools/` dentro del módulo `llm` existente.

---

## 5. Testing and Validation Strategy

- **Unit tests**: N/A para V1 (tools son thin wrappers de `fs`/`exec`)
- **Integration**: `npm run compile` debe pasar
- **E2E / Manual**:
  - Pedir al agente "Lee el package.json y dime la versión"
  - Pedir al agente "Crea un archivo test.txt con 'hello world'"
  - Pedir al agente "Ejecuta `ls -la`"
  - Verificar que en sandbox, writes/commands están bloqueados o piden permiso

**Traceability**: AC-1→Step1, AC-2→Step2, AC-3→Step3, AC-4→Step4, AC-5→manual, AC-6→Step5

---

## 6. Demo Plan
- **Objective**: Demostrar que un agente puede interactuar con el filesystem
- **Scenario**: Conversación con el architect-agent donde se le pide leer, escribir, y ejecutar
- **Success criteria**: El agente usa tools automáticamente sin que el usuario las invoque explícitamente

---

## 7. Estimations

| Step | Effort | Lines ~est |
|:--|:--|:--|
| Step 1 — Tool definitions | Medium | ~200 lines |
| Step 2 — Factory integration | Low | ~20 lines |
| Step 3 — Permission passthrough | Low | ~30 lines |
| Step 4 — Tool call rendering | Medium | ~100 lines |
| Step 5 — Integration | Low | ~0 (verify) |
| **Total** | **Medium** | **~350 lines** |

---

## 8. Critical Points

| Point | Risk | Resolution |
|:--|:--|:--|
| `runCommand` cuelga | Alto | Timeout 30s + `child_process.execSync` con timeout |
| `writeFile` fuera de workspace | Alto | Path validation en cada tool: `path.resolve()` must start with workspace root |
| Stream tool events no lleguen al view | Medio | Verificar que el sidecar emite eventos SSE para tool calls |

---

## 9. Dependencies and Compatibility
- **Internal**: `@openai/agents` SDK (installed), `fs`, `child_process` (Node.js core)
- **External**: None for V1
- **Constraints**: Sidecar runs as separate Node.js process — tools execute with same permissions as VS Code

---

## 10. Completion Criteria
- [ ] 5 tools creadas y exportadas
- [ ] Factory pasa tools al Agent
- [ ] `permissionMode` llega al sidecar
- [ ] Tool calls visibles en el chat
- [ ] `npm run compile` pasa
- [ ] Demo: agente lee un archivo exitosamente

---

## 11. Developer Approval (MANDATORY)

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-20T12:06:16+01:00"
    comments: null
```
