---
id: workflow.tasklifecycle.phase-6-results-acceptance
description: Fase 6 del ciclo de tarea. Presenta el informe final de resultados y requiere aceptación explícita del desarrollador (SI/NO).
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["phase6", "phase-6", "results", "acceptance"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-6-results-acceptance

## Input (REQUIRED)
- Existe el informe de verificación:
  - `.agent/artifacts/<taskId>-<taskTitle>/verification.md`
- Existe la current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- El `task.md` **DEBE** reflejar:
  - `task.phase.current == aliases.taskcycle-long.phases.phase_6.id`

> [!IMPORTANT]
> **Constitución activa (OBLIGATORIO)**:
> - Cargar `constitution.extensio_architecture` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)

## Output (REQUIRED)
- Crear el informe de aceptación de resultados:
  - `.agent/artifacts/<taskId>-<taskTitle>/results-acceptance.md`
- Decisión final del desarrollador (OBLIGATORIA): **SI / NO**
- Actualización del estado en `task.md`.

## Objetivo (ONLY)
- Presentar un **informe final de resultados** basado en la verificación.
- Obtener una **aceptación final explícita (SI)** por parte del desarrollador.

## Template (OBLIGATORIO)
- El informe **DEBE** crearse usando `templates.results_acceptance`.

---

## Pasos obligatorios

0. **Activación de Rol y Prefijo (OBLIGATORIO)**
   - El `architect-agent` **DEBE** comenzar su intervención identificándose.
   - Mensaje: `🏛️ **architect-agent**: Iniciando Phase 6 - Results Acceptance.`

1. Verificar inputs
   - Existe `verification.md` y `task.md`.

2. Cargar template y crear `results-acceptance.md`.

3. Solicitar aceptación final del desarrollador (OBLIGATORIA, por consola)
   - Exigir decisión binaria **SI**.
   - Registrar en `results-acceptance.md`: `decision: SI`.

4. PASS
   - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md` (usando prefijo).
   - Marcar fase completada y avanzar a Phase 7.

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existe `results-acceptance.md` con Gate PASS (`decision: SI`).
2. `task.md` refleja timestamps y estado:
   - `task.phase.current == aliases.taskcycle-long.phases.phase_7.id`
   - `task.lifecycle.phases.phase-6-results-acceptance.completed == true`
   - `task.lifecycle.phases.phase-6-results-acceptance.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **FAIL**.
