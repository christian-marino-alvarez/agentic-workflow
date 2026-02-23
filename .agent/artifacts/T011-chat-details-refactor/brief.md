---
artifact: brief
phase: short-phase-1-brief
owner: architect-agent
status: draft
related_task: T011-chat-details-refactor
---

# Brief — T011-chat-details-refactor

<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 0 1 2 2v2H6V3a2 2 0 0 1 2-2zm3 4V3a3 3 0 1 0-6 0v2a3 3 0 0 0-3 3v7h12V8a3 3 0 0 0-3-3zM7 14v-2h2v2H7zm0-3V9h2v2H7z"/></svg> **architect-agent**: Brief analysis.

## 1. Task Identification

**Title**: Chat Details Refactor
**Objective**: Unificar la funcionalidad de "details" en una única sección vertical desplegable, eliminar código muerto, hacer visible el timeline por defecto y establecer un funcionamiento de "toggle" exclusivo entre detalles y timeline.
**Strategy**: Short

---

## 2. The 5 Mandatory Questions

*(Respuestas documentadas en `acceptance.md`)*

---

## 3. Acceptance Criteria

*(Criterios verificables documentados en `acceptance.md`)*

---

## 4. Simplified Analysis

### Current State (As-Is)
- Affected structure: `src/extension/modules/chat/view/templates/html.ts`, `src/extension/modules/chat/view/templates/css.ts`, `src/extension/modules/chat/view/index.ts`.
- Known limitations: Código muerto residual. Flags de estado no exclusivas para los toggles (ambos pueden ser true simultáneamente). El timeline usa una lógica que lo esconde al empezar sesión (`taskSteps.length === 0`).

### Complexity Evaluation

| Indicator | Status | Comment |
|-----------|--------|---------|
| Affects more than 3 packages | ☐ Yes ☑ No | Solo View del chat |
| Requires API research | ☐ Yes ☑ No | Lógica ya existente en WebComponents/Lit |
| Breaking changes | ☐ Yes ☑ No | Refactor visual/estado |
| Complex E2E tests | ☐ Yes ☑ No | No altera conectividad end-to-end |

**Complexity result**: ☑ LOW (continue Short) ☐ HIGH (recommend abort to Long)

---

## 5. Implementation Plan

### Ordered Steps

1. **Paso 1: Modificar Estado y Toggles (index.ts)**
   - Establecer `showTimeline: true` por defecto.
   - Modificar las funciones `toggleTimeline()` y `toggleDetails()`:
     - En `toggleTimeline()`: Al activarse, invocar `this.showDetails = false;`
     - En `toggleDetails()`: Al activarse, invocar `this.showTimeline = false;`
   - Quitar la restricción en `renderSideTimeline` (html.ts) de ocultarse si `taskSteps.length === 0`.

2. **Paso 2: Limpieza de Código Muerto (html.ts)**
   - Eliminar las "cards" en HTML suelto fuera de las funciones (líneas 208-286).
   - Eliminar o absorber la función `renderActiveWorkflowDef`.

3. **Paso 3: Unificar Details Panel (html.ts)**
   - Refactorizar `renderDetailsPanel` para asegurar que las dos columnas contengan todas las tarjetas informativas requeridas (Workflow context, Active Agent, Context files, Gate requirements, y Next Step).
   - Eliminar el CSS relacionado con las features borradas en html.ts (si existiera).

### Planned Verification
- Test type: Manual/QA Visual Inspection.
- Success criteria: Al recargar, se ve un timeline vacío a la izquierda. Al clickar en Details, se esconde la izquierda y baja la información combinada desde el header. Subir Details esconde la data y restaurar Timeline muestra el timeline.

---

## 6. Developer Approval (MANDATORY)

```yaml
approval:
  developer:
    decision: null # SI | NO
    date: null
    comments: null
```

> Without approval, this phase CANNOT advance to Implementation.
