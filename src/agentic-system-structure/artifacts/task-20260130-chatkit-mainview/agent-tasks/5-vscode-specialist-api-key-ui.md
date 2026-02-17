---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: in-progress
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 5
---

🧩 **vscode-specialist**: Añadir UX para API key faltante en la webview.

# Agent Task — 5-vscode-specialist-api-key-ui

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Detectar ausencia de API key y mostrar en la webview un botón que invoque el comando `Agentic: Set OpenAI API Key`.
- **Alcance**: `src/extension/views/main-view.ts` y wiring con `postMessage` si aplica; sin tocar otros dominios.
- **Dependencias**: Tareas 2 y 3 completadas; comando ya registrado.

---

## Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.
> Documentar el razonamiento mejora la calidad y permite detectar errores temprano.

### Análisis del objetivo
- Mostrar un CTA cuando la API key no existe y lanzar el comando desde la webview.
- Requiere comunicación webview -> extension host.

### Opciones consideradas
- **Opción A**: Botón en webview que envía `postMessage` y el extension host ejecuta el comando.
- **Opción B**: Mensaje en UI sin botón.

### Decisión tomada
- Opción elegida: A.
- Justificación: UX directa y sin salir de la vista.

---

## Output (REQUIRED)
- **Entregables**:
  - Botón visible cuando no hay API key
  - El botón abre el input de API key
- **Evidencia requerida**:
  - Build `npm run compile` OK

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
- `src/extension/views/main-view.ts`: aviso de API key faltante + botón que envía `postMessage` para abrir input.
- Manejo de mensajes desde el webview para guardar la key en SecretStorage.

### Decisiones técnicas
- Se usa `postMessage` para invocar el prompt nativo desde el extension host.
- El aviso se muestra solo cuando el backend responde 401.

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
