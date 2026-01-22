---
id: workflow.tasklifecycle.phase-2-analysis
description: Fase 2 del ciclo de tarea. Analisis profundo basado en la investigacion previa, cubre acceptance criteria y define agentes, responsabilidades e impacto. Requiere aprobacion del desarrollador.
owner: architect-agent
version: 1.0.0
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
- respete la arquitectura de Extensio y sus rules
- analice el estado real del proyecto (estructura, drivers, core, modulos activos)
- integre la investigacion aprobada de Fase 1
- defina agentes, subareas e impacto de la tarea
- identifique si la tarea requiere crear, modificar o eliminar componentes del sistema
- identificar si la tarea requiere crear una demo y su impacto estructural
- sirva como **input contractual** para la Fase 3 (Planning)

> Esta fase **NO implementa codigo**.  
> Esta fase **NO planifica ejecucion detallada**.  
> Esta fase **REQUIERE aprobacion explicita del desarrollador**.

## Template (OBLIGATORIO)
- El informe **DEBE** crearse usando el template:
  - `templates.analysis`
- El template **NO DEBE** modificarse.
- Si el template no existe o no se puede cargar → **FAIL**.

## Pasos obligatorios
0. Activar `architect-agent` y usar prefijo obligatorio en cada mensaje.
1. Verificar inputs
   - Existe `.agent/artifacts/<taskId>-<taskTitle>/task.md`
   - Existe `.agent/artifacts/<taskId>-<taskTitle>/researcher/research.md`
   - `task.phase.current == aliases.taskcycle-long.phases.phase_2.id`
   - El `task.md` contiene acceptance criteria definidos
   - El research esta aprobado por el desarrollador (SI)
   - Si falla → ir a **Paso 10 (FAIL)**.

2. Cargar template de analysis
   - Cargar `templates.analysis`
   - Si no existe o no se puede leer → ir a **Paso 10 (FAIL)**.

3. Crear instancia de analysis
   - Copiar el template a:
     - `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`
   - Rellenar secciones segun la tarea concreta.

4. Analizar estado del proyecto e historial de agentes
   - Revisar estructura, drivers, core y tareas previas.
   - **OBLIGATORIO**: Leer `.agent/metrics/agents.json` para conocer el desempeño de los agentes propuestos.
   - Si un agente tiene tendencia negativa o media baja, DEBE proponerse una mejora en su comportamiento o reglas.
   - Documentar hallazgos en `analysis.md`.

5. Integrar investigacion aprobada
   - Basar alternativas, riesgos y compatibilidad en `research.md`.
   - Complementar con analisis arquitectonico propio.

5.5 **Consultar TODO backlog (OBLIGATORIO)**
   - Leer `.agent/todo/` para identificar mejoras pendientes.
   - Evaluar si algún item del backlog impacta en la tarea actual.
   - Documentar en `analysis.md` sección "TODO Backlog".
   - Si el directorio está vacío, indicar "Ningún item pendiente".

6. Cobertura de acceptance criteria
   - Mapear **cada acceptance criteria** a su analisis, verificacion y riesgos.

7. Definir agentes y subareas
   - Enumerar agentes necesarios.
   - Definir responsabilidades y handoffs.
   - Identificar si se requiere crear, modificar o eliminar componentes:
     - drivers
     - modulos
     - otros artefactos o integraciones relevantes
   - Identificar si se requiere crear demo:
     - justificar la necesidad
     - impacto en estructura Extensio

8. Solicitar aprobacion del desarrollador (OBLIGATORIO, por consola)
   - El desarrollador **DEBE** emitir una decision binaria:
     - **SI** (aprobado)
     - **NO** (rechazado)
   - La decision **DEBE** registrarse en `analysis.md` con el formato:
     ```yaml
     approval:
       developer:
         decision: SI | NO
         date: <ISO-8601>
         comments: <opcional>
     ```
   - Si `decision != SI` → ir a **Paso 10 (FAIL)**.

9. PASS
   - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md`:
     - marcar Fase 2 como completada
     - establecer `task.lifecycle.phases.phase-2-analysis.validated_at = <ISO-8601>`
     - actualizar `task.phase.updated_at = <ISO-8601>`
     - avanzar `task.phase.current = aliases.taskcycle-long.phases.phase_3.id`
   - Indicar rutas:
     - `analysis.md`
     - `task.md` actualizado

## FAIL (OBLIGATORIO)
10. Declarar Fase 2 como **NO completada**
    - Indicar exactamente que fallo:
      - task inexistente
      - fase incorrecta
      - research inexistente o no aprobado
      - template inexistente
      - fallo al crear `analysis.md`
      - aprobacion del desarrollador = NO o inexistente
    - Pedir la accion minima para solventar
    - Terminar bloqueado: no avanzar de fase.

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existe `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`.
2. El fichero sigue la estructura del template `templates.analysis`.
3. El `analysis.md` inicia con el prefijo del `architect-agent`.
4. Cubre todos los acceptance criteria del `task.md`.
5. Existe aprobacion explicita del desarrollador:
   - `approval.developer.decision == SI`
6. `task.md` refleja:
   - Fase 2 completada
   - `task.phase.current == aliases.taskcycle-long.phases.phase_3.id`
   - `task.lifecycle.phases.phase-2-analysis.completed == true`
   - `task.lifecycle.phases.phase-2-analysis.validated_at` no nulo
   - `task.phase.updated_at` no nulo
7. El análisis incluye sección "TODO Backlog" con consulta a `.agent/todo/`.

Si Gate FAIL:
- Ejecutar **Paso 10 (FAIL)**.
