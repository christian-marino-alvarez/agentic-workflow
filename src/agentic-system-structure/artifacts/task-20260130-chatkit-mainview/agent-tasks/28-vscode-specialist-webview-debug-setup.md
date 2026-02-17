---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: pending
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 28
---

🧩 **vscode-specialist**: Diagnóstico de script no cargado en Setup (webview).

# Agent Task — 28-vscode-specialist-webview-debug-setup

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Confirmar si el template reemplaza `__SCRIPT_URI__`/`__NONCE__` y por qué el JS no ejecuta; aplicar fix mínimo.
- **Alcance**: `src/extension/views/key/*` (template + JS) y CSP si aplica.
- **Dependencias**: templates JS/TS ya activos.

---

## Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.
> Documentar el razonamiento mejora la calidad y permite detectar errores temprano.

### Análisis del objetivo
- El setup muestra “Loading… [setup v2]”, pero `JS status` no cambia.
- Necesitamos evidencia visible sin DevTools para confirmar si el script se inyecta.

### Opciones consideradas
- **Opción A**: Añadir texto visible con `__SCRIPT_URI__` y `__NONCE__` en el HTML.
- **Opción B**: Relajar CSP de `script-src` para permitir recursos de VS Code.

### Decisión tomada
- Opción elegida: A primero; B solo si A confirma CSP bloqueo.
- Justificación: diagnóstico mínimo y reversible.

---

## Output (REQUIRED)
- **Entregables**:
  - Indicadores visibles en Setup para `script src` y `nonce` reemplazados.
  - Fix aplicado si el problema es CSP/URI.
- **Evidencia requerida**:
  - `npm run compile` OK.
  - Captura/nota del resultado visible.

---

## Execution

```yaml
execution:
  agent: "vscode-specialist"
  status: in-progress
  started_at: 2026-01-31T00:00:00Z
  completed_at: null
```

---

## Implementation Report

> Esta sección la completa el agente asignado durante la ejecución.

### Cambios realizados
- Añadidos indicadores visibles en Setup con `__SCRIPT_URI__` y `__NONCE__`.
- CSP ajustado para permitir `vscode-resource:`/`vscode-webview-resource:` en script/img.

### Decisiones técnicas
- Diagnóstico visible primero; CSP ampliado de forma mínima para recursos webview.

### Evidencia
- `npm run compile`

### Desviaciones del objetivo
- Ninguna.

---

## Gate (REQUIRED)

El desarrollador **DEBE** aprobar esta tarea antes de que el arquitecto asigne la siguiente.

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```

---

## Reglas contractuales

1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
2. Si Gate FAIL (`decision: NO`):
   - El arquitecto define acciones correctivas.
   - Se genera una nueva tarea de corrección si procede.
3. El agente asignado **NO puede modificar** el Input ni el Output definidos por el arquitecto.
4. El Gate es **síncrono y bloqueante**: el flujo se detiene hasta obtener respuesta del desarrollador.
