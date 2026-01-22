# Task (Template)

## Identificación
- id: 13
- title: Sistema de Ciclo de Vida Dual (Long/Short)
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Crear un mecanismo de switch en el proceso de inicialización para permitir al desarrollador elegir entre el ciclo de vida estándar (Long) y uno simplificado (Short). Implementar los nuevos workflows y lógica necesaria para el ciclo Short.

## Objetivo
Disponer de flexibilidad operativa según la complejidad de la tarea sin perder la integridad del sistema agéntico. El ciclo Short debe constar de 3 fases: 1. Análisis y Planificación, 2. Implementación, 3. Verificación y Resultados.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "13"
  title: "Sistema de Ciclo de Vida Dual (Long/Short)"
  strategy: "long" # Esta tarea técnica se ejecuta en modo long por su impacto estructural
  phase:
    current: "phase-8-commit-push"
    validated_by: "architect-agent"
    updated_at: "2026-01-16T17:47:04+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-15T23:55:00+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-16T00:02:48+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-16T00:06:01+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-16T07:48:25+01:00"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-16T17:45:00+01:00"
      phase-5-verification:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-16T17:47:04+01:00"
      phase-6-results-acceptance:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-16T17:47:04+01:00"
      phase-7-evaluation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-16T17:47:04+01:00"
      phase-8-commit-push:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-16T17:53:59+01:00"
```

## 5 Preguntas Obligatorias (REQUERIDO - Phase 0)
> Sin respuestas completas, la tarea NO puede avanzar a Phase 1.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿La decisión de usar el modo Short debe quedar grabada en el task.md de cada tarea individual, o prefieres que sea una configuración global de la sesión? | Debe estar grabada en task.md para que pueda ser interpretada fuera de la session o incluso en otra session |
| 2 | ¿Para las fases fusionadas (ej: Análisis y Planificación), creamos un único documento unificado o prefieres mantener los ficheros separados? | No, crear nuevos ficheros para ese nuevo flow |
| 3 | ¿En el modo Short, el architect-agent debe seguir haciendo una revisión manual de los Gates, o buscamos un sistema más automático? | No, la estructura de los ficheros de workflow debe respetarse por lo que el gate es crucial |
| 4 | ¿Una vez que una tarea se inicia en modo Short, debe poder convertirse al modo Long si la complejidad aumenta? | Por ahora debe ser definitiva. Si se identifica complejidad, el desarrollador decide si abortar y crear una nueva tarea en modo long. |
| 5 | ¿Confirmas que para el caso de uso Short es un trade-off aceptable perder Research y Evaluación? | Si, pero dentro del analisis de short debe ser un analisis profundo para detectar complejidad. Por eso sigue siendo crucial el modelo de 5 preguntas. |

---

## Acceptance Criteria (OBLIGATORIO PARA CURRENT TASK)

1. Alcance:
   - Modificación de `workflow.init` para incluir el selector.
   - Creación de `workflow.tasklifecycle.short` y ficheros de fases mergeadas.
   - Actualización de `templates.task` para incluir el campo `strategy`.

2. Entradas / Datos:
   - Selección de estrategia (Long/Short) durante el comando `init`.
   - Respuestas a las 5 preguntas (cruciales para detectar complejidad en modo Short).

3. Salidas / Resultado esperado:
   - Nuevo directorio de workflows para el ciclo Short.
   - Versión de `task.md` con soporte para el switch de estrategia.
   - Selector funcional en el proceso de inicialización.

4. Restricciones:
   - Mantener la integridad de los Gates arquitectónicos.
   - El modo Short NO debe sacrificar la profundidad del Análisis inicial.

5. Criterio de aceptación (Done):
   - El desarrollador puede elegir "Short" al iniciar una tarea y completar el flujo de 3 fases con validación exitosa del arquitecto.

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-15T23:55:00+01:00"
    notes: "Acceptance criteria definidos y validados. Iniciamos Phase 1."
  - phase: "phase-1-research"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-16T00:02:48+01:00"
    notes: "Research aprobado por desarrollador. Scope ampliado con rename de carpeta y verificación de aliases."
  - phase: "phase-2-analysis"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-16T00:06:01+01:00"
    notes: "Analysis aprobado. Cobertura completa de 5 ACs, 6 ficheros nuevos, 5 modificaciones, 1 rename."
```

## Reglas contractuales
- Este fichero es la fuente única de verdad del estado de la tarea.
- El campo task.phase.current SOLO puede ser modificado por architect-agent.
