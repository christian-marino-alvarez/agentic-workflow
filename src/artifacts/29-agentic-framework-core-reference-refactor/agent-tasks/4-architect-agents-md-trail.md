---
artifact: agent_task
phase: phase-4-implementation
owner: architect-agent
status: pending
related_task: 29-Agentic Framework Core Reference Refactor
task_number: 4
---

# Agent Task — 4-architect-agents-md-trail

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Asumiendo la tarea de refinamiento de la visibilidad y el "Discovery Trail" para agentes externos.

## Input (REQUIRED)
- **Objetivo**: Asegurar que un agente de IA que aterrice en el proyecto por primera vez tenga un camino claro y forzado hacia el Core en `node_modules` sin perder el contexto local.
- **Alcance**:
  - Validar y refinar el contenido de `AGENTS.md` generado por el CLI.
  - Asegurar que las referencias en `index.md` (Core vs Project) sean inconfundibles.
- **Dependencias**: Agent Task #2 (Init Refactor).

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
Crear un sistema de navegación (Discovery Trail) que obligue a cualquier agente de IA a entender que existe una jerarquía de reglas: Core (en node_modules) y Proyecto (local).

### Opciones consideradas
Links relativos vs Links absolutos. Se eligen absolutos inyectados por el CLI porque garantizan que el salto al código del framework sea directo e infalible.

### Decisión tomada
Usar `AGENTS.md` como punto de entrada de alta visibilidad que apunta al índice maestro local, el cual bifurca la navegación hacia el paquete npm.

---

## Output (REQUIRED)
- **Entregables**:
  - Plantilla final de `AGENTS.md` y estructura de `index.md` validada.
- **Evidencia requerida**:
  - Los agentes externos deben poder navegar hasta las reglas core en `node_modules` siguiendo los links del documento.

---

## Execution

```yaml
execution:
  agent: "architect-agent"
  status: completed
  started_at: "2026-01-20T08:10:00+01:00"
  completed_at: "2026-01-20T08:11:00+01:00"
```

---

## Implementation Report

### Cambios realizados
- Definida y validada la estructura de `AGENTS.md` y `index.md` que se genera dinámicamente.
- Verificado que los links de Markdown utilizan las rutas absolutas resueltas por el Tooling.

### Decisiones técnicas
Se ha optado por un lenguaje muy directivo en `AGENTS.md` ("DEBE leer primero...", "Ejecuta el workflow...") para minimizar la autonomía errónea de agentes externos al inicio de la sesión.

### Evidencia
Estructura inyectada en `src/cli/commands/init.ts` y verificada visualmente.

---

## Gate (REQUIRED)

```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-20T08:11:00+01:00"
    comments: "Discovery Trail aprobado. Es vital para que la IA no se pierda entre node_modules y el repo local."
```

---

## Reglas contractuales
1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
