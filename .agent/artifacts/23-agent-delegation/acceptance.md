🏛️ **architect-agent**: Criterios de Aceptación — T039 Agent Delegation

# Acceptance Criteria — 23-agent-delegation

## 1. Consolidated Definition

El architect-agent será el único orquestador capaz de delegar sub-tareas a agentes especializados. La delegación se ejecutará dentro de una sesión de chat activa, donde el architect invoca un tool `delegateTask` que:
1. Requiere **confirmación explícita del desarrollador** (botón Confirmar/Denegar en el chat).
2. Crea una invocación LLM separada con la persona del agente delegado.
3. El agente delegado ejecuta la sub-tarea usando sus capabilities definidas en Settings.
4. Genera un **informe visible en streaming** en el chat.
5. Devuelve el resultado al architect como `tool_result`.

Si el agente delegado no puede completar la tarea (falta de capabilities), lo notifica al architect, quien busca alternativa o crea un **agente temporal ad-hoc**.

## 2. Answers to Clarification Questions

| # | Question | Answer |
|---|----------|--------|
| 1 | ¿Qué agentes pueden delegar? | Solo el `architect-agent`. Es el orquestador. Según necesidades de la tarea o instrucciones del desarrollador, delega en sub-tareas a agentes activos. |
| 2 | ¿Cuál es el alcance de la delegación? | Cada agente usa sus capabilities definidas en Settings + Skills de su role. Si no tiene una capability (ej: vision, tooling), no puede usarla y lo notifica al architect. La delegación requiere confirmación del desarrollador (botón Confirmar/Denegar). |
| 3 | ¿Cómo debe visualizarse la delegación? | En vivo (streaming). El agente delegado presenta un informe de su sub-tarea al architect y al desarrollador visible en el chat. |
| 4 | ¿Qué pasa si la delegación falla? | No debería suceder. Si ocurre: fallback a buscar otro agente similar, o el architect "contrata" un agente temporal creado virtualmente para ese fin específico. |
| 5 | ¿Puede el agente delegado modificar archivos? | Sí, según sus capabilities. Si la tarea tiene una acción que no puede llevar a cabo, lo notifica al architect y este busca alternativa. |

---

## 3. Verifiable Acceptance Criteria

1. **Scope**:
   - Solo `architect-agent` tiene acceso al tool `delegateTask`
   - La delegación ocurre dentro de una sesión de chat existente
   - No hay delegación recursiva (el agente delegado NO puede delegar)

2. **Inputs / Data**:
   - `delegateTask({ agent: string, task: string })` — nombre del agente destino + descripción de la sub-tarea
   - El agente delegado recibe: su persona completa (`.md`), sus capabilities de Settings, y la instrucción del architect

3. **Outputs / Expected Result**:
   - Informe del agente delegado visible en streaming en el chat
   - Resultado devuelto al architect como `tool_result`
   - El architect sintetiza y responde al usuario

4. **Constraints**:
   - Requiere confirmación del desarrollador antes de ejecutar (botón Confirmar/Denegar)
   - Si el agente no tiene la capability necesaria → notifica al architect
   - Fallback: agente temporal si no hay agente adecuado
   - Sin delegación recursiva (max depth = 1)

5. **Acceptance Criterion (Done)**:
   - [ ] El architect tiene un tool `delegateTask` funcional
   - [ ] La delegación requiere aprobación del desarrollador via botón en el chat
   - [ ] El agente delegado ejecuta con su persona y capabilities reales
   - [ ] El output del agente delegado se ve en streaming en el chat
   - [ ] El resultado vuelve al architect como `tool_result`
   - [ ] Si capability falta → notificación al architect
   - [ ] Fallback: agente temporal si no hay agente apto
   - [ ] No hay delegación recursiva

---

## Approval (Gate 0)
This document constitutes the task contract. Its approval is blocking to proceed to Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-20T16:35:23+01:00
    comments: null
```

---

## Validation History (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "created"
    validated_by: "architect-agent"
    timestamp: "2026-02-20T16:33:07+01:00"
    notes: "Acceptance criteria defined from 5 developer answers"
  - phase: "phase-0-acceptance-criteria"
    action: "approved"
    validated_by: "developer"
    timestamp: "2026-02-20T16:35:23+01:00"
    notes: "Gate 0 PASS — developer approved SI"
```
