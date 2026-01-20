---
id: workflow.tasklifecycle.phase-3-planning
description: Fase 3 del ciclo de tarea. Define el plan de implementación basado en el análisis previo, asigna responsabilidades por agente, detalla testing, demo, estimaciones y puntos críticos. Requiere aprobación explícita del desarrollador.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["phase3", "phase-3", "planning", "plan"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-3-planning

## Input (REQUIRED)
- Existe el artefacto de análisis creado en Fase 2:
  - `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`
- Existe la current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- El `task.md` **DEBE** reflejar:
  - `task.phase.current == aliases.taskcycle-long.phases.phase_3.id`

> [!IMPORTANT]
> **Constitución activa (OBLIGATORIO)**:
> - Cargar `constitution.extensio_architecture` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)

## Output (REQUIRED)
- Crear el plan de implementación:
  - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`
- Actualizar el estado en la current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objetivo (ONLY)
Crear un **plan de implementación detallado** para ejecutar el diseño definido en Fase 2, que:
- traduzca el análisis en pasos ejecutables
- asigne responsabilidades claras por agente e inyeccion de reglas
- defina cómo se validará la tarea (tests y verificaciones)

> Esta fase **NO implementa código**.  
> Esta fase **REQUIERE aprobación explícita y severa del desarrollador (SI / NO)**.

## Template (OBLIGATORIO)
- El plan **DEBE** crearse usando el template:
  - `templates.planning`
- Si el template no existe o no se puede cargar → **FAIL**.

---

## Pasos obligatorios

0. **Activación de Rol y Prefijo (OBLIGATORIO)**
   - El `architect-agent` **DEBE** comenzar su intervención identificándose.
   - Mensaje: `🏛️ **architect-agent**: Iniciando Phase 3 - Planning.`

1. Verificar inputs
   - Existe `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`
   - Existe `.agent/artifacts/<taskId>-<taskTitle>/task.md`
   - `task.phase.current == aliases.taskcycle-long.phases.phase_3.id`
   - Si falla → ir a **Paso 11 (FAIL)**.

2. Cargar template de planificación
   - Cargar `templates.planning`
   - Si no existe o no se puede leer → ir a **Paso 11 (FAIL)**.

3. Crear instancia del plan
   - Copiar el template a:
     - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`
   - Rellenar todas las secciones usando `analysis.md` como contrato.

4. Descomprimir tareas
   - Identificar cada subtarea necesaria.
   - Definir agente responsable.

5. Solicitar aprobación del desarrollador (OBLIGATORIO, por consola)
   - El desarrollador **DEBE** emitir una decisión binaria:
     - **SI** (aprobado)
     - **NO** (rechazado)
   - Registrar la decisión en `plan.md`:
     ```yaml
     approval:
       developer:
         decision: SI | NO
         date: <ISO-8601>
         comments: <opcional>
     ```
   - Si `decision != SI` → ir a **Paso 11 (FAIL)**.

6. PASS
   - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md` (usando prefijo):
     - marcar Fase 3 como completada
     - establecer `task.lifecycle.phases.phase-3-planning.validated_at = <ISO-8601>`
     - actualizar `task.phase.updated_at = <ISO-8601>`
     - avanzar `task.phase.current = aliases.taskcycle-long.phases.phase_4.id`

## FAIL (OBLIGATORIO)
10. Declarar Fase 3 como **NO completada**.
    - Indicar exactamente qué falló.
    - Terminar bloqueado: no avanzar de fase.

---

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existe `.agent/artifacts/<taskId>-<taskTitle>/plan.md`.
2. El plan sigue la estructura del template `templates.planning`.
3. Existe aprobación explícita del desarrollador registrada en `plan.md`:
   - `approval.developer.decision == SI`
4. `task.md` refleja timestamps y estado:
   - `task.phase.current == aliases.taskcycle-long.phases.phase_4.id`
   - `task.lifecycle.phases.phase-3-planning.completed == true`
   - `task.lifecycle.phases.phase-3-planning.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **Paso 10 (FAIL)**.
