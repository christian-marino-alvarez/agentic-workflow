---
id: workflow.tasklifecycle.phase-2-analysis
description: Fase 2 del ciclo de tarea. Analisis profundo basado en la investigacion previa, cubre acceptance criteria y define agentes, responsabilidades e impacto. Requiere aprobacion del desarrollador.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["phase2", "phase-2", "analysis"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-2-analysis

## Input (REQUIRED)
- Existe la current task creada en Fase 0:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- Existe el informe de investigacion aprobado:
  - `.agent/artifacts/<taskId>-<taskTitle>/researcher/research.md`
- El `task.md` **DEBE** incluir:
  - descripcion
  - objetivo
  - acceptance criteria definidos
  - `task.phase.current == aliases.taskcycle-long.phases.phase_2.id`

> [!IMPORTANT]
> **Constitución activa (OBLIGATORIO)**:
> - Cargar `constitution.extensio_architecture` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)

## Output (REQUIRED)
- Crear el artefacto de analisis **a partir del template**:
  - `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`
- Actualizar el estado en la current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objetivo (ONLY)
Crear un informe de **analisis** profundo que:
- cubra **todos** los acceptance criteria del `task.md`
- respete la arquitectura del proyecto y sus reglas
- defina agentes, subareas e impacto de la tarea
- identifique si la tarea requiere crear, modificar o eliminar componentes del sistema
- sirva como **input contractual** para la Fase 3 (Planning)

> Esta fase **NO implementa codigo**.  
> Esta fase **NO planifica ejecucion detallada**.  
> Esta fase **REQUIERE aprobacion explicita del desarrollador**.

## Template (OBLIGATORIO)
- El informe **DEBE** crearse usando el template:
  - `templates.analysis`
- Si el template no existe o no se puede cargar → **FAIL**.

## Pasos obligatorios
0. **Activación de Rol y Prefijo (OBLIGATORIO)**
   - El `architect-agent` **DEBE** comenzar su intervención identificándose.
   - Mensaje: `🏛️ **architect-agent**: Iniciando Phase 2 - Analysis.`

1. Verificar inputs
   - Existe `.agent/artifacts/<taskId>-<taskTitle>/task.md`
   - Existe `.agent/artifacts/<taskId>-<taskTitle>/researcher/research.md`
   - `task.phase.current == aliases.taskcycle-long.phases.phase_2.id`
   - El research esta aprobado por el desarrollador (SI)
   - Si falla → ir a **Paso 10 (FAIL)**.

2. Cargar template de analysis
   - Cargar `templates.analysis`
   - Si no existe o no se puede leer → ir a **Paso 10 (FAIL)**.

3. Crear instancia de analysis
   - Copiar el template a:
     - `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`
   - Rellenar secciones segun la tarea concreta.

4. Analizar estado del proyecto
   - Revisar estructura, drivers, modulos y tareas previas si aplica.
   - Documentar hallazgos en `analysis.md`.

5. Integrar investigacion aprobada
   - Basar alternativas, riesgos y compatibilidad en `research.md`.

6. Cobertura de acceptance criteria
   - Mapear **cada acceptance criteria** a su analisis, verificacion y riesgos.

7. Definir agentes y subareas
   - Enumerar agentes necesarios.
   - Definir responsabilidades y handoffs.

8. Solicitar aprobacion del desarrollador (OBLIGATORIO, por consola)
   - El desarrollador **DEBE** emitir una decision binaria:
     - **SI** (aprobado)
     - **NO** (rechazado)
   - registrar en `analysis.md`:
     ```yaml
     approval:
       developer:
         decision: SI | NO
         date: <ISO-8601>
         comments: <opcional>
     ```
   - Si `decision != SI` → ir a **Paso 10 (FAIL)**.

9. PASS
   - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md` (usando prefijo):
     - marcar Fase 2 como completada
     - establecer `task.lifecycle.phases.phase-2-analysis.validated_at = <ISO-8601>`
     - actualizar `task.phase.updated_at = <ISO-8601>`
     - avanzar `task.phase.current = aliases.taskcycle-long.phases.phase_3.id`

## FAIL (OBLIGATORIO)
10. Declarar Fase 2 como **NO completada**.
    - Indicar exactamente que fallo.
    - Terminar bloqueado: no avanzar de fase.

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existe `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`.
2. El fichero sigue la estructura del template `templates.analysis`.
3. Cubre todos los acceptance criteria del `task.md`.
4. Existe aprobacion explicita del desarrollador registrada en `analysis.md`:
   - `approval.developer.decision == SI`
5. `task.md` refleja timestamps y estado:
   - `task.phase.current == aliases.taskcycle-long.phases.phase_3.id`
   - `task.lifecycle.phases.phase-2-analysis.completed == true`
   - `task.lifecycle.phases.phase-2-analysis.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **Paso 10 (FAIL)**.
