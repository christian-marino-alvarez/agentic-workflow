# Task: 30-AHRP: Agentic Handover & Reasoning Protocol

## Identificación
- id: 30
- title: AHRP: Agentic Handover & Reasoning Protocol
- scope: core / orchestration
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: Problemas detectados en Tarea #29 (Disciplina Agéntica)
  - candidate_path: .agent/artifacts/candidate/init.md

## Descripción de la tarea
Institucionalizar el protocolo **AHRP** (Agentic Handover & Reasoning Protocol) mediante la creación de la `constitution.agent_system`. Se implementará una secuencia obligatoria de Triple Gate (Activación -> Reasoning -> Resultados) para cada tarea.

## Objetivo
Eliminar la autonomía no autorizada y asegurar la separación de dominios mediante un proceso de "Doble Aprobación Pre-Ejecución".

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "30"
  title: "Task Execution Protocol & Activation Gates"
  strategy: "long"
  status: "in_progress"
  phase:
    current: "phase-2-analysis"
    validated_by: "architect-agent"
    updated_at: "2026-01-20T08:35:00+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T08:33:00+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-20T08:35:00+01:00"
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

---

## 2. Definición y Alcance (Contrato)
- **Acceptance Criteria**: [.agent/artifacts/30-task-execution-protocol-gates/acceptance.md](.agent/artifacts/30-task-execution-protocol-gates/acceptance.md)
- **Alias**: `task.acceptance`
