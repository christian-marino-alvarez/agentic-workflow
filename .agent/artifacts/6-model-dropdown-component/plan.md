---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: approved
related_task: 6-model-dropdown-component
---

# Implementation Plan — 6-model-dropdown-component

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Plan de implementación detallado para el selector de modelos y orquestación dinámica.

## 1. Resumen del plan
- **Contexto**: Implementar un componente dropdown en el chat para seleccionar modelos manualmente y un motor de orquestación que proponga modelos ligeros por tarea.
- **Resultado esperado**: 
  - Componente `<vscode-dropdown>` funcional en el ChatView.
  - Sincronización de la lista de modelos desde el backend.
  - Flujo de interrupción (Human-in-the-loop) para aprobación de modelos sugeridos.
- **Alcance**: 
  - Incluye: UI, Lógica de advisor, Contratos de mensajería, Persistencia local de selección.
  - Excluye: Configuración de nuevos modelos (se hace en Security).

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/6-model-dropdown-component/task.md`
- **Analysis**: `.agent/artifacts/6-model-dropdown-component/analysis.md`
- **Acceptance Criteria**: Ver `acceptance.md` (Integración VS Code Toolkit, Propuesta Dinámica, Notificaciones).

**Dispatch de dominios (OBLIGATORIO)**
```yaml
plan:
  workflows:
    - domain: chat
      action: refactor
      workflow: workflow.tasklifecycle-long.phase-4-implementation

  dispatch:
    - domain: ui
      action: create
      workflow: subtask-ui-implementation
    - domain: backend
      action: create
      workflow: subtask-backend-orch-implementation
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Configuración de Dependencias y Bundle
- **Descripción**: Añadir `@vscode/webview-ui-toolkit` a `package.json` y asegurar que `scripts/build/bundle-webviews.mjs` lo incluya correctamente.
- **Entregables**: `package.json` actualizado, bundle funcional con el toolkit.
- **Agente responsable**: ui-agent

### Paso 2: Contratos y Sincronización de Estado
- **Descripción**: Actualizar `StateUpdateMessage` en `types.d.ts` e implementar el envío de la lista de modelos desde `ChatController`.
- **Entregables**: Tipos actualizados, `ChatController.syncState` enviando `ExtensionConfig.models`.
- **Agente responsable**: backend-agent

### Paso 3: UI del Selector (Dropdown)
- **Descripción**: Integrar el componente `<vscode-dropdown>` en `templates/main/html/index.ts`. Manejar el evento `@change` para enviar la nueva selección al backend.
- **Entregables**: UI actualizada, evento `chat:set-model` implementado.
- **Agente responsable**: ui-agent

### Paso 4: Motor de Asesoría de Modelos (Orchestrator)
- **Descripción**: Implementar `ModelAdvisor` en el backend. Interceptar el inicio de proceso de mensaje para evaluar si proponer un modelo diferente.
- **Entregables**: Clase `ModelAdvisor`, integración en `WorkflowRuntimeService`.
- **Agente responsable**: backend-agent

### Paso 5: Flujo de Consentimiento (HIL)
- **Descripción**: Implementar la interrupción `chat:model-proposal` en el frontend (Toast/Dialog) y el endpoint de decisión en el backend.
- **Entregables**: Componente de notificación en UI, lógica de aprobación/rechazo en backend.
- **Agente responsable**: ui-agent & backend-agent

---

## 4. Asignación de responsabilidades (Agentes)

- **Architect-Agent**
  - Supervisión de contratos y validación de gates de implementación.
- **ui-agent**
  - Implementación de webview components y lógica de estado frontal.
- **backend-agent**
  - Lógica de orquestación, ModelAdvisor y endpoints de Fastify.

---

## 5. Estrategia de testing y validación
- **Unit tests**: Tests para `ModelAdvisor` (decisiones de modelo correctas).
- **Integration tests**: Verificar que el cambio en el dropdown llega al backend y actualiza `SettingsStorage`.
- **E2E / Manual**:
  - Escenario 1: Inicio de chat -> El dropdown muestra los modelos de Security correctamente.
  - Escenario 2: Cambio de modelo -> Se persiste la selección local del chat.
  - Escenario 3: Propuesta dinámica -> Aparece el toast, acepto, y el log muestra el uso del modelo ligero.

---

## 6. Plan de demo
- **Objetivo**: Mostrar el flujo completo desde la selección manual hasta la orquestación asistida.
- **Datos de ejemplo**: Modelos mockeados ("Pro: GPT-4o", "Flash: GPT-4o-mini").
- **Criterios de éxito**: El usuario ve el cambio de modelo en tiempo real y el sistema reacciona a su decisión.

---

## 7. Estimaciones y pesos de implementación
- **Paso 1-2**: Bajo (Setup y contratos).
- **Paso 3**: Medio (UI y estilos).
- **Paso 4-5**: Alto (Lógica de orquestación e interrupciones).

---

## 8. Puntos críticos y resolución
- **Punto crítico 1**: Integración de dependencias externas en el bundle de VS Code.
  - **Resolución**: Verificación inmediata del build tras añadir el toolkit.
- **Punto crítico 2**: Estado de carrera si el usuario cierra la propuesta y envía un mensaje.
  - **Resolución**: Bloqueo de la caja de texto durante la propuesta de modelo.

---

## 9. Dependencias y compatibilidad
- **Internas**: `SettingsStorage`, `AgwViewBase`.
- **Externas**: `@vscode/webview-ui-toolkit`.

---

## 10. Criterios de finalización
- [ ] El dropdown se renderiza con los modelos configurados.
- [ ] La selección manual persiste en la sesión actual.
- [ ] Se recibe y procesa correctamente una propuesta de modelo dinámico.
- [ ] Un usuario sin modelos configurados no puede acceder al chat.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-10T09:34:30+01:00
    comments: Plan aprobado. Iniciando implementación.
```
