---
artifact: agent_task
phase: phase-4-implementation
owner: {{agent}}
status: pending | in-progress | completed | failed
related_task: {{taskId}}-{{taskTitle}}
task_number: {{N}}
---

# Agent Task — {{N}}-{{agent}}-{{taskName}}

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: {{objective}}
- **Alcance**: {{scope}}
- **Dependencias**: {{dependencies}}

---

## Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.
> Documentar el razonamiento mejora la calidad y permite detectar errores temprano.

### Análisis del objetivo
- ¿Qué se pide exactamente?
- ¿Hay ambigüedades o dependencias?

### Opciones consideradas
- **Opción A**: (descripción)
- **Opción B**: (descripción)
- *(añadir más si aplica)*

### Decisión tomada
- Opción elegida: (A/B/...)
- Justificación: (por qué esta opción)

---

## Output (REQUIRED)
- **Entregables**:
  - {{deliverables}}
- **Evidencia requerida**:
  - {{evidence}}

---

## Execution

```yaml
execution:
  agent: "{{agent}}"
  status: pending | in-progress | completed | failed
  started_at: null
  completed_at: null
```

---

## Implementation Report

> Esta sección la completa el agente asignado durante la ejecución.

### Cambios realizados
- (Archivos modificados, funciones añadidas, etc.)

### Decisiones técnicas
- (Decisiones clave y justificación)

### Evidencia
- (Logs, capturas, tests ejecutados)

### Desviaciones del objetivo
- (Si las hay, justificación)

---

## Gate (REQUIRED)

El desarrollador **DEBE** aprobar esta tarea antes de que el arquitecto asigne la siguiente.

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```

---

## Reglas contractuales

1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
2. Si Gate FAIL (`decision: NO`):
   - El arquitecto define acciones correctivas.
   - Se genera una nueva tarea de corrección si procede.
3. El agente asignado **NO puede modificar** el Input ni el Output definidos por el arquitecto.
4. El Gate es **síncrono y bloqueante**: el flujo se detiene hasta obtener respuesta del desarrollador.
