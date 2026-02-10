---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: approved
related_task: 6-model-dropdown-component
---

# Analysis — 6-model-dropdown-component

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Análisis de arquitectura e impacto para la implementación del selector de modelos y orquestación dinámica.

## 1. Resumen ejecutivo
**Problema**
El sistema actual de chat carece de una interfaz para cambiar de modelo manualmente y de una lógica que optimice el uso de modelos (coste/eficiencia) según la tarea específica que realiza el agente.

**Objetivo**
Implementar el componente `vscode-dropdown` para selección manual y establecer el flujo de "Propuesta de Modelo" donde el sistema sugiere cambios optimizados que el usuario debe validar.

**Criterio de éxito**
- Interfaz nativa (reutilizando VS Code toolkit).
- Bloqueo de chat si no hay modelo activo.
- Soporte para interrupciones de backend para consentimiento de modelo por tarea.

---

## 2. Estado del proyecto (As-Is)
- **Estructura relevante**
  - `src/extension/modules/chat/web/`: Contiene la lógica Lit del chat.
  - `src/extension/modules/chat/background/background.ts`: Controlador principal.
  - `src/extension/modules/security/background/settings-storage.ts`: Gestión de modelos persistente.
- **Componentes existentes**
  - El `agw-chat-view` ya recibe `modelId` y `environment` vía `chat:state-update`.
  - No existe integración con `@vscode/webview-ui-toolkit`.
- **Nucleo / capas base**
  - `AgwViewProviderBase` y `AgwViewBase` gestionan la comunicación con ACK/Streaming.
- **Limitaciones detectadas**
  - El bundle de webviews (`bundle-webviews.mjs`) necesitará incluir el toolkit de VS Code.

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Interfaz Nativa
- **Interpretación**: Sustituir el display de texto plano actual por un `<vscode-dropdown>`.
- **Verificación**: Inspección visual del webview.
- **Riesgos**: Conflictos de estilos CSS (glassmorphism vs native toolkit).

### AC-2: Propuesta Dinámica (Orquestación)
- **Interpretación**: El backend debe poder interrumpir el flujo si un agente sugiere un modelo mejor.
- **Verificación**: Test E2E donde el agente propone un cambio y el flujo se detiene hasta el ACK del usuario.

### AC-3: Notificaciones y Reintentos
- **Interpretación**: Sistema de toasts para errores de backend.
- **Verificación**: Simular caída de backend y verificar que aparece el toast con botón "Retry".

---

## 4. Research técnico
- **Enfoque A (Preferido)**: Integrar `@vscode/webview-ui-toolkit` vía CDN o Bundle (npm) y registrar los componentes en la fase de inicialización del Webview.
- **Enfoque B**: Implementar dropdown custom con CSS. Descartado por requisito explícito de reutilizar componentes nativos.

**Decisión recomendada**
Enfoque A. Proporciona la mejor experiencia de usuario y cumple con los estándares de extensiones de VS Code.

---

## 5. Agentes participantes
- **ui-agent**:
  - Responsabilidades: Implementación del componente Lit, estilos y gestión de estado en el frontend.
  - Subáreas: `src/extension/modules/chat/web/`.
- **backend-agent**:
  - Responsabilidades: Implementación del `ModelAdvisor` y lógica de interrupción en Fastify.
  - Subáreas: `src/extension/modules/chat/backend/`.
- **security-agent**:
  - Responsabilidades: Asegurar que el bloqueo por falta de modelos configurados sea robusto.

**Handoffs**
Vía eventos de mensajería puente (`chat:model-proposal`, `chat:model-decision`).

---

## 6. Impacto de la tarea
- **Arquitectura**
  - Introducción de una capa de "Asesoría de Modelos" (`ModelAdvisor`) en el backend.
- **APIs / contratos**
  - Extensión de `StateUpdateMessage` para incluir la lista de modelos disponibles.
- **Testing / verificación**
  - Nuevos tests E2E para el flujo de consentimiento.

---

## 7. Riesgos y mitigaciones
- **Riesgo 1**: Bloqueo del bundle por tamaño excesivo al incluir el toolkit.
- **Mitigación**: Usar `esbuild` con tree-shaking para incluir solo los componentes necesarios.
- **Riesgo 2**: Confusión del usuario ante múltiples propuestas.
- **Mitigación**: Limitar las propuestas a cambios significativos de coste (ej: de GPT-4o a GPT-4o-mini).

---

## 8. TODO Backlog (Consulta obligatoria)
**Referencia**: `.agent/todo/`
**Estado actual**: vacío
**Items relevantes para esta tarea**: Ninguno.

---

## 9. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-10T09:33:38+01:00
    comments: Análisis aprobado. Proceder con el plan de implementación.
```
