# Task

## Identificación
- id: 6
- title: Exportar ciclo .agent a zip
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: .agent/artifacts/candidate/task.md

## Descripción de la tarea
Crear un zip que permita llevar a otro repositorio el ciclo de desarrollo AI definido en `.agent`.

## Objetivo
Empaquetar el scaffolding necesario para crear una nueva constitution fuera de la arquitectura de Extensio.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "6"
  title: "Exportar ciclo .agent a zip"
  phase:
    current: "completed"
    validated_by: "architect-agent"
    updated_at: "2026-01-07T08:19:20+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T08:19:20+01:00"
      phase-1-research:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T08:23:07+01:00"
      phase-2-analysis:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T08:25:47+01:00"
      phase-3-planning:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T08:27:35+01:00"
      phase-4-implementation:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T08:29:07+01:00"
      phase-5-verification:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T08:30:31+01:00"
      phase-6-results-acceptance:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T08:31:30+01:00"
      phase-7-evaluation:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T08:32:54+01:00"
      phase-8-commit-push:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T08:33:56+01:00"
```

## Acceptance Criteria (OBLIGATORIO PARA CURRENT TASK)
> Esta sección **DEBE** completarse en la Fase 0.

1. Alcance:
   - Incluir los ficheros necesarios de `.agent` para crear un scaffolding de un ciclo de desarrollo en una arquitectura nueva (no Extensio).

2. Entradas / Datos:
   - Directorio `.agent` actual (templates, rules, workflows, indices).

3. Salidas / Resultado esperado:
   - Zip `development-cycle` con el scaffolding necesario, sin artefactos de tareas.

4. Restricciones:
   - Excluir artefactos de tareas y contenido especifico de Extensio.

5. Criterio de aceptación (Done):
   - Zip generado y aprobado por el desarrollador.

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-07T08:19:20+01:00"
    notes: "Acceptance criteria definidos por el desarrollador"
  - phase: "phase-1-research"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-07T08:23:07+01:00"
    notes: "Research aprobado por el desarrollador"
  - phase: "phase-2-analysis"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-07T08:25:47+01:00"
    notes: "Analisis aprobado por el desarrollador"
  - phase: "phase-3-planning"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-07T08:27:35+01:00"
    notes: "Plan aprobado por el desarrollador"
  - phase: "phase-4-implementation"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-07T08:29:07+01:00"
    notes: "Implementacion completada y review arquitectonico aprobado"
  - phase: "phase-5-verification"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-07T08:30:31+01:00"
    notes: "Verificacion aprobada por el desarrollador"
  - phase: "phase-6-results-acceptance"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-07T08:31:30+01:00"
    notes: "Resultados aceptados por el desarrollador"
  - phase: "phase-7-evaluation"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-07T08:32:54+01:00"
    notes: "Evaluacion aprobada por el desarrollador (score: 4)"
  - phase: "phase-8-commit-push"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-07T08:33:56+01:00"
    notes: "Commit y push aprobados por el desarrollador"
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
