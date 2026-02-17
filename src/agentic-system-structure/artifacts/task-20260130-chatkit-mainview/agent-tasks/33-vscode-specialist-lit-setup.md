---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: pending
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 33
---

🧩 **vscode-specialist**: Integrar Lit en Setup view (piloto).

# Agent Task — 33-vscode-specialist-lit-setup

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Integrar Lit en la view Setup como piloto, manteniendo CSP correcto.
- **Alcance**: `src/extension/views/key/**`, `package.json` (dependencia Lit), build si aplica.
- **Dependencias**: CSP con `webview.cspSource` y logging activo.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- Introducir Lit sin romper el flujo actual de setup.

### Opciones consideradas
- **Opción A**: Lit solo en Setup (piloto).
- **Opción B**: Lit en todas las views (más impacto).

### Decisión tomada
- Opción elegida: A.
- Justificación: menor riesgo y validación progresiva.

---

## Output (REQUIRED)
- **Entregables**:
  - Componente Lit para Setup (API key + log ping).
  - CSP actualizado si es necesario.
  - `npm run compile` OK.
- **Evidencia requerida**:
  - Logs AGW al cargar y usar el componente.

---

## Execution

```yaml
execution:
  agent: "vscode-specialist"
  status: pending | in-progress | completed | failed
  started_at: null
  completed_at: null
```

---

## Implementation Report

### Cambios realizados
- (Archivos modificados, funciones añadidas, etc.)

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
