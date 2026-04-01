🏛️ **architect-agent**: Análisis Técnico — T039 Delegación de Agentes

---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 23-agent-delegation
---

# Análisis — 23-agent-delegation

## 1. Resumen Ejecutivo

**Problema**
- Los agentes del sistema operan de forma aislada. El architect-agent no puede delegar sub-tareas a agentes especializados dentro de una sesión de chat.

**Objetivo**
- Implementar un tool `delegateTask` que permita al architect-agent invocar sub-agentes con sus personas, capabilities y tools, devolviendo el resultado al coordinador.

**Criterio de Éxito**
- Los 8 AC definidos en `acceptance.md` deben cumplirse: tool funcional, confirmación del desarrollador, capabilities reales, streaming, notificación de limitaciones, fallback a agente temporal.

---

## 2. Estado del Proyecto (As-Is)

- **Estructura relevante**
  - `src/extension/modules/llm/backend/` — Factory, tools, sidecar server
  - `src/extension/modules/chat/background/` — Bridge entre UI y sidecar
  - `src/extension/modules/chat/view/` — Chat UI con Lit
  - `src/extension/modules/settings/background/` — Roles y capabilities

- **Componentes existentes**
  - `LLMFactory.createAgent()` — Instancia agentes con persona, modelo y tools
  - `LLMVirtualBackend.stream()` — Streaming SSE con eventos `content`, `tool_call`, `tool_result`
  - `agentTools` — 5 tools (readFile, writeFile, runCommand, listDir, searchFiles)
  - `ChatBackground.handleSendMessage()` — Consume SSE y reenvía al Chat View
  - Cada agente ya recibe su `.md` completo como `instructions` (implementado hoy)

- **Limitaciones detectadas**
  - No existe mecanismo de delegación inter-agente
  - Los tools son estáticos (mismos 5 para todos los agentes)
  - No hay UI para confirmar/denegar acciones del agente
  - No hay concepto de "agente temporal"

---

## 3. Cobertura de Criterios de Aceptación

### AC-1: Architect tiene tool `delegateTask` funcional
- **Interpretación**: Un tool registrado en el sidecar, disponible solo para el architect
- **Verificación**: El architect puede invocar `delegateTask({ agent: "qa", task: "..." })` y recibir resultado
- **Riesgos**: El tool debe estar disponible solo para el architect, no para sub-agentes

### AC-2: Delegación requiere aprobación (botón Confirmar/Denegar)
- **Interpretación**: Antes de ejecutar la delegación, el Chat muestra un prompt con dos botones
- **Verificación**: El desarrollador ve la propuesta y puede aprobar o rechazar
- **Riesgos**: Requiere nuevo tipo de mensaje en Chat View con interacción bidireccional

### AC-3: Agente delegado ejecuta con persona y capabilities reales
- **Interpretación**: El sub-agente recibe su `.md`, su modelo vinculado, y solo las capabilities que tiene
- **Verificación**: El sub-agente responde según su personalidad y usa el modelo configurado en Settings
- **Riesgos**: Si el agente no tiene modelo vinculado, la delegación falla

### AC-4: Output en streaming visible en el chat
- **Interpretación**: El desarrollador ve el output del sub-agente en tiempo real como un bloque diferenciado
- **Verificación**: El chat muestra "🔀 Delegando a QA..." seguido del streaming del sub-agente
- **Riesgos**: `agent.asTool()` del SDK no soporta streaming intermedio. Solución: custom tool con streaming manual

### AC-5: Resultado vuelve al architect como `tool_result`
- **Interpretación**: El resultado final del sub-agente se devuelve al coordinator como respuesta del tool
- **Verificación**: El architect recibe el output y puede sintetizar/continuar
- **Riesgos**: Si el output es muy largo, puede exceder límites de contexto

### AC-6: Capability faltante → notificación al architect
- **Interpretación**: Si el sub-agente no puede ejecutar una acción (ej: no tiene `vision`), genera un error descriptivo
- **Verificación**: El tool result incluye una notificación clara de la limitación
- **Riesgos**: Requiere validación de capabilities antes de instanciar el sub-agente

### AC-7: Fallback a agente temporal
- **Interpretación**: Si no hay agente adecuado, el architect crea uno virtual con instrucciones ad-hoc
- **Verificación**: El `delegateTask` acepta un parámetro `customInstructions` como alternativa a un nombre de agente
- **Riesgos**: El agente temporal no tiene archivo `.md` ni modelo vinculado — necesita un modelo default

### AC-8: Sin delegación recursiva (max depth = 1)
- **Interpretación**: El sub-agente NO recibe el tool `delegateTask` en su lista de tools
- **Verificación**: La factory excluye `delegateTask` del array de tools del sub-agente
- **Riesgos**: Bajo — es una exclusión simple del array de tools

---

## 4. Investigación Técnica

### Alternativa A: `agent.asTool()` nativo del SDK
- **Descripción**: Usar la API nativa `agent.asTool()` de `@openai/agents`
- **Ventajas**: Mínimo código, integrado con el SDK, manejo de estado automático
- **Desventajas**: Sin streaming intermedio, sin control sobre la confirmación del desarrollador, sin validación de capabilities previa

### Alternativa B: Custom `delegateTask` Tool (RECOMENDADA)
- **Descripción**: Tool personalizado que usa `LLMFactory.createAgent()` + `Runner.run()` + streaming manual
- **Ventajas**: Control total sobre confirmación, streaming, capabilities, fallback. Se integra con el flujo SSE existente
- **Desventajas**: Más código, pero aprovecha toda la infraestructura existente

### Alternativa C: Endpoint HTTP separado para delegación
- **Descripción**: Nuevo endpoint `/delegate` en el sidecar que maneja la sub-invocación
- **Ventajas**: Separación clara de responsabilidades
- **Desventajas**: Duplicación de lógica de streaming y agent creation. Overkill.

**Decisión recomendada**: **Alternativa B** — Custom `delegateTask` Tool. Razones:
1. Control total sobre el flujo de confirmación del desarrollador
2. Streaming real del sub-agente aprovechando `pumpStreamEvents` existente
3. Validación de capabilities antes de instanciar
4. Soporte nativo para agente temporal via `customInstructions`
5. Prevención de recursión trivial (no incluir el tool en sub-agentes)

---

## 5. Agentes Participantes

- **🏛️ architect-agent**
  - Responsabilidades: Diseño del tool, integración con el sidecar, validación de capabilities
  - Sub-áreas: `llm/backend/tools/`, `llm/backend/factory.ts`

- **🎨 view-agent** (o desarrollador si no existe)
  - Responsabilidades: UI del botón Confirmar/Denegar, bloque visual de delegación en el chat
  - Sub-áreas: `chat/view/templates/html.ts`, `chat/view/templates/css.ts`

- **⚙️ background-agent** (o desarrollador)
  - Responsabilidades: Manejo del flujo de confirmación, routing de delegación
  - Sub-áreas: `chat/background/index.ts`

**Handoffs**
- Architect define el tool → Background maneja confirmación → Sidecar ejecuta delegación → View muestra resultado

**Componentes requeridos**
- **CREAR**: `delegateTask` tool en `llm/backend/tools/delegate.ts`
- **MODIFICAR**: `ChatBackground.handleSendMessage()` para soportar confirmación
- **MODIFICAR**: `ChatView` templates para renderizar bloque de delegación y botones
- **MODIFICAR**: `chat/constants.ts` para nuevos tipos de mensaje
- **NO DEMO**: No se requiere demo específica

---

## 6. Impacto de la Tarea

- **Arquitectura**: Añade un tool nuevo al sidecar. No modifica la estructura modular existente. La factory se mantiene igual.
- **APIs / contratos**: Nuevo tipo de mensaje SSE (`delegation_request`, `delegation_start`, `delegation_result`). Nuevos comandos de chat (`DELEGATION_CONFIRM`, `DELEGATION_DENY`).
- **Compatibilidad**: Sin breaking changes. El tool `delegateTask` es aditivo.
- **Testing / verificación**: Tests unitarios para el tool. Test E2E del flujo de delegación con confirmación.

---

## 7. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| **Coste de tokens del sub-agente** | Cada delegación es una llamada LLM separada | Documentar en el UI la estimación de tokens antes de confirmar |
| **Timeout en tareas largas** | El sub-agente podría tardar mucho | Configurar timeout del tool a 120s, notificar progreso por streaming |
| **Modelo no vinculado** | Agente sin modelo no puede ejecutar | Validar antes de mostrar confirmación, usar modelo fallback del architect |
| **Output excesivamente largo** | Puede exceder contexto del coordinator | Truncar a 8000 chars con resumen |

---

## 8. Preguntas Abiertas
- Ninguna. Todos los ACs están cubiertos.

---

## 9. Backlog TODO

**Referencia**: `.agent/todo/` — No existe actualmente.

**Items relevantes**: Ninguno.

**Impacto en análisis**: Ninguno.

---

## 10. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-20T16:44:22+01:00
    comments: null
```

> Sin aprobación, esta fase **NO puede considerarse completada** ni avanzar a Fase 3.
