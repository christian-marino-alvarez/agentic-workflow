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
> - Cargar `constitution.runtime_integration` para trazabilidad MCP

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

6. Solicitar feedback y puntuación del desarrollador (OBLIGATORIA, por consola)
6.1 **Auditoría Pre-Gate (OBLIGATORIO)**:
- Antes de la evaluación del usuario, el `architect-agent` **DEBE** usar `runtime.validate_gate`.
- El agente **DEBE** usar `debug_read_logs` para confirmar el cálculo de métricas.
- Estrictamente **PROHIBIDO** consolidar este paso.

7. PASS
- Registrar validación en `metrics.md`.
- Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md`:
  - marcar Fase 7 como completada
  - establecer `task.lifecycle.phases.phase-7-evaluation.validated_at = <ISO-8601>`
  - establecer `task.lifecycle.phases.phase-7-evaluation.runtime_validated = true`
  - establecer `task.lifecycle.phases.phase-7-evaluation.validation_id = <ID de runtime>`
  - actualizar `task.phase.updated_at = <ISO-8601>`
  - llamar `runtime_advance_phase` despues de la aprobacion explicita del desarrollador.
  - actualizar `task.phase.current` con el `currentPhase` devuelto por el runtime (NO incrementar manualmente).

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
6. **Auditoría de Runtime**: El agente ha ejecutado `runtime.validate_gate` y el resultado es PASS.
7. **Trazabilidad de Logs**: Los logs (`debug_read_logs`) confirman la consolidación de métricas.
8. `metrics.md` contiene la puntuación del desarrollador.
9. `task.md` refleja fase completada y datos de validación de runtime.
10. `task.md` refleja timestamp y estado.

Si Gate FAIL:
- Ejecutar **Paso 8 (FAIL)**.
