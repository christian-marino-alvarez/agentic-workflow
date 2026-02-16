---
id: workflow.tasklifecycle-long.phase-7-evaluation
description: Fase 7 del ciclo de tarea. Evalua la participacion de los agentes y la ejecucion de la tarea con puntuaciones objetivas.
owner: architect-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["phase7", "phase-7", "evaluation", "scoring"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-7-evaluation

## Input (REQUIRED)
- Existe el informe de implementacion por agente (si aplica):
  - `.agent/artifacts/<taskId>-<taskTitle>/<agent>/subtask-implementation.md`
- Existe el informe de revision del arquitecto:
  - `.agent/artifacts/<taskId>-<taskTitle>/architect/review.md`
- Existe la current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- El `task.md` **DEBE** reflejar:
  - `task.phase.current == aliases.tasklifecycle-long.phases.phase_7.id`

> [!IMPORTANT]
> **Constitución activa (OBLIGATORIO)**:
> - Cargar `constitution.clean_code` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)

## Output (REQUIRED)
- Crear metricas de la tarea (por agente y global):
  - `.agent/artifacts/<taskId>-<taskTitle>/metrics.md`
- Registrar puntuaciones por agente:
  - `.agent/artifacts/<taskId>-<taskTitle>/agent-scores.md`
- Actualizacion del estado en:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objetivo (ONLY)
- Valorar objetivamente a cada agente participante.
- Evaluar la adecuacion del rol y la ejecucion de cada agente.

## Templates (OBLIGATORIOS)
- Metricas de tarea:
  - `templates.task_metrics`
- Metricas globales:
  - `templates.agent_scores`

---

## Pasos obligatorios

0. Activar `architect-agent` y usar prefijo obligatorio en cada mensaje.

1. Verificar inputs
   - Existe `task.md`
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_7.id`
   - Existe `architect/review.md`
   - Si aplica, existen subtasks por agente
   - Si falla → ir a **Paso 8 (FAIL)**.

2. Cargar templates
   - Cargar `templates.task_metrics` y `templates.agent_scores`
   - Si no existen o no se pueden leer → ir a **Paso 8 (FAIL)**.

3. Evaluar agentes
   - Para cada agente participante:
     - revisar su subtask e informe de review
     - asignar puntuacion (0-10)
     - justificar la puntuacion

4. Calcular puntuacion global de la tarea
   - Promedio ponderado de agentes
   - Registrar en `metrics.md`

5. Registrar puntuaciones por agente
   - Actualizar `agent-scores.md` con el score de la tarea actual

6. Solicitar feedback y puntuación obligatoria del desarrollador (por consola)
   - Presentar `metrics.md` al usuario.
   - Solicitar confirmación explícita (SI/NO).
   - Solicitar puntuación del desarrollador (1-10) para CADA agente participante.
   - **GATE OBLIGATORIO**: Sin estas puntuaciones, la tarea NO puede cerrarse.
   - Si respuesta es NO → ir a **Paso 8 (FAIL)**.

7. PASS
   - Informar que la Fase 7 está completada correctamente.
   - Registrar validación en `metrics.md`.
   - El `architect-agent` **DEBE realizar explícitamente** las siguientes acciones:
     - Marcar la Fase 7 como completada en el `task.md`.
     - Establecer `task.lifecycle.phases.phase-7-evaluation.completed = true`.
     - Establecer `task.lifecycle.phases.phase-7-evaluation.validated_at = <ISO-8601>`.
     - Actualizar `task.phase.updated_at = <ISO-8601>`.
     - Actualizar el estado:
       - `task.phase.current = aliases.tasklifecycle-long.phases.phase_8.id`
   - Esta actualización **NO es automática** y **NO puede ser inferida**.
   - Hasta que este cambio no se refleje en el `task.md`, **no se puede iniciar la Fase 8**.
   - Indicar rutas:
     - `metrics.md`
     - `agent-scores.md`
     - `task.md` actualizado

---

## FAIL (OBLIGATORIO)

8. Declarar Fase 7 como **NO completada**
   - Casos de FAIL:
     - fase incorrecta
     - faltan informes requeridos
     - no se pudieron crear metricas
     - desarrollador rechaza la evaluación
   - Accion minima: corregir inputs y reintentar
   - Terminar bloqueado: no avanzar de fase.

---

## Gate (REQUIRED)

Requisitos (todos obligatorios):
1. Existe `.agent/artifacts/<taskId>-<taskTitle>/metrics.md`.
2. El `metrics.md` inicia con el prefijo del `architect-agent`.
3. `metrics.md` contiene la validación del desarrollador (`Aprobado: SI`).
4. `metrics.md` contiene la puntuación del desarrollador (0-5).
5. Existe `.agent/artifacts/<taskId>-<taskTitle>/agent-scores.md` actualizado.
6. `task.md` refleja:
   - Fase 7 completada
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_8.id`
   - `task.lifecycle.phases.phase-7-evaluation.completed == true`
   - `task.lifecycle.phases.phase-7-evaluation.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **Paso 8 (FAIL)**.
