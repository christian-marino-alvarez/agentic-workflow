# Task

## Identificación
- id: 27
- title: update-portable-module-agent-identity
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Actualizar el módulo portable (@cmarino/agentic-workflow) con los últimos cambios efectuados en el sistema de agentes local, específicamente para asegurar que se identifique el agente activo en cada tarea.

## Objetivo
Revisar el estado actual del paquete portable, determinar si requiere actualizaciones basadas en los cambios recientes (como la identificación obligatoria de roles), e implementar dichas actualizaciones para mantener la paridad con el sistema local.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "27"
  title: "update-portable-module-agent-identity"
  strategy: "long"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "completed"
    validated_by: "architect-agent"
    updated_at: "2026-01-19T23:55:00+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T23:15:16+01:00"
      phase-1-research:
        completed: true
        validated_by: "researcher-agent"
        validated_at: "2026-01-19T23:19:32+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T23:21:24+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T23:23:05+01:00"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T23:42:00+01:00"
      phase-5-verification:
        completed: true
        validated_by: "qa-agent"
        validated_at: "2026-01-19T23:50:42+01:00"
      phase-6-results-acceptance:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T23:51:25+01:00"
      phase-7-evaluation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T23:52:12+01:00"
      phase-8-commit-push:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T23:55:00+01:00"
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
      short-phase-1-brief:
        completed: false
        validated_by: null
        validated_at: null
      short-phase-2-implementation:
        completed: false
        validated_by: null
        validated_at: null
      short-phase-3-closure:
        completed: false
        validated_by: null
        validated_at: null
```

---

## 2. Definición y Alcance (Contrato)
- **Acceptance Criteria**: [acceptance.md](file:///.agent/artifacts/27-update-portable-module-agent-identity/acceptance.md)
- **Alias**: `task.acceptance`

---

## Reglas contractuales
- Este fichero es la **fuente única de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- El campo `task.lifecycle.phases.*` **SOLO puede ser marcado como completed por `architect-agent`**.
- Una fase **NO puede marcarse como completed** si no es la fase actual.
- El avance de fase requiere:
  1. Marcar la fase actual como `completed: true`
  2. Validación explícita del architect
  3. Actualización de `task.phase.current` a la siguiente fase
