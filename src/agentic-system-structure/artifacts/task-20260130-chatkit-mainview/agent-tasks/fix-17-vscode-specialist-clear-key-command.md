---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: in-progress
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 17
---

🧩 **vscode-specialist**: Añadir comando para borrar API key.

# Agent Task — fix-17-vscode-specialist-clear-key-command

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Crear comando “Agentic: Clear OpenAI API Key” que borre SecretStorage y actualice context key.
- **Alcance**: `src/extension/chatkit/openai-key-command.ts`, `package.json`, `src/extension/extension.ts`.
- **Dependencias**: API key command existente; context keys.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- Facilitar tests y resets del flujo setup.

### Opciones consideradas
- **Opción A**: Nuevo comando de borrado.
- **Opción B**: Manual vía storage (insuficiente).

### Decisión tomada
- Opción elegida: A.
- Justificación: UX directa para QA.

---

## Output (REQUIRED)
- **Entregables**:
  - Comando de borrado.
  - Actualización de context key.
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
- Nuevo comando `agenticWorkflow.clearOpenAIKey` para borrar SecretStorage.
- `package.json` actualizado con contribución y activationEvent.

### Decisiones técnicas
- Mantener comandos en `openai-key-command.ts` para centralizar gestión de key.

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
