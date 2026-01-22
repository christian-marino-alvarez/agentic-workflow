# Task (Current)

## Identificación
- id: 22
- title: Standardize Phase 0 Artifact
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: architect intervention
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Implementar un artefacto dedicado para la Fase 0 (`acceptance.md`) para estandarizar el flujo 1 fase = 1 artefacto. Esto desacopla la definición del contrato de la gestión del estado de la tarea en `task.md`.

## Objetivo
Crear el template `acceptance.md`, registrarlo en los índices y actualizar los workflows de la Fase 0 (Long y Short) para que generen y validen este nuevo archivo como output obligatorio, eliminando la redundancia en `task.md`.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "22"
  title: "Standardize Phase 0 Artifact"
  strategy: "long"
  phase:
    current: "phase-4-implementation"
    validated_by: "architect-agent"
    updated_at: "2026-01-19T09:43:00Z"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T09:40:00Z"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T09:41:00Z"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T09:42:00Z"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T09:42:00Z"
      phase-4-implementation:
        completed: false
        validated_by: null
        validated_at: null
      phase-5-verification:
        completed: false
        validated_by: null
        validated_at: null
      phase-6-results-acceptance:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T09:44:00Z"
      phase-7-evaluation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T09:44:00Z"
      phase-8-commit-push:
        completed: false
        status: "pending_manual_commit"
```

## 5 Preguntas Obligatorias (REQUERIDO - Phase 0)

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Debemos mantener una copia de los criterios en `task.md` o solo una referencia al archivo `acceptance.md`? | Solo referencia para mantener el uso de alias. |
| 2 | ¿Actualizamos tanto el ciclo Long como el Short con este cambio? | Si, ambos. |
| 3 | ¿Qué nombre exacto tendrá la nueva clave en `templates/index.md`? | acceptance. |
| 4 | ¿Deseas que el workflow de Fase 0 borre las secciones de criterios del `task.md` original en el template base? | Si. |
| 5 | ¿Cómo manejaremos la retrocompatibilidad con las tareas actuales que no tienen `acceptance.md`? | Ignorarlas y aplicar el cambio. |

---

## Acceptance Criteria (OBLIGATORIO PARA CURRENT TASK)

1. Alcance:
   - Modificación de workflows `phase-0-acceptance-criteria.md` y `short-phase-1-brief.md`.
   - Creación de `templates/acceptance.md`.
   - Registro del nuevo template en `templates/index.md`.
   - Modificación de `templates/task.md` para eliminar secciones redundantes.

2. Entradas / Datos:
   - Estructura actual de workflows y templates.

3. Salidas / Resultado esperado:
   - Flujo de Fase 0 genera un archivo `acceptance.md` separado.
   - `task.md` queda limpio de criterios detallados, manteniendo solo metadatos y estado.
   - El alias `task.acceptance` apunta al nuevo archivo.

4. Restricciones:
   - Mantener compatibilidad de alias.
   - Los Gates deben validar la existencia del nuevo archivo.

5. Criterio de aceptación (Done):
   - Una nueva tarea (ID 23+) genera automáticamente `acceptance.md`.
   - El sistema valida el Gate 0 basándose en la existencia y formato del nuevo artefacto.

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-19T09:40:00Z"
    notes: "Estandarización de Fase 0 definida. Pasando a Research."
```
