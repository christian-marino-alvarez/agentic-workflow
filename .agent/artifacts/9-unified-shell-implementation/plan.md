---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 9-Unified-Tabbed-Shell-Implementation
---

# Implementation Plan — 9-Unified Tabbed Shell Implementation

🏛️ **architect-agent**: Plan de implementación para la multiplexación de vistas.

## 1. Resumen del plan
- **Contexto**: Unificar los 4 ViewProviders actuales en uno solo (`agw.mainView`) sin fusionar la lógica de negocio de los módulos.
- **Resultado esperado**: Un sidebar con 4 pestañas funcionales (Chat, Workflow, History, Security) operando sobre una única Webview reactiva.
- **Alcance**: Refactor de registro de extensión, creación del multiplexor en el Core y actualización del componente Shell.

## 2. Inputs contractuales
- **Task**: [task.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/9-unified-shell-implementation/task.md)
- **Analysis**: [analysis.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/9-unified-shell-implementation/analysis.md)
- **Acceptance Criteria**: AC-1 (Multiplexor), AC-2 (Preservación de módulos), AC-3 (Persistencia).

```yaml
plan:
  dispatch:
    - domain: core
      action: create
      workflow: phase-4-implementation
    - domain: ui
      action: refactor
      workflow: phase-4-implementation
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Refactor de Manifiesto (`package.json`)
- **Descripción**: Consolidar `views` en un único ID `agw.mainView`. Eliminar `chatView` y `keyView`.
- **Agente responsable**: architect-agent (o Neo)

### Paso 2: Creación del `AgwMainViewProvider` (Core)
- **Descripción**: Crear `src/extension/core/background/main-view-provider.ts`. Este componente heredará de `AgwViewProviderBase` y actuará como el único "Host".
- **Lógica**: Al recibir `resolveWebviewView`, notificará a los controladores de módulo registrados para que "adopten" la webview inyectada.

### Paso 3: Refactor de Controladores de Módulo
- **Descripción**: Modificar `ChatController`, `SecurityController`, `WorkflowController` y `HistoryController`.
- **Cambio**: Ya no llamarán a `super(context, viewId)` (que hace el registro en VS Code). En su lugar, se registrarán en el `AgwMainViewProvider` como delegados.

### Paso 4: Implementación de Namespacing en el Bridge
- **Descripción**: Actualizar `AgwViewProviderBase.postMessage` para aceptar opcionalmente un `domain`.
- **Lógica Frontend**: El `<agw-unified-shell>` recibirá todos los mensajes y los distribuirá a las pestañas basándose en el campo `domain`.

### Paso 5: Lógica Funcional del Shell (Lit)
- **Descripción**: En `agw-unified-shell.ts`, implementar el renderizado condicional de componentes:
  - `Chat` -> `<agw-chat-view>`
  - `Workflow` -> `<agw-workflow-view>`
  - `History` -> `<agw-history-view>`
  - `Security` -> `<agw-security-view>`
- **Acción**: Solo el componente de la pestaña activa será visible, pero los otros se mantendrán "vivos" para preservar el estado.

---

## 4. Asignación de responsabilidades

- **🏛️ architect-agent**
  - Implementación del `AgwMainViewProvider` (Core Logic).
  - Refactor de `ModuleRouter` y registro en `extension.ts`.
- **Neo (Implementation)**
  - Edición de `package.json`.
  - Refactor de vistas Web (Lit) y lógica del Shell.

---

## 5. Estrategia de testing y validación
- **Unit tests**: Verificar que `AgwMainViewProvider` notifica correctamente a N delegados.
- **Manual**: 
  - Abrir la extensión y comprobar que el Shell carga.
  - Alternar entre pestañas y verificar que los logs de cada controlador se disparan correctamente.
  - Escribir en el Chat, cambiar a Security y volver: el texto debe seguir ahí.

---

## 8. Puntos críticos y resolución
- **Punto crítico: Initial State Race Condition**
  - Riesgo: Los módulos intentan sincronizar estado antes de que la Webview esté resuelta en el Core.
  - Resolución: Implementar un evento `onBridgeReady` que se dispare en los controladores de módulo solo tras el `resolve` del MainProvider.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-11T08:17:00Z"
    comments: "Plan aprobado. Proceder con el refactor de package.json y creación del MainViewProvider."
```
