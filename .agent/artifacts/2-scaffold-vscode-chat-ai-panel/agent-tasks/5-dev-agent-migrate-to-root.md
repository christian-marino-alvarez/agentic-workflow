---
artifact: agent_task
phase: phase-4-implementation
owner: dev-agent
status: pending
related_task: 2-scaffold-vscode-chat-ai-panel
task_number: 5
---

# Agent Task — 5-dev-agent-migrate-to-root

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Input (REQUIRED)
- **Objetivo**: Migrar extension al root con `package.json` unico y `src/`/`out/` en root.
- **Alcance**: Mover archivos desde `src/extension` al root, actualizar configs y eliminar entrypoint duplicado.
- **Dependencias**: Plan aprobado.

---

## Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.
> Documentar el razonamiento mejora la calidad y permite detectar errores temprano.

### Análisis del objetivo
- Se requiere que el Extension Host use el manifest del root.

### Opciones consideradas
- **Opción A**: Mover/duplicar archivos manteniendo root limpio.
- **Opción B**: Mantener subcarpeta y ajustar launch (descartado por alcance).

### Decisión tomada
- Opción elegida: A
- Justificación: Cumple alcance aprobado.

---

## Output (REQUIRED)
- **Entregables**:
  - `package.json`, `tsconfig.json`, `eslint.config.mjs`, `package-lock.json` en root con configuracion de extension.
  - `src/` y `out/` en root con codigo de extension.
  - `src/extension` eliminado como entrypoint activo.
- **Evidencia requerida**:
  - Diff de estructura y archivos movidos.

---

## Execution

```yaml
execution:
  agent: "dev-agent"
  status: pending
  started_at: null
  completed_at: null
```

---

## Implementation Report

> Esta sección la completa el agente asignado durante la ejecución.

### Cambios realizados
- (Archivos movidos, reemplazados, etc.)

### Decisiones técnicas
- (Justificaciones clave)

### Evidencia
- (Lista de archivos movidos, comandos ejecutados)

### Desviaciones del objetivo
- (Si las hay, justificación)

---

## Gate (REQUIRED)

El desarrollador **DEBE** aprobar esta tarea antes de continuar.

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
