---
id: workflow.tasklifecycle-short.short-phase-3-closure
description: Fase 3 del ciclo Short. Fusiona Verification + Results + Commit.
owner: architect-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["short-phase-3", "closure"]
blocking: true
---

# WORKFLOW: tasklifecycle-short.short-phase-3-closure

## Input (REQUIRED)
- Existe informe de implementación aprobado.
- task.md refleja `task.phase.current == "short-phase-3-closure"`

> [!IMPORTANT]
> **Constitución activa (OBLIGATORIO)**:
> - Cargar `constitution.clean_code` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)
> - Cargar `constitution.runtime_integration` para trazabilidad MCP

## Output (REQUIRED)
- Artefacto de cierre: `.agent/artifacts/<taskId>-<taskTitle>/closure.md`
- Commits realizados (si aplica).
- Task completado.

## Objetivo (ONLY)
- Verificar la implementación mediante tests (si aplica).
- Presentar resultados al desarrollador.
- Obtener aceptación final.
- Consolidar y realizar commit.

> Esta fase **NO implementa código nuevo**.  
> Esta fase **CIERRA el ciclo de la tarea**.

---

## Pasos obligatorios

0. Activar `architect-agent` y usar prefijo obligatorio en cada mensaje.

### 1. Protocolo de Validación Pre-Vuelo (OBLIGATORIO)
- El agente **DEBE** leer físicamente el informe de implementación aprobado: `.agent/artifacts/<taskId>-<taskTitle>/architect/implementation.md`.
- **Citar explícitamente** la decisión de aprobación (ej: "Estado: APROBADO").
- Si el informe no existe o no está aprobado, el proceso **DEBE** detenerse inmediatamente (FAIL).
- Verificar que la fase en `task.md` sea la correcta.

### 2. Ejecutar verificación
Si la tarea requiere tests:
- Ejecutar tests según `constitution.clean_code`.
- Documentar resultados.

Si no requiere tests:
- Documentar justificación.

### 3. Crear artefacto closure.md
- Usar template `templates.closure`.
- Incluir:
  - Resumen de verificación.
  - Estado de cada acceptance criteria (✅/❌).
  - Evidencia de tests (si aplica).

### 4. Presentar resultados al desarrollador
4.1 **Auditoría Pre-Gate (OBLIGATORIO)**:
- Antes de la aceptación final, el `architect-agent` **DEBE** usar `runtime.validate_gate` para el cierre de la tarea.
- El agente **DEBE** usar `debug_read_logs` para confirmar la verificación técnica y los commits (si aplica).
- Estrictamente **PROHIBIDO** consolidar este paso con la presentación de resultados.

### 6. Evaluar agentes (OBLIGATORIO)
- Solicitar puntuación (1-10) del desarrollador para cada agente que haya intervenido.
- **GATE OBLIGATORIO**: Sin puntuación, la tarea NO puede cerrarse.
- Registrar las puntuaciones en `closure.md`.

### 7. Consolidar commits
Si hay cambios de código:
- Preparar commits siguiendo Conventional Commits.
- Solicitar aprobación del desarrollador para push.

### 8. PASS
- Marcar tarea como **COMPLETADA**.
- Generar changelog (si aplica).
- Actualizar task.md con estado final.
  - Establecer `task.lifecycle.phases.short-phase-3-closure.validated_at = <ISO-8601>`.
  - Establecer `task.lifecycle.phases.short-phase-3-closure.runtime_validated = true`.
  - Establecer `task.lifecycle.phases.short-phase-3-closure.validation_id = <ID de runtime>`.
  - Actualizar `task.phase.updated_at = <ISO-8601>`.

---

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existe closure.md con template correcto.
2. El `closure.md` inicia con el prefijo del `architect-agent`.
3. Todos los acceptance criteria están marcados.
4. **Auditoría de Runtime**: El agente ha ejecutado `runtime.validate_gate` y el resultado es PASS.
5. **Trazabilidad de Logs**: Los logs (`debug_read_logs`) confirman el cierre y evaluación.
6. Existe aceptación final del desarrollador.
7. Se han registrado las puntuaciones de los agentes en `closure.md`.
8. Commits realizados (si aplica).
9. task.md refleja tarea completada y datos de validación de runtime.
10. task.md refleja timestamp y estado:
   - `task.lifecycle.phases.short-phase-3-closure.completed == true`
   - `task.lifecycle.phases.short-phase-3-closure.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Indicar qué requisito falta.
- Bloquear hasta resolver.
