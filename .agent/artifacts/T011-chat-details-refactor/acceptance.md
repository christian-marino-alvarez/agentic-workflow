# Acceptance Criteria — T011-chat-details-refactor

<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 0 1 2 2v2H6V3a2 2 0 0 1 2-2zm3 4V3a3 3 0 1 0-6 0v2a3 3 0 0 0-3 3v7h12V8a3 3 0 0 0-3-3zM7 14v-2h2v2H7zm0-3V9h2v2H7z"/></svg> **architect-agent**: Contract defined.

## 1. Consolidated Definition
Refactorizar el panel de detalles del workflow en el chat (`renderDetailsPanel`) para que use el formato actual de 2 columnas pero unificando en él toda la información (Workflow, Active Agent, Context Loaded, Gate Requirements, Next Step). 
Eliminar el HTML muerto ("cards" sueltas) y la función reduntante `renderActiveWorkflowDef`.
El panel de Details actuará como un toggle exclusivo junto al Timeline lateral (si se abre uno, se cierra el otro). 
El Timeline lateral inicializará visible por defecto (`showTimeline: true`), incluso si la vista y los pasos están vacíos al iniciar una nueva sesión.

## 2. Answers to Clarification Questions
> This section documents the developer's answers to the 5 questions formulated by the architect-agent.

| # | Question (formulated by architect) | Answer (from developer) |
|---|-----------------------------------|------------------------|
| 1 | Formato unificado vs 2 columnas actuales | 2 columnas y la información unificada |
| 2 | Timeline por defecto visible (con estado vacío) | Sí |
| 3 | Código muerto (cards sueltas en HTML) | Eliminar |
| 4 | Función `renderActiveWorkflowDef` | Consolidar su funcionalidad en el panel Details |
| 5 | Toggle exclusivo (cerrar timeline al abrir details) | Sí, como toggle |

---

## 3. Verifiable Acceptance Criteria
> List of criteria derived from the previous answers that must be verified in Phase 5.

1. Scope:
   - Limpiar `html.ts` y `css.ts` de elementos redundantes.
   - Refactorizar `renderDetailsPanel`.
   - Modificar estado inicial y lógica de toggles.

2. Inputs / Data:
   - `workflowDetails`, `taskSteps`, `showTimeline`, `showDetails`.

3. Outputs / Expected Result:
   - Toda la información del workflow mostrada únicamente en el panel desplegable del header (al activarlo).
   - El código muerto no existe.
   - Si se abre "Details", el "Timeline" se oculta automáticamente (y viceversa).

4. Constraints:
   - Sin componentes separados (solo 1 panel robusto a 2 columnas).
   - UI de layout actual respetado (colores pasteles en etiquetas).

5. Acceptance Criterion (Done):
   - Al pulsar en "Details", se visualizan los tags/información de contexto (2 columnas) en el header y el Timeline lateral está invisible. Al pulsar en el timeline progress bar, aparece el Timeline y Details se cierra. Al iniciar la aplicación, el Timeline lateral es visible mostrando placeholders vacíos si no hay tareas. HTML muerto de templates eliminado.

---

## Approval (Gate 0)
This document constitutes the task contract. Its approval is blocking to proceed to Phase 1.

```yaml
approval:
  developer:
    decision: null # SI | NO
    date: null
    comments: null
```

---

## Validation History (Phase 0)
```yaml
history:
  - phase: "short-phase-1-brief"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-02-22T21:42:26+01:00"
    notes: "Acceptance criteria defined"
```
