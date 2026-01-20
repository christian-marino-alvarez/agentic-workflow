---
id: workflow.tasklifecycle.phase-4-implementation
description: Fase 4 del ciclo de tarea. Ejecuta la implementación mediante delegación granular de tareas a agentes con Gate de aprobación del desarrollador por cada tarea. Solo avanza si todas las tareas han sido aprobadas.
owner: architect-agent
version: 3.1.0
severity: PERMANENT
trigger:
  commands: ["phase4", "phase-4", "implementation", "implement"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-4-implementation

## Input (REQUIRED)
- Existe el plan de implementación aprobado:
  - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`
- Existe la current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- El `task.md` **DEBE** reflejar:
  - `task.phase.current == aliases.taskcycle-long.phases.phase_4.id`

> [!IMPORTANT]
> **Constitución activa (OBLIGATORIO)**:
> - Cargar `constitution.extensio_architecture` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)

## Output (REQUIRED)
- Por **cada tarea de agente**:
  - `.agent/artifacts/<taskId>-<taskTitle>/agent-tasks/<N>-<agent>-<taskName>.md`
- Informe de revisión del arquitecto:
  - `.agent/artifacts/<taskId>-<taskTitle>/architect/review.md`
- Actualización del estado en:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objetivo (ONLY)
- Ejecutar **todas las tareas de implementación** definidas en el plan aprobado mediante **delegación granular**.
- Cada tarea requiere **aprobación explícita del desarrollador** (SI).

---

## Pasos obligatorios

0. **Activación de Rol y Prefijo (OBLIGATORIO)**
   - El `architect-agent` **DEBE** comenzar su intervención identificándose.
   - Mensaje: `🏛️ **architect-agent**: Iniciando Phase 4 - Implementation.`

1. Verificar inputs
   - Existe `plan.md` aprobado.
   - `task.phase.current == aliases.taskcycle-long.phases.phase_4.id`.

2. Extraer tareas del plan
   - Leer `plan.md`.
   - Crear el directorio: `.agent/artifacts/<taskId>-<taskTitle>/agent-tasks/`

3. Bucle de delegación (SÍNCRONO - Protocolo AHRP)
   Para cada tarea `N`:
   3.1 **Preparación**: Crear fichero de tarea usando `templates.agent_task`. El estado inicial es `blocked`.
   3.2 **Asignación**: El `architect-agent` presenta la tarea.
   3.3 **Gate A (Activación)**: El agente asignado debe esperar a que el desarrollador firme con `decision: SI` en el bloque de activación. 
       - **PROHIBIDO**: El agente no puede usar herramientas hasta el Gate A PASS.
   3.4 **Gate B (Reasoning)**: Una vez activado, el agente debe presentar su `Reasoning`.
       - El desarrollador debe firmar el razonamiento con `decision: SI`.
       - **PROHIBIDO**: El agente no puede modificar código hasta el Gate B PASS.
   3.5 **Ejecución**: El agente desarrolla la tarea siguiendo el plan aprobado.
   3.6 **Gate C (Resultados)**: El desarrollador valida el resultado final con `decision: SI`.
   3.7 **Cierre**: Si todos los gates son PASS, marcar como `completed` y actualizar `task.md`.

4. Consolidación de implementación
   - Verificar que todas las tareas han cumplido el protocolo AHRP (A, B y C).

5. Crear informe de revisión arquitectónica (OBLIGATORIO)
   - Crear: `.agent/artifacts/<taskId>-<taskTitle>/architect/review.md` (usando `templates.review`).

6. Gate final del desarrollador (OBLIGATORIO, por consola)
   - Confirmación global con **SI**.
   - Registrar en `architect/review.md`: `decision: SI`.

7. PASS
   - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md` (usando prefijo):
     - marcar Fase 4 como completada
     - establecer `task.lifecycle.phases.phase-4-implementation.validated_at = <ISO-8601>`
     - actualizar `task.phase.updated_at = <ISO-8601>`
     - avanzar a Phase 5.

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Todas las tareas tienen Gate PASS (`approval.developer.decision == SI`).
2. Existe `architect/review.md` con Gate final PASS (SI).
3. `task.md` refleja timestamps y estado:
   - `task.phase.current == aliases.taskcycle-long.phases.phase_5.id`
   - `task.lifecycle.phases.phase-4-implementation.completed == true`
   - `task.lifecycle.phases.phase-4-implementation.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **FAIL**.
