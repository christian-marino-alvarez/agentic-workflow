# Acceptance Criteria — task-20260130-fix-mainview-provider-No hay proveedor de datos para mainView

🏛️ **architect-agent**: Criterios de aceptación para corregir el proveedor de la vista `mainView`.

## 1. Definición Consolidada
Asegurar que la vista `mainView` registre un proveedor válido y muestre HTML en el panel ("Hello world"), eliminando el mensaje de ausencia de proveedor al abrir la vista desde la Activity Bar.

## 2. Respuestas a Preguntas de Clarificación
> Esta sección documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Cómo estás ejecutando la extensión cuando aparece el error? | F5 tras realizar `npm run compile`. |
| 2 | ¿Confirmas que la vista se registra como WebviewView (no TreeView) y debe renderizar “Hello world”? | No se sabe si debe ser WebviewViewProvider, pero se necesita cargar HTML en el panel para usar OpenAI ChatKit después. |
| 3 | ¿Qué `viewId` exacto esperas que se registre en el provider? | `mainView` (solo existe uno). |
| 4 | ¿Qué `activationEvents` están activos ahora mismo en `package.json`? | Solo debe existir `onView:mainView`. |
| 5 | ¿Ves algún error en el “Extension Host” log al abrir la vista? | Solo warnings: preview debug extension, `punycode` deprecado y SQLite experimental. |

---

## 3. Criterios de Aceptación Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - `mainView` se registra con un proveedor válido y muestra HTML.

2. Entradas / Datos:
   - La ejecución con F5 tras `npm run compile` reproduce y valida el fix.

3. Salidas / Resultado esperado:
   - La vista muestra el HTML base ("Hello world").
   - No aparece el mensaje “No hay ningún proveedor de datos registrado…”.

4. Restricciones:
   - Se mantiene `activationEvents: ["onView:mainView"]`.
   - El `viewId` permanece como `mainView`.

5. Criterio de aceptación (Done):
   - La vista se renderiza correctamente y no hay errores funcionales en el Extension Host log.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-30T00:00:00Z
    comments: null
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-30T00:00:00Z"
    notes: "Acceptance criteria definidos"
```
