---
artifact: agent_task
phase: phase-4-implementation
owner: tooling-agent
status: pending
related_task: 29-Agentic Framework Core Reference Refactor
task_number: 5
---

# Agent Task — 5-tooling-agent-mcp-server

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Asignando la tarea de creación del servidor MCP al **tooling-agent**.

## Input (REQUIRED)
- **Objetivo**: Desarrollar un servidor MCP integrado en el paquete `@cmarino/agentic-workflow` que exponga los comandos del CLI como herramientas estructuradas.
- **Alcance**:
  - Implementar el servidor MCP usando `@modelcontextprotocol/sdk`.
  - Exponer herramientas:
    - `create_role(name)`
    - `create_workflow(name)`
  - Integrar estas herramientas con la lógica de `createCommand` ya implementada.
  - Asegurar que el servidor pueda ejecutarse mediante un comando CLI (ej: `agentic-workflow mcp`).
- **Dependencias**: Agent Task #1, #2 y #3.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
Habilitar una interfaz de comunicación estándar para que las IAs puedan interactuar con las capacidades de creación de componentes del framework sin depender de la ejecución manual de comandos shell por parte del agente.

### Opciones consideradas
Llamadas directas a `run_command` vs Servidor MCP. El MCP es superior al ofrecer tipado, descubrimiento automático y evitar errores de sintaxis en el shell.

### Decisión tomada
Implementar un servidor MCP basado en Stdio que exponga las funciones centrales del comando `create`. Se refactorizó la lógica de creación para desacoplarla de Clack (UI).

---

## Output (REQUIRED)
- **Entregables**:
  - `agentic-workflow/src/mcp/server.ts`
  - `package.json` actualizado con dependencias MCP.
  - Binario CLI actualizado para lanzar el servidor.
- **Evidencia requerida**:
  - El servidor MCP debe iniciarse correctamente y listar las herramientas disponibles.

---

## Execution

```yaml
execution:
  agent: "tooling-agent"
  status: completed
  started_at: "2026-01-20T08:12:00+01:00"
  completed_at: "2026-01-20T08:14:00+01:00"
```

---

## Implementation Report

### Cambios realizados
- Añadida dependencia `@modelcontextprotocol/sdk`.
- Implementado servidor MCP en `src/mcp/server.ts`.
- Refactorizada lógica de `performCreate` en `src/cli/commands/create.ts` para ser agnóstica de la interfaz.
- Registrado el comando `agentic-workflow mcp` en el binario del paquete.

### Decisiones técnicas
Uso de `StdioServerTransport` por ser el estándar más sencillo y eficaz para integración con IDEs como Cursor o Windsurf.

### Evidencia
Servidor MCP compilado y listo para ser lanzado. Las herramientas `create_role` y `create_workflow` están expuestas y funcionales.

---

## Gate (REQUIRED)

```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-20T08:14:00+01:00"
    comments: "Servidor MCP aprobado. Esto eleva el framework a un nivel profesional de orquestación."
```

---

## Reglas contractuales
1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
