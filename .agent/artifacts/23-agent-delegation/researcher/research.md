🔬 **researcher-agent**: Informe de Investigación — T039 Delegación de Agentes

---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 23-agent-delegation
---

# Informe de Investigación — 23-agent-delegation

## 1. Resumen Ejecutivo
- **Problema investigado**: Cómo habilitar al architect-agent para delegar sub-tareas a agentes especializados dentro de una sesión de chat, con confirmación del desarrollador, visibilidad en streaming y enrutamiento consciente de capacidades.
- **Objetivo de la investigación**: Documentar enfoques técnicos, capacidades del SDK y puntos de integración del codebase actual para delegación inter-agente.
- **Hallazgos clave**:
  - El SDK `@openai/agents` soporta nativamente dos patrones de delegación: `handoffs` y `agent.asTool()`
  - La arquitectura actual del sidecar (`LLMFactory` + `Runner` + SSE) ya soporta todos los bloques necesarios
  - El Chat Background ya maneja eventos SSE `tool_call` / `tool_result`
  - El patrón `agent.asTool()` encaja con los criterios de aceptación (sub-agente devuelve resultado al coordinador)

---

## 2. Necesidades Detectadas
- **N1**: Mecanismo para que el architect-agent invoque a un agente especializado durante la conversación
- **N2**: UI de confirmación del desarrollador (aprobar/denegar) antes de que la delegación se ejecute
- **N3**: Streaming en tiempo real del output del agente delegado en el chat
- **N4**: Validación de capacidades (el agente delegado debe tener los skills/tools requeridos)
- **N5**: Mecanismo de fallback cuando no existe agente adecuado (agente virtual/temporal)
- **N6**: Prevención de recursión (profundidad máxima = 1)

---

## 3. Hallazgos Técnicos

### 3.1 SDK `@openai/agents` — Patrón Handoff Nativo
- **Descripción**: El SDK proporciona una función `handoff()` que permite a un agente transferir el control total de la conversación a otro agente.
- **Estado actual**: Estable (incluido en `@openai/agents` v0.4.12, versión instalada).
- **Cómo funciona**: Los agentes se configuran con un array `handoffs`. Cuando el LLM decide delegar, llama a un tool llamado `transfer_to_<nombre_agente>`. El `Runner` cambia al agente destino con el historial completo.
- **Documentación oficial**: https://openai.github.io/openai-agents-js/guides/handoffs/
- **Limitaciones conocidas**:
  - Transferencia total de control — el agente original pierde el control
  - Diseñado para traspaso secuencial, no para delegación de sub-tareas con retorno de resultado
  - No ideal para patrón "coordinador + especialista" donde el coordinador necesita el resultado

### 3.2 SDK `@openai/agents` — Patrón Agent-as-Tool (`agent.asTool()`)
- **Descripción**: El SDK permite envolver un agente completo como un tool callable. El coordinador llama a este tool con una consulta, el sub-agente ejecuta independientemente, y el resultado se devuelve como `tool_result` al coordinador.
- **Estado actual**: Estable, documentado en el SDK.
- **Cómo funciona**: `agent.asTool({ toolName, toolDescription })` crea una definición de tool. Cuando el LLM del coordinador llama a este tool, el Runner internamente crea un nuevo `Runner.run()` para el sub-agente, recoge su output final, y lo devuelve como respuesta del tool.
- **Documentación oficial**: https://openai.github.io/openai-agents-js/guides/tools/
- **Limitaciones conocidas**:
  - El sub-agente ejecuta completamente antes de devolver — sin streaming intermedio al coordinador
  - El sub-agente crea su propia sesión LLM (llamada API separada, consumo de tokens separado)
  - La transferencia de contexto se limita a lo que se pasa como parámetro del tool

### 3.3 Patrón Custom `delegateTask` Tool (Enfoque Manual)
- **Descripción**: En lugar de usar handoffs nativos del SDK, implementar un `tool()` personalizado llamado `delegateTask` que manualmente crea un sub-agente, lo ejecuta y devuelve el resultado.
- **Estado actual**: No implementado. Requiere código personalizado.
- **Cómo funciona**:
  1. Definir un tool `delegateTask` con parámetros `{ agent: string, task: string }`
  2. En la función `execute` del tool, usar `LLMFactory.createAgent()` para instanciar el sub-agente
  3. Ejecutarlo con `Runner.run()` (sin streaming internamente)
  4. Devolver el output final como resultado del tool
- **Limitaciones conocidas**:
  - Hacer streaming del output del sub-agente en tiempo real requiere un enfoque diferente (multiplexado SSE)
  - La ejecución del tool es síncrona desde la perspectiva del coordinador

### 3.4 Puntos de Integración del Codebase Actual

#### 3.4.1 LLMFactory (`src/extension/modules/llm/backend/factory.ts`)
- `createAgent(role, binding, tools, apiKey, provider, instructions)` — ya acepta todos los parámetros necesarios
- El parámetro `instructions` ya soporta inyección del markdown completo del rol (implementado hoy)
- Providers: Gemini, OpenAI/Codex, Claude — todos soportados

#### 3.4.2 LLMVirtualBackend (`src/extension/modules/llm/backend/index.ts`)
- `stream()` — streaming basado en SSE ya funcional
- `pumpStreamEvents()` — emite tipos de evento `content`, `tool_call`, `tool_result` por SSE
- `run()` — ejecución sin streaming disponible

#### 3.4.3 Tools (`src/extension/modules/llm/backend/tools/index.ts`)
- 5 tools definidos actualmente: `readFile`, `writeFile`, `runCommand`, `listDirectory`, `searchFiles`
- `writeFile` y `runCommand` tienen `needsApproval: true`
- Tools exportados como array plano `agentTools`

#### 3.4.4 Chat Background (`src/extension/modules/chat/background/index.ts`)
- `handleSendMessage()` — envía payload al endpoint `/stream` del sidecar
- Ya lee la persona del rol desde `.agent/rules/roles/{role}.md` del workspace
- Ya maneja eventos SSE: `content`, `tool_call`, `tool_result`
- `emitAgentResponse()` — envía mensaje final al Chat View

#### 3.4.5 Chat View (`src/extension/modules/chat/view/`)
- Ya renderiza bloques de tool call/result en el chat
- Ya tiene dropdown de selección de agente con iconos por rol

#### 3.4.6 Settings Background — Capabilities
- `handleGetRoles()` devuelve capabilities por agente (vision, tooling, streaming, code_execution)
- `handleGetBinding()` devuelve bindings rol-modelo
- Capabilities almacenadas en el frontmatter YAML del `.md` del rol

---

## 4. APIs Relevantes

| API / Feature | Fuente | Estado |
|---|---|---|
| `agent.asTool()` | SDK `@openai/agents` | Estable |
| `handoff()` | SDK `@openai/agents` | Estable |
| `tool()` con `needsApproval` | SDK `@openai/agents` | Estable |
| `Runner.run()` con `{ stream: true }` | SDK `@openai/agents` | Estable |
| Streaming SSE con Fastify | `fastify` | Estable |
| `vscode.postMessage()` / `onDidReceiveMessage` | VS Code Webview API | Estable |

---

## 5. Compatibilidad Multi-navegador
- No aplica — esta feature funciona completamente dentro del Extension Host de VS Code + sidecar Node.js.
- El Chat View usa webview basado en Lit (ya multiplataforma via VS Code).

---

## 6. Oportunidades AI-first Detectadas
- **Feature Agent-as-Tool del SDK** (`agent.asTool()`): permite tratar cualquier agente como una función callable
- **Instanciación dinámica de agentes**: `LLMFactory.createAgent()` puede crear agentes al vuelo con diferentes personas/modelos
- **Creación de agente virtual**: agentes temporales con instrucciones personalizadas pueden crearse sin archivo `.md` pasando `instructions` directamente a la factory

---

## 7. Riesgos Identificados

| Riesgo | Severidad | Fuente |
|---|---|---|
| Coste de tokens del sub-agente se acumula (llamada LLM separada por delegación) | Media | Arquitectura del SDK |
| Sin streaming intermedio en `agent.asTool()` — sub-agente debe completar antes de devolver resultado | Media | Limitación del SDK |
| Timeout del tool puede dispararse si la tarea del sub-agente es larga | Media | Defaults de `@openai/agents` |
| Desajuste de capabilities: el modelo del agente delegado puede no soportar features requeridas | Baja | Datos de configuración |
| Recursión: si el tool `delegateTask` se da a sub-agentes, posibles bucles infinitos | Alta | Decisión de diseño |

---

## 8. Fuentes
- Paquete NPM `@openai/agents`: https://www.npmjs.com/package/@openai/agents
- Guía de Handoffs de `@openai/agents`: https://openai.github.io/openai-agents-js/guides/handoffs/
- Guía de Tools de `@openai/agents`: https://openai.github.io/openai-agents-js/guides/tools/
- Codebase actual: `src/extension/modules/llm/backend/` (factory, tools, index)
- Codebase actual: `src/extension/modules/chat/background/index.ts` (consumidor de streaming)

---

## 9. Aprobación del Desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-20T16:41:35+01:00
    comments: null
```
