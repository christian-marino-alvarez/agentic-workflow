# Task: 29-Agentic Framework Core Reference Refactor

## Identificación
- id: 29
- title: Agentic Framework Core Reference Refactor
- scope: core
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: feedback desarrollador post-tarea-28
  - candidate_path: .agent/artifacts/candidate/task.md

## Descripción de la tarea
Refactorización arquitectónica profunda para mover el centro de gravedad del sistema agéntico al paquete npm. El core (roles, rules, workflows) quedará alojado en node_modules y el proyecto local solo contendrá referencias, extensiones y el historial de ejecución.

## Objetivo
Desplegar un modelo de orquestación portable por referencia absoluta, garantizando inmutabilidad del core y extensibilidad local segura.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "29"
  title: "Agentic Framework Core Reference Refactor"
  status: "completed"
  strategy: "long"
  artifacts:
    supplemental: []
  phase:
    current: "completed"
    validated_by: "architect-agent"
    updated_at: "2026-01-20T08:23:00+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T08:05:00+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T08:00:00+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T08:00:30+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T08:05:00+01:00"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T08:18:00+01:00"
      phase-5-verification:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T08:20:00+01:00"
      phase-6-results-acceptance:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T08:23:00+01:00"
      phase-7-evaluation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T08:23:30+01:00"
      phase-8-commit-push:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T08:24:00+01:00"
    subflows:
      drivers:
        create: []
        refactor: []
        delete: []
      modules:
        create: []
        refactor: []
        delete: []
      pages:
        create: []
      shards:
        create: []
```

---

## 2. Definición y Alcance (Contrato)
- **Acceptance Criteria**: [.agent/artifacts/29-agentic-framework-core-reference-refactor/acceptance.md](.agent/artifacts/29-agentic-framework-core-reference-refactor/acceptance.md)
- **Alias**: `task.acceptance`

---

## Reglas contractuales
- Este fichero es la **fuente única de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- El avance de fase requiere validación explícita.
