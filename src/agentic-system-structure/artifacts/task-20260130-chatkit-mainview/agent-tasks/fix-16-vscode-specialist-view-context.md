---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: in-progress
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 16
---

🧩 **vscode-specialist**: Context keys para mostrar Setup vs Chat views.

# Agent Task — fix-16-vscode-specialist-view-context

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Usar context keys para ocultar/mostrar views según API key; renombrar keyView a “Setup”.
- **Alcance**: `src/extension/extension.ts`, `src/extension/views/key/key-view.ts`, `package.json`.
- **Dependencias**: ApiKeyBroadcaster ya implementado.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- Mostrar solo Setup si no hay key; mostrar Chat/History/Workflow si hay key.

### Opciones consideradas
- **Opción A**: `setContext` + `when` en `package.json`.
- **Opción B**: Collapse manual (no soportado).

### Decisión tomada
- Opción elegida: A.
- Justificación: patrón recomendado por VS Code para visibilidad condicional.

---

## Output (REQUIRED)
- **Entregables**:
  - `setContext('agenticWorkflow.hasKey', boolean)`.
  - `views[*].when` en `package.json`.
  - Vista “Setup”.
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
- `setContext('agenticWorkflow.hasKey', ...)` en activación y al guardar key.
- `package.json` views con `when` para mostrar Setup solo si falta key.
- Setup view renombrada.

### Decisiones técnicas
- Uso de context keys para visibilidad condicional de views.

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
