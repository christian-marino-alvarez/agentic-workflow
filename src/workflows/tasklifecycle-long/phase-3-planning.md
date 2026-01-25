---
id: workflow.tasklifecycle-long.phase-3-planning
description: Fase 3 del ciclo de tarea. Define el plan de implementación basado en el análisis previo, asigna responsabilidades por agente, detalla testing, demo, estimaciones y puntos críticos. Requiere aprobación explícita del desarrollador.
owner: architect-agent
version: 1.0.0
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
> - Cargar `constitution.clean_code` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)

## Output (REQUIRED)
- Crear el plan de implementación:
  - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`
- Actualizar el estado en la current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objetivo (ONLY)
Crear un **plan de implementación detallado** para ejecutar el diseño definido en Fase 2, que:
- traduzca el análisis en pasos ejecutables
- asigne responsabilidades claras por agente y subárea
- defina cómo se validará la tarea (tests y verificaciones)
- describa la demo final (si aplica)
- estime pesos/esfuerzo de implementación
- explique cómo se resolverán los puntos críticos identificados

> Esta fase **NO implementa código**.  
> Esta fase **REQUIERE aprobación explícita y severa del desarrollador (SI / NO)**.

## Template (OBLIGATORIO)
- El plan **DEBE** crearse usando el template:
  - `templates.planning`
- El template **NO DEBE** modificarse.
- Si el template no existe o no se puede cargar → **FAIL**.

---

## Pasos obligatorios
0. Activar `architect-agent` y usar prefijo obligatorio en cada mensaje.

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

4. Definir pasos de implementación
   - Descomponer la tarea en pasos claros y ordenados.
   - Indicar dependencias y orden de ejecución.

5. Asignar responsabilidades
   - Para cada paso o subárea:
     - agente responsable
     - entregables esperados
   - Si el analisis requiere crear/modificar/eliminar componentes:
     - definir quien lo ejecuta (agente responsable)
     - definir COMO se hara
     - definir el tool o skill a usar por alias (si existe) y el motivo
   - Si el analisis requiere crear demo:
     - definir estructura esperada (alineada con `constitution.clean_code`)
   - Definir el dispatch de dominios (si aplica) en `plan.workflows.*`
   - Definir dispatch secundario (si aplica) en `plan.dispatch[]`

6. Estrategia de testing y validación
   - Definir tipos de tests:
     - unitarios
     - integración
     - end-to-end (si aplica)
   - Indicar tooling obligatorio según:
     - `constitution.clean_code`
   - Relacionar tests con acceptance criteria.

7. Plan de demo (si aplica)
   - Qué se mostrará
   - Cómo se validará frente al desarrollador/usuario

8. Estimación y puntos críticos
   - Estimar esfuerzo/peso por bloque
   - Identificar puntos críticos
   - Explicar cómo se resolverán

9. Solicitar aprobación del desarrollador (OBLIGATORIO, por consola)
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

10. PASS
    - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md`:
      - marcar Fase 3 como completada
      - establecer `task.lifecycle.phases.phase-3-planning.validated_at = <ISO-8601>`
      - actualizar `task.phase.updated_at = <ISO-8601>`
      - avanzar `task.phase.current = aliases.taskcycle-long.phases.phase_4.id`
    - Indicar rutas finales:
      - `plan.md`
      - `task.md` actualizado

---

## FAIL (OBLIGATORIO)

11. Declarar Fase 3 como **NO completada**
    - Indicar exactamente qué falló:
      - analysis.md inexistente
      - fase incorrecta
      - template de planning inexistente
      - fallo al crear `plan.md`
      - aprobación del desarrollador = NO o inexistente
    - Pedir la acción mínima:
      - completar Fase 2
      - corregir fase actual
      - corregir permisos/rutas
      - revisar el plan y reenviar para aprobación
    - Terminar bloqueado: no avanzar de fase.

---

## Gate (REQUIRED)

Requisitos (todos obligatorios):
1. Existe `.agent/artifacts/<taskId>-<taskTitle>/plan.md`.
2. El plan sigue la estructura del template `templates.planning`.
3. El `plan.md` inicia con el prefijo del `architect-agent`.
4. El plan es coherente con `analysis.md`.
5. Si el analisis requiere crear/modificar/eliminar componentes, el plan define:
   - responsable
   - como se implementa
   - mejor herramienta disponible (preferir tools declarados; si no existe, justificar alternativa)
   - tool elegido por alias y motivo
6. Si aplica, el plan define `plan.workflows.*` con el dispatch de dominios.
7. Si aplica, el plan define `plan.dispatch[]` con dispatch secundario.
8. Si el analisis requiere crear demo, el plan define:
   - estructura alineada con `constitution.clean_code`
9. Existe aprobación explícita del desarrollador:
   - `approval.developer.decision == SI`
10. `task.md` refleja:
   - Fase 3 completada
   - `task.phase.current == aliases.taskcycle-long.phases.phase_4.id`
   - `task.lifecycle.phases.phase-3-planning.completed == true`
   - `task.lifecycle.phases.phase-3-planning.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **Paso 11 (FAIL)**.
