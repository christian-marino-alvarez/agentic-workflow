# Acceptance Criteria — 24-revision-priorizacion-todo-backlog

## 1. Definición Consolidada
El usuario requiere una revisión profunda de todos los TODOs actuales. Se debe priorizar la portabilidad del sistema (item 004). El ítem 001 (Reasoning section) debe ser re-ejecutado (no se considera 'done'). Se requiere un plan de fases para el portable system y recomendaciones de nuevos ítems basados en la arquitectura.

## 2. Respuestas a Preguntas de Clarificación
> Esta sección documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Qué profundidad de revisión esperas? | Una revisión profunda. |
| 2 | ¿Hay algún criterio específico para la priorización? | Prioritario la tarea de portable. |
| 3 | ¿Debo verificar/rehacer el ítem 001-reasoning? | Hay que volver a realizar. |
| 4 | ¿Debo crear un plan de fases para el portable system? | SI. |
| 5 | ¿Deseas recomendaciones sobre nuevos ítems? | SI. |

---

## 3. Criterios de Aceptación Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - Auditoría completa de `.agent/todo/*.md`.
   - Re-evaluación técnica de la sección 'Reasoning' en los templates.
   - Definición de roadmap para el paquete `@cmarino/agentic-workflow`.

2. Entradas / Datos:
   - Backlog actual en `.agent/todo/`.
   - Constitución de arquitectura y reglas de agents-behavior.

3. Salidas / Resultado esperado:
   - Reporte de análisis profundo por cada TODO.
   - Todo items actualizados (ficheros `.md` editados con nueva prioridad y estado).
   - Documento de Roadmap/Fases para Portable Agentic System.
   - Propuesta de 2-3 nuevos TODOs de mejora arquitectónica.

4. Restricciones:
   - El ítem 004 debe ser marcado con la prioridad más alta.
   - El ítem 001 debe volver al estado `open` y ser analizado desde cero.

5. Criterio de aceptación (Done):
   - El desarrollador aprueba el nuevo estado y prioridad del backlog.
   - El roadmap del sistema portable es validado.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-19T17:28:26+01:00"
    comments: "Usuario acepta los criterios de aceptación y el alcance de la revisión profunda."
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-19T17:28:00+01:00"
    notes: "Acceptance criteria definidos tras clarificación con el usuario"
```
