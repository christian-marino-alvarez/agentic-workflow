---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: in-progress
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 2
---

🧩 **vscode-specialist**: Implementar servidor local ChatKit custom (protocolo) en extension host.

# Agent Task — 2-vscode-specialist-local-server

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Crear servidor HTTP local que implemente el protocolo ChatKit custom (endpoint `/chatkit`) y use un agente Neo dinámico con `gpt-5`. Añadir comando para configurar API key en SecretStorage.
- **Alcance**: `src/extension/**`, `package.json` (comandos/activación si aplica), sin tocar UI de webview aún.
- **Dependencias**: Resultado de Task 1; reglas de VS Code; documentación ChatKit + Agents SDK.

---

## Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.
> Documentar el razonamiento mejora la calidad y permite detectar errores temprano.

### Análisis del objetivo
- Implementar el protocolo ChatKit en TS (sin workflowId) y conectar con un agente dinámico.
- Depende de especificación de requests/events y de la UI ChatKit.

### Opciones consideradas
- **Opción A**: Seguir `workflowId` (descartado).
- **Opción B**: Implementar protocolo ChatKit custom en TS y generar eventos SSE.

### Decisión tomada
- Opción elegida: B.
- Justificación: El usuario requiere runtime local basado en markdown sin workflowId.

---

## Output (REQUIRED)
- **Entregables**:
  - Módulo servidor local ChatKit
  - Comando “Agentic: Set OpenAI Key” con SecretStorage
  - API key nunca en webview
- **Evidencia requerida**:
  - Rutas de endpoints implementadas
  - Comando registrado en `package.json`

---

## Execution

```yaml
execution:
  agent: "vscode-specialist"
  status: completed
  started_at: 2026-01-30T00:00:00Z
  completed_at: 2026-01-30T00:00:00Z
```

---

## Implementation Report

> Esta sección la completa el agente asignado durante la ejecución.

### Cambios realizados
- Reescrito `src/extension/chatkit/chatkit-server.ts` para implementar protocolo ChatKit custom en TS con endpoint `/chatkit` y SSE.
- Ajustado `package.json` para eliminar configuración `workflowId` (ya no aplica).
- Se mantiene comando de API key en SecretStorage.

### Decisiones técnicas
- Protocolo ChatKit custom con requests `threads.*` y `items.*` mínimos para ChatKit UI.
- Respuestas con SSE y eventos `thread.created`, `thread.item.added`, `thread.item.done`.
- Agente dinámico Neo usando `gpt-5` y system prompt desde `.agent/rules`.

### Evidencia
- `npm run compile` ejecutado sin errores.

### Desviaciones del objetivo
- Ninguna.

---

## Gate (REQUIRED)

El desarrollador **DEBE** aprobar esta tarea antes de que el arquitecto asigne la siguiente.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-30T00:00:00Z
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
