---
id: 21-openai-agents-sdk-refactoring
title: OpenAI Agents SDK Refactoring
owner: architect-agent
strategy: long
---

# Task (Template)

## Identification
- id: 21-openai-agents-sdk-refactoring
- title: OpenAI Agents SDK Refactoring
- scope: current
- owner: architect-agent

## Origin
- created_from:
  - workflow: tasklifecycle-long
  - source: init
  - candidate_path: artifacts.candidate.task

## Task Description
Refactorizar completamente el sistema de agentes para usar el OpenAI Agents SDK (`@openai/agents`) como motor de agentes y orquestador de tareas. El sistema actual (LiveAgent/GhostAgent/Factory/Orchestrator) será reemplazado por completo. Cada agente se construirá a partir de los role markdowns existentes en `.agent/rules/roles/`, con soporte multi-provider (Gemini, Claude, OpenAI), handoffs entre agentes, multi-turn, y asignación dinámica de modelos.

## Objective
Utilizar el OpenAI Agents SDK para obtener control total sobre los agentes, maximizar las capacidades del SDK (Runner, handoffs, tool calling, guardrails), y permitir asignar un modelo distinto a cada agente desde la UI (Chat/Settings), persistiendo la asignación en el frontmatter de los roles.

## Lifecycle State (SINGLE SOURCE OF TRUTH)

```yaml
task:
  id: "21-openai-agents-sdk-refactoring"
  title: "OpenAI Agents SDK Refactoring"
  strategy: "long"
  artifacts:
    supplemental: []
  phase:
    current: "phase-4-implementation"
    validated_by: "architect-agent"
    updated_at: "2026-02-19T21:29:00+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-19T21:04:44+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-19T21:24:36+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-19T21:27:17+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-19T21:29:00+01:00"
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

## 2. Definition and Scope (Contract)
- **Acceptance Criteria**: [acceptance.md](file:///.agent/artifacts/21-openai-agents-sdk-refactoring/acceptance.md)
- **Alias**: `task.acceptance`
