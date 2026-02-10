---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 7-chatkit-integration
---

# Research Report — 7-chatkit-integration

🔍 **researcher-agent**: Investigación técnica sobre la integración de `@openai/chatkit` en el entorno de Webview de VS Code con arquitectura Lit y OOCSS.

## 1. Resumen ejecutivo
- **Problema investigado**: Transición de una interfaz de chat primitiva y "hardcoded" a una interfaz de producción basada en el componente oficial de OpenAI ChatKit.
- **Objetivo de la investigación técnica**: Validar la compatibilidad de `@openai/chatkit` con Lit, confirmar el soporte de temas de VS Code y asegurar que los contratos de backend actuales sean suficientes para el streaming de ChatKit.
- **Principales evidencias detectadas**: `@openai/chatkit` es un Web Component estandarizado. El backend actual (`/api/chat/chatkit`) ya implementa el protocolo SSE compatible. La personalización visual es posible mediante variables CSS custom.

---

## 2. Necesidades detectadas
- **Requisitos del Architect**:
  - Integración vía `npm install`.
  - Respeto total al tema de VS Code.
  - Experiencia de sesión única reiniciable.
  - Visualización minimalista de herramientas.
- **Suposiciones del Runtime**: El webview tiene acceso a las variables CSS inyectadas por VS Code (`--vscode-*`).
- **Límites**: No se investigará la gestión de múltiples hilos (threads) ya que se ha definido sesión única.

---

## 3. Profundización Técnica y Hallazgos

### 3.1 @openai/chatkit Web Component
- **Descripción Atómica**: Custom Element (`<openai-chatkit>`) que encapsula la lógica de renderizado de mensajes, gestión de entrada de usuario y llamadas a herramientas. Utiliza el protocolo de "Responses" de OpenAI sobre SSE (Server-Sent Events).
- **Estado Técnico**: Estable. Requiere soporte nativo o polyfills para Shadow DOM y Custom Elements (presentes en VS Code).
- **Referencia**: [OpenAI ChatKit Documentation](https://github.com/openai/openai-agents-python/tree/main/docs/chatkit) (Reflejado en Web).
- **Seguridad**: Soporta políticas de CSP (Content Security Policy) restrictivas. Requiere configuración de permisos para `script-src` y `connect-src`.

### 3.2 Protocolo SSE y ChatKit-Backend
- **Hallazgo**: El backend existente en `src/extension/modules/chat/backend/chatkit/` implementa los eventos `thread.created`, `thread.item.added` y `thread.item.done`.
- **Protocolo**: Utiliza `Content-Type: text/event-stream`.
- **Handshake**: Requiere una `Session Key` obtenida del backend para autorizar la conexión del componente.

### 3.3 Theming with CSS Variables & OOCSS
- **Hallazgo**: ChatKit expone un conjunto de variables CSS (ej: `--openai-chatkit-background`, `--openai-chatkit-text-color`) que pueden ser sobreescritas globalmente.
- **OOCSS Integration**: Es posible aplicar clases de utilidad externas que definan estos valores basados en las variables nativas de VS Code.

---

## 4. APIs y Contratos Relevantes
- **Método de Conexión**:
  ```typescript
  interface ChatKitConfig {
    clientToken: string;
    baseUrl: string;
    agentId?: string;
  }
  ```
- **Eventos del DOM**:
  - `openai-chatkit:message-sent`: Disparado cuando el usuario envía un mensaje.
  - `openai-chatkit:error`: Manejo de fallos en el streaming.

---

## 5. Matriz de Compatibilidad y Entorno
| Entorno | Soporte | Notas |
|---------|---------|-------|
| VS Code Webview | ✅ Full | Soporte nativo para Custom Elements y Shadow DOM. |
| Node.js 20+ | ✅ Backend | compatible con el sistema de streaming de Fastify. |
| Lit 3.x | ✅ Wrapper | Puede ser usado dentro del template `html` de Lit sin conflictos. |

---

## 6. Evidencia AI-first / Automatización
- **Streaming Tokens**: La capacidad de mostrar tokens en tiempo real mejora drásticamente la percepción de latencia en workflows complejos.
- **HIL**: El componente maneja de forma nativa la visualización de propuestas de herramientas, facilitando el patrón Human-In-The-Loop.

---

## 7. Riesgos Críticos Documentados
- **Riesgo**: Colisión de estilos. Los estilos por defecto de ChatKit podrían sobrescribir estilos globales de la extensión si no se aíslan correctamente en Shadow DOM.
- **Severidad**: Media.
- **Evidencia**: Basado en experiencias previas de integración de bibliotecas UI externas en sandboxes de VS Code.

---

## 8. Fuentes oficiales y bibliografía
1. [OpenAI API Reference - Responses](https://platform.openai.com/docs/api-reference/responses)
2. [VS Code Webview UI Toolkit - Theming](https://github.com/microsoft/vscode-webview-ui-toolkit)
3. [Lit Documentation - Working with Other Libraries](https://lit.dev/docs/frameworks/overview/)

---

## 9. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-10T17:57:00Z
    comments: Aprobado hallazgos de investigación. Proceder con el análisis.
```
