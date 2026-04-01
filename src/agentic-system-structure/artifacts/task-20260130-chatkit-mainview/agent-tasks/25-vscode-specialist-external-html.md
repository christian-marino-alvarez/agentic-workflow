---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: failed
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 25
---

🧩 **vscode-specialist**: Mover HTML a ficheros externos por view.

# Agent Task — 25-vscode-specialist-external-html

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Extraer el HTML de cada view a ficheros externos y cargarlos desde el provider.
- **Alcance**: `src/extension/views/**` y assets en `dist/extension/views/**`.
- **Dependencias**: JS externo ya implementado.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- Cumplir `constitution.external_html`.

### Opciones consideradas
- **Opción A**: HTML por view en `src/extension/views/<view>/web/<view>.html`.
- **Opción B**: HTML común con placeholders (menos claro).

### Decisión tomada
- Opción elegida: A.
- Justificación: claridad y separación.

---

## Output (REQUIRED)
- **Entregables**:
  - HTML externo por view.
  - Providers cargan el HTML desde archivo.
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
- Añadido HTML externo por view en `src/extension/views/*/web/*.html`.
- Carga de HTML desde `HtmlLoader` en `chat-view.ts`, `key-view.ts`, `history-view.ts`, `workflow-view.ts`.
- `HtmlLoader` centraliza lectura y reemplazo de placeholders.
- `copy-view-assets` copia los assets web (HTML + JS) a `dist/extension/views/**`.

### Decisiones técnicas
- Mantener placeholders `__NONCE__`, `__SCRIPT_URI__`, `__API_URL__` para CSP y configuración.
- HTML externo por vista para cumplir separación de responsabilidades.

### Evidencia
- `npm run compile`

### Desviaciones del objetivo
- Ninguna.

---

## Gate (REQUIRED)
```yaml
approval:
  developer:
    decision: NO
    date: 2026-01-31T00:00:00Z
    comments: "Cambio de constitución: HTML debe ir en módulo JS/TS dedicado."
```
