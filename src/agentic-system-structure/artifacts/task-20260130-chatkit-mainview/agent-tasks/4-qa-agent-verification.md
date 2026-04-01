---
artifact: agent_task
phase: phase-4-implementation
owner: qa-agent
status: pending
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 4
---

🛡️ **qa-agent**: Verificación manual end-to-end de ChatKit en VS Code.

# Agent Task — 4-qa-agent-verification

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Validar manualmente que la extensión funciona en F5 con API key real, que el botón “Test” envía el mensaje y que hay respuesta en el chat.
- **Alcance**: Ejecución manual, sin cambios de código de producción.
- **Dependencias**: Tasks 1-3 completadas; API key configurada en SecretStorage.

---

## Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.
> Documentar el razonamiento mejora la calidad y permite detectar errores temprano.

### Análisis del objetivo
- ¿Qué se pide exactamente?
- ¿Hay ambigüedades o dependencias?

### Opciones consideradas
- **Opción A**: Validación manual solo en local.
- **Opción B**: Validación adicional en entorno remoto (si aplica).

### Decisión tomada
- Opción elegida: (A/B/...)
- Justificación: (por qué esta opción)

---

## Output (REQUIRED)
- **Entregables**:
  - Resultado de pruebas manuales
  - Errores encontrados (si los hay)
- **Evidencia requerida**:
  - Comandos ejecutados (si aplica)
  - Observaciones de UI

---

## Execution

```yaml
execution:
  agent: "qa-agent"
  status: pending
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
