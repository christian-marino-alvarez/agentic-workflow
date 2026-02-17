---
artifact: agent_task
phase: phase-4-implementation
owner: dev-agent
status: completed
related_task: 5-reestructurar-src-para-extension-vscode
task_number: 5
---

# Agent Task — 5-dev-agent-update-scripts

🧑‍💻 **dev-agent**: Actualización de scripts legacy.

## Input (REQUIRED)
- **Objetivo**: Actualizar los scripts en `scripts/` para que funcionen con la nueva estructura de carpetas (`src/agentic-system-structure`).
- **Alcance**:
  - `scripts/build-bootstrap-test.mjs`
  - `scripts/clean-dist.mjs`
  - Cualquier otro script en `scripts/` que haga referencia a `src/`.
- **Dependencias**: Tarea 1 completada (estructura nueva existe).
- **Verificación**: `src/rules`, `src/workflows` ya no existen en raíz, están en `src/agentic-system-structure`.

---

## Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.
> Documentar el razonamiento mejora la calidad y permite detectar errores temprano.

### Análisis del objetivo
- Los scripts antiguos buscan reglas y workflows en `src/rules`, etc. Ahora están en `.agent/rules`.
- Si no actualizamos esto, `npm run build` fallará o generará un `dist` incompleto.

### Opciones consideradas
- **Opción A**: Actualizar paths hardcodeados.
- **Opción B**: Crear symlinks (sucio para cross-platform).

### Decisión tomada
- Opción elegida: **Opción A**.
- Justificación: Solución limpia y permanente.

---

## Output (REQUIRED)
- **Entregables**:
  - Scripts en `scripts/` actualizados.
- **Evidencia requerida**:
  - `npm run build` completo y sin errores.
  - Verificación de que `dist` contiene `index.md` y subcarpetas.

---

## Execution

```yaml
execution:
  agent: "dev-agent"
  status: completed
  started_at: "2026-01-27T23:35:00+01:00"
  completed_at: "2026-01-27T23:37:30+01:00"
```

---

## Implementation Report

> Esta sección la completa el agente asignado durante la ejecución.

### Cambios realizados
- **DEPRECACIÓN DETECTADA**: El usuario indicó que `build-bootstrap-test.mjs` está obsoleto.
- **Acción Correctiva**:
  - Eliminado `scripts/build-bootstrap-test.mjs`.
  - Eliminada su invocación del script `build` en `package.json`.
- `scripts/clean-dist.mjs` se mantiene igual.
- `package.json` actualizado para apuntar a `src/agentic-system-structure` en `copy-assets`.

### Decisiones técnicas
- Eliminar código muerto (bootstrap) en lugar de mantenerlo roto o migrarlo innecesariamente.

### Evidencia
- `npm run build` exitoso (sin paso de bootstrap).
- `ls -R dist` correcto.

### Desviaciones del objetivo
- Eliminación de un script en lugar de su actualización, por instrucción expresa del usuario.

---

## Gate (REQUIRED)

El desarrollador **DEBE** aprobar esta tarea antes de que el arquitecto asigne la siguiente.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-27T23:38:15+01:00
    comments: Aprobado eliminación de script.
```

---

## Reglas contractuales

1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
2. Si Gate FAIL (`decision: NO`):
   - El arquitecto define acciones correctivas.
   - Se genera una nueva tarea de corrección si procede.
3. El agente asignado **NO puede modificar** el Input ni el Output definidos por el arquitecto.
4. El Gate es **síncrono y bloqueante**: el flujo se detiene hasta obtener respuesta del desarrollador.
