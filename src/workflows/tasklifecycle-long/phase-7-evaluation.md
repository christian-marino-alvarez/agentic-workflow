---
id: workflow.tasklifecycle.phase-7-evaluation
description: Fase 7 del ciclo de tarea. Evalua la participacion de los agentes y la ejecucion de la tarea con puntuaciones objetivas.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["phase7", "phase-7", "evaluation", "scoring"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-7-evaluation

## Input (REQUIRED)
- Existe el informe de revision del arquitecto:
  - `.agent/artifacts/<taskId>-<taskTitle>/architect/review.md`
- Existe la current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- El `task.md` **DEBE** reflejar:
  - `task.phase.current == aliases.taskcycle-long.phases.phase_7.id`

> [!IMPORTANT]
> **Constitución activa (OBLIGATORIO)**:
> - Cargar `constitution.extensio_architecture` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)

## Output (REQUIRED)
- Crear metricas de la tarea (por agente y global):
  - `.agent/artifacts/<taskId>-<taskTitle>/metrics.md`
- Actualizacion del estado en `task.md`.

## Objetivo (ONLY)
- Valorar objetivamente a cada agente participante.
- Obtener aprobación (SI) del desarrollador para la evaluación.

## Templates (OBLIGATORIOS)
- Metricas de tarea: `templates.task_metrics`
- Metricas globales: `templates.agent_scores`

---

## Pasos obligatorios

0. **Activación de Rol y Prefijo (OBLIGATORIO)**
   - El `architect-agent` **DEBE** comenzar su intervención identificándose.
   - Mensaje: `🏛️ **architect-agent**: Iniciando Phase 7 - Evaluation.`

1. Verificar inputs (`task.md`, `review.md`).

2. Cargar templates y generar `metrics.md`.

3. Evaluar agentes y calcular puntuación global.

4. Solicitar feedback y puntuación obligatoria del desarrollador (por consola)
   - Presentar `metrics.md`.
   - Exigir confirmación explícita **SI**.
   - Registrar puntuación (1-10) en el artefacto.

5. PASS
   - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md` (usando prefijo).
   - Marcar fase completada y avanzar a Phase 8.

## FAIL (OBLIGATORIO)
9. Declarar Fase 7 como **NO completada**.
   - Terminar bloqueado: no avanzar de fase.

---

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existe `metrics.md` con validación `Aprobado: SI`.
2. `task.md` refleja timestamps y estado:
   - `task.phase.current == aliases.taskcycle-long.phases.phase_8.id`
   - `task.lifecycle.phases.phase-7-evaluation.completed == true`
   - `task.lifecycle.phases.phase-7-evaluation.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **FAIL**.
