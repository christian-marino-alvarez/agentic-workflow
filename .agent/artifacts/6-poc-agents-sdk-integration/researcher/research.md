---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 6-poc-agents-sdk-integration
---

# Research Report — 6-poc-agents-sdk-integration

🔬 **researcher-agent**: Informe de investigación técnica para integración de Agents SDK

> [!CAUTION]
> **REGLA PERMANENT**: Este documento es SOLO documentación. El researcher-agent documenta hallazgos SIN analizar, SIN recomendar, SIN proponer soluciones.

## 1. Resumen ejecutivo
- **Problema investigado**: Cómo integrar el SDK `@openai/agents` (validado en T001) dentro de la arquitectura modular de la extensión de VS Code.
- **Objetivo de la investigacion**: Identificar los puntos de integración (comandos, servicios, logs) y patrones necesarios para ejecutar un agente como parte del ciclo de vida de la extensión.
- **Principales hallazgos**: La arquitectura basada en módulos (`src/extension/modules/`) facilita la encapsulación. El SDK se puede instanciar dentro de un comando. El OutputChannel es el mecanismo nativo ideal para streaming de texto sin UI compleja.

---

## 2. Necesidades detectadas
- **Módulo aislado**: Se requiere un nuevo módulo `poc-agents` para no contaminar el código base.
- **Command Registration**: Mecanismo para invocar el agente bajo demanda.
- **Feedback Loop**: El usuario necesita ver qué está pasando (Thinking... Tool Call... Response).
- **Configuración**: Inyección de API Key desde entorno o configuración.

---

## 3. Hallazgos técnicos

### VS Code Extension Host Runtime
- **Descripción**: Proceso Node.js que ejecuta la extensión. Comparte el event loop con otras extensiones.
- **Estado**: Estable (Node.js 20.x en versiones recientes de VS Code).
- **Limitaciones**: Bloquear el event loop congela la extensión. Las operaciones de red (API calls) deben ser asíncronas.
- **Documentación**: [VS Code Extension Host](https://code.visualstudio.com/api/advanced-topics/extension-host)

### `@openai/agents` SDK Integration
- **Descripción**: Librería para orquestar agentes. Maneja el bucle de razonamiento y llamadas a herramientas.
- **Estado**: Beta.
- **Uso en Extension**: Se debe instanciar el `Agent` dentro del handler del comando.
- **Streaming**: Provee eventos `run.on('delta', ...)` que pueden redirigirse a un OutputChannel.

### VS Code OutputChannel
- **Descripción**: Panel de texto en la pestaña "Output" de VS Code.
- **Uso**: Ideal para logs, trazas de depuración y streaming de texto simple.
- **API**: `vscode.window.createOutputChannel("name")`. Métodos: `append()`, `appendLine()`, `clear()`, `show()`.

### Estructura de Módulos (Architecture)
- **Patrón actual**: `src/extension/modules/<module-name>/` con `index.ts` (exporta `activate`/`deactivate`) y `controller.ts` (lógica).
- **Compatibilidad**: El nuevo POC debe seguir este patrón para mantener la coherencia.

---

## 4. APIs relevantes

- **`vscode.commands.registerCommand(commandId, handler)`**: Para registrar `agentic-workflow.runPoc`.
- **`vscode.window.createOutputChannel(name)`**: Para crear el canal de logs.
- **`process.env`**: Acceso a variables de entorno del proceso VS Code (heredadas del terminal que lo lanzó).

---

## 5. Compatibilidad multi-browser
- **No aplica**: Esta tarea es backend (Extension Host), no Webview/UI.

---

## 6. Oportunidades AI-first detectadas
- **Introspección**: El agente podría recibir herramientas para leer el estado de VS Code (archivos abiertos, selección) en el futuro.
- **Self-Correction**: Si el agente falla al usar una herramienta, el SDK maneja el ciclo de corrección automáticamente.

---

## 7. Riesgos identificados
- **Bloqueo de UI**: Si el SDK realiza cómputo intensivo síncrono (poco probable, es I/O bound). 
  - *Fuente*: VS Code Best Practices.
  - *Severidad*: Media.
- **Gestión de API Key**: Usar `process.env` requiere lanzar VS Code desde terminal con las variables seteadas. Si se lanza desde Dock/Icono, no las ve.
  - *Fuente*: Experiencia operativa macOS/Linux.
  - *Severidad*: Media (User Friction).

---

## 8. Fuentes
- [VS Code Extension API](https://code.visualstudio.com/api)
- [OpenAI Agents SDK Docs](https://github.com/openai/openai-agents-node-sdk)
- Artifact: `spike/nodejs-compatibility/adr.md` (T001)

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-08T16:06:01+01:00
    comments: Approved by user
```
