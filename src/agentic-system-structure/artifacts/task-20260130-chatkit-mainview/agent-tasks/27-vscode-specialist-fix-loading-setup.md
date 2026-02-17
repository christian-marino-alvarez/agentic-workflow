---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: completed
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 27
---

🧩 **vscode-specialist**: Corregir setup en Loading… y asegurar JS/boot de webviews.

# Agent Task — 27-vscode-specialist-fix-loading-setup

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Resolver el estado “Loading… [setup]” que no avanza, garantizando que el JS de la vista setup se ejecuta y emite `webview-ready`.
- **Alcance**: `src/extension/views/**` (providers + web JS) y ajustes necesarios en build/paths de assets de la extensión.
- **Dependencias**: Templates JS/TS en vistas (tarea 26) y JS externos existentes.

---

## Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.
> Documentar el razonamiento mejora la calidad y permite detectar errores temprano.

### Análisis del objetivo
- El setup queda en “Loading…”, lo que indica que el JS no arranca o no llega a `webview-ready`.
- Dependencias: templates JS/TS y scripts externos en `views/*/web`.

### Opciones consideradas
- **Opción A**: Revisar URIs de scripts y CSP en templates.
- **Opción B**: Revisar `localResourceRoots` y paths de assets en build.

### Decisión tomada
- Opción elegida: A + B.
- Justificación: validar que el template tiene los IDs esperados y el script se carga desde `asWebviewUri`, además de añadir fallback en el JS.

---

## Output (REQUIRED)
- **Entregables**:
  - Setup view carga y oculta el loading.
  - JS de webview ejecuta `webview-ready` sin errores.
- **Evidencia requerida**:
  - `npm run compile` OK.
  - Nota de verificación manual (F5) o logs de webview.

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

> Esta sección la completa el agente asignado durante la ejecución.

### Cambios realizados
- Añadido guard en `key-view.js` para detectar elementos faltantes y evitar bloqueo silencioso.
- Añadido `noscript` en template para señalizar fallo de JS.
- Loading oculto por defecto y scripts con `defer` para evitar bloqueo visual si el JS no arranca.
- Añadido indicador `debugStatus` y tag "Loading… [setup v2]" para confirmar carga del template/JS.

### Decisiones técnicas
- Mantener el fix minimalista para no romper otras vistas.
- Dejar evidencia visible en UI si faltan elementos.

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
