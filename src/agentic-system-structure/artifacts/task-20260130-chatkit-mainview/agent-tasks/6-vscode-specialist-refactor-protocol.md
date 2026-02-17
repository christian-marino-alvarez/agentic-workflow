---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: in-progress
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 6
---

🧩 **vscode-specialist**: Extraer lógica pura del protocolo ChatKit para habilitar unit tests.

# Agent Task — 6-vscode-specialist-refactor-protocol

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Extraer la lógica pura de protocolo ChatKit (threads/items/eventos) a un módulo sin `vscode` para permitir unit tests.
- **Alcance**: `src/extension/chatkit/**` únicamente; sin cambiar el comportamiento observable del servidor.
- **Dependencias**: Servidor ChatKit custom ya implementado.

---

## Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.
> Documentar el razonamiento mejora la calidad y permite detectar errores temprano.

### Análisis del objetivo
- Extraer lógica pura (threads/items/eventos) a un módulo sin `vscode`.
- Debe mantener el comportamiento del servidor.

### Opciones consideradas
- **Opción A**: Extraer helpers puros (thread store, builders) a `chatkit-protocol.ts`.
- **Opción B**: Testear directamente el servidor con mocks de `vscode`.

### Decisión tomada
- Opción elegida: A.
- Justificación: Habilita unit tests sin dependencias de VS Code.

---

## Output (REQUIRED)
- **Entregables**:
  - Nuevo módulo puro para protocolo ChatKit
  - Servidor usa ese módulo
- **Evidencia requerida**:
  - Build `npm run compile` OK

---

## Execution

```yaml
execution:
  agent: "vscode-specialist"
  status: completed
  started_at: 2026-01-31T00:00:00Z
  completed_at: 2026-01-31T00:00:00Z
```

---

## Implementation Report

> Esta sección la completa el agente asignado durante la ejecución.

### Cambios realizados
- Nuevo módulo puro `src/extension/chatkit/chatkit-protocol.ts` con thread store y helpers.
- `chatkit-server.ts` ahora usa el módulo puro.
- `src/extension/chatkit/index.ts` exporta tipos/funciones del protocolo.

### Decisiones técnicas
- Store in-memory para threads/items mantiene el comportamiento actual.
- Helpers puros permiten testeo con `node:test`.

### Evidencia
- `npm run compile` OK.

### Desviaciones del objetivo
- Ninguna.

---

## Gate (REQUIRED)

El desarrollador **DEBE** aprobar esta tarea antes de que el arquitecto asigne la siguiente.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-31T00:00:00Z
    comments: "Aprobado."
```

---

## Reglas contractuales

1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
2. Si Gate FAIL (`decision: NO`):
   - El arquitecto define acciones correctivas.
   - Se genera una nueva tarea de corrección si procede.
3. El agente asignado **NO puede modificar** el Input ni el Output definidos por el arquitecto.
4. El Gate es **síncrono y bloqueante**: el flujo se detiene hasta obtener respuesta del desarrollador.
