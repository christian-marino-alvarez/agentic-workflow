---
id: workflow.tasklifecycle-long.phase-6-results-acceptance
description: Fase 6 del ciclo de tarea. Presenta el informe final de resultados y requiere aceptación explícita del desarrollador (SI/NO).
owner: architect-agent
version: 1.0.0
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
  - `task.phase.current == aliases.tasklifecycle-long.phases.phase_6.id`

> [!IMPORTANT]
> **Constitución activa (OBLIGATORIO)**:
> - Cargar `constitution.clean_code` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)

## Output (REQUIRED)
- Crear el informe de aceptación de resultados:
  - `.agent/artifacts/<taskId>-<taskTitle>/results-acceptance.md`
- Decisión final del desarrollador (OBLIGATORIA):
  - **SI / NO**
- Actualización del estado en:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

---

## Objetivo (ONLY)
- Presentar un **informe final de resultados** basado en la verificación.
- Facilitar al desarrollador una **visión completa y clara** del trabajo realizado.
- Obtener una **aceptación final explícita (SI/NO)** por parte del desarrollador.

> Esta fase **NO implementa código**.  
> Esta fase **CIERRA la evaluación de resultados**.

---

## Template (OBLIGATORIO)
- El informe de resultados **DEBE** crearse usando el template:
  - `templates.results_acceptance`
- Si el template no existe o no se puede cargar → **FAIL**.

---

## Pasos obligatorios

0. Activar `architect-agent` y usar prefijo obligatorio en cada mensaje.

1. Verificar inputs
   - Existe `verification.md`
   - Existe `task.md`
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_6.id`
   - Si falla → ir a **Paso 10 (FAIL)**.

2. Cargar template de resultados
   - Cargar `templates.results_acceptance`
   - Si no existe o no se puede leer → ir a **Paso 10 (FAIL)**.

3. Crear informe de resultados
   - Crear:
     - `.agent/artifacts/<taskId>-<taskTitle>/results-acceptance.md`
   - El informe **DEBE** incluir:
     - resumen de verificación
     - estado final de acceptance criteria

4. Presentar resultados al desarrollador
   - El `architect-agent` **DEBE** presentar el informe `results-acceptance.md`.
   - Resolver dudas sin modificar alcance ni resultados documentados.

5. Solicitar aceptación final del desarrollador (OBLIGATORIA, por consola)
   - El desarrollador **DEBE** emitir una decisión binaria:
     - **SI** → acepta los resultados
     - **NO** → no acepta los resultados
   - Registrar la decisión en `results-acceptance.md`:
     ```yaml
     approval:
       developer:
         decision: SI | NO
         date: <ISO-8601>
         comments: <opcional>
     ```
   - Si `decision != SI` → ir a **Paso 10 (FAIL)**.

6. PASS (solo si aceptado)
   - Informar que la Fase 6 está completada correctamente.
   - Marcar el informe de resultados como **ACEPTADO**.
   - El `architect-agent` **DEBE realizar explícitamente** las siguientes acciones:
     - Marcar la Fase 6 como completada en el `task.md`.
     - Establecer `task.lifecycle.phases.phase-6-results-acceptance.completed = true`.
     - Establecer `task.lifecycle.phases.phase-6-results-acceptance.validated_at = <ISO-8601>`.
     - Actualizar `task.phase.updated_at = <ISO-8601>`.
     - Actualizar el estado:
       - `task.phase.current = aliases.tasklifecycle-long.phases.phase_7.id`
   - Esta actualización **NO es automática** y **NO puede ser inferida**.
   - Hasta que este cambio no se refleje en el `task.md`, **no se puede iniciar la Fase 7**.
   - Indicar rutas:
     - `results-acceptance.md`
     - `task.md` actualizado

---

## FAIL (OBLIGATORIO)

10. Declarar Fase 6 como **NO completada**
    - Casos de FAIL:
      - falta algún informe requerido
      - fase incorrecta
      - fallo al crear `results-acceptance.md`
      - aceptación del desarrollador = NO o inexistente
    - Acciones obligatorias:
      - analizar los incumplimientos indicados
      - **iterar para resolver issues detectados**
    - Terminar bloqueado: no avanzar de fase.

---

## Gate (REQUIRED)

Requisitos (todos obligatorios):
1. Existe `.agent/artifacts/<taskId>-<taskTitle>/results-acceptance.md`.
2. El informe resume verificación y estado final de acceptance criteria.
3. El `results-acceptance.md` inicia con el prefijo del `architect-agent`.
4. Todos los acceptance criteria están marcados como ✅ en el informe.
5. Existe aceptación final explícita del desarrollador (por consola):
   - `approval.developer.decision == SI`
6. `task.md` refleja:
  - Fase 6 completada
  - `task.phase.current == aliases.tasklifecycle-long.phases.phase_7.id`
  - `task.lifecycle.phases.phase-6-results-acceptance.completed == true`
  - `task.lifecycle.phases.phase-6-results-acceptance.validated_at` no nulo
  - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **Paso 10 (FAIL)**.
