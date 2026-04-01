---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: in-progress
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 13
---

🧩 **vscode-specialist**: Ajustar estado “Sending…” con timeout y error.

# Agent Task — fix-13-vscode-specialist-status-timeout

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Evitar que el estado quede en “Sending…” tras pulsar Test; mostrar Ready o Error con timeout.
- **Alcance**: `src/extension/views/main-view.ts` únicamente.
- **Dependencias**: ChatKit UI y botón Test ya implementados.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- El promise de `sendUserMessage` puede colgarse o no resolver.

### Opciones consideradas
- **Opción A**: `Promise.race` con timeout y fallback “Ready”.
- **Opción B**: Escuchar eventos del componente (no garantizado).

### Decisión tomada
- Opción elegida: A.
- Justificación: determinístico sin depender de eventos externos.

---

## Output (REQUIRED)
- **Entregables**:
  - Timeout y manejo de error en botón Test.
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
- `src/extension/views/main-view.ts`: timeout y manejo de error para botón Test.

### Decisiones técnicas
- `Promise.race` con timeout de 10s para evitar estado colgado.

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
