---
artifact: agent_task
phase: phase-4-implementation
owner: tooling-agent
status: pending
related_task: 28-Agent System Update & Conversion System
task_number: 2
---

# Agent Task — 2-tooling-agent-content-transformer

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Asignando la segunda tarea al **tooling-agent**.

## Input (REQUIRED)
- **Objetivo**: Implementar el motor de transformación de contenido Markdown para migrar archivos del backup con frontmatter actualizado.
- **Alcance**: Crear `src/core/migration/transformer.ts` y añadir la dependencia `gray-matter`.
- **Dependencias**: Paso 1.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
(A completar por el agente asignado)

### Opciones consideradas
(A completar por el agente asignado)

### Decisión tomada
(A completar por el agente asignado)

---

## Output (REQUIRED)
- **Entregables**:
  - `agentic-workflow/src/core/migration/transformer.ts`
  - `package.json` actualizado con `gray-matter`.
- **Evidencia requerida**:
  - Función `transformFile()` que inyecte o actualice claves obligatorias en el frontmatter conservando el contenido.

---

## Execution

```yaml
execution:
  agent: "tooling-agent"
  status: pending
  started_at: null
  completed_at: null
```

---

## Implementation Report

### Cambios realizados
(A completar por el agente asignado)

### Decisiones técnicas
(A completar por el agente asignado)

### Evidencia
(A completar por el agente asignado)

---

## Gate (REQUIRED)

```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-20T00:19:00+01:00"
    comments: "Aprobado vía consola."
execution:
  agent: "tooling-agent"
  status: completed
  started_at: "2026-01-20T00:18:10+01:00"
  completed_at: "2026-01-20T00:19:00+01:00"
```

---

## Reglas contractuales
1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
