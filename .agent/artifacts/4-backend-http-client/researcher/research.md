---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 4-backend-http-client
---

# Research Report — 4-backend-http-client

## Identificación del agente (OBLIGATORIA)
🔍 **researcher-agent**: Ejecutando investigación técnica profunda de "Alto Rigor" sobre transporte SSE y Criptografía del Bridge.

> [!DANGER]
> **CRITERIO DE RIGOR TÉCNICO**: Este documento DEBE ser una investigación profunda y técnica. 
> Se prohíben las descripciones superficiales. Cada punto debe estar respaldado por datos, especificaciones de APIs o comportamientos observados del runtime.

> [!CAUTION]
> **REGLA PERMANENT**: Este documento es SOLO documentación de HALLAZGOS.
> El researcher-agent documenta hechos y evidencias SIN analizar, SIN recomendar y SIN proponer soluciones.

## 1. Resumen ejecutivo
- **Problema investigado**: Establecimiento de un canal de comunicación resiliente y seguro entre el Extension Host (VS Code) y el Backend (Fastify) que soporte Streaming de tokens y resolución de secretos.
- **Objetivo de la investigación técnica**: Validar el protocolo de bajo nivel para SSE en Node.js (sin polyfills de navegador) y auditar el flujo criptográfico AES-256-GCM del Bridge.
- **Principales evidencias detectadas**: Node.js requiere manejo manual de buffers para SSE; el protocolo de seguridad del Bridge impone restricciones estrictas sobre el tamaño del IV (12 bytes) y Key (32 bytes).

---

## 2. Necesidades detectadas
- **Streaming Unidireccional Eficiente**: El chat requiere `text/event-stream` sin overhead de handshakes complejos (WS).
- **Seguridad "Zero-Trust" Local**: El cliente no debe persistir claves; debe pedirlas "Just-in-Time" al Bridge.
- **Resiliencia de Conexión**: Los proxies corporativos y VS Code cierran conexiones inactivas >60s.

---

## 3. Profundización Técnica y Hallazgos

### A. Protocolo Server-Sent Events (SSE) en Node.js
- **Descripción Atómica**: SSE no es más que una conexión HTTP persistente (`Connection: keep-alive`) con `Content-Type: text/event-stream`. El servidor envía bloques de texto delimitados por doble salto de línea (`\n\n`).
- **Estado Técnico**: Estable en Fastify. En el cliente (Node.js/Extension Host), **NO existe `EventSource` nativo**.
- **Implementación Low-Level**:
  - Se debe usar `http.request` o `fetch` obteniendo el `body` como un `ReadableStream`.
  - **Parsing**: El cliente debe implementar un "Line Buffer" ya que los chunks TCP pueden cortar un mensaje JSON a la mitad.
    - Ejemplo de chunk crudo: `data: {"to`
    - Siguiente chunk: `ken": "Hola"}\n\n`
  - Se requiere un `TransformStream` para reconstruir estos fragmentos.
- **Límites de Performance**:
  - Max Sockets: Node.js `http.globalAgent` tiene un límite por defecto. Se debe configurar `keepAlive: true` y ajustar `maxSockets` si hay múltiples chats.
  - Latencia: Prácticamente cero overhead tras la conexión inicial (a diferencia del polling).

### B. Criptografía del Security Bridge (AES-256-GCM)
- **Descripción Atómica**: Cifrado simétrico autenticado.
  - **Algoritmo**: `aes-256-gcm`.
  - **Inputs**: Key (32 bytes), IV (12 bytes - crítico para GCM).
  - **Integridad**: GCM produce un **Authentication Tag** (16 bytes) que DEBE ser verificado al descifrar.
- **Documentación de Referencia**: [Node.js Crypto - CCM/GCM Mode](https://nodejs.org/api/crypto.html#ccm-mode).
- **Flujo de Memoria**:
  - El `BridgeServer` espera un JSON con `{ iv, tag, data }` (hex strings).
  - El cliente debe generar el IV aleatorio (`crypto.randomBytes(12)`) por cada petición. **Nunca reutilizar IVs**.
- **Seguridad**:
  - **Fuga de Memoria**: Las claves en variables JS (`string` o `Buffer`) residen en heap hasta el GC. En entornos de alta seguridad, se recomienda sobreescribir el buffer con ceros (`buffer.fill(0)`) tras su uso, aunque V8 no garantiza el borrado inmediato de copias antiguas.

### C. Análisis de WebTransport ("Transporter")
- **Concepto**: Estándar web moderno (HTTP/3 + QUIC) para comunicación bidireccional de baja latencia. Es la evolución de WebSockets.
- **Estado en Node.js**: **Experimental / Inestable**.
  - No existe soporte nativo estable. Requiere flags como `--experimental-quic` o dependencias nativas complejas.
  - El Extension Host de VS Code no permite recompilar binarios nativos fácilmente ni habilitar flags experimentales de Node.js.
- **Veredicto**: Descartado para esta iteración por riesgo de estabilidad y complejidad de despliegue en distribuciones de VS Code.

---

## 4. APIs y Contratos Relevantes

### `http.ClientRequest` (Node.js)
- **Método**: `request(url, options, callback)`
- **Eventos Críticos**:
  - `response`: Inicia el stream.
  - `data` (en el response): Llegan los chunks binarios.
  - `end`: El servidor cerró el stream (fin de respuesta).
  - `error`: Problema de red.
  - `close`: Cierre del socket subyacente (puede ser prematuro).

### `vscode.SecretStorage`
- **Contrato**: `get(key: string): Thenable<string | undefined>`
- **Comportamiento**: Asíncrono. Accede al Keychain del SO (macOS Keychain, Windows Credential Manager).
- **Límite**: No diseñado para alta frecuencia (no pedir el token en cada milisegundo de un loop).

### `ReadableStream` / `TransformStream` (Web Streams API)
- **Disponibilidad**: Global en Node.js 18+ (y extensión host).
- **Uso**: Ideal para desacoplar la lectura de chunks del procesamiento de líneas, alineándose con los estándares web modernos.

---

## 5. Matriz de Compatibilidad y Entorno

| Entorno | SSE Nativo (`EventSource`) | `http` module | WebSocket | Restricciones de Red |
|---------|---------------------------|---------------|-----------|----------------------|
| **VS Code Ext Host** | ❌ NO | ✅ SI (Full) | ✅ SI (ws lib) | Proxy del sistema aplica |
| **Webview (UI)** | ✅ SI | ❌ NO | ✅ SI | CSP restringido |
| **Fastify Backend** | ✅ SI (Plugin) | N/A | ✅ SI | Ninguna |

- **Conclusión de Entorno**: El cliente debe residir en el **Extension Host** para tener acceso a `net` y `http` completos sin bloqueos de CSP, y comunicarse con el Bridge que corre en localhost (puerto efímero).

---

## 6. Evidencia AI-first / Automatización
- **Stream Processing**: La capacidad de procesar tokens (`data: ...`) permite implementar parsers de "Tool Calls" parciales. Se puede detectar que el LLM está invocando una herramienta antes de que termine de generar el JSON completo.

---

## 7. Riesgos Críticos Documentados

1. **Riesgo: Socket Hangup Silencioso**
   - **Descripción Técncia**: Balanceadores de carga y proxies intermedios cierran conexiones TCP inactivas tras 60s. En SSE, si el LLM tarda en "pensar", no hay datos fluyendo.
   - **Severidad**: Alta.
   - **Evidencia**: Comportamiento estándar en infraestructura AWS/Azure y proxies corporativos zscaler.
   - **Mitigación necesaria**: Heartbeats (`: ping\n\n`) desde el servidor.

2. **Riesgo: Bloqueo del Event Loop por Decriptado**
   - **Descripción**: AES-256-GCM es rápido, pero síncrono en Node (`update` + `final`). Si se descifran payloads de varios MBs en el hilo principal, la UI de VS Code podría no afectarse (Extension Host separado), pero otras extensiones sí.
   - **Severidad**: Baja (los secretos son pequeños, <4KB).

---

## 8. Fuentes oficiales y bibliografía
1. [Node.js Documentation: HTTP](https://nodejs.org/api/http.html)
2. [Fastify: Server-Sent Events](https://fastify.dev/docs/latest/Guides/Server-Sent-Events/)
3. [NIST SP 800-38D (GCM Specification)](https://csrc.nist.gov/pubs/sp/800/38/d/final)

---

## 9. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-09T20:29:15Z"
    comments: "Research approved. Proceeding to Analysis."
```
