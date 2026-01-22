# Task: Sistema de Evaluación y Feedback de Agentes

## Identificación
- id: 15
- title: Sistema de Evaluación y Feedback de Agentes
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle-short
  - source: init
  - candidate_path: artifacts.candidate.init

## Descripción de la tarea
Implementar la obligatoriedad de puntuación de agentes en el Gate de validación, persistir estas puntuaciones y facilitar la media de cada agente durante la fase de análisis de nuevas tareas para mejorar el rendimiento del sistema agéntico.

## Objetivo
Asegurar que el rendimiento de los agentes sea medible y que esta información retroalimente el proceso de selección y análisis en futuras tareas.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "15"
  title: "Sistema de Evaluación y Feedback de Agentes"
  strategy: "short"
  phase:
    current: "short-phase-3-closure"
    validated_by: "architect-agent"
    updated_at: "2026-01-17T08:25:00Z"
  lifecycle:
    phases:
      short-phase-1-brief:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T08:23:00Z"
      short-phase-2-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T08:25:00Z"
      short-phase-3-closure:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T08:26:00Z"
```

## 5 Preguntas Obligatorias (REQUERIDO - Phase 1 Brief)

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Dónde se almacenarán las puntuaciones? | .agent/metrics/ |
| 2 | ¿Qué métricas exactas registrar? | Nota global sencilla de cada agente. |
| 3 | ¿Cómo presentar la info al LLM? | Análisis de tendencia: si las medias bajan, proponer mejoras para el agente. |
| 4 | ¿Obligatoriedad? | Sí, debe ser un Gate obligatorio. |
| 5 | ¿Ponderación temporal? | Sí, las puntuaciones antiguas pesan más. |

---

## Acceptance Criteria (OBLIGATORIO)

1. **Alcance**: Directorio `.agent/metrics/`, persistencia en `agents.json`, y modificación de workflows Long y Short.
2. **Entradas/Datos**: Puntuaciones 1-10 por agente en el gate de cierre.
3. **Salidas esperadas**: Media histórica ponderada por agente y sección de historial/mejora en informes de Análisis y Brief.
4. **Restricciones**: Gate obligatorio para el cierre; tendencia negativa obliga a propuesta de mejora.
5. **Criterio de Done**: Verificación exitosa de que el sistema persiste notas y las recupera para el análisis.

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "init"
    action: "started"
    validated_by: "architect-agent"
    timestamp: "2026-01-17T08:18:00Z"
    notes: "Tarea iniciada en modo Short"
  - phase: "short-phase-3-closure"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-17T08:26:00Z"
    notes: "Tarea completada. Primera implementación del sistema de evaluación de agentes."
    developer_score:
      architect-agent: 10
```
