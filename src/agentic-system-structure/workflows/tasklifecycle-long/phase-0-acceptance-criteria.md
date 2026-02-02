---
id: workflow.tasklifecycle-long.phase-0-acceptance-criteria
description: Convierte el task candidate en una tarea definitiva. El arquitecto define los acceptance criteria mediante 5 preguntas obligatorias basadas en la tarea y su objetivo, y crea el current task necesario para iniciar el ciclo de vida.
owner: architect-agent
version: 1.2.1
severity: PERMANENT
trigger:
  commands: ["phase0", "phase-0", "acceptance", "acceptance-criteria"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-0-acceptance-criteria

## Input (REQUIRED)
- Task candidate creado por `workflows.tasklifecycle-long`:
  - `artifacts.candidate.task`
- El `task.md` candidate **DEBE** incluir:
  - descripción de la tarea
  - objetivo de la tarea

> [!IMPORTANT]
> **Constitución activa (OBLIGATORIO)**:
> - Cargar `constitution.clean_code` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)

## Output (REQUIRED)
- Current task (definitiva) con acceptance criteria completos:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Template (OBLIGATORIO)
- La current task **DEBE** crearse usando el template:
  - `templates.task`
- Si el template no existe o no se puede cargar → **FAIL**.

## Objetivo (ONLY)
- Pasar de **task candidate** a **current task** (definitiva).
- **Calcular el `taskId` definitivo**.
- Definir acceptance criteria **obligatorios** a partir de 5 preguntas al desarrollador.
- Registrar los acceptance criteria dentro del fichero de current task.

## Pasos obligatorios
0. Activar `architect-agent` y usar prefijo obligatorio en cada mensaje.
1. Cargar y leer el task candidate:
   - `artifacts.candidate.task`
   - Extraer:
     - descripción de la tarea
     - objetivo de la tarea
   - Si faltan → ir a **Paso 10 (FAIL)**.

2. Cargar template contractual de task
   - Cargar `templates.task`
   - Si no existe o no se puede cargar → ir a **Paso 10 (FAIL)**.

3. **Calcular `taskId` (OBLIGATORIO – architect)**
   - El `architect-agent` **DEBE** ejecutar el siguiente comando:
     ```bash
     ls .agent/artifacts/ | grep -E "^[0-9]" | sort -n | tail -1 | cut -d'-' -f1
     ```
   - El output muestra el último taskId (ej: "8")
   - El nuevo `taskId = output + 1` (ej: si output es "8", nuevo taskId es "9")
   - Si no hay output (sin tareas previas) → `taskId = 1`
   - El valor final de `taskId` es **obligatorio** para continuar.

4. Definir `taskTitle` (architect)
   - Derivar `taskTitle` desde la solicitud del desarrollador (candidate).
   - Normalizar para filesystem:
     - minúsculas
     - espacios → `-`
     - sin caracteres especiales

5. Formular preguntas de clarificación (OBLIGATORIO, adaptativas a la tarea)
   - El `architect-agent` **DEBE** analizar:
     - `task.description`
     - `task.goal`
   - A partir de ese análisis, **DEBE formular exactamente 5 preguntas** cuyo objetivo sea:
     - eliminar ambigüedades
     - completar información faltante
     - permitir definir acceptance criteria verificables
   - Las preguntas:
     - **NO deben** duplicar información ya explícita
     - **DEBEN** estar directamente relacionadas con la tarea concreta
     - **PUEDEN** variar según el contexto de la tarea

6. Validar respuestas y cerrar definición (OBLIGATORIO)
   - Confirmar que las 5 preguntas formuladas tienen respuesta explícita.
   - A partir de las respuestas, el `architect-agent` **DEBE**:
     - consolidar una definición completa de la tarea
     - derivar acceptance criteria verificables
   - Si alguna respuesta falta o sigue existiendo ambigüedad → ir a **Paso 10 (FAIL)**.

7. Crear current task (OBLIGATORIO)
   - Crear el directorio de la tarea (si no existe):
     - `.agent/artifacts/<taskId>-<taskTitle>/`
   - Crear el fichero de estado:
     - `.agent/artifacts/<taskId>-<taskTitle>/task.md` (usando `templates.task`)
   - Crear el fichero de aceptación (NUEVO):
     - `.agent/artifacts/<taskId>-<taskTitle>/acceptance.md` (usando `templates.acceptance`)
   - El `task.md` **solo contendrá**:
     - metadatos (id, title, owner, strategy)
     - historial de fases
     - alias `task.acceptance` apuntando al nuevo fichero
   - El `acceptance.md` **contendrá**:
     - definición consolidada
     - las 5 respuestas detalladas
     - checklist de criterios verificables (AC)
   - Si no se puede crear/escribir → ir a **Paso 10 (FAIL)**.

8. Solicitar aprobacion del desarrollador (OBLIGATORIA, por consola)
   - El desarrollador **DEBE** aprobar explicitamente:
     - Acceptance criteria
     - Current task creada
   - Registrar la decision en `acceptance.md`:
     ```yaml
     approval:
       developer:
         decision: SI | NO
         date: <ISO-8601>
         comments: <opcional>
     ```
   - Si `decision != SI` → ir a **Paso 10 (FAIL)**.

9. PASS
   - Informar que la Fase 0 está completada correctamente.
   - El `architect-agent` **DEBE realizar explícitamente** las siguientes acciones:
    - Marcar la Fase 0 como completada en el `task.md`.
    - Establecer `task.lifecycle.phases.phase-0-acceptance-criteria.validated_at = <ISO-8601>`.
    - Actualizar `task.phase.updated_at = <ISO-8601>`.
    - Actualizar el estado:
      - `task.phase.current = aliases.tasklifecycle-long.phases.phase_1.id`
   - Esta actualización **NO es automática** y **NO puede ser inferida**.
   - Hasta que este cambio no se refleje en el `task.md`, **no se puede iniciar la Fase 1**.

10. FAIL (obligatorio)
   - Declarar Fase 0 como **NO completada**.
   - Indicar exactamente qué falló:
     - falta candidate
     - template inaccesible (`templates.task`)
     - falta descripción/objetivo
     - no se pudo calcular `taskId`
     - respuestas incompletas (menos de 5)
     - no se pudo crear current task
   - Pedir la acción mínima:
     - completar datos del candidate
     - responder preguntas faltantes
     - corregir permisos/rutas de artifacts
   - Terminar bloqueado: no avanzar de fase.

## Gate (REQUIRED)

Requisitos (todos obligatorios):
1. Existe el directorio y el fichero de estado:
   - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
2. Existe el artefacto de aceptación:
   - `.agent/artifacts/<taskId>-<taskTitle>/acceptance.md`
3. Ambos siguen sus respectivos templates.
4. El `acceptance.md` inicia con el prefijo del `architect-agent`.
5. El `taskId` es secuencial:
   - Ejecutar: `ls .agent/artifacts/ | grep -E "^[0-9]" | sort -n | tail -1 | cut -d'-' -f1`
   - El taskId del nuevo directorio debe ser exactamente `output + 1`
6. El current task incluye acceptance criteria completos y verificables.
7. Existe aprobacion explicita del desarrollador (por consola) registrada en `acceptance.md`:
   - `approval.developer.decision == SI`
8. El `architect-agent` ha marcado explícitamente:
   - la Fase 0 como completada
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_1.id`
9. `task.md` refleja timestamp y estado:
   - `task.lifecycle.phases.phase-0-acceptance-criteria.completed == true`
   - `task.lifecycle.phases.phase-0-acceptance-criteria.validated_at` no nulo
   - `task.phase.updated_at` no nulo
10. Las 5 preguntas obligatorias fueron realizadas y respondidas por el desarrollador.

Si Gate FAIL:
- Ejecutar **FAIL**.
