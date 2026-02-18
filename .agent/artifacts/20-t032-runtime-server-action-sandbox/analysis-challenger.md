# T032: Análisis Alternativo - Contrapunto

🤖 **Gemini (Challenger)**

## 1. Crítica a la Arquitectura Propuesta (Opción B)

La propuesta inicial sugiere crear un módulo `chat` monolítico que encierra el `RuntimeServer`.
**Problema**: El `Runtime` de acciones (Filesystem, Terminal) es una capacidad **transversal**, no exclusiva del Chat. Si mañana implementamos "Workflows Automatizados" (sin chat), necesitarán acceso al mismo Runtime.

### Propuesta Alternativa: Desacoplamiento (Opción C)

```mermaid
graph TD
    subgraph "Extension Host"
        AB[AppBackground]
        CB[ChatBackground]
        RB[RuntimeBackground]  <-- NUEVO MÓDULO INDEPENDIENTE
    end

    subgraph "Sidecar 1 (App)"
        S1[AppServer]
        LLM[LLMVirtualBackend]
    end

    subgraph "Sidecar 2 (Runtime)"
        S2[RuntimeServer]
        ACT[ActionRegistry]
    end

    CB -->|"Solicita Acción"| RB
    RB -->|"Ejecuta (con Sandbox)"| S2
    S2 -->|"Result"| RB --> CB
```

**Ventajas**:
- **Reusabilidad**: Cualquier módulo (`chat`, `automation`, `task`) puede consumir el Runtime.
- **Claridad**: El módulo `chat` solo se preocupa de la UI y el historial. El módulo `runtime` se preocupa de la ejecución y seguridad.

---

## 2. Crítica al Protocolo IPC (JSON-RPC)

La propuesta inicial sugiere cambiar a `vscode-jsonrpc` sobre pipes.
**Riesgo**: Introduce una nueva pila tecnológica (duplicidad de patrones). Ya usamos Fastify/HTTP en `AppServer`.

### Propuesta Alternativa: HTTP + SSE/WebSocket (Consistencia)

Si ya tenemos infraestructura para `AbstractBackend` (Fastify):
- **Host → Runtime**: HTTP POST `/execute` (ya estándar).
- **Runtime → Host (Permisos)**:
  - **Opción simple**: El request HTTP se queda "colgado" (Long Polling) o retorna `402 Payment Required` (metafórico) indicando "Necesito Permiso". El Host pide permiso y re-intenta con un token de aprobación.
  - **Opción robusta**: WebSocket inverso simple para eventos.

**Veredicto**: Mantener consistencia reduce carga cognitiva y mantenimiento. JSON-RPC es potente pero "alienígena" al patrón actual Fastify.

---

## 3. Matriz de Diferencias

| Característica | Propuesta A (Original) | Propuesta Gemini (Challenger) | Diferencia |
|---|---|---|---|
| **Ubicación** | Runtime dentro de `chat` | Runtime como módulo `core/runtime` o `modules/runtime` | **Modularidad** |
| **Acceso** | Chat es dueño exclusivo | Runtime es un servicio compartido | **Reusabilidad** |
| **Server** | `ChatServer` (propio) | `RuntimeServer` (propio) | Naming |
| **IPC** | `vscode-jsonrpc` (Pipes) | HTTP Reinventado / Long Polling | **Simplicidad vs Estándar** |
| **Sandbox** | Lógica en `ChatBackground` | Lógica en `RuntimeBackground` | **SRP** |

---

## 4. Conclusión del Challenger

Recomiendo fuertemente **extraer el Runtime a su propio módulo** (`src/extension/modules/runtime` o `core/runtime`).
El Chat no debe *ser* el ejecutor, solo una *interfaz* para invocar la ejecución.

Si acoplamos el servidor físico al Chat, limitamos la evolución del sistema hacia agentes autónomos que corren en background sin UI de chat activa.
