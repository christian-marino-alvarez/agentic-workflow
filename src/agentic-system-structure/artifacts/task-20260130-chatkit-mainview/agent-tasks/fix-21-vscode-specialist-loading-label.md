---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: in-progress
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 21
---

🧩 **vscode-specialist**: Loading con etiqueta de view + ocultar cuando listo.

# Agent Task — fix-21-vscode-specialist-loading-label

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Mostrar “Loading… [view]” y ocultar loading en cada view cuando el HTML esté listo.
- **Alcance**: `src/extension/views/chat/chat-view.ts`, `key/key-view.ts`, `history/history-view.ts`, `workflow/workflow-view.ts`.
- **Dependencias**: Loading actual.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- Loading debe indicar qué view está cargando y desaparecer cuando esté listo.

### Opciones consideradas
- **Opción A**: Ocultar loading con `window.onload`.
- **Opción B**: Mantener loading siempre (no deseado).

### Decisión tomada
- Opción elegida: A.
- Justificación: simple, sin dependencias.

---

## Output (REQUIRED)
- **Entregables**:
  - “Loading… [view]” visible al inicio.
  - Loading oculto en cada view al cargar.
- **Evidencia requerida**:
  - `npm run compile` OK.

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

### Cambios realizados
- Loading con etiqueta por view y ocultación en load.\n@@\n ### Decisiones técnicas\n-- (Decisiones clave y justificación)\n+- `window.load` para ocultar loading simple.\n@@\n ### Evidencia\n-- (Logs, capturas, tests ejecutados)\n+- `npm run compile` OK.\n@@\n ### Desviaciones del objetivo\n-- (Si las hay, justificación)\n+- Ninguna.

### Decisiones técnicas
- (Decisiones clave y justificación)

### Evidencia
- (Logs, capturas, tests ejecutados)

### Desviaciones del objetivo
- (Si las hay, justificación)

---

## Gate (REQUIRED)
```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```
