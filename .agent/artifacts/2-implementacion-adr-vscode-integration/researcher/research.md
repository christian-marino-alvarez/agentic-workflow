🔬 **researcher-agent**: Research report completado para la tarea de roadmap de implementación del ADR-001

# Research Report — 2-implementacion-adr-vscode-integration

## 1. Resumen ejecutivo

**Problema investigado**: Descomponer la arquitectura definida en el ADR-001 (Integración de OpenAI ChatKit, OpenAI Agent SDK y Runtime MCP en VS Code) en tareas atómicas ejecutables.

**Objetivo de la investigación**: Identificar componentes técnicos, tecnologías clave, requisitos de seguridad y usabilidad, y dependencias entre módulos para crear un roadmap estructurado de implementación.

**Principales hallazgos**:
- OpenAI ChatKit (Vercel AI SDK) soporta múltiples transports incluyendo DirectChatTransport para comunicación directa con agentes
- VS Code webviews requieren Content Security Policy (CSP) estricto para prevenir XSS y exfiltración de datos
- Agentes autónomos necesitan OAuth 2.0/M2M con tokens de corta duración, least-privilege y explicit user consent
- Runtime MCP debe funcionar como middleware de gobernanza preventiva, no reactiva
- Persistencia de estado requiere arquitectura robusta para sincronizar UI ↔ Agent ↔ Runtime

---

## 2. Necesidades detectadas

Basándome en el ADR-001 y las respuestas del desarrollador en la Fase 0:

### Requisitos técnicos identificados:

1. **UI/Frontend**:
   - Integración de OpenAI ChatKit en módulo `chat` de la extensión VS Code
   - Dropdown UI para selección de modelo LLM por tarea
   - Sistema escalable para añadir nuevos modelos
   - Webview seguro con CSP estricto

2. **Backend/Agent**:
   - OpenAI Agent SDK ejecutándose en Extension Host (no en servidor local)
   - AgentController que gestiona instancias del Agent SDK
   - SSE Event Bridge para streaming entre UI y Agent
   - Gestión de hilos (threads) persistente

3. **Gobernanza/Runtime**:
   - Runtime MCP con control total sobre workflow
   - Sistema de roles y permisos escalable para empresas
   - Autorización preventiva de tools y skills
   - Auditoría completa de todas las acciones del agente

4. **Setup/Configuración**:
   - Módulo de configuración de modelos LLM
   - Configuración de path de persistencia (actualmente `.agent/artifacts`)
   - Soporte para rutas customizables y futura conexión a DB/GitHub

### Supuestos y límites:

- La arquitectura debe mantener aislamiento entre Webview y Extension Host
- API keys y secretos deben almacenarse solo en Extension Host
- El sistema debe operar dentro de las restricciones de VS Code Extension API
- La latencia del middleware Runtime MCP debe minimizarse

---

## 3. Hallazgos técnicos

### OpenAI ChatKit (OFICIAL)

**Descripción**: Framework oficial de OpenAI para embeber interfaces de chat AI-powered en aplicaciones. **Web component framework-agnostic** que no requiere construir UI custom ni manejar estado de chat de bajo nivel.

**Estado actual**: Estable, activamente mantenido por OpenAI

**Documentación oficial**: 
- https://openai.github.io/chatkit-js/
- https://platform.openai.com/docs/guides/chatkit
- Repositorio: https://github.com/openai/chatkit-js

**Características clave**:
- **Framework-agnostic**: Funciona con cualquier stack (React, Vue, Svelte, **Lit**, Vanilla JS)
- **Drop-in solution**: Web component `<openai-chatkit>` o React component `<ChatKit />`
- **UI completa incluida**: No necesitas construir componentes de chat
- **Deep UI customization**: Temas, estilos, widgets personalizables
- **Built-in response streaming**: Conversaciones interactivas en tiempo real
- **Tool and workflow integration**: Visualización de acciones agéntic as y chain-of-thought
- **Rich interactive widgets**: Cards, forms, buttons, date pickers, images renderizados en chat
- **Attachment handling**: Soporte para subida de archivos e imágenes
- **Thread and message management**: Organización de conversaciones complejas
- **Source annotations y entity tagging**: Transparencia y referencias

**Opciones de implementación**:

1. **React** (con bindings oficiales):
   ```bash
   npm install @openai/chatkit-react
   ```
   ```jsx
   import { ChatKit, useChatKit } from '@openai/chatkit-react';
   
   const { control } = useChatKit({
     api: { url, domainKey }
   });
   <ChatKit control={control} className="h-[600px] w-[320px]" />
   ```

2. **Vanilla JS / Web Component** (framework-agnostic, **compatible con Lit**):
   ```html
   <script src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" async></script>
   ```
   ```javascript
   const chatkit = document.createElement('openai-chatkit');
   chatkit.setOptions({ api: { url, domainKey } });
   document.body.appendChild(chatkit);
   ```

**Backend options**:

1. **Managed (OpenAI-hosted)**:
   - Usar workflows creados en **OpenAI Agent Builder**
   - OpenAI gestiona backend, session management, streaming
   - Requiere workflow ID

2. **Self-hosted**:
   - Usar **ChatKit Python SDK** en tu infraestructura
   - Control total sobre inference stack
   - Mayor control sobre autenticación, data residency

**Integración con VS Code Webview**:

✅ **Perfectamente compatible con Lit**: Al ser un web component puro, se integra naturalmente con Lit.

✅ **Compatible con React**: Si prefieres React, usa los bindings `@openai/chatkit-react`.

**Arquitectura para VS Code Extension**:

```
┌─────────────────────────────────────┐
│  Webview (Lit + <openai-chatkit>)  │
│  - Web component nativo             │
│  - postMessage para auth tokens     │
└─────────────────────────────────────┘
              ↕ HTTPS
┌─────────────────────────────────────┐
│  OpenAI Agent Builder (managed)     │
│  - Workflows configurables          │
│  - Session management               │
│  - Streaming responses              │
└─────────────────────────────────────┘
```

O con backend self-hosted:

```
┌─────────────────────────────────────┐
│  Webview (Lit + <openai-chatkit>)  │
└─────────────────────────────────────┘
              ↕ HTTPS
┌─────────────────────────────────────┐
│  Extension Host (ChatKit Python SDK)│
│  - Custom backend con AgentKit      │
│  - Runtime MCP middleware           │
│  - Control total de auth/data       │
└─────────────────────────────────────┘
```

**Limitaciones conocidas**:
- Requiere conexión a backend (managed o self-hosted)
- Managed backend = vendor lock-in con OpenAI
- Self-hosted backend requiere implementar ChatKit Python SDK
- Session management requiere implementar endpoint para client secrets

### OpenAI Agents SDK (TypeScript/JavaScript)

**Descripción**: SDK oficial de OpenAI para construir aplicaciones agénticas multi-agente con TypeScript/JavaScript. **Lightweight framework** con muy pocas abstracciones para máximo control.

**Estado actual**: Estable, activamente mantenido por OpenAI

**Documentación oficial**:
- https://openai.github.io/openai-agents-js/
- https://platform.openai.com/docs/guides/agents-sdk
- Repositorio: https://github.com/openai/openai-agents-js
- NPM: `@openai/agents`

**Características clave**:
- **Multi-agent workflows**: Orquestación de múltiples agentes especializados
- **Tool integration**: Llamadas a funciones externas y APIs
- **Handoffs**: Transferencia dinámica de control entre agentes
- **Structured outputs**: Outputs validados con schemas (plain text o structured)
- **Streaming responses**: Output y eventos en tiempo real
- **Built-in tracing y debugging**: Visualización y optimización de agent runs
- **Guardrails**: Validación de inputs/outputs para seguridad
- **Parallelization**: Ejecución paralela de agentes o tool calls
- **Human-in-the-loop**: Aprobaciones e intervenciones humanas
- **Real-time voice agents**: WebRTC o WebSockets

**Compatibilidad**:
- ✅ Node.js (v22+)
- ✅ Deno
- ✅ Bun
- ⚠️ Cloud flare Workers (experimental)

**Instalación**:
```bash
npm install @openai/agents
```

**Ejemplo básico**:
```typescript
import { Agent } from '@openai/agents';

const agent = new Agent({
  model: 'gpt-4',
  instructions: 'You are a helpful assistant',
  tools: [/* ... */]
});

// Streaming
for await (const event of agent.run('Hello')) {
  console.log(event);
}
```

**Integración con ChatKit**:
- ChatKit puede usar Agents SDK como backend (self-hosted)
- Agents SDK maneja lógica agéntica
- ChatKit maneja UI de chat
- Comunicación vía API HTTP custom

**Uso en VS Code Extension Host**:

✅ **Perfectamente compatible**: Al ser TypeScript/Node.js, puede ejecutarse directamente en el Extension Host de VS Code.

**Arquitectura**:
```
┌─────────────────────────────────────┐
│ Extension Host (Node.js)            │
│ ├─ Agents SDK (@openai/agents)     │
│ ├─ Multi-agent workflows            │
│ ├─ Tool integration                 │
│ └─ Runtime MCP middleware           │
└─────────────────────────────────────┘
        ↕
┌─────────────────────────────────────┐
│ Webview (Lit + ChatKit)             │
│ - Chat UI                           │
│ - User interactions                 │
└─────────────────────────────────────┘
```

**Limitaciones conocidas**:
- Requiere Node.js 22+ (Extension Host debe soportar esta versión)
- Agentes complejos pueden tener latencia significativa
- Gestión de estado y persistencia es manual
- No incluye UI (necesita ChatKit u otra solución)

### Runtime MCP (Model Context Protocol)

**Descripción**: Protocolo y runtime del proyecto agentic-workflow para gobernanza, autorización y trazabilidad de agentes.

**Estado actual**: Implementado localmente en `.agent/runtime/`

**Documentación**: `.agent/rules/constitution/runtime-integration.md`

**Capacidades**:
- `runtime_run`, `runtime_advance_phase`, `runtime_validate_gate`
- Control de workflow y fases
- Registro de eventos y logs
- Validación de constituciones

**Requisitos de extensión (según ADR)**: 
- Debe actuar como middleware preventivo (gatekeeping)
- Control de autorización de tools por rol/permiso
- Registrar cada acción del agente para auditoría
- Sistema de roles y permisos escalable

---

## 4. APIs relevantes

### VS Code Extension API

**Principales módulos relevantes**:

1. **Webview API** (`vscode.window.createWebviewPanel`)
   - Estado de soporte: Estable en todas las versiones recientes
   - Permite crear paneles de UI custom en VS Code
   - Aislamiento de contexto (separate origin)
   - Comunicación vía `postMessage`

2. **Extension Host APIs**
   - `vscode.workspace` para acceso a configuración
   - `vscode.SecretStorage` para API keys (almacenamiento seguro)
   - `vscode.Memento` para persistencia de estado

3. **Local HTTP Server** (via Node.js `http` module)
   - Permite servir SSE para streaming
   - Necesario para ChatKit si usa DefaultChatTransport

**Restricciones conocidas**:
- Webviews no pueden acceder directamente a APIs de Node.js
- CSP estricto requerido
- Comunicación async vía message passing

---

## 5. Integración de OpenAI ChatKit en VS Code Webview

### Decisión simplificada: ChatKit es framework-agnostic

**Hallazgo clave**: OpenAI ChatKit es un **web component** estándar, lo que significa que es compatible con **cualquier framework** incluyendo Lit, React, Vue, Svelte, y Vanilla JS.

**No hay conflicto entre ChatKit y Lit**.

---

### Opción A: Lit + OpenAI ChatKit Web Component (RECOMENDADA)

**Integración**:
```typescript
// En tu Lit component
import { LitElement, html } from 'lit';

class ChatPanel extends LitElement {
  firstUpdated() {
    // Cargar script de ChatKit
    const script = document.createElement('script');
    script.src = 'https://cdn.platform.openai.com/deployments/chatkit/chatkit.js';
    script.async = true;
    document.head.appendChild(script);
    
    script.onload = () => {
      // Crear elemento ChatKit
      const chatkit = document.createElement('openai-chatkit');
      chatkit.setOptions({
        api: { url: this.apiUrl, domainKey: this.domainKey }
      });
      this.shadowRoot.appendChild(chatkit);
    };
  }
  
  render() {
    return html`<div id="chatkit-container"></div>`;
  }
}
```

**Ventajas**:
- ✅ Bundle ligero (Lit ~5KB + ChatKit ~small footprint)
- ✅ Recomendación oficial de Microsoft para VS Code webviews
- ✅ Theming automático de VS Code
- ✅ Accesibilidad (ARIA) incorporada
- ✅ UI completa de ChatKit sin construir componentes custom

**Arquitectura**:
```
┌─────────────────────────────────────┐
│ VS Code Webview (Lit)               │
│ ├─ Lit Components (layout, header)  │
│ └─ <openai-chatkit> (chat UI)       │
└─────────────────────────────────────┘
        ↕ postMessage (auth tokens)
┌─────────────────────────────────────┐
│ Extension Host                      │
│ ├─ ChatKit session endpoint         │
│ └─ Runtime MCP middleware           │
└─────────────────────────────────────┘
        ↕ HTTPS
┌─────────────────────────────────────┐
│ Backend (elección)                  │
│ ├─ Option A: OpenAI Agent Builder   │
│ └─ Option B: Self-hosted (Python)   │
└─────────────────────────────────────┘
```

---

### Opción B: React + OpenAI ChatKit React Bindings

**Integración**:
```bash
npm install @openai/chatkit-react
```

```tsx
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function MyChatPanel() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        // Fetch from Extension Host via postMessage
        const secret = await vscode.postMessage({ type: 'get-client-secret' });
        return secret;
      }
    }
  });
  
  return <ChatKit control={control} className="h-full w-full" />;
}
```

**Ventajas**:
- ✅ Bindings oficiales de React
- ✅ Hooks `useChatKit` para control fino
- ✅ Ecosistema React completo

**Contras**:
- ❌ Bundle más pesado (~150-200KB con React)
- ❌ No es recomendación de Microsoft para webviews
- ❌ Mayor complejidad de setup (bundler required)

---

### Comparación: Lit vs React para ChatKit en VS Code

| Criterio | Lit + ChatKit Web Component | React + ChatKit Bindings |
|----------|----------------------------|-------------------------|
| **Bundle Size** | ~5-10KB | ~150-200KB |
| **Setup Complexity** | Media | Media-Alta |
| **Microsoft Recommendation** | ✅ Sí | ❌ No |
| **ChatKit Integration** | Web component nativo | Bindings oficiales |
| **Development Speed** | Alta | Alta |
| **VS Code Theming** | Automático | Manual |

---

### Recomendación final

**Para VS Code Extension + OpenAI ChatKit**: Usar **Lit + ChatKit Web Component**

**Razones**:
1. Bundle mínimo (mejor rendimiento en webview)
2. Alineado con recomendación de Microsoft
3. ChatKit funciona perfectamente como web component
4. Lit proporciona estructura sin overhead de React
5. Theming automático de VS Code

**Cuándo usar React + ChatKit**:
- Si el equipo ya tiene fuerte experiencia en React
- Si necesitas integrar con ecosistema React existente
- Si bundle size no es prioridad crítica

---

### Backend: Managed vs Self-hosted

**Managed (OpenAI Agent Builder)**:
- Más rápido de setup
- OpenAI gestiona infraestructura
- Limitado a workflows de Agent Builder
- Vendor lock-in

**Self-hosted (ChatKit Python SDK)**:
- Control total de infraestructura
- Integración con Runtime MCP posible
- Más complejidad de implementación
- Sin vendor lock-in

---

### Integración con Runtime MCP

Si usas backend **self-hosted**, puedes integrar Runtime MCP como middleware:

```python
# Backend Python con ChatKit SDK + Runtime MCP
from openai_chatkit import ChatKit
from runtime_mcp import RuntimeClient

class MCPGoverned ChatKit:
    def __init__(self):
        self.chatkit = ChatKit(...)
        self.runtime = RuntimeClient(...)
    
    async def handle_tool_call(self, tool_name, args):
        # 1. Solicitar autorización al Runtime MCP
        authorized = await self.runtime.validate_tool(tool_name, args)
        
        if not authorized:
            return {"error": "Tool not authorized"}
        
        # 2. Ejecutar tool
        result = await self.chatkit.execute_tool(tool_name, args)
        
        # 3. Registrar en Runtime MCP
        await self.runtime.log_action(tool_name, result)
        
        return result
```

Con **managed backend**, no tienes control sobre tool execution, por lo que la gobernanza MCP sería limitada.

---

## 6. Oportunidades AI-first detectadas

1. **Agent-Based Architecture**: Usar `DirectChatTransport` de ChatKit + `ToolLoopAgent` permite crear agentes que corren directamente en Extension Host sin necesidad de servidor HTTP separado.

2. **Tool Extensibility**: El patrón de Tools del Agent SDK permite registrar dinámicamente nuevas capacidades (acceso a filesystem, ejecución de comandos, integración con APIs)

3. **Governance Middleware**: Runtime MCP puede implementar logging automático y compliance checks sin modificar el código del agente

4. **Multi-Model Strategy**: Dropdown configurable permite A/B testing de modelos o selección contextual por tipo de tarea

---

## 7. Riesgos identificados

### 7.1 Seguridad - Webview (Alta severidad)

**Riesgo**: XSS (Cross-Site Scripting) y exfiltración de datos en Webview

**Fuente**: VS Code Security Guidelines, OWASP CSP Cheat Sheet

**Detalles**:
- Webviews sin CSP estricto pueden ejecutar scripts maliciosos
- Uso de `.innerHTML` con datos no sanitizados = vector de ataque
- Inline scripts (`'unsafe-inline'`) debilitan CSP significativamente

**Mitigaciones requeridas** (según research):
- CSP con `default-src 'none'` como baseline
- Usar nonces o hashes para scripts inline inevitables
- `${webview.cspSource}` para recursos de la extensión
- Evitar `'unsafe-inline'` y `'unsafe-eval'`
- `localResourceRoots` restricto al mínimo
- Sanitizar todo input del usuario antes de renderizar

### 7.2 Seguridad - Autenticación de Agentes (Alta severidad)

**Riesgo**: Credenciales estáticas expuestas, privilege escalation, prompt injection

**Fuente**: OpenAI Security Best Practices, Curity AI Agent Auth Guide

**Detalles**:
- API keys en variables de entorno = vulnerable a leaks
- Agentes con permisos excesivos pueden ejecutar acciones no autorizadas
- Tokens JWT pasados a LLMs pueden decodificarse y exponerse

**Mitigaciones requeridas**:
- OAuth 2.0/M2M con tokens de corta duración (no refresh tokens)
- Least-privilege: agentes solo acceden a recursos necesarios
- Explicit user consent para acciones high-privilege
- Tokens opacos (no JWTs) para AI agents
- Identidades únicas no-humanas para agentes
- Claims con `client_type=ai-agent` para auditoría
- Guardrails de input/output para validación

### 7.3 Complejidad - Sincronización de Estado (Media severidad)

**Riesgo**: Pérdida de sincronización entre UI ↔ Agent ↔ Runtime

**Fuente**: ADR-001 - Consecuencias Negativas

**Detalles**:
- Thread state debe persistir incluso si Extension Host se reinicia
- Mensajes SSE pueden cortarse durante intercepción Runtime
- Race conditions en flujos concurrentes

**Mitigaciones sugeridas** (documentación, no recomendación):
- Estado de threads persistido en `vscode.Memento` o archivo
- Event sourcing pattern para reconstruir estado
- Retry logic y timeout handling en SSE bridge

### 7.4 Usabilidad - Latencia del Middleware (Media severidad)

**Riesgo**: Overhead de latencia en cada call al Runtime MCP

**Fuente**: ADR-001

**Detalles**:
- Cada tool invocation requiere round-trip al Runtime
- Usuario percibe delay en respuestas del agente
- UX degradada si latencia > 200ms por tool call

### 7.5 Escalabilidad - Sistema de Permisos (Media severidad)

**Riesgo**: Complejidad de gestión de roles y permisos para múltiples modelos y usuarios

**Fuente**: Requisitos del desarrollador (Fase 0, respuesta #3)

**Detalles**:
- Sistema debe escalar para uso empresarial
- Configuración de permisos por rol, tool, skill y modelo
- Auditoría de quién ejecutó qué acción con qué modelo

---

## 8. Fuentes

### Documentación oficial consultada:

- [Vercel AI SDK - Chatbot (useChat)](https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot)
- [VS Code Extension API - Webview Guide](https://code.visualstudio.com/api/extension-guides/webview)
- [OWASP Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Curity - AI Agent Authentication Guide](https://curity.io/resources/learn/ai-agent-authentication/)
- [OpenAI Safety Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)
- [Trail of Bits - VS Code Extension Security](https://blog.trailofbits.com/2024/01/31/vscode-extension-security/)

### Recursos adicionales:

- ADR-001 (`.agent/artifacts/1-adr-vscode-extension-integration/ADR-001-integration.md`)
- Constitución Runtime MCP (`.agent/rules/constitution/runtime-integration.md`)
- Acceptance Criteria de la tarea (`.agent/artifacts/2-implementacion-adr-vscode-integration/acceptance.md`)

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: null # SI | NO
    date: null
    comments: null
```
