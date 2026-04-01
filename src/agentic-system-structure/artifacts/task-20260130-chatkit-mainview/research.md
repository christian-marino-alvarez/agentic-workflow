---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
---

🔍 **researcher-agent**: Investigación de ChatKit avanzado, requisitos de servidor y consideraciones de webview/secretos en VS Code.

# Research Report — task-20260130-chatkit-mainview-Integrar ChatKit en mainView

## 1. Resumen ejecutivo
- Problema investigado: Integración de ChatKit en un webview de VS Code con backend local y agentes dinámicos.
- Objetivo de la investigacion: Identificar requisitos de ChatKit avanzado, endpoints, seguridad y límites de webview para comunicación local.
- Principales hallazgos: ChatKit avanzado requiere servidor propio y `apiURL`; webviews no pueden usar localhost directo en entornos remotos; SecretStorage es la vía recomendada para secretos.

---

## 2. Necesidades detectadas
- Requisitos tecnicos identificados por el architect-agent
  - Backend ChatKit propio (advanced) con endpoint `apiURL`.
  - API key fuera del webview; uso de SecretStorage en el extension host.
  - ChatKit embed en webview requiere cargar `chatkit.js` desde CDN y usar bindings JS/React.
  - Para local server en webview: usar `asExternalUri` o message passing para entornos remotos.
- Suposiciones y limites
  - Se usará integración avanzada para agentes dinámicos.
  - El servidor será local en el extension host (Node).

---

## 3. Hallazgos técnicos

### ChatKit: integración avanzada (servidor propio)
- Descripción: ChatKit avanzado permite usar infraestructura propia y un servidor ChatKit que procesa requests y emite eventos/stream.
- Estado actual: activo.
- Documentación oficial: guía de integración avanzada. citeturn0search3
- Limitaciones conocidas: requiere implementar servidor y un `apiURL` para el cliente; el cliente embebe widget y se comunica con el servidor. citeturn0search3

### ChatKit: integración recomendada (workflow fijo)
- Descripción: ChatKit puede apuntar a un workflow de Agent Builder; requiere generar sesión y devolver `client_secret` desde un backend.
- Estado actual: activo.
-- Documentación oficial: guía principal de ChatKit. citeturn0search5
-- Limitaciones conocidas: depende de workflow fijo; menos control para agentes dinámicos. citeturn0search5

### ChatKit frontend (script + bindings)
- Descripción: Para embebido, se carga `chatkit.js` desde CDN y se usan bindings (p. ej. `@openai/chatkit-react`) para montar el widget.
- Estado actual: activo.
-- Documentación oficial: guía ChatKit. citeturn0search5
-- Limitaciones conocidas: requiere backend que entregue `client_secret` y configure `apiURL`. citeturn0search5

### Agents SDK
- Descripción: SDK para construir agentes con OpenAI (JS/Python), útil para crear agentes dinámicos en backend propio.
- Estado actual: activo.
-- Documentación oficial: guía Agents SDK. citeturn0search1
-- Limitaciones conocidas: documentación principal remite a repositorios SDK. citeturn0search1

### VS Code webviews y acceso a servidores locales
- Descripción: En entornos remotos, el `localhost` del webview no apunta al extension host; se recomienda message passing o `asExternalUri`.
- Estado actual: activo.
-- Documentación oficial: Remote Extensions (`asExternalUri`, port mapping). citeturn0search2
-- Limitaciones conocidas: webview no accede a localhost remoto sin `asExternalUri` o `portMapping`. citeturn0search2

### VS Code SecretStorage
- Descripción: `ExtensionContext.secrets` provee almacenamiento seguro cifrado para claves; recomendado por VS Code.
- Estado actual: activo.
-- Documentación oficial: Common Capabilities. citeturn0search6
-- Limitaciones conocidas: secretos no se sincronizan entre máquinas. citeturn0search6

---

## 4. APIs relevantes
- ChatKit `apiURL` (endpoint del servidor ChatKit propio). Estado: requerido en integración avanzada. citeturn0search3
- `vscode.env.asExternalUri` para enrutar requests desde webviews a servidores locales remotos. Estado: soportado. citeturn0search2
- `ExtensionContext.secrets` (SecretStorage). Estado: soportado. citeturn0search6

---

## 5. Compatibilidad multi-browser
- Tabla de compatibilidad: Webviews corren en el motor de VS Code/Electron; no aplica compatibilidad multi‑browser clásica.
-- Diferencias clave: en VS Code Web/Remote, webview no puede usar localhost sin `asExternalUri` o `portMapping`. citeturn0search2
-- Estrategias de mitigacion: uso de `asExternalUri` o message passing. citeturn0search2

---

## 6. Oportunidades AI-first detectadas
-- Uso de Agents SDK para crear agentes dinámicos en backend propio. citeturn0search1
-- ChatKit advanced permite widgets y acciones para flujos guiados. citeturn0search3

---

## 7. Riesgos identificados
-- Riesgo: webview no puede acceder a localhost remoto sin mecanismos especiales. Severidad: alta. Fuente: Remote Extensions doc. citeturn0search2
-- Riesgo: secretos en cliente; debe evitarse. Severidad: alta. Fuente: SecretStorage doc. citeturn0search6
-- Riesgo: integración avanzada requiere servidor propio y store; esfuerzo extra. Severidad: media. Fuente: ChatKit advanced guide. citeturn0search3

---

## 8. Fuentes
-- OpenAI ChatKit (guía principal): https://platform.openai.com/docs/guides/chatkit citeturn0search5
-- OpenAI ChatKit Advanced (custom): https://platform.openai.com/docs/guides/custom-chatkit citeturn0search3
-- OpenAI Agents SDK: https://platform.openai.com/docs/guides/agents-sdk citeturn0search1
-- VS Code Remote Extensions (asExternalUri/port mapping): https://code.visualstudio.com/api/advanced-topics/remote-extensions citeturn0search2
-- VS Code SecretStorage: https://code.visualstudio.com/api/extension-capabilities/common-capabilities citeturn0search6

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-30T00:00:00Z
    comments: null
```
