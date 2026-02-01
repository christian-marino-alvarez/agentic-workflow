---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: completed
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 36
---

🧩 **vscode-specialist**: Diagnosticar y corregir arranque del módulo Lit en Setup.

# Agent Task — 36-vscode-specialist-lit-module-start

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Asegurar que el módulo `key-view.js` se ejecuta y renderiza el componente Lit.
- **Alcance**: `src/extension/views/key/**`, CSP si aplica.
- **Dependencias**: Lit TS + base core.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- El script `key-view.js` se carga pero el componente no ejecuta (no hay `init` logs).

### Opciones consideradas
- **Opción A**: Ajustar CSP para `type="module"` + `unpkg`.
- **Opción B**: Cambiar a import local (bundle) si CSP bloquea CDN.

### Decisión tomada
- Opción elegida: A primero; B si A no resuelve.
- Justificación: mínimo cambio.

---

## Output (REQUIRED)
- **Entregables**:
  - Setup renderizado (Lit) y logs `init` visibles.
- **Evidencia requerida**:
  - Output `[AGW] [keyView] init`.
  - `npm run compile` OK.

---

## Execution

```yaml
execution:
  agent: "vscode-specialist"
  status: completed
  started_at: 2026-02-01T11:02:30Z
  completed_at: 2026-02-01T11:10:00Z
```

---

## Implementation Report

### Cambios realizados
- Ajustado `copy-view-assets` para no sobrescribir JS compilado de `key-view` y `core/webview`.
- Eliminado `dist/extension/views/key/web/key-view.ts` residual.

### Decisiones técnicas
- Evitar copiar fuentes TS al `dist` para permitir que el módulo JS cargue correctamente.

### Evidencia
- `npm run compile`

### Desviaciones del objetivo
- (Si las hay, justificación)

---

## Gate (REQUIRED)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-01T11:10:30Z
    comments: "Aprobado."
```
