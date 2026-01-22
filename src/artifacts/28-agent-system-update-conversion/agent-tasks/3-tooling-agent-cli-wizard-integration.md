---
artifact: agent_task
phase: phase-4-implementation
owner: tooling-agent
status: pending
related_task: 28-Agent System Update & Conversion System
task_number: 3
---

# Agent Task — 3-tooling-agent-cli-wizard-integration

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Asignando la tarea final de implementación al **tooling-agent**.

## Input (REQUIRED)
- **Objetivo**: Integrar la lógica de detección, backup y transformación en el comando `init` para crear el Wizard interactivo.
- **Alcance**: Refactorizar `src/cli/commands/init.ts` para gestionar el flujo de actualización si se detecta un sistema previo.
- **Dependencias**: Paso 1, Paso 2.

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
  - `agentic-workflow/src/cli/commands/init.ts` actualizado.
- **Evidencia requerida**:
  - El comando `init` debe preguntar al usuario si desea migrar si detecta una versión antigua, realizar el backup y aplicar la nueva estructura.

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
    date: "2026-01-20T00:19:30+01:00"
    comments: "Aprobado vía consola."
execution:
  agent: "tooling-agent"
  status: completed
  started_at: "2026-01-20T00:18:40+01:00"
  completed_at: "2026-01-20T00:19:30+01:00"
```

---

## Reglas contractuales
1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
