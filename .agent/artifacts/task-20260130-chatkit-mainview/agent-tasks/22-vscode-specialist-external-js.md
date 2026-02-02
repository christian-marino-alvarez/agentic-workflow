---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: in-progress
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 22
---

🧩 **vscode-specialist**: Mover JS inline a ficheros externos por view.

# Agent Task — 22-vscode-specialist-external-js

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Eliminar JS inline en HTML; cada view usa un archivo JS externo.
- **Alcance**: `src/extension/views/**` y posibles helpers; CSP y URIs correctos.
- **Dependencias**: router de views existente.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- Separar HTML y JS como requerido por el usuario.

### Opciones consideradas
- **Opción A**: Archivos JS por view en `src/extension/views/<view>/view.js`.
- **Opción B**: Un único JS con router interno (menos claro).

### Decisión tomada
- Opción elegida: A.
- Justificación: claridad y separación.

---

## Output (REQUIRED)
- **Entregables**:
  - HTML solo con `<script src>`.
  - JS externo por view con lógica actual.
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
- JS movido a ficheros externos por view (`src/extension/views/*/web/*.js`).\n- HTML ahora incluye solo `<script src>`.\n- Nuevo script `copy-view-assets` para copiar JS a `dist/extension`.\n@@\n ### Decisiones técnicas\n-- (Decisiones clave y justificación)\n+- JS externo por view para separación HTML/JS.\n@@\n ### Evidencia\n-- (Logs, capturas, tests ejecutados)\n+- `npm run compile` OK.\n@@\n ### Desviaciones del objetivo\n-- (Si las hay, justificación)\n+- Ninguna.

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
