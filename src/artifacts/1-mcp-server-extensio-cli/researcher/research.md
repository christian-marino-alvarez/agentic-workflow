---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: approved
related_task: 1-mcp-server-extensio-cli
---

# Research Report — 1-mcp-server-extensio-cli

## 1. Resumen ejecutivo

**Problema investigado:**  
Cómo exponer las capacidades del CLI de Extensio (`@extensio/cli`) a través del Model Context Protocol (MCP) para que Google Antigravity y otros clientes AI puedan automatizar la creación y gestión de drivers, módulos y proyectos del framework Extensio.

**Objetivo de la investigación:**  
Identificar la arquitectura técnica óptima, los patrones de implementación y las mejores prácticas para construir un servidor MCP que actúe como puente entre herramientas AI (agentes) y el CLI de Extensio, permitiendo una experiencia de desarrollo asistida por IA.

**Principales hallazgos:**
- El Model Context Protocol (MCP) es un estándar abierto desarrollado por Anthropic (donado a Linux Foundation en dic 2025) que utiliza JSON-RPC 2.0
- MCP define una arquitectura cliente-servidor con dos modos de transporte: **stdio** (local) y **HTTP SSE** (remoto)
- Google Antigravity integra servidores MCP mediante configuración en `mcp_config.json`
- El CLI de Extensio (`@extensio/cli`) expone 4 comandos principales: `create`, `build`, `test`, `demo`
- Existen SDKs oficiales de MCP para TypeScript que facilitan la implementación de servidores
- La mejor ubicación para el servidor MCP es `tools/mcp-server` dentro del monorepo, publicable como `@extensio/mcp-server`

---

## 2. Necesidades detectadas

**Requisitos técnicos identificados por el architect-agent:**
1. Exponer TODAS las capacidades del CLI de Extensio vía MCP
2. Priorizar comandos `build`, `create` y `test`
3. Validación de inputs antes de ejecutar comandos
4. Verificación de resultados post-ejecución
5. Integración con Google Antigravity mediante configuración
6. Documentación completa para agentes AI
7. Demo funcional con agente real
8. Tests automatizados simulando llamadas MCP

**Suposiciones y límites:**
- El servidor MCP se ejecutará localmente (mismo entorno que el CLI)
- Los agentes AI tendrán permisos para ejecutar comandos del sistema
- El monorepo de Extensio estará accesible desde el servidor MCP
- Google Antigravity soporta MCP v1.0+ con transporte stdio

---

## 3. Alternativas técnicas

### Alternativa 1: Servidor MCP con stdio transport (RECOMENDADA)

**Descripción:**  
Implementar un servidor MCP que use transporte stdio (stdin/stdout) para comunicación local con Google Antigravity. El servidor invoca directamente el CLI de Extensio mediante child processes.

**Pros:**
- Máxima performance (sin overhead de red)
- Seguridad mejorada (comunicación local)
- Simplicidad en autenticación (no requiere tokens/API keys)
- Soporte nativo en Google Antigravity
- Alineado con patrones LSP y MCP estándar

**Contras:**
- Limitado a uso local (no remoto)
- Requiere que Antigravity y el CLI estén en la misma máquina

**Riesgos:**
- Gestión de procesos hijo (child process lifecycle)
- Buffering de stdio puede causar bloqueos si no se maneja correctamente

**Impacto en arquitectura:**
- Ubicación: `tools/mcp-server/` en monorepo
- Dependencias: `@modelcontextprotocol/sdk`, `@extensio/cli`
- Exposición: bin script `extensio-mcp-server`

---

### Alternativa 2: Servidor MCP con HTTP SSE transport

**Descripción:**  
Servidor MCP accesible vía HTTP con Server-Sent Events para streaming, permitiendo acceso remoto.

**Pros:**
- Acceso remoto desde cualquier ubicación
- Soporte para autenticación OAuth/API keys
- Escalable para múltiples clientes concurrentes

**Contras:**
- Mayor complejidad (gestión de HTTP, auth, CORS)
- Overhead de red
- Requiere infraestructura de despliegue

**Riesgos:**
- Seguridad (exposición de capacidades de CLI a red)
- Gestión de sesiones y estado

**Impacto en arquitectura:**
- Requiere servidor HTTP (Express/Fastify)
- Gestión de autenticación y autorización
- Deployment infrastructure

**Decisión:** NO recomendada para MVP. Priorizar stdio transport.

---

### Alternativa 3: Wrapper directo sin MCP

**Descripción:**  
Crear una extensión propietaria de Google Antigravity sin usar MCP.

**Pros:**
- Control total sobre la implementación

**Contras:**
- No es estándar
- No es reutilizable con otros clientes AI
- Fragmenta el ecosistema

**Decisión:** DESCARTADA. MCP es el estándar de facto.

---

## 4. APIs Web / WebExtensions relevantes

**N/A:** Este proyecto no interactúa directamente con Web APIs ni WebExtensions APIs. El servidor MCP opera en el contexto de Node.js y se comunica con el CLI de Extensio (también Node.js).

---

## 5. Compatibilidad multi-browser

**N/A:** El servidor MCP es agnóstico del navegador. El CLI de Extensio ya gestiona la compilación multi-browser (Chrome, Firefox, Safari, Edge) de drivers y módulos.

---

## 6. Recomendaciones AI-first

### 1. Exponer CLI commands como MCP Tools

Cada comando del CLI (`create`, `build`, `test`, `demo`) debe mapearse como una **tool** en MCP:

```typescript
{
  "name": "extensio_create",
  "description": "Create a new Extensio driver, module, or project",
  "inputSchema": {
    "type": "object",
    "properties": {
      "type": { "enum": ["driver", "module", "project"] },
      "name": { "type": "string" },
      "options": { "type": "object" }
    }
  }
}
```

**Impacto esperado:**  
Los agentes AI podrán invocar comandos del CLI de forma estructurada y recibir resultados JSON.

---

### 2. Proveer Resources para exploración

Exponer **resources** MCP que permitan a los agentes:
- Listar drivers existentes en `packages/drivers/`
- Listar módulos existentes en `packages/modules/`
- Leer configuración de proyectos (`package.json`, `tsconfig.json`)

```typescript
{
  "uri": "extensio://drivers",
  "name": "List available drivers",
  "mimeType": "application/json"
}
```

**Impacto esperado:**  
Los agentes pueden descubrir el estado actual del monorepo antes de proponer creaciones/cambios.

---

### 3. Prompts para casos de uso comunes

Definir **prompts** reutilizables para workflows frecuentes:
- "Create a new driver with multi-browser support"
- "Build and test a module for Chrome"
- "Scaffold a complete project with demo"

**Impacto esperado:**  
Reduce fricción para usuarios nuevos y agentes que necesitan contexto sobre cómo usar el CLI.

---

### 4. Validación de inputs con JSON Schema

Usar JSON Schema en `inputSchema` de MCP tools para:
- Validar nombres de entidades (drivers, modules)
- Validar paths (no permitir rutas fuera del monorepo)
- Validar opciones de build (browsers válidos)

**Impacto esperado:**  
Reduce errores y mejora experiencia del agente con feedback inmediato.

---

### 5. Streaming de output para builds largos

Implementar **progress notifications** de MCP para comandos de larga duración (build, test):

```typescript
server.notifications.sendProgress({
  progressToken: "build-chrome",
  progress: 50,
  total: 100
})
```

**Impacto esperado:**  
Los agentes pueden mostrar progreso en tiempo real al usuario, mejorando UX.

---

## 7. Riesgos y trade-offs

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| **Child process failures** | Alta | Capturar stderr, validar exit codes, timeouts |
| **Buffering de stdio** | Media | Usar streams, chunk parsing, line-buffered output |
| **Validación de inputs** | Alta | JSON Schema + validación custom pre-ejecución |
| **Paths inseguros** | Alta | Validar paths relativos al monorepo, prohibir `..` |
| **Concurrencia** | Media | Limitar workers concurrentes, queue de comandos |
| **Compatibilidad MCP versions** | Baja | Especificar `protocolVersion` en handshake |
| **Breaking changes en CLI** | Media | Versionado semántico del servidor MCP |

---

## 8. Fuentes

### Especificación y documentación oficial
- [Model Context Protocol - Official Site](https://modelcontextprotocol.io)
- [MCP Architecture Overview](https://modelcontextprotocol.io/docs/concepts/architecture)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification (GitHub)](https://github.com/modelcontextprotocol/specification)

### Google Antigravity Integration
- [Antigravity MCP Integration Guide](https://antigravity.google)
- [MCP Store for Antigravity](https://google.com/antigravity/mcp)

### Implementación y ejemplos
- [Building MCP Servers with TypeScript](https://medium.com/@kai_21887/model-context-protocol-explained-with-example-mcp-server-using-typescript-f01f1caf4a42)
- [MCP Server Examples Repository](https://github.com/modelcontextprotocol/servers)

### Estándares relacionados
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/)
- [Language Server Protocol (LSP)](https://microsoft.github.io/language-server-protocol/) - Inspiración de MCP

### Extensio CLI
- Código fuente: `packages/cli/src/index.mts`
- package.json: `packages/cli/package.json`

---

## 9. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-06T21:04:31+01:00
    comments: "Aprobada investigación técnica. Proceder con análisis detallado en Fase 2."
```
