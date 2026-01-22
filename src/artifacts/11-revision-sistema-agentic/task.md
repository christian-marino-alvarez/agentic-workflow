# Task: Revisión de Constitución y Workflows Agénticos

## Identificación
- id: 11-revision-sistema-agentic
- title: Revisión de Constitución y Workflows Agénticos
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: .agent/artifacts/candidate/task.md

## Descripción de la tarea
Revisión exhaustiva de las reglas de constitución para módulos, páginas y shards, seguida de un análisis y redefinición de los workflows operativos del sistema agéntico. El desarrollador ha detectado debilidades arquitectónicas en la implementación de estos elementos que causan interpretaciones erróneas por parte de los agentes.

## Objetivo
Analizar y consolidar la normativa del framework (Modules, Pages, Shards) y optimizar los flujos de trabajo (workflows) para asegurar la coherencia arquitectónica y la eficiencia del ciclo de vida de desarrollo, incluyendo la creación de workflows específicos para Page y Shard.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "11-revision-sistema-agentic"
  title: "Revisión de Constitución y Workflows Agénticos"
  phase:
    current: "phase-4-implementation"
    validated_by: "architect-agent"
    updated_at: "2026-01-13T23:48:00+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-13T09:25:00+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-13T09:43:00+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-13T22:00:00+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-13T22:15:00+01:00"
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
| 1 | ¿Cuál es el problema principal o la "desconexión" que has detectado actualmente en las constituciones de módulos, páginas y shards que motiva esta revisión? | Inconsistencias y debilidades arquitectónicas que causan implementaciones incompletas y mala interpretación de los agentes sobre las reglas e integración. |
| 2 | Respecto a los workflows, ¿buscas una simplificación de los pasos actuales o una mayor automatización y rigurosidad en las validaciones entre fases? | Perfeccionar los existentes e incluir workflows específicos y necesarios para Page y Shard. |
| 3 | En el análisis de la constitución, ¿prefieres que el architect-agent proponga cambios basados en `extensio-architecture.md` o guiarás el análisis punto por punto? | El arquitecto debe guiar con recomendaciones y valoraciones objetivas sobre las decisiones del desarrollador. |
| 4 | ¿Deseas que los resultados se materialicen en nuevos documentos de constitución (`modules.md`, `pages.md`, `shards.md`) o en una actualización profunda de los existentes? | Crear nuevos si no existen y refactorizar profundamente los existentes. |
| 5 | ¿Debemos considerar el impacto de estos cambios en las herramientas del CLI y el `mcp-server` durante la redefinición de los workflows? | Sí. |

---

## Acceptance Criteria (OBLIGATORIO PARA CURRENT TASK)

1. Alcance:
   - Revisión y actualización de las constituciones `modules.md`, `pages.md` y `shards.md`.
   - Creación de nuevos workflows contractuales para la creación/gestión de Pages y Shards.
   - Refactorización de los workflows existentes del sistema agéntico para mayor rigurosidad.

2. Entradas / Datos:
   - `extensio-architecture.md` como fuente de verdad arquitectónica.
   - Constituciones actuales en `.agent/rules/constitution/`.
   - Workflows actuales en `.agent/workflows/`.

3. Salidas / Resultado esperado:
   - Documentos de constitución (`modules.md`, `pages.md`, `shards.md`) robustos, claros y sin ambigüedades.
   - Workflows para Page (`pages.create.md`) y Shard (`shards.create.md`) implementados y registrados.
   - Informe de impacto en CLI y MCP-server sobre los cambios estructurales.

4. Restricciones:
   - No romper la retrocompatibilidad con la lógica de Core sin aviso.
   - Mantener el aislamiento estricto entre módulos.
   - Formato Markdown estricto para las reglas (`PERMANENT`, `MEMORY`, etc.).

5. Criterio de aceptación (Done):
   - Aprobación explícita (SI) por parte de la autoridad técnica del desarrollador tras la revisión de los nuevos documentos y flujos.

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-13T09:25:00+01:00"
    notes: "Acceptance criteria definidos y validados. Iniciando Fase 1."
  - phase: "phase-1-research"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-13T09:43:00+01:00"
    notes: "Investigación completada. Se ha analizado la lógica de build de shards/pages y las debilidades de la constitución actual. Iniciando Fase 2."
```
  - phase: "phase-1-research"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-13T09:43:00+01:00"
    notes: "Investigación completada. Análisis de constituciones y workflows."
  - phase: "phase-2-analysis"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-13T22:00:00+01:00"
    notes: "Análisis de impacto completado. Identificados gaps en CLI y Core."
  - phase: "phase-3-planning"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-13T22:15:00+01:00"
    notes: "Plan de implementación implícito en los documentos de impacto."
  - phase: "phase-4-implementation"
    action: "started"
    validated_by: "architect-agent"
    timestamp: "2026-01-13T23:48:00+01:00"
    notes: "Constituciones y workflows actualizados. Pendiente: cambios en Core y CLI."
