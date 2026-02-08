---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 6-poc-agents-sdk-integration
---

# Plan — 6-poc-agents-sdk-integration

🏛️ **architect-agent**: Plan de implementación para POC Agents SDK Integration

## 1. Resumen del plan
- **Objetivo**: Integrar `@openai/agents` como un módulo nativo del Extension Host.
- **Resultado esperado**: Comando `agentic-workflow.runPoc` funcional que demuestra la ejecución de un agente con streaming de logs a un OutputChannel.

---

## 2. Pasos de implementación

### Paso 1: Scaffolding del Módulo POC
- **Descripción**: Crear la estructura de directorios y archivos base para el nuevo módulo.
- **Responsable**: `neo-agent`
- **Archivos**:
  - `src/extension/modules/poc-agents/index.ts` (Module entry point)
  - `src/extension/modules/poc-agents/controller.ts` (Logic implementation)

### Paso 2: Implementación de Lógica del Agente
- **Descripción**: Escribir el código que instancia el agente y maneja la ejecución.
- **Responsable**: `neo-agent`
- **Detalle**:
  - Importar `Agent` de `@openai/agents`.
  - Configurar herramienta simple `get_time`.
  - Implementar streaming de logs a `vscode.OutputChannel`.
  - Manejar `process.env.OPENAI_API_KEY`.

### Paso 3: Integración y Registro
- **Descripción**: Conectar el módulo con el sistema principal y registrar el comando.
- **Responsable**: `neo-agent`
- **Archivos**:
  - `package.json`: Añadir contribución de comando `agentic-workflow.runPoc` con título "Run Agentic POC".
  - `src/extension/index.ts`: Registrar `PocAgentsModule` en la lista de módulos activos.

---

## 3. Verificación prevista
- **Tests Manuales**:
  1. Abrir Extension Host.
  2. Ejecutar comando `Run Agentic POC`.
  3. Verificar que se abre el OutputChannel "Agentic POC".
  4. Verificar logs de flujo: "Thinking...", "Tool called: get_time", "Response: ...".
- **Criterios de éxito**:
  - No hay errores de runtime (crash).
  - El agente responde coherentemente.
  - El código está aislado en `poc-agents`.

---

## 4. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-08T16:09:47+01:00
    comments: Approved by user
```

> Sin aprobación, esta fase NO puede avanzar a Implementación.
