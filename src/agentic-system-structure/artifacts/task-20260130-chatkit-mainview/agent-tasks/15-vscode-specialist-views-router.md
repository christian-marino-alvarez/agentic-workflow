---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: in-progress
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 15
---

🧩 **vscode-specialist**: Implementar router de vistas y nuevas views (chat, history, workflow, key).

# Agent Task — 15-vscode-specialist-views-router

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Crear arquitectura de router para vistas y estructurar cada view en su carpeta con `index.ts` y `types.d.ts`. Registrar múltiples views en un único View Container.
- **Alcance**: `src/extension/views/**`, `src/extension/extension.ts`, `package.json` (contributes/activationEvents).
- **Dependencias**: ChatKit view existente.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- Se requiere soporte para múltiples views visibles simultáneamente y escalable a futuro.

### Opciones consideradas
- **Opción A**: Router central con registry y factories.
- **Opción B**: Registro manual por view sin router.

### Decisión tomada
- Opción elegida: A.
- Justificación: escalabilidad y consistencia.

---

## Output (REQUIRED)
- **Entregables**:
  - Router/registry de views.
  - Carpetas por view con `index.ts` y `types.d.ts`.
  - Views visibles simultáneamente en el panel.
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
- Router de views en `src/extension/views/router` y tipos compartidos en `src/extension/views/types.ts`.
- Nuevas vistas: `chat`, `history`, `workflow`, `key` con carpetas e `index.ts`.
- `ApiKeyBroadcaster` para sincronizar estado de API key entre views.
- Actualizado `src/extension/extension.ts` para registrar el registry.
- Actualizado `package.json` con nuevos view ids y activation events.

### Decisiones técnicas
- Todas las views son `webview` por ahora; TreeView queda como TODO futuro.

### Evidencia
- `npm run compile` OK.

### Desviaciones del objetivo
- Ninguna.

---

## Gate (REQUIRED)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-31T00:00:00Z
    comments: "Aprobado."
```
