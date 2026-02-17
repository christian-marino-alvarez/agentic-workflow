---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
---

🏛️ **architect-agent**: Análisis de integración ChatKit avanzada en webview con servidor local y agentes dinámicos.

# Analysis — task-20260130-chatkit-mainview-Integrar ChatKit en mainView

## 1. Resumen ejecutivo
**Problema**
- El webview actual no integra ChatKit ni un backend local para agentes dinámicos, y la UI no prueba el flujo real con OpenAI.

**Objetivo**
- Mostrar ChatKit embebido en `mainView` con botón “Test” que envíe “Hello I am the first agent called Neo”, usando agente dinámico `gpt-5` creado por sesión, API key segura y servidor local en extension host.

**Criterio de éxito**
- Se cumplen los AC: ChatKit embebido, backend local con `apiURL`, API key en SecretStorage, botón Test produce respuesta real del agente Neo y no hay filtración de secretos.

---

## 2. Estado del proyecto (As-Is)
- **Estructura relevante**
  - `src/extension/views/main-view.ts` renderiza HTML base.
  - `package.json` define `mainView` en Activity Bar.
- **Componentes existentes**
  - `MainChatView` registra un `WebviewViewProvider` básico.
  - No existe servidor local ni integración ChatKit.
- **Nucleo / capas base**
  - Extension host controla activación; no hay capa de backend HTTP local.
- **Artifacts / tareas previas**
  - Tarea previa corrigió el nonce y el webview ya renderiza HTML.
- **Limitaciones detectadas**
  - Webview no puede usar `localhost` directo en entornos remotos sin `asExternalUri`.
  - API key no puede residir en webview.

---

## 3. Cobertura de Acceptance Criteria

### AC-1
- **Interpretación**: ChatKit debe renderizarse en el webview con `apiURL` apuntando al servidor local.
- **Verificación**: UI visible, network calls al servidor local vía `asExternalUri`.
- **Riesgos / ambigüedades**: configuración CSP y carga de `chatkit.js`.

### AC-2
- **Interpretación**: API key en SecretStorage y modelo `gpt-5` en creación del agente.
- **Verificación**: comando para set key, lectura en extension host, creación de agente con modelo correcto.
- **Riesgos / ambigüedades**: ausencia de key o permisos de SecretStorage.

### AC-3
- **Interpretación**: botón “Test” dispara mensaje y se ve respuesta real.
- **Verificación**: click genera request y respuesta visible en UI.
- **Riesgos / ambigüedades**: rate limits o fallos de red.

### AC-4
- **Interpretación**: no exponer API key; `mainView` único.
- **Verificación**: no hay key en webview, `activationEvents` intactos.
- **Riesgos / ambigüedades**: logging accidental en webview.

### AC-5
- **Interpretación**: flujo completo funciona en F5.
- **Verificación**: prueba manual en VS Code.
- **Riesgos / ambigüedades**: entorno remoto y acceso a servidor local.

---

## 4. Research técnico

- **Alternativa A: asExternalUri + servidor local HTTP (recomendado)**
  - Descripción: extension host levanta servidor local; webview usa `asExternalUri` para acceder incluso en Remote.
  - Ventajas: compatibilidad con Remote/Codespaces; flujo standard.
  - Inconvenientes: manejo de puertos y lifecycle del servidor.

- **Alternativa B: message passing (postMessage) + proxy en extension host**
  - Descripción: webview no llama a HTTP; usa `postMessage` y extension host ejecuta llamadas.
  - Ventajas: evita problemas de red; sin servidor HTTP.
  - Inconvenientes: no encaja bien con ChatKit embed que espera `apiURL` HTTP; más trabajo de adaptación.

**Decisión recomendada (si aplica)**
- **Usar asExternalUri + servidor local HTTP**, porque ChatKit embed necesita `apiURL` y el backend debe ser accesible como endpoint HTTP.

---

## 5. Agentes participantes
- **vscode-specialist**
  - Responsabilidades: integración webview, CSP, carga de ChatKit, UI botón “Test”.
- **architect-agent**
  - Responsabilidades: decisiones de arquitectura, seguridad de API key, flujo de agentes dinámicos.

**Handoffs**
- architect define arquitectura y requisitos; vscode-specialist implementa webview + wiring.

**Componentes necesarios**
- Crear servidor local HTTP en extension host.
- Crear comando “Agentic: Set OpenAI Key”.
- Modificar webview para embed ChatKit + botón Test.

**Demo (si aplica)**
- Sí: botón “Test” que dispara el mensaje del agente Neo.

---

## 6. Impacto de la tarea
- **Arquitectura**: se agrega backend local (servidor HTTP) y flujo de agentes dinámicos.
- **APIs / contratos**: nuevos endpoints internos para ChatKit.
- **Compatibilidad**: requiere `asExternalUri` para Remote.
- **Testing / verificación**: prueba manual en F5; validación de secret storage y flujo ChatKit.

---

## 7. Riesgos y mitigaciones
- **Riesgo 1**: webview no accede a localhost en Remote.
  - Impacto: chat no carga.
  - Mitigación: usar `asExternalUri` para exponer el endpoint.
- **Riesgo 2**: crear agente por sesión aumenta coste/latencia.
  - Impacto: respuesta lenta y coste alto.
  - Mitigación: limitar creación por sesión y reciclar mientras la vista esté abierta.
- **Riesgo 3**: fuga de API key.
  - Impacto: seguridad comprometida.
  - Mitigación: SecretStorage + nunca exponer en webview.

---

## 8. Preguntas abiertas
- Confirmar flujo exacto de creación del agente dinámico con ChatKit advanced en el server local.

---

## 9. TODO Backlog (Consulta obligatoria)

**Referencia**: `.agent/todo/`

**Estado actual**: vacío (directorio no existe)

**Items relevantes para esta tarea**:
- Ninguno

**Impacto en el análisis**:
- Sin impacto.

---

## 10. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-30T00:00:00Z
    comments: null
```
