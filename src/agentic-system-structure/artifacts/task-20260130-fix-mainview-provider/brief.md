---
artifact: brief
phase: short-phase-1-brief
owner: architect-agent
status: approved
related_task: task-20260130-fix-mainview-provider-No hay proveedor de datos para mainView
---

🏛️ **architect-agent**: Brief para corregir el registro de la vista `mainView` y mostrar el HTML en el panel.

# Brief — task-20260130-fix-mainview-provider-No hay proveedor de datos para mainView

## 1. Identificación de la tarea

**Título**: No hay proveedor de datos para mainView
**Objetivo**: Al abrir `mainView` desde la Activity Bar, se debe registrar el proveedor y mostrar el webview con HTML base ("Hello world"), sin el mensaje de ausencia de proveedor.
**Estrategia**: Short

---

## 2. Las 5 Preguntas Obligatorias

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Cómo estás ejecutando la extensión cuando aparece el error? | F5 tras realizar `npm run compile`. |
| 2 | ¿Confirmas que la vista se registra como WebviewView (no TreeView) y debe renderizar “Hello world”? | No se sabe si debe ser WebviewViewProvider, pero se necesita cargar HTML en el panel para usar OpenAI ChatKit después. |
| 3 | ¿Qué `viewId` exacto esperas que se registre en el provider? | `mainView` (solo existe uno). |
| 4 | ¿Qué `activationEvents` están activos ahora mismo en `package.json`? | Solo debe existir `onView:mainView`. |
| 5 | ¿Ves algún error en el “Extension Host” log al abrir la vista? | Solo warnings: "preview" debug extension, `punycode` deprecado y SQLite experimental. |

---

## 3. Acceptance Criteria

Derivados de las respuestas anteriores:

1. **Alcance**: Registrar correctamente la vista `mainView` para que muestre HTML en el panel.
2. **Entradas/Datos**: Se ejecuta con F5 después de `npm run compile`.
3. **Salidas esperadas**: La vista muestra el HTML base ("Hello world") y desaparece el mensaje de “no hay proveedor”.
4. **Restricciones**: Mantener `activationEvents: ["onView:mainView"]` y un único `viewId` (`mainView`).
5. **Criterio de Done**: Al abrir la vista desde la Activity Bar, renderiza el HTML y no hay errores funcionales en el Extension Host log.

---

## 4. Análisis simplificado

### Estado actual (As-Is)
- La vista `mainView` aparece pero muestra “No hay ningún proveedor de datos registrado que pueda proporcionar datos de la vista.”
- No hay errores de ejecución funcionales en el log, solo warnings de entorno.

### Evaluación de complejidad

| Indicador | Estado | Comentario |
|-----------|--------|------------|
| Afecta más de 3 paquetes | ☐ Sí ☑ No | Cambios localizados a extensión/manifest. |
| Requiere investigación APIs | ☐ Sí ☑ No | Se usa API de WebviewView existente. |
| Cambios breaking | ☐ Sí ☑ No | Ajustes en registro/activación. |
| Tests E2E complejos | ☐ Sí ☑ No | Validación manual en VS Code. |

**Resultado de complejidad**: ☑ BAJA (continuar Short) ☐ ALTA (recomendar abortar a Long)

---

## 5. Plan de implementación

### Pasos ordenados

1. **Paso 1**
   - Descripción: Revisar `package.json` y el registro del provider para `mainView`.
   - Entregables: Identificación del punto de fallo (id/activation/registro).

2. **Paso 2**
   - Descripción: Ajustar el registro del provider para que VS Code lo encuentre al abrir la vista.
   - Entregables: Provider registrado y HTML base renderizado.

3. **Paso 3**
   - Descripción: Verificar en el Extension Host que la vista ya no muestra el mensaje de “no proveedor”.
   - Entregables: Validación manual con F5.

### Verificación prevista
- Tipo de tests: Validación manual en VS Code (F5).
- Criterios de éxito: La vista renderiza HTML y no aparece el mensaje de falta de proveedor.

---

## 6. Evaluación de agentes

- **architect-agent**: Plan claro y verificación manual enfocada en registro de provider.

---

## 7. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-30T00:00:00Z
    comments: null
```

> Sin aprobación, esta fase NO puede avanzar a Implementation.
