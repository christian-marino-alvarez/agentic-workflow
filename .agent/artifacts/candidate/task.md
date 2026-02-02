# Task (Template)

## Identificación
- id: task-20260202-agentic-runtime-cli-first
- title: Create Agentic Runtime (CLI-first) as the Single Execution Engine
- scope: candidate | current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Context

The current state of agentic-workflow defines workflows, tasks, and agent behavior at a conceptual and structural level, but lacks a concrete execution runtime.

This task introduces a CLI-first, headless runtime that becomes the single source of truth for workflow execution and state management.

This runtime will serve both as:
- A standalone CLI tool for local execution and testing
- The foundational backend engine to be consumed later by the VS Code extension UI

Scope
- CLI command(s) to run workflows (e.g. agentic run, agentic resume)
- Runtime core responsible for:
  - Workflow orchestration
  - Task execution sequencing
  - Context propagation
  - State persistence (in-memory or file-based)
  - Event / log emission suitable for:
    - Debugging
    - Streaming to a UI layer later

Out of scope
- VS Code UI implementation
- Visual components
- Agent prompting optimization
- LLM provider specifics (should be pluggable later)

Outcome
A reusable, testable, and UI-agnostic agentic runtime that becomes the foundation for:
- Local CLI usage
- VS Code extension integration
- Future remote or daemonized runtimes

Mantra
“The runtime thinks. The CLI executes. The UI observes.”

## Objetivo
- Design and implement a runtime engine capable of executing agentic workflows deterministically.
- Expose execution exclusively through a CLI interface (no UI concerns).
- Establish a clear execution lifecycle:
  - Load workflow definition
  - Resolve context
  - Execute steps / agents
  - Persist and emit state changes
- Define a stable runtime API contract that future UIs (VS Code) can consume.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "task-20260202-agentic-runtime-cli-first"
  title: "Create Agentic Runtime (CLI-first) as the Single Execution Engine"
  strategy: "long"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "phase-0-acceptance-criteria"
    validated_by: "architect-agent"
    updated_at: "2026-02-02T08:08:27Z"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: false
        validated_by: null
        validated_at: null
      phase-1-research:
        completed: false
        validated_by: null
        validated_at: null
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
    subflows:
      components:
        create:
          - name: <component-name>
            completed: false
            validated_by: null
            validated_at: null
        refactor:
          - name: <component-name>
            completed: false
            validated_by: null
            validated_at: null
        delete:
          - name: <component-name>
            completed: false
            validated_by: null
            validated_at: null
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
- **Acceptance Criteria**: [acceptance.md](file:///.agent/artifacts/task-20260202-agentic-runtime-cli-first/acceptance.md)
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
