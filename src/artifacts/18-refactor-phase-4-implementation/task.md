# Task

## Identificación
- id: 18
- title: refactor-phase-4-implementation
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init
  - candidate_path: .agent/artifacts/candidate/task.md

## Descripción de la tarea
Refactorización de la Fase 4 (Implementación) del ciclo de vida de tareas. Cambiar el modelo de implementación monolítico a un modelo de delegación donde cada tarea de agente es un workflow independiente con gate de aprobación del desarrollador.

## Objetivo
1. Redefinir la Fase 4 para que el arquitecto asigne tareas granulares a los agentes.
2. Cada tarea de agente debe tener: input (objetivo definido por arquitecto), output (definido por arquitecto), gate (aprobación del desarrollador).
3. La Fase 4 termina cuando todas las tareas del plan han sido ejecutadas y aprobadas.
4. La Fase 5 valida técnicamente (tests) pero NO corrige; si hay error, se delega una nueva tarea al agente responsable.
5. Evaluar si el workflow `/refinement-delegation` es redundante con este nuevo modelo.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "18"
  title: "refactor-phase-4-implementation"
  strategy: "long"
  phase:
    current: "phase-1-research"
    validated_by: "architect-agent"
    updated_at: "2026-01-17T22:50:00+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-17T22:50:00+01:00"
      phase-1-research:
        completed: false
        validated_by: null
        validated_at: null
      phase-2-analysis:
        completed: false
        validated_by: null
        validated_at: null
      phase-3-planning:
        completed: false
        validated_by: null
        validated_at: null
      phase-4-implementation:
        completed: false
        validated_by: null
        validated_at: null
      phase-5-verification:
        completed: false
        validated_by: null
        validated_at: null
      phase-6-results-acceptance:
        completed: false
        validated_by: null
        validated_at: null
      phase-7-evaluation:
        completed: false
        validated_by: null
        validated_at: null
      phase-8-commit-push:
        completed: false
        validated_by: null
        validated_at: null
```

## 5 Preguntas Obligatorias (REQUERIDO - Phase 0)

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Deseas que cada tarea de agente sea un fichero `.md` independiente o secciones dentro de un artefacto de coordinación? | Sea un fichero independiente |
| 2 | El Gate de revisión del desarrollador, ¿debe ser aprobación formal (SI/NO) en YAML o validación de código? | El mismo formato que los gate de workflows que tenemos así como el propio formato de workflow |
| 3 | ¿La Fase 6 debe convertirse en "consolidador de aprobaciones" o mantenerse como cierre final? | Mantener la Fase 4 pero su gate será la realización de todas las tareas definidas en la planificación y que el desarrollador las haya aceptado, con una última gate de confirmación global. El output es la ejecución de todas las tareas del plan. |
| 4 | Si apruebas cada tarea en Fase 4, ¿cómo afecta a la Fase 5 (Verificación)? | La Fase 5 es de testeo y validación. Si existe tarea de test se valida aquí pero NUNCA se arregla código. Se notifica el error y se resuelve por el agente responsable mediante un workflow de tarea específica para esa issue. |
| 5 | ¿Crees que el nuevo modelo granular de Fase 4 cubre las iteraciones, eliminando `/refinement-delegation`? | Analiza si hace falta |

---

## Acceptance Criteria (OBLIGATORIO PARA CURRENT TASK)

1. **Alcance**:
   - Modificar `phase-4-implementation.md` para soportar delegación granular.
   - Crear template `agent-task.md` para las tareas individuales de agente.
   - Ajustar `phase-5-verification.md` para que notifique errores sin corregir.
   - Analizar redundancia de `refinement-delegation.md`.

2. **Entradas / Datos**:
   - Workflows actuales: `phase-4-implementation.md`, `phase-5-verification.md`, `phase-6-results-acceptance.md`
   - Template actual: `subtask-implementation.md`
   - Workflow de iteración: `refinement-delegation.md`

3. **Salidas / Resultado esperado**:
   - [ ] `phase-4-implementation.md` refactorizado con modelo de tareas granulares
   - [ ] Nuevo template `agent-task.md` con estructura de workflow (Input, Output, Gate)
   - [ ] `phase-5-verification.md` ajustado para notificar sin corregir
   - [ ] Decisión documentada sobre eliminación/conservación de `refinement-delegation.md`
   - [ ] Actualización del índice de workflows si procede

4. **Restricciones**:
   - Cada tarea de agente DEBE ser un fichero `.md` independiente.
   - El Gate de cada tarea DEBE seguir el formato de gates de workflow.
   - La Fase 5 NO puede modificar código; solo notifica errores.
   - Se DEBE mantener compatibilidad con el ciclo Long existente.

5. **Criterio de aceptación (Done)**:
   - [ ] AC1: `phase-4-implementation.md` usa modelo de tareas granulares con ficheros independientes
   - [ ] AC2: Existe template `agent-task.md` con Input/Output/Gate en formato workflow
   - [ ] AC3: `phase-5-verification.md` notifica errores y delega correcciones
   - [ ] AC4: Análisis documentado sobre `refinement-delegation.md` con decisión
   - [ ] AC5: Tests de estructura de workflows validan los nuevos artefactos

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-17T22:50:00+01:00"
    notes: "Gate PASS. 5 preguntas respondidas y acceptance criteria definidos."
    notes: "5 preguntas respondidas. Acceptance criteria definidos."
```

## Reglas contractuales
- Este fichero es la **fuente única de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- El campo `task.lifecycle.phases.*` **SOLO puede ser marcado como completed por `architect-agent`**.
- Una fase **NO puede marcarse como completed** si no es la fase actual.
- El avance de fase requiere:
  1. Marcar la fase actual como `completed: true`
  2. Validación explícita del architect
  3. Actualización de `task.phase.current` a la siguiente fase
