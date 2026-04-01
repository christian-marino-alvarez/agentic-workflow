---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: in-progress
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 19
---

🧩 **vscode-specialist**: Setup visible siempre + focus chat + Test solo cuando ready.

# Agent Task — fix-19-vscode-specialist-setup-visible

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**:
  - Setup visible siempre como sección.
  - Tras guardar key, enfocar/expandir Chat y colapsar otras views si es posible.
  - Botón Test solo visible cuando ChatKit esté listo.
- **Alcance**: `package.json`, `src/extension/views/key/key-view.ts`, `src/extension/views/chat/chat-view.ts`.
- **Dependencias**: Router de views y context key existentes.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- Ajustar UX a flujo deseado con Setup permanente.

### Opciones consideradas
- **Opción A**: Quitar `when` de setup y usar comandos para enfocar view.
- **Opción B**: Mantener `when` y mostrar setup inline (no deseado).

### Decisión tomada
- Opción elegida: A.
- Justificación: Setup visible siempre y control de foco.

---

## Output (REQUIRED)
- **Entregables**:
  - Setup visible siempre.
  - Chat focus tras guardar key.
  - Botón Test visible solo cuando ready.
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
- `package.json`: setup visible siempre.\n- `key-view.ts`: enfocar chat al guardar key.\n- `chat-view.ts`: ocultar Test hasta Ready.\n@@\n ### Decisiones técnicas\n-- (Decisiones clave y justificación)\n+- Uso de `workbench.action.focusView` para expandir Chat.\n@@\n ### Evidencia\n-- (Logs, capturas, tests ejecutados)\n+- `npm run compile` OK.\n@@\n ### Desviaciones del objetivo\n-- (Si las hay, justificación)\n+- Colapsar otras views depende del estado del UI; se fuerza foco en Chat.

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
