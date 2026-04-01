---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: in-progress
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 8
---

🧩 **vscode-specialist**: Fix detección de API key faltante en webview.

# Agent Task — fix-8-vscode-specialist-api-key-detect

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Mostrar botón de API key cuando el backend responde 401 al inicializar la vista.
- **Alcance**: `src/extension/views/main-view.ts` únicamente.
- **Dependencias**: Servidor ChatKit custom y UX del botón ya implementados.

---

## Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.

### Análisis del objetivo
- Necesitamos un chequeo explícito de estado de API key al cargar la vista.

### Opciones consideradas
- **Opción A**: `fetch` a `/chatkit` con `threads.list` y evaluar 401.
- **Opción B**: confiar en evento `error` del componente (insuficiente).

### Decisión tomada
- Opción elegida: A.
- Justificación: asegura UX consistente incluso si el componente no emite evento.

---

## Output (REQUIRED)
- **Entregables**:
  - `fetch` inicial a `/chatkit` con `threads.list`.
  - Mostrar aviso/botón si 401.
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

> Esta sección la completa el agente asignado durante la ejecución.

### Cambios realizados
- `src/extension/views/main-view.ts`: `fetch` inicial a `/chatkit` con `threads.list` para detectar 401 y mostrar aviso de API key.

### Decisiones técnicas
- Chequeo explícito al iniciar, no depender de eventos del componente.

### Evidencia
- `npm run compile` OK.

### Desviaciones del objetivo
- Ninguna.

---

## Gate (REQUIRED)
```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```
