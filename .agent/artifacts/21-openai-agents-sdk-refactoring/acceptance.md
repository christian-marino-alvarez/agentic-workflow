🏛️ **architect-agent**: Acceptance Criteria — Task 21

# Acceptance Criteria — 21-openai-agents-sdk-refactoring

## 1. Consolidated Definition

Reemplazo completo del sistema de agentes actual (LiveAgent, GhostAgent, AgentFactory, AgentOrchestrator) por una implementación basada en el **OpenAI Agents SDK** (`@openai/agents`). El SDK será el motor central de ejecución, utilizando `Agent`, `Runner`, handoffs y tool calling nativos. Cada rol (architect, qa, researcher, etc.) se instanciará como un `Agent` del SDK con instrucciones cargadas desde los markdowns de `.agent/rules/roles/`. El sistema soportará multi-provider (Gemini, Claude, OpenAI) a través de los adapters existentes (`ModelProvider`), asignación dinámica de modelos por agente (persistida en frontmatter del role markdown), y handoffs entre agentes para flujos multi-turn alineados con los workflows del lifecycle.

El `Runner` del SDK se ejecutará en el **backend/sidecar** (proceso independiente), manteniendo el aislamiento del Extension Host.

## 2. Answers to Clarification Questions

| # | Question | Answer |
|---|---------|--------|
| 1 | ¿Reemplazar completamente o wrapper? | **Reemplazo completo**. El sistema actual no funciona. LiveAgent/GhostAgent/Factory/Orchestrator se eliminan. |
| 2 | ¿Multi-provider o solo OpenAI? | **Mantener adapters multi-provider** (GeminiProvider, ClaudeProvider, OpenAIProvider) para que cada agente pueda usar un modelo diferente. |
| 3 | ¿Cómo se crean agentes y se asigna modelo? | Agentes creados a partir de role markdowns (`.agent/rules/roles/*.md`). El frontmatter debe seguir el formato de VSCode. Si desde Settings o Chat se cambia el modelo, se actualiza el markdown del role para mantener consistencia. |
| 4 | ¿Handoffs y multi-turn? | **Sí**. Los workflows ya soportan sub-tareas. El architect detecta sub-tareas en el análisis, asigna agentes (1 agente = 1 tarea), y el SDK gestiona handoffs entre ellos. |
| 5 | ¿Ubicación del Runner? | **Backend/sidecar** (thread independiente). Mantener aislamiento del Extension Host. |

---

## 3. Verifiable Acceptance Criteria

1. Scope:
   - [ ] LiveAgent, GhostAgent, AgentFactory, AgentOrchestrator eliminados
   - [ ] Agent module usa `@openai/agents` SDK exclusively
   - [ ] LLM Backend refactorizado para ser el host del Runner del SDK

2. Inputs / Data:
   - [ ] Role markdowns (`.agent/rules/roles/*.md`) definen cada agente (nombre, instrucciones, modelo, capabilities)
   - [ ] Frontmatter de los roles sigue formato VSCode y contiene campo `model` con el ID del modelo asignado
   - [ ] Cambiar modelo desde UI (Chat/Settings) actualiza el frontmatter del role markdown

3. Outputs / Expected Result:
   - [ ] Cada agente responde usando su modelo asignado a través del provider correcto
   - [ ] Multi-provider funciona: un agente con Gemini, otro con Claude, otro con OpenAI
   - [ ] Handoffs entre agentes funcionan: architect delega sub-tareas a otros agentes
   - [ ] Runner en el sidecar ejecuta agentes sin bloquear Extension Host

4. Constraints:
   - [ ] Cumplir constitutions (Background hereda de Core, modular architecture)
   - [ ] Mantener tests unitarios para agent module (≥ coverage actual)
   - [ ] Backward compatible con la UI (Chat sigue enviando mensajes igual)
   - [ ] Compilación exitosa (`npm run compile`)

5. Acceptance Criterion (Done):
   - [ ] Enviar mensaje desde Chat → agente responde con el LLM asignado a su modelo
   - [ ] Cambiar modelo en Settings → actualiza frontmatter del role y siguiente mensaje usa el nuevo modelo
   - [ ] Al menos 2 providers funcionando simultáneamente (e.g., architect=Gemini, qa=Claude)
   - [ ] Handoffs básicos: architect delega sub-tarea a otro agente

---

## Approval (Gate 0)

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-19T21:04:44+01:00"
    comments: null
```

---

## Validation History (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-02-19T20:51:00+01:00"
    notes: "Acceptance criteria defined from 5 developer answers"
```
