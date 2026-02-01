---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: completed
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 35
---

🧩 **vscode-specialist**: Migrar Setup a Lit con decoradores en TypeScript.

# Agent Task — 35-vscode-specialist-lit-decorators-ts

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Usar Lit con decoradores en TS para la view Setup, manteniendo ciclo de vida base.
- **Alcance**: `src/extension/core/**`, `src/extension/views/key/**`, `tsconfig.json`, build assets.
- **Dependencias**: Base Lit ya creada.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- La base Lit existe pero está en JS; queremos decoradores TS.

### Opciones consideradas
- **Opción A**: Convertir base + setup a `.ts`, habilitar `experimentalDecorators`.
- **Opción B**: Mantener JS sin decoradores.

### Decisión tomada
- Opción elegida: A.
- Justificación: alineado con preferencia del desarrollador.

---

## Output (REQUIRED)
- **Entregables**:
  - Base Lit en TS con decoradores.
  - Setup en TS con decoradores.
  - Compilación OK.
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
- Base Lit migrada a TS con decoradores en `src/extension/core/webview/agw-view-base.ts`.
- Setup migrado a TS con decoradores en `src/extension/views/key/web/key-view.ts`.
- `tsconfig.json` habilita `experimentalDecorators`.
- Tipos para CDN de Lit (`cdn-lit.d.ts`) y globals de VS Code (`vscode-globals.d.ts`).

### Decisiones técnicas
- Lit sigue cargándose vía CDN, pero el código propio ahora es TS con decoradores.

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
