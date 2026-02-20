🏛️ **architect-agent**: Plan de Implementación — T039 Delegación de Agentes

---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 23-agent-delegation
---

# Plan de Implementación — 23-agent-delegation

## 1. Resumen del Plan
- **Contexto**: Implementar delegación inter-agente para que el architect-agent pueda asignar sub-tareas a agentes especializados.
- **Resultado esperado**: Tool `delegateTask` funcional con confirmación del desarrollador, streaming en vivo, y validación de capabilities.
- **Alcance incluido**: Tool de delegación, UI de confirmación, lógica de streaming del sub-agente, fallback a agente temporal.
- **Excluido**: Delegación recursiva, modificación de la factory, nuevos endpoints HTTP.

---

## 2. Inputs Contractuales
- **Task**: `.agent/artifacts/23-agent-delegation/task.md`
- **Análisis**: `.agent/artifacts/23-agent-delegation/analysis.md`
- **Criterios de Aceptación**: AC-1 a AC-8 definidos en `acceptance.md`

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

## 3. Desglose de Implementación

### Paso 1: Crear el tool `delegateTask`
- **Descripción**: Nuevo archivo `delegate.ts` en `llm/backend/tools/` con el tool de delegación
- **Dependencias**: `LLMFactory`, `Runner`, `agentTools` existentes
- **Entregables**:
  - `src/extension/modules/llm/backend/tools/delegate.ts` — Tool con params: `{ agent: string, task: string, customInstructions?: string }`
  - El tool internamente: valida capabilities → crea sub-agente via `LLMFactory` → ejecuta con `Runner.run()` → devuelve resultado
  - Excluye `delegateTask` del array de tools del sub-agente (AC-8)
  - Trunca output a 8000 chars (AC-5)
- **Agente responsable**: Desarrollador (dominio `llm/backend`)

### Paso 2: Integrar confirmación en Chat Background
- **Descripción**: Modificar `handleSendMessage` para detectar `tool_call` de tipo `delegateTask` y pausar la ejecución hasta recibir confirmación del desarrollador
- **Dependencias**: Paso 1 completado
- **Entregables**:
  - Nuevos mensajes en `chat/constants.ts`: `DELEGATION_REQUEST`, `DELEGATION_CONFIRM`, `DELEGATION_DENY`
  - Lógica en `ChatBackground` para interceptar `delegateTask` tool_call del stream SSE
  - Emitir `DELEGATION_REQUEST` al Chat View con datos del agente y la tarea
  - Esperar `DELEGATION_CONFIRM` o `DELEGATION_DENY` del View
  - Si confirma → continuar stream; si deniega → emitir cancelación al sidecar
- **Agente responsable**: Desarrollador (dominio `chat/background`)

### Paso 3: UI de delegación en Chat View
- **Descripción**: Renderizar bloque visual de delegación con botones Confirmar/Denegar y streaming del sub-agente
- **Dependencias**: Paso 2 completado
- **Entregables**:
  - Nuevo bloque en `html.ts`: tarjeta de delegación con icono del agente, nombre, descripción de la tarea
  - Botones "✅ Confirmar" / "❌ Denegar"
  - Bloque de streaming del sub-agente diferenciado visualmente (borde lateral de color, prefijo de agente)
  - Informe final del sub-agente renderizado como bloque colapsable
  - Estilos en `css.ts`: `.delegation-card`, `.delegation-stream`, `.delegation-report`
- **Agente responsable**: Desarrollador (dominio `chat/view`)

### Paso 4: Integración y pruebas
- **Descripción**: Conectar los 3 pasos, registrar el tool en `agentTools` (solo para architect), y probar el flujo completo
- **Dependencias**: Pasos 1-3 completados
- **Entregables**:
  - Modificar `tools/index.ts` para exportar `delegateTask` condicionalmente (solo si `role === 'architect'`)
  - Test E2E del flujo: architect → delegateTask → confirmación → sub-agente → resultado
  - Verificación de AC-6 (capability faltante) y AC-7 (agente temporal)
- **Agente responsable**: Desarrollador

---

## 4. Asignación de Responsabilidades

| Agente | Responsabilidad | Sub-área |
|---|---|---|
| **architect-agent** | Diseño, supervisión, validación de gates | Plan y artefactos |
| **Desarrollador** | Implementación de los 4 pasos | `llm/backend/tools/`, `chat/background/`, `chat/view/` |

**Handoffs**
- Paso 1 → Paso 2: Tool creado, listo para integración en el flujo SSE
- Paso 2 → Paso 3: Mensajes de delegación definidos, View debe renderizarlos
- Paso 3 → Paso 4: UI lista, integración final y testing

**Componentes**
- **CREAR**: `src/extension/modules/llm/backend/tools/delegate.ts`
- **MODIFICAR**: `src/extension/modules/llm/backend/tools/index.ts`
- **MODIFICAR**: `src/extension/modules/chat/background/index.ts`
- **MODIFICAR**: `src/extension/modules/chat/view/templates/html.ts`
- **MODIFICAR**: `src/extension/modules/chat/view/templates/css.ts`
- **MODIFICAR**: `src/extension/modules/chat/constants.ts`

---

## 5. Estrategia de Testing y Validación

- **Tests unitarios**
  - Tool `delegateTask`: mock de `LLMFactory` y `Runner`, verificar que excluye el tool de sub-agentes
  - Validación de capabilities: verificar que detecta capabilities faltantes
- **Tests de integración**
  - Flujo completo: Chat Background → sidecar → delegación → resultado
- **Tests E2E / Manual**
  - Seleccionar architect → enviar mensaje que requiera delegación → confirmar → ver streaming → ver resultado

**Trazabilidad**

| Test | AC |
|---|---|
| Tool crea sub-agente y devuelve resultado | AC-1, AC-5 |
| Confirmación del desarrollador | AC-2 |
| Sub-agente usa persona y model real | AC-3 |
| Streaming visible en chat | AC-4 |
| Capability faltante notificada | AC-6 |
| Agente temporal via customInstructions | AC-7 |
| Sin tool delegateTask en sub-agente | AC-8 |

---

## 6. Plan de Demo
- No requerido según el análisis.

---

## 7. Estimaciones

| Paso | Esfuerzo | Estimación |
|---|---|---|
| 1. Tool `delegateTask` | Medio | ~45 min |
| 2. Confirmación en Background | Alto | ~60 min |
| 3. UI de delegación | Medio | ~45 min |
| 4. Integración y tests | Medio | ~30 min |
| **Total** | — | **~3 horas** |

---

## 8. Puntos Críticos y Resolución

| Punto Crítico | Riesgo | Resolución |
|---|---|---|
| **Streaming del sub-agente** | `agent.asTool()` no soporta streaming | Usar custom tool con `Runner.run()` no-streaming + emitir resultado al finalizar |
| **Confirmación asíncrona** | La ejecución del tool es síncrona desde el SDK | Implementar confirmación a nivel de Chat Background, ANTES de que el tool se ejecute en el sidecar |
| **Tool condicional** | `delegateTask` solo debe estar disponible para architect | Pasar tools filtrados según el rol en `handleSendMessage` |

---

## 9. Dependencias y Compatibilidad
- **Internas**: `@openai/agents` v0.4.12 (ya instalado), `LLMFactory`, `Runner`, `agentTools`
- **Externas**: Ninguna nueva
- **Compatibilidad cross-browser**: N/A (VS Code webview)

---

## 10. Criterios de Completitud

- [ ] Tool `delegateTask` creado y funcional (AC-1)
- [ ] Botones Confirmar/Denegar en el chat (AC-2)
- [ ] Sub-agente ejecuta con persona real (AC-3)
- [ ] Output visible en streaming (AC-4)
- [ ] Resultado devuelto al architect (AC-5)
- [ ] Notificación de capability faltante (AC-6)
- [ ] Fallback a agente temporal (AC-7)
- [ ] Sin delegación recursiva (AC-8)
- [ ] `npm run compile` pasa sin errores
- [ ] Test manual exitoso del flujo completo

---

## 11. Aprobación del Desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-20T16:46:54+01:00
    comments: null
```
