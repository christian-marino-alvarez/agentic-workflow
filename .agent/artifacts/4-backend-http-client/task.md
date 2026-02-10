---
id: 4
title: backend-http-client
owner: architect-agent
strategy: long
---

# Task (Template)

## Identificación
- id: 4
- title: backend-http-client
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: roadmap
  - candidate_path: .agent/artifacts/candidate/task-t012.md

## Descripción de la tarea
Implementación de un cliente HTTP/WebSocket robusto en el Extension Host de VS Code para centralizar la comunicación con el servidor Fastify.

## Objetivo
Garantizar una comunicación segura, tipada y con soporte para streaming entre VS Code y el Core agnóstico.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

<!-- RUNTIME:START task-state -->
```yaml
task:
  id: "4"
  title: "backend-http-client"
  strategy: "long"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "phase-8-commit-push"
    validated_by: "architect-agent"
    updated_at: "2026-02-10T06:25:41.453Z"
  delegation:
    active_agent: "qa-agent"
    history:
      - from: "developer"
        to: "qa-agent"
        approved_by: "architect-agent"
        approved_at: "2026-02-09T20:41:30Z"
        reason: "Phase 4 completed. Delegation to qa-agent for Phase 5 verification."
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T20:18:15Z"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T20:29:15Z"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T20:32:15Z"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T20:33:30Z"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T20:41:30Z"
      phase-5-verification:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-10T06:25:19.644Z"
      phase-6-results-acceptance:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-10T06:25:37.968Z"
      phase-7-evaluation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-10T06:25:41.453Z"
      phase-8-commit-push:
        completed: false
        validated_by: null
        validated_at: null
```
<!-- RUNTIME:END -->

---

## Registro de delegación
- Cualquier cambio de agente **DEBE** registrarse en `task.delegation.history`.
- La entrada mínima incluye: `from`, `to`, `approved_by`, `approved_at`, `reason`.

---

## 2. Definición y Alcance (Contrato)
- **Acceptance Criteria**: [.agent/artifacts/4-backend-http-client/acceptance.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/4-backend-http-client/acceptance.md)
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
