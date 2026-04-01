🏛️ **architect-agent**: Acceptance criteria for T032 — Agent Tools & Action Sandbox.

## 1. Consolidated Definition

Implementar un sistema de **tools ejecutables** para los agentes del Chat, permitiéndoles
interactuar con el sistema de archivos, terminal y web. Las tools se integran con el
OpenAI Agents SDK y están controladas por un sistema de permisos dual (sandbox/full).
La UI de confirmación usa componentes interactivos (botones Allow/Deny) en la propia
conversación del chat.

## 2. Answers to Clarification Questions

| # | Question | Answer |
|---|----------|--------|
| 1 | ¿Las 4 tools base son suficientes o necesitas más? | 6 tools: `readFile`, `writeFile`, `runCommand`, `listDir` + `searchWeb` (buscar en internet) + `searchFiles` (buscar contenido en archivos, tipo grep) |
| 2 | ¿Cómo funciona la aprobación en sandbox? | UI de confirmación con botones Allow/Deny en el propio chat, estilo A2UI (componentes interactivos renderizados en el mensaje) |
| 3 | ¿Scope de acceso a archivos? | Sandbox: solo workspace actual. Full access: acceso extendido pero con aprobación por UI (Allow/Deny) para cada acción |
| 4 | ¿Límites de runCommand? | Investigar en Phase 1 cómo otros chats gestionan ejecución de comandos (timeout, restricciones, stdout/stderr) |
| 5 | ¿Feedback visual de tool calls? | Investigar en Phase 1 cómo otros chats muestran tool calls al usuario y proponer opciones en el análisis |

---

## 3. Verifiable Acceptance Criteria

1. **Scope**:
   - 6 tools funcionales: `readFile`, `writeFile`, `runCommand`, `listDir`, `searchWeb`, `searchFiles`
   - Integradas con OpenAI Agents SDK via `tools[]` en el `Agent` constructor
   - Sistema de permisos sandbox/full conectado al toggle existente del Chat UI

2. **Inputs / Data**:
   - Argumentos de cada tool definidos por el LLM (paths, contenido, queries)
   - Workspace root como base para rutas relativas
   - API key/endpoint para `searchWeb`

3. **Outputs / Expected Result**:
   - Tools ejecutan acciones reales en el filesystem/terminal/web
   - Resultados devueltos al LLM como contexto para continuar la conversación
   - UI interactiva de Allow/Deny renderizada en el chat para solicitar permisos

4. **Constraints**:
   - Sandbox: solo workspace, sin acceso externo
   - Full: acceso extendido con aprobación individual por UI
   - Investigar patrones de UX de otros chats (Cursor, Cline, etc.) en Phase 1

5. **Acceptance Criterion (Done)**:
   - Un agente puede leer un archivo del proyecto y responder sobre su contenido
   - Un agente puede crear un archivo nuevo con contenido generado
   - Un agente puede ejecutar un comando y actuar sobre el resultado
   - Un agente puede buscar en archivos del proyecto
   - Las acciones en sandbox muestran UI Allow/Deny antes de ejecutar
   - `npm run compile` pasa sin errores

---

## Approval (Gate 0)

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-20T11:45:41+01:00"
    comments: null
```

---

## Validation History (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-02-20T11:21:22+01:00"
    notes: "Acceptance criteria defined — 5 questions answered"
```
