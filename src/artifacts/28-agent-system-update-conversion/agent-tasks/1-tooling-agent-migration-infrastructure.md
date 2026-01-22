---
artifact: agent_task
phase: phase-4-implementation
owner: tooling-agent
status: pending
related_task: 28-Agent System Update & Conversion System
task_number: 1
---

# Agent Task — 1-tooling-agent-migration-infrastructure

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Asignando la primera tarea de implementación al **tooling-agent**.

## Input (REQUIRED)
- **Objetivo**: Implementar las utilidades de core para la detección de versiones legacy y la lógica de respaldo.
- **Alcance**: Crear `src/core/migration/detector.ts` y `src/core/migration/backup.ts`.
- **Dependencias**: Ninguna.

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
  - `agentic-workflow/src/core/migration/detector.ts`
  - `agentic-workflow/src/core/migration/backup.ts`
- **Evidencia requerida**:
  - Los archivos deben existir y exportar funciones de detección de versión y copia de seguridad con timestamp.

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
    date: "2026-01-20T00:18:00+01:00"
    comments: "Aprobado vía consola."
execution:
  agent: "tooling-agent"
  status: completed
  started_at: "2026-01-20T00:17:30+01:00"
  completed_at: "2026-01-20T00:18:00+01:00"
```

---

## Reglas contractuales
1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
2. El agente asignado **NO puede modificar** el Input ni el Output definidos por el arquitecto.
