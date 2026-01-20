---
id: workflow.tasklifecycle.phase-5-verification
description: Fase 5 del ciclo de tarea. Verifica la implementación con tests (unitarios y E2E si aplica) y reporta métricas y cobertura. NO corrige código; si hay errores, delega una nueva tarea de corrección al agente responsable.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["phase5", "phase-5", "verification", "verify"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-5-verification

## Input (REQUIRED)
- Existe el informe de revisión del arquitecto creado en Fase 4:
  - `.agent/artifacts/<taskId>-<taskTitle>/architect/review.md`
- Existe la current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- El `task.md` **DEBE** reflejar:
  - `task.phase.current == aliases.taskcycle-long.phases.phase_5.id`

> [!IMPORTANT]
> **Constitución activa (OBLIGATORIO)**:
> - Cargar `constitution.extensio_architecture` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)

## Output (REQUIRED)
- Informe detallado de verificación y testing:
  - `.agent/artifacts/<taskId>-<taskTitle>/verification.md`
- Actualización del estado en:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objetivo (ONLY)
- Verificar la implementación mediante tests (unitarios y E2E si aplica).
- Obtener aprobación explícita del desarrollador (SI) para avanzar.

## Pasos obligatorios

0. **Activación de Rol y Prefijo (OBLIGATORIO)**
   - El `architect-agent` **DEBE** comenzar su intervención identificándose.
   - Mensaje: `🏛️ **architect-agent**: Iniciando Phase 5 - Verification.`

1. Asignar rol de verificacion
   - El `qa-agent` **DEBE** ejecutar esta fase.
   - Mensaje: `🧪 **qa-agent**: Iniciando verificación técnica...`

2. Verificar inputs
   - Existe `architect/review.md`.
   - `task.phase.current == aliases.taskcycle-long.phases.phase_5.id`.

3. Cargar template de verificación (`templates.verification`).

4. Ejecutar testing y crear informe (`verification.md`).

5. Solicitar aprobación del desarrollador (OBLIGATORIA, por consola)
   - Exigir decisión binaria **SI**.
   - Registrar en `verification.md`: `decision: SI`.

6. PASS
   - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md` (usando prefijo):
     - marcar Fase 5 como completada
     - establecer timestamps y avanzar a Phase 6.

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existe `verification.md` con Gate PASS (`decision: SI`).
2. `task.md` refleja timestamps y estado:
   - `task.phase.current == aliases.taskcycle-long.phases.phase_6.id`
   - `task.lifecycle.phases.phase-5-verification.completed == true`
   - `task.lifecycle.phases.phase-5-verification.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **FAIL**.
