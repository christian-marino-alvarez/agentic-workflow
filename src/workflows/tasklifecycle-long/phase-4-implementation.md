---
id: workflow.tasklifecycle.phase-4-implementation
description: Fase 4 del ciclo de tarea. Ejecuta la implementación mediante delegación granular de tareas a agentes con Gate de aprobación del desarrollador por cada tarea. Solo avanza si todas las tareas han sido aprobadas.
owner: architect-agent
version: 3.0.0
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
> - Cargar `constitution.clean_code` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)
> - Cargar constituciones específicas del dominio según la tarea

## Output (REQUIRED)
- Por **cada tarea de agente**:
  - `.agent/artifacts/<taskId>-<taskTitle>/agent-tasks/<N>-<agent>-<taskName>.md`
- Informe de revisión del arquitecto:
  - `.agent/artifacts/<taskId>-<taskTitle>/architect/review.md`
- Actualización del estado en:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

---

## Objetivo (ONLY)
- Ejecutar **todas las tareas de implementación** definidas en el plan aprobado mediante **delegación granular**.
- Cada tarea es un **fichero independiente** con estructura Input/Output/Gate.
- Cada tarea requiere **aprobación explícita del desarrollador** (Gate síncrono) antes de asignar la siguiente.
- Generar un **informe de revisión arquitectónica obligatorio** consolidando todas las tareas.

> Esta fase **SÍ implementa código**.  
> Esta fase **NO redefine alcance ni planificación**.  
> Esta fase **NO puede avanzar sin Gate PASS en todas las tareas + confirmación global**.

---

## Templates (OBLIGATORIOS)
- Cada tarea de agente **DEBE** usar:
  - `templates.agent_task`
- El informe de revisión **DEBE** usar:
  - `templates.review`
- Si algún template no existe o no se puede cargar → **FAIL**.

---

## Pasos obligatorios
0. Activar `architect-agent` y usar prefijo obligatorio en cada mensaje.

### 1. Verificar inputs
- Existe `plan.md` aprobado.
- Existe `task.md`.
- `task.phase.current == aliases.taskcycle-long.phases.phase_4.id`.
- Si falla → ir a **Paso 10 (FAIL)**.

### 2. Extraer tareas del plan
- Leer `plan.md`.
- Identificar todas las tareas de implementación y sus agentes responsables.
- Crear (si no existe) el directorio:
  - `.agent/artifacts/<taskId>-<taskTitle>/agent-tasks/`

### 3. Bucle de delegación (SÍNCRONO)

Para cada tarea `N` en el plan:

#### 3.1 Crear fichero de tarea
- Crear fichero usando `templates.agent_task`:
  - `.agent/artifacts/<taskId>-<taskTitle>/agent-tasks/<N>-<agent>-<taskName>.md`
- Completar:
  - **Input**: Objetivo, Alcance, Dependencias (definidos por el arquitecto)
  - **Output**: Entregables, Evidencia requerida (definidos por el arquitecto)

#### 3.2 Asignar al agente
- El `architect-agent` **DEBE** activar al agente correspondiente:
  - `qa-agent`, `researcher-agent` u otros roles definidos.
- El agente ejecuta la tarea y completa la sección "Implementation Report" del fichero.

#### 3.3 Presentar al desarrollador
- El `architect-agent` **DEBE** presentar la tarea completada al desarrollador.
- Solicitar Gate por consola: **SI / NO**.

#### 3.4 Registrar Gate
- Actualizar el fichero de la tarea con la decisión:
  ```yaml
  approval:
    developer:
      decision: SI | NO
      date: <ISO-8601>
      comments: <opcional>
  ```

#### 3.5 Evaluar Gate
- Si `decision == SI`:
  - Marcar tarea como `completed`.
  - Continuar con la siguiente tarea (N+1).
- Si `decision == NO`:
  - Marcar tarea como `failed`.
  - Definir acciones correctivas.
  - Crear nueva tarea de corrección si procede.
  - **NO avanzar** hasta resolver.

### 4. Consolidación de implementación
- El `architect-agent` revisa:
  - Todas las tareas completadas y aprobadas.
  - Coherencia entre tareas.
  - Alineación con el plan aprobado.
  - Respeto a reglas de arquitectura y clean code.

### 5. Crear informe de revisión arquitectónica (OBLIGATORIO)
- Crear:
  - `.agent/artifacts/<taskId>-<taskTitle>/architect/review.md`
- El informe **DEBE**:
  - Usar el template `templates.review`.
  - Listar todas las tareas y su estado de Gate.
  - Indicar cumplimiento o desviación del plan.
  - Listar problemas detectados (si existen).

### 6. Gate final del desarrollador (OBLIGATORIO, por consola)
- Solicitar confirmación global:
  - "Todas las tareas han sido ejecutadas y aprobadas. ¿Confirmas que la Fase 4 está completa? (SI/NO)"
- Registrar en `architect/review.md`:
  ```yaml
  final_approval:
    developer:
      decision: SI | NO
      date: <ISO-8601>
      comments: <opcional>
  ```
- Si `decision != SI` → ir a **Paso 10 (FAIL)**.

### 7. PASS (solo si Gate final aprobado)
- El `architect-agent` **DEBE**:
  - Marcar Fase 4 como completada en `task.md`.
  - Establecer `task.lifecycle.phases.phase-4-implementation.validated_at = <ISO-8601>`.
  - Actualizar `task.phase.updated_at = <ISO-8601>`.
  - Avanzar:
    - `task.phase.current = aliases.taskcycle-long.phases.phase_5.id`
- Indicar rutas:
  - Directorio `agent-tasks/`
  - `architect/review.md`

---

## FAIL (OBLIGATORIO)

### 10. Declarar Fase 4 como **NO completada**
Casos de FAIL:
- Plan inexistente o no aprobado.
- Fase incorrecta.
- Tarea de agente incompleta o rechazada.
- Gate de tarea individual = NO sin resolución.
- Gate final = NO.

Acciones obligatorias:
- Identificar la tarea fallida.
- Definir acciones correctivas.
- Crear nueva tarea de corrección si procede.
- Iterar hasta Gate PASS.

Terminar bloqueado: no avanzar de fase.

---

## Gate (REQUIRED)

Requisitos (todos obligatorios):
1. Existe una tarea de agente por cada paso del plan.
2. Todas las tareas tienen Gate PASS (`approval.developer.decision == SI`).
3. Existe `architect/review.md`.
4. El `architect/review.md` inicia con el prefijo del `architect-agent`.
5. Cada `agent-tasks/*.md` inicia con el prefijo del agente correspondiente.
6. El informe de revisión tiene Gate final PASS.
7. La implementación es coherente con el `plan.md`.
8. `task.md` refleja:
   - Fase 4 completada
   - `task.phase.current == aliases.taskcycle-long.phases.phase_5.id`
   - `task.lifecycle.phases.phase-4-implementation.completed == true`
   - `task.lifecycle.phases.phase-4-implementation.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **Paso 10 (FAIL)**.
