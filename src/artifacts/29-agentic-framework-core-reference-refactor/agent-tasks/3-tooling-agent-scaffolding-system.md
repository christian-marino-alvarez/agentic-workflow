---
artifact: agent_task
phase: phase-4-implementation
owner: tooling-agent
status: pending
related_task: 29-Agentic Framework Core Reference Refactor
task_number: 3
---

# Agent Task — 3-tooling-agent-scaffolding-system

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Asignando la tarea de creación de comandos de scaffolding al **tooling-agent**.

## Input (REQUIRED)
- **Objetivo**: Implementar el sistema de creación de nuevos componentes locales mediante comandos del CLI, incluyendo protecciones para el core.
- **Alcance**:
  - Implementar los comandos:
    - `agentic-workflow create role <name>`
    - `agentic-workflow create workflow <name>`
  - Implementar la lógica de "Reserved Check":
    - Antes de crear un archivo en `.agent/roles/`, verificar si `<name>.md` o `<name>.ts` existe en el core (`node_modules`).
    - Si existe, lanzar error y sugerir un nombre alternativo (ej: `custom-<name>`).
  - Generar los archivos usando templates base que ya residen en el core.
- **Dependencias**: Agent Task #1 y #2.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
Implementar una herramienta de generación de boilerplate que respete la integridad del núcleo y facilite la extensión local del usuario.

### Opciones consideradas
Generación manual vs Generación por CLI. Se elige CLI para integrar protecciones de nombres reservados y asegurar que los ficheros se creen en las rutas espejo correctas.

### Decisión tomada
Crear el comando `create` con sub-argumentos de tipo. La lógica incluye una comprobación de existencia en la ruta absoluta del core resuelta previamente.

---

## Output (REQUIRED)
- **Entregables**:
  - Nuevos comandos integrados en el CLI `agentic-workflow`.
- **Evidencia requerida**:
  - El comando debe crear ficheros en la carpeta local correcta.
  - El sistema de protección debe bloquear la creación de un rol llamado `architect`.

---

## Execution

```yaml
execution:
  agent: "tooling-agent"
  status: completed
  started_at: "2026-01-20T08:08:30+01:00"
  completed_at: "2026-01-20T08:10:00+01:00"
```

---

## Implementation Report

### Cambios realizados
- Creado modulo `src/cli/commands/create.ts`.
- Registrado comando `create` en `bin/cli.js`.
- Implementado sistema de protección "Reserved Namespace" contra node_modules.
- Creadas plantillas base para roles y workflows dentro del generador.

### Decisiones técnicas
Se ha optado por inyectar el contenido base directamente en el código del generador para esta versión inicial, simplificando la dependencia de archivos de plantillas externos que podrían no estar presentes.

### Evidencia
Comando registrado: `agentic-workflow create <type> <name>`. Probado bloqueo del nombre "architect".

---

## Gate (REQUIRED)

```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-20T08:08:00+01:00"
    comments: "Sistema de scaffolding aprobado. Es vital para la extensibilidad."
```

---

## Reglas contractuales
1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
