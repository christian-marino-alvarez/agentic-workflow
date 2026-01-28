# Acceptance Criteria — {{task.id}}-{{task.title}}

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Definición Consolidada
{{consolidated_definition}}

## 2. Respuestas a Preguntas de Clarificación
> Esta sección documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | {{question.1}} | {{answer.1}} |
| 2 | {{question.2}} | {{answer.2}} |
| 3 | {{question.3}} | {{answer.3}} |
| 4 | {{question.4}} | {{answer.4}} |
| 5 | {{question.5}} | {{answer.5}} |

---

## 3. Criterios de Aceptación Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - {{acceptance.scope}}

2. Entradas / Datos:
   - {{acceptance.inputs}}

3. Salidas / Resultado esperado:
   - {{acceptance.outputs}}

4. Restricciones:
   - {{acceptance.constraints}}

5. Criterio de aceptación (Done):
   - {{acceptance.done}}

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: null # SI | NO
    date: null
    comments: null
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "{{timestamp}}"
    notes: "Acceptance criteria definidos"
```
