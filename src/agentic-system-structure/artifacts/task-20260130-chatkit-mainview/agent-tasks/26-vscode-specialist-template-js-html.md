---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: completed
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
task_number: 26
---

🧩 **vscode-specialist**: Migrar HTML externo a módulos JS/TS de template por vista.

# Agent Task — 26-vscode-specialist-template-js-html

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Reemplazar HTML en ficheros `.html` por módulos `.js`/`.ts` dedicados que exporten el template por vista, y cargarlo desde los providers.
- **Alcance**: `src/extension/views/**` y `dist/extension/views/**` si aplica; no tocar fuera de extensión.
- **Dependencias**: `constitution.external_html` actualizada; JS externo ya implementado.

---

## Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.
> Documentar el razonamiento mejora la calidad y permite detectar errores temprano.

### Análisis del objetivo
- Convertir los HTML externos a módulos JS/TS dedicados que exporten el template.
- Dependencia directa: constitución actualizada permite templates en JS/TS.

### Opciones consideradas
- **Opción A**: Módulos `.ts` por vista que exportan el HTML (ej. `chat-view.template.ts`).
- **Opción B**: Módulos `.js` en `dist` generados por build.

### Decisión tomada
- Opción elegida: A.
- Justificación: mantener el source en `src` y compilar con `tsc`.

---

## Output (REQUIRED)
- **Entregables**:
  - Templates HTML exportados por módulo para cada view.
  - Providers ajustados para cargar desde módulo en lugar de `.html`.
  - Build actualizado si es necesario para copiar templates.
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

> Esta sección la completa el agente asignado durante la ejecución.

### Cambios realizados
- Añadidos templates por view en `src/extension/views/*/*-view.template.ts`.
- Los providers ahora renderizan HTML desde los templates en TS.
- Eliminados HTML externos en `src/extension/views/*/web/*.html`.
- Eliminado `HtmlLoader` por no ser necesario.

### Decisiones técnicas
- Templates en TypeScript para mantener tipado y control de tokens.
- Clase base `ViewTemplate` para reemplazo de placeholders.

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
    decision: SI
    date: 2026-01-31T00:00:00Z
    comments: "Aprobado."
```

---

## Reglas contractuales

1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
2. Si Gate FAIL (`decision: NO`):
   - El arquitecto define acciones correctivas.
   - Se genera una nueva tarea de corrección si procede.
3. El agente asignado **NO puede modificar** el Input ni el Output definidos por el arquitecto.
4. El Gate es **síncrono y bloqueante**: el flujo se detiene hasta obtener respuesta del desarrollador.
