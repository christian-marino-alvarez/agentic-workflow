---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: in-progress
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 9
---

🧩 **vscode-specialist**: Mostrar botón de API key según SecretStorage.

# Agent Task — fix-9-vscode-specialist-api-key-state

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Validar existencia de API key en SecretStorage y avisar a la webview para mostrar el botón si falta.
- **Alcance**: `src/extension/views/main-view.ts` únicamente.
- **Dependencias**: Comando de API key y webview ya implementados.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- Debemos consultar la key desde el extension host y notificar a la webview.

### Opciones consideradas
- **Opción A**: Mensaje `api-key-missing` en `resolveWebviewView`.
- **Opción B**: Continuar con `fetch` al backend.

### Decisión tomada
- Opción elegida: A.
- Justificación: No depende de networking ni eventos del componente.

---

## Output (REQUIRED)
- **Entregables**:
  - Enviar mensaje inicial `api-key-missing` / `api-key-present`.
  - Webview muestra/oculta aviso.
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
- `src/extension/views/main-view.ts`: envío de estado de API key desde extension host y renderizado del aviso en webview.

### Decisiones técnicas
- Se usa `context.secrets.get` para estado real sin depender de red.

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
