---
artifact: agent_task
phase: phase-4-implementation
owner: security-agent
status: pending
related_task: 9-secrets-management
task_number: 1
---

# Agent Task — 1-security-agent-environments

## Identificacion del agente (OBLIGATORIA)
<icono> **security-agent**: Implementando soporte multi-entorno en módulo de Seguridad.

## Input (REQUIRED)
- **Objetivo**: Implementar configuración global de entorno (DEV/PRO) y actualizar estructura de datos y UI para soportar claves por entorno.
- **Alcance**: 
  - `ExtensionConfigSchema`: Añadir `environment: 'dev' | 'pro'`.
  - `ModelConfig`: Añadir `environment`.
  - `SettingsStorage`: Implementar lógica de entorno.
  - UI `security`: Añadir selector de entorno global y reflejar cambio en lista de modelos.
- **Dependencias**: Ninguna.

---

## Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.

### Análisis del objetivo
- Se necesita diferenciar claves PRO de DEV.
- La forma más limpia es un toggle global en la UI que filtre qué modelos se ven/usan.
- Alternativamente, mostrar todos pero con tag.
- **Decisión**: Toggle global en la cabecera de la UI. "Environment: PRO | DEV".

### Opciones consideradas
- **Option A**: Toggle global. Simplifica la vista.
- **Option B**: Metadata en cada row. Ensucia la vista si hay muchos.

### Decisión tomada
- **Option A**.

---

## Output (REQUIRED)
- **Entregables**:
  - `src/extension/providers/base.ts`: Update Schema.
  - `security/background/settings-storage.ts`: `getEnvironment()`, `setEnvironment()`.
  - `security/web/security-view.js`: UI Toggle.
  - `security/background/background.ts`: Handle `ChangeEnvironment` message.
- **Evidencia requerida**:
  - Test unitario de `SettingsStorage` con entorno.
  - Screenshot/Log de la UI mostrando el toggle.

---

## Execution

```yaml
execution:
  agent: "security-agent"
  status: in_progress
  started_at: 2026-02-08T21:10:00Z
  completed_at: null
```

---

## Implementation Report

> Esta sección la completa el agente asignado durante la ejecución.

### Cambios realizados
...

### Decisiones técnicas
...

### Evidencia
...

### Desviaciones del objetivo
...

---

## Gate (REQUIRED)

> [!IMPORTANT]
> El desarrollador **DEBE** aprobar esta tarea antes de que el arquitecto asigne la siguiente.

```yaml
approval:
  developer:
    decision: PENDING
    date: null
    comments: null
```

---

## Reglas contractuales

1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
2. Si Gate FAIL (`decision: NO`):\n   - El arquitecto define acciones correctivas.\n   - Se genera una nueva tarea de corrección si procede.
3. El agente asignado **NO puede modificar** el Input ni el Output definidos por el arquitecto.
4. El Gate es **síncrono y bloqueante**: el flujo se detiene hasta obtener respuesta del desarrollador.
