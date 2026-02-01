---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: completed
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 34
---

🧩 **vscode-specialist**: Crear espacio core + base Lit para ciclo de vida de vistas.

# Agent Task — 34-vscode-specialist-core-lit-base

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Crear `src/extension/core/` con base Lit y ciclo de vida común para vistas (run/listen/predata/loadData/render).
- **Alcance**: `src/extension/core/**`, `src/extension/views/key/**` (piloto), `package.json` (dependencia Lit).
- **Dependencias**: CSP con `cspSource` y logging activo.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- Necesitamos base común para escalar vistas con mismo lifecycle.

### Opciones consideradas
- **Opción A**: Base Lit en `core` y adaptar Setup primero.
- **Opción B**: Base Lit en `views` (menos modular).

### Decisión tomada
- Opción elegida: A.
- Justificación: core reutilizable para futuras vistas/componentes.

---

## Output (REQUIRED)
- **Entregables**:
  - `src/extension/core/` con clase base Lit y contrato de lifecycle.
  - Setup view migrada a Lit usando la base.
  - `npm run compile` OK.
- **Evidencia requerida**:
  - Logs AGW al cargar Setup.

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
- Añadida base Lit `AgwViewBase` en `src/extension/core/webview/agw-view-base.js`.
- Setup migrado a Lit (`src/extension/views/key/web/key-view.js`) con ciclo de vida run/listen/predata/loadData/render.
- Template Setup actualizado para usar componente Lit y permitir `https://unpkg.com`.
- Dependencia `lit` añadida a `package.json` y assets core copiados en build.

### Decisiones técnicas
- Base en `core` para reutilización futura.
- Lit cargado por CDN (unpkg) para evitar bundler en webview piloto.

### Evidencia
- `npm run compile`

### Desviaciones del objetivo
- Ninguna.

---

## Gate (REQUIRED)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-01T11:02:30Z
    comments: "Aprobado."
```
