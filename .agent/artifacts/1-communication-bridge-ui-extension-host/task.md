---
id: "1"
title: "Communication Bridge (UI ↔ Extension Host)"
owner: architect-agent
strategy: "long"
---

# Task: Communication Bridge (UI ↔ Extension Host)

## Identificación
- id: "1"
- title: "Communication Bridge (UI ↔ Extension Host)"
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: roadmap
  - candidate_path: .agent/artifacts/candidate/2026-02-09T12-56-14Z-init.md

## Descripción de la tarea
Implementar un puente de comunicación bidireccional mediante `postMessage` entre la UI (Webview) y el Extension Host de VS Code, utilizando contratos de mensajes tipados y validación.

## Objetivo
Establecer un canal de comunicación robusto, seguro y tipado que permita el flujo de conversaciones, cambios de estado y comandos entre la interfaz de usuario y la lógica del plugin.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

<!-- RUNTIME:START task-state -->
```yaml
task:
  id: "1"
  title: "Communication Bridge (UI ↔ Extension Host)"
  strategy: "long"  # long | short
  artifacts:
    supplemental: []
  phase:
    current: "phase-4-implementation"
    validated_by: "architect-agent"
    updated_at: "2026-02-09T15:18:39Z"
  delegation:
    active_agent: "architect-agent"
    history: []
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T14:16:47Z"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T14:40:53Z"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T15:17:55Z"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-09T15:18:39Z"
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
<!-- RUNTIME:END -->

---

## Registro de delegación
- (Historial vacío)

---

## 2. Definición y Alcance (Contrato)
- **Acceptance Criteria**: [.agent/artifacts/1-communication-bridge-ui-extension-host/acceptance.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/1-communication-bridge-ui-extension-host/acceptance.md)
- **Alias**: `task.acceptance`

---

## Reglas contractuales
- Este fichero es la **fuente única de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- El campo `task.lifecycle.phases.*` **SOLO puede ser marcado como completed por `architect-agent`**.
