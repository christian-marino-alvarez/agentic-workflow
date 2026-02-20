---
artifact: agent_task
phase: phase-4-implementation
owner: backend-agent
status: pending
related_task: 21-openai-agents-sdk-refactoring
task_number: 1
---

# Agent Task — 1-backend-agent-cleanup-and-parser

## Agent Identification (MANDATORY)
`<icon> **backend-agent**: Eliminando agentes legacy y creando parser de roles.`

## Input (REQUIRED)
- **Objective**: Eliminar las clases `LiveAgent`, `GhostAgent`, `AgentFactory` y `AgentOrchestrator` antiguas. Refactorizar el acceso a los roles (`src/extension/modules/llm/backend/roles.ts`) para que parsee el YAML frontmatter de `.agent/rules/roles/*.md` y devuelva objetos compatibles con la creación dinámica de un `Agent` del SDK. Asegurar que `@openai/agents` está en `package.json`.
- **Scope**: Modificaciones en el Extension Host (eliminaciones en module `agent` y limpieza de referencias en `chat`) y en el Sidecar Fastify (`llm/backend`).
- **Dependencies**: Ninguna. Es el primer paso fundacional.

---

## Reasoning (MANDATORY)

> [!IMPORTANT]
> The agent **MUST** complete this section BEFORE executing.
> Documenting the reasoning improves quality and allows early error detection.

### Objective analysis
- What is being asked exactly?
  1. Delete legacy custom agents and orchestration logic.
  2. Implement a `RoleParser` in `llm/backend` to read VSCode Markdown frontmatters.
  3. Ensure SDK dependency is installed.
- Are there ambiguities or dependencies?
  - Removing `AgentOrchestrator` will break `ChatBackground` temporarily. I have to remove those usages or leave an empty stub temporarily so the compiler doesn't totally break in this intermediate step.

### Options considered
- **Option A**: Delete files and leave `ChatBackground` broken until Step 4.
- **Option B**: Delete files, but comment out or stub the exact lines in `ChatBackground` that refer to `AgentOrchestrator` so TypeScript can compile `llm/backend` without errors.

### Decision made
- Chosen option: Option B
- Justification: In a modular system, breaking the compilation of the entire host extension makes it hard to verify if the Sidecar changes are correct. We will stub/comment out the `AgentOrchestrator` usages in `ChatBackground` for now.

---

## Output (REQUIRED)
- **Deliverables**:
  - Legacy proxy classes removed.
  - `llm/backend` has a utility to parse role markdowns (`gray-matter` or custom regex for YAML).
- **Required evidence**:
  - `npm run compile` succeeds for the backend.

---

## Execution

```yaml
execution:
  agent: "backend-agent"
  status: pending
  started_at: null
  completed_at: null
```

---

## Implementation Report

> This section is completed by the assigned agent during execution.

### Changes made
- Módulo `agent` eliminado por completo, ya que toda la orquestación recaerá en `llm/backend` utilizando `@openai/agents`.
- Tipos de capabilities reubicados de `agent/types.ts` a `llm/capabilities.ts`.
- Refactorizado `app/background` y `settings/background` para ajustarse a las eliminaciones.
- Creada nueva utilidad `src/extension/modules/llm/backend/roles.ts` (`RoleParser`) para extraer instrucciones y modelos de `.agent/rules/roles/*.md`.

### Technical decisions
- Al confirmar que el Extension Host ya no mantendrá estado de agentes, se decidió eliminar el módulo `agent` completo en lugar de solo vaciarlo, reduciendo la carga cognitiva y tamaño del bundle. 
- En `chat/background/index.ts` se dejó un stub temporal en `handleSendMessage`.

### Evidence
- El proyecto compila 100% libre de errores tras eliminar el módulo y actualizar `settings`. (`npm run compile` = success).

### Deviations from objective
- Se recomendaba refactorizar el acceso al módulo agent, pero dada la evaluación técnica, se procedió a **eliminarlo** por completo y reubicar las constantes necesarias en el módulo `llm`.

---

## Gate (REQUIRED)

The developer **MUST** approve this task before the architect assigns the next one.

```yaml
approval:
  developer:
    decision: "SI"
    date: "2026-02-19T21:39:25+01:00"
    comments: "Approved after fixing Domain Autonomy and Cross-Module Import violations per constitution index.md."
```
