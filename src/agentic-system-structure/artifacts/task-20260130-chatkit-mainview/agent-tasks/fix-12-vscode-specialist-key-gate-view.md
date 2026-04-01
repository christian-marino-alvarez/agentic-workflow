---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: in-progress
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 12
---

🧩 **vscode-specialist**: Vista exclusiva para API key antes de ChatKit.

# Agent Task — fix-12-vscode-specialist-key-gate-view

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Mostrar una vista exclusiva para pedir API key cuando falta; solo mostrar ChatKit y “Ready” cuando la key esté guardada.
- **Alcance**: `src/extension/views/main-view.ts` únicamente.
- **Dependencias**: Handshake de API key ya implementado.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- UX debe bloquear ChatKit y “Ready” hasta que exista API key.

### Opciones consideradas
- **Opción A**: Dos layouts en el mismo HTML (key-view vs chat-view) con toggle.
- **Opción B**: Dos webviews distintas (más complejidad).

### Decisión tomada
- Opción elegida: A.
- Justificación: cambio mínimo sin nuevas contribuciones.

---

## Output (REQUIRED)
- **Entregables**:
  - Vista de key visible cuando falta.
  - Vista principal visible cuando hay key.
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
- `src/extension/views/main-view.ts`: vista “key” exclusiva hasta que exista API key, luego se muestra ChatKit.

### Decisiones técnicas
- Toggle de vistas dentro del mismo HTML para evitar nuevas contribuciones.

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
