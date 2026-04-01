# Acceptance Criteria — task-20260130-extension-vscode-webview-Crear extensión VS Code con webview en activity bar

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

🏛️ **architect-agent**: Acceptance criteria definidos para la extensión VS Code con webview.

## 1. Definición Consolidada
Crear una extensión de VS Code dentro de `src/extension` que agregue un contenedor en la activity bar con **icono propio** (SVG minimalista) y muestre una vista basada en WebviewViewProvider con script y estado básico “Hello world”. La jerarquía de vistas estará en `src/extension/views` y un `index.ts` ESM exportará las vistas (inicialmente `MainChatView`). Debe declarar compatibilidad con la última versión estable de VS Code.

## 2. Respuestas a Preguntas de Clarificación
> Esta sección documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Nombre del viewsContainers.activitybar.id y del views.<container>.id? | `viewsContainers.activitybar.id = main` y `views.<container>.id = mainView`. |
| 2 | ¿Contenido mínimo esperado del Webview? | WebviewViewProvider con script y estado básico “Hello world”. |
| 3 | ¿Qué vistas concretas en `src/extension/views/` y export desde `index.ts`? | `MainChatView` desde `./main-view` y exportado en `views/index.ts`. |
| 4 | ¿Versión exacta de VS Code para `engines.vscode`? | Última estable (propuesta `^1.108.2`). |
| 5 | ¿Activación de la extensión? | `onView` cuando se clickea el botón en la activity bar. |

---

## 3. Criterios de Aceptación Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - La extensión agrega un contenedor en activity bar con **icono propio** y una vista webview asociada.

2. Entradas / Datos:
   - Estructura en `src/extension` con `views` y `views/index.ts` ESM exportando `MainChatView`.

3. Salidas / Resultado esperado:
   - WebviewViewProvider funcional con script y estado básico “Hello world”.
   - Contribuciones declaradas en `package.json` para activity bar y view.
   - Icono SVG minimalista ubicado en `media/` y referenciado por el contenedor.

4. Restricciones:
   - Compatibilidad declarada en `engines.vscode` con la versión estable más reciente.
   - Activación por `onView` y no por `*`.
   - Icono debe seguir estilo minimalista recomendado para Activity Bar.

5. Criterio de aceptación (Done):
   - La extensión carga la vista desde activity bar sin errores y el webview muestra el estado básico.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI # SI | NO
    date: 2026-01-30T16:19:16Z
    comments: null
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-30T15:51:57Z"
    notes: "Acceptance criteria definidos"
```
