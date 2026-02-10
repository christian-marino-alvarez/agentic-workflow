---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 5-agent-workflows-implementation
---

# Research — 5-agent-workflows-implementation

## Identificación
- **Objetivo**: Investigar la implementación de orquestación multi-agente usando `@openai/agents`.
- **Enfoque**: Handoffs dinámicos, Tools HIL, Persistencia, Streaming de Eventos.

## 1. SDK Overview
El SDK `@openai/agents` está dividido en lógica central (`@openai/agents-core`) e implementaciones de modelos (`@openai/agents-openai`).

**Componentes Clave:**
- **Agent**: La unidad central, configurada con instrucciones, herramientas y handoffs.
- **Runner**: Orquesta la ejecución de agentes, manejando el ciclo de llamadas al modelo, ejecución de herramientas y handoffs.
- **RunState**: Gestiona el estado de una ejecución de flujo de trabajo, incluyendo historial de conversación, turno actual y agente activo. Es serializable, lo que permite persistencia y reanudación.
- **Handoff**: Un mecanismo nativo para delegar la ejecución a otro agente.
- **Tools**: Funciones expuestas al agente, incluyendo herramientas de función estándar y herramientas MCP.

## 2. Estrategia de Implementación: Orquestación Híbrida
La estrategia híbrida propuesta se alinea directamente con las capacidades del SDK:
- **Runtime Triage**: Puede implementarse como un "Router Agent" o lógica simple que inicializa el `Runner` con un `Agent` específico basado en la intención del usuario.
- **Owner Handoffs**: El agente "Owner" se configura con `handoffs` (ej. `[writerAgent, coderAgent]`). El SDK maneja la transferencia de control y el paso de contexto automáticamente usando la clase `Handoff`.

## 3. Persistencia y Reanudación
El SDK proporciona soporte nativo para persistencia a través de `RunState`.

**Mecanismo:**
1.  **Serializar**: `runResult.runState.toString()` (o `toJSON()`) serializa el estado completo de la ejecución.
2.  **Almacenar**: Guardar la cadena serializada en la base de datos (vinculada a un `sessionId`).
3.  **Deserializar**: `await RunState.fromString(agent, serializedState)` recrea el objeto de estado.
4.  **Reanudar**: Pasar el `RunState` restaurado como `input` a `runner.run(agent, state)`.

**Ejemplo de Flujo:**
```typescript
// Pausar / Persistir
const serialized = result.runState.toString();
await db.saveSession(sessionId, serialized);

// Reanudar
const serialized = await db.getSession(sessionId);
const state = await RunState.fromString(rootAgent, serialized);
const result = await runner.run(rootAgent, state);
```

## 4. Human-in-the-Loop (HIL)
HIL se maneja a través de **Interrupciones** y **Aprobaciones de Herramientas**.

**Mecanismo:**
1.  **Configuración**: Definir herramientas con `needsApproval: true` (o una función que retorne boolean).
2.  **Ejecución**: Cuando el agente llama a dicha herramienta, `runner.run()` pausa y retorna un resultado donde `result.isInterrupted` es `true`.
3.  **Manejo**: El array `result.interruptions` contiene objetos `RunToolApprovalItem`.
4.  **Acción del Usuario**: La aplicación presenta la solicitud al usuario.
5.  **Aprobación/Rechazo**:
    - Cargar el estado.
    - Llamar a `state.approve(interruptionItem)` o `state.reject(interruptionItem)`.
    - Reanudar la ejecución con `runner.run(agent, state)`.

**Ejemplo:**
```typescript
if (result.isInterrupted) {
  const approvalItem = result.interruptions[0];
  // ... solicitar aprobación al usuario ...
  // Al aprobar:
  state.approve(approvalItem);
  const nextResult = await runner.run(agent, state);
}
```

## 5. Streaming y Eventos
El SDK soporta streaming basado en eventos, el cual es preferible sobre el streaming crudo de tokens para flujos de trabajo complejos.

**Mecanismo:**
- Usar `stream: true` en `RunOptions`.
- `runner.run()` retorna un `StreamedRunResult`.
- Iterar sobre `result` (es un async iterable) para recibir objetos `RunStreamEvent`.

**Eventos Clave:**
- `message_output_created`: Nuevo chunk de token/mensaje.
- `tool_called`: Agente invoca una herramienta.
- `tool_output`: Ejecución de herramienta finalizada.
- `handoff_occurred`: Control transferido a otro agente.
- `agent_updated_stream_event`: Notificación de cambio de agente activo.
- `tool_approval_requested`: Solicitud de aprobación (HIL).

## 6. Registro Dinámico de Agentes (Markdown-based)
Para cumplir con el requerimiento de crear agentes basándose en definiciones de Markdown (`.agent/rules/roles/*.md`) y asignarles skills (`.agent/skills/*`):

**Estrategia de Hidratación:**
1.  **Escaneo**: Al inicio (o mediante Watcher), el sistema escanea `.agent/rules/roles`.
2.  **Parsing**:
    - **Frontmatter**: Extraer `id` (nombre del agente), `capabilities.skills`.
    - **Contenido**: El cuerpo del markdown se convierte en las `instructions` (System Prompt) del agente.
3.  **Mapeo de Skills**:
    - Para cada skill en `capabilities.skills` (ej: `skill.runtime-governance`), buscar la definición en `.agent/skills/`.
    - Cargar las herramientas asociadas a ese skill y añadirlas al array `tools` del agente.
4.  **Instanciación**: Crear la instancia de `Agent` usando la configuración extraída.

**Sincronización Automática:**
- Implementar un **`AgentRegistry`** que:
    - Cargue todos los roles al iniciar.
    - (Opcional) Observe cambios en el sistema de archivos (file watcher) para recargar/registrar nuevos agentes y skills en tiempo real sin reiniciar el backend.

## 7. Integración con MCP
- **Tools Estándar**: Creadas vía helper `tool()`.
- **Soporte MCP**: Soporte nativo mediante clases `MCPServer` (`MCPServerStdio`, `MCPServerSSE`).
- **Conversión**: `mcpToFunctionTool` convierte herramientas MCP a herramientas compatibles con el SDK.

## 8. Recomendaciones Finales
1.  **Agent Manager Encapsulado**: Crear un servicio wrapper alrededor de `Runner` que maneje la persistencia de estado, carga, y puenteo de eventos al formato estandarizado `AgentEvent`.
2.  **Definiciones de Herramientas**: Usar Zod para definiciones de esquema para asegurar seguridad de tipos y compatibilidad con el helper `tool()` del SDK.
3.  **API de Aprobación**: Implementar un endpoint dedicado para `approve/reject` que acepte `sessionId` y `approvalId`.
4.  **Testing**: Usar `MCPServerStdio` para probar integraciones MCP localmente.
5.  **Agent Registry Service**: Implementar un servicio dedicado a cargar dinámicamente definiciones de agentes desde Markdown, parsear sus skills, e instanciarlos usando el SDK. Debe incluir una capacidad de "watching" para detectar nuevos archivos.

