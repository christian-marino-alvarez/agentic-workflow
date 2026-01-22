---
artifact: agent_task
phase: phase-4-implementation
owner: architect-agent
status: pending
related_task: 26-portable-agentic-system
task_number: 4
---

# Agent Task — 4-architect-linking-and-verification

## Input (REQUIRED)
- **Objetivo**: Implementar lógica de resolución de paths (linking) y crear una demo de verificación.
- **Alcance**: 
  - Validar que los workflows copiados usan rutas relativas o aliases correctamente.
  - Implementar `AgentPathResolver` real en `src/core/index.ts` (si es necesario para runtime, aunque los agentes leen markdown directamente).
  - **Prueba manual**: Crear una carpeta temporal `test-project`, instalar el paquete (link local), ejecutar `init` y verificar que la estructura generada es válida.
- **Dependencias**: Tarea 3 completada.

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
  - Evidencia de ejecución de `npm link` y `agentic-workflow init` en carpeta de prueba.
  - Ajustes finales en `src/` si se detectan rutas rotas.
- **Evidencia requerida**:
  - Captura (log) de la sesión de testing manual.

---

## Execution

```yaml
execution:
  agent: "architect-agent"
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
    decision: SI
    date: 2026-01-19T22:47:57+01:00
    comments: Demostración exitosa en test-project.

```

---

## Reglas contractuales

1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
2. Si Gate FAIL (`decision: NO`):
   - El arquitecto define acciones correctivas.
   - Se genera una nueva tarea de corrección si procede.
3. El agente asignado **NO puede modificar** el Input ni el Output definidos por el arquitecto.
4. El Gate es **síncrono y bloqueante**: el flujo se detiene hasta obtener respuesta del desarrollador.
