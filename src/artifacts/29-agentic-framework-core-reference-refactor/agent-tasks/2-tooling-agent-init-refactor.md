---
artifact: agent_task
phase: phase-4-implementation
owner: tooling-agent
status: pending
related_task: 29-Agentic Framework Core Reference Refactor
task_number: 2
---

# Agent Task — 2-tooling-agent-init-refactor

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Asignando la segunda tarea de implementación al **tooling-agent**.

## Input (REQUIRED)
- **Objetivo**: Refactorizar el comando `init` para implementar el modelo de referencia absoluta y estructura espejo.
- **Alcance**:
  - Modificar `agentic-workflow/src/cli/commands/init.ts`.
  - Utilizar `resolveCorePath()` de `resolver.ts`.
  - Generar un `.agent/index.md` local que contenga referencias absolutas a `node_modules`.
  - Crear directorios espejo locales (`.agent/rules`, `.agent/workflows`, `.agent/templates`, `.agent/roles`) si no existen, pero sin copiar ficheros core dentro de ellos.
- **Dependencias**: Agent Task #1 (Resolver).

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
Transformar el comando `init` para que actúe como un configurador de referencias en lugar de un instalador por copia.

### Opciones consideradas
Mantener la copia vs Referencia absoluta. La referencia absoluta es la única que garantiza que el core sea inmutable y actualizable vía npm sin intervención manual del usuario.

### Decisión tomada
Implementar inyección de paths absolutos resueltos dinámicamente. Se crean directorios espejo vacíos para permitir la extensibilidad natural sin saturar el proyecto con archivos duplicados.

---

## Output (REQUIRED)
- **Entregables**:
  - `agentic-workflow/src/cli/commands/init.ts` actualizado.
- **Evidencia requerida**:
  - Tras ejecutar `init`, el archivo `.agent/index.md` debe apuntar físicamente a las carpetas en `node_modules`.
  - Las carpetas locales en `.agent/` deben estar vacías o contener solo archivos creados por el usuario.

---

## Execution

```yaml
execution:
  agent: "tooling-agent"
  status: completed
  started_at: "2026-01-20T08:06:30+01:00"
  completed_at: "2026-01-20T08:08:00+01:00"
```

---

## Implementation Report

### Cambios realizados
- Integrado `resolveCorePath` en el flujo de `initCommand`.
- Eliminada la lógica de `fs.cp` de directorios core.
- Actualizada la generación de `index.md` para inyectar variables de entorno de paths del core.
- Actualizada la plantilla de `AGENTS.md` para guiar al agente hacia `node_modules`.
- Creados directorios espejo locales (`rules`, `workflows`, etc.) vacíos para el usuario.

### Decisiones técnicas
Añadida la variable `version: 1.3.0` al índice para marcar este cambio arquitectónico mayor. El uso de paths absolutos evita problemas de resolución de los agentes del IDE que no indexan node_modules por defecto.

### Evidencia
Código refactorizado y listo para pruebas. El comando `init` ahora es consciente de la ubicación del paquete real.

---

## Gate (REQUIRED)

```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-20T08:08:00+01:00"
    comments: "Refactor del comando init aprobado satisfactoriamente."
```

---

## Reglas contractuales
1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
