# T032: Servidor Runtime & Sandbox de Acciones - Análisis Final

🏛️ **architect-agent**

## 1. Decisión Arquitectónica Consolidada

Tras comparar la propuesta inicial (Chat monolítico) y el desafío (Runtime desacoplado), la arquitectura final será **Híbrida**.

**Decisión**:
El **Runtime/Action Server** será un **módulo independiente** (`src/extension/modules/runtime`), gestionado por su propio Background (`RuntimeBackground`).
El **Chat** consumirá el Runtime como un cliente, delegando la ejecución.

**Justificación**:
- **Desacoplamiento (Challenger)**: Permite que futuros agentes sin chat (e.g., "watcher") ejecuten acciones.
- **Protocolo (Original)**: Mantenemos **JSON-RPC sobre IPC**. Aunque HTTP es consistente con la app actual, la naturaleza de "Ejecución Remota con Permisos Asíncronos" es nativa de RPC. Reinventar esto sobre HTTP (polling/websockets) añade deuda técnica innecesaria.
- **Seguridad**: El Sandbox reside en el `RuntimeBackground` (Extension Host), actuando como Gateway único.

---

## 2. Mapa de Arquitectura Final

```mermaid
graph TD
    subgraph "Extension Host"
        AB[AppBackground]
        CB[ChatBackground]
        RB[RuntimeBackground]  <-- NUEVO (Gateway)
        
        AB -->|delegación| RB
        AB -->|delegación| CB
        CB -->|Request Action| RB
    end

    subgraph "Sidecar 1 (AppServer - 3000)"
        S1[AppServer]
        LLM[LLMVirtualBackend]
    end

    subgraph "Sidecar 2 (RuntimeServer - 3001)"
        S2[RuntimeServer]
        ACT[ActionRegistry]
    end

    RB -->|"spawn()"| S2
    RB <-->|"JSON-RPC (stdio)"| S2
    RB -.->|"Ask Permission (Event)"| CB
    CB -.->|"Show Dialog"| VIEW[ChatView]
```

---

## 3. Matriz de Responsabilidades (Consolidada)

| Componente | Módulo | Responsabilidad |
|---|---|---|
| `RuntimeBackground` | `runtime` | Orquestador, Sandbox, Gateway de Permisos. Spawna el proceso Sidecar. |
| `RuntimeServer` | `runtime` | Proceso físico Node.js (Puerto 3001). Ejecuta FS/Terminal. |
| `ChatBackground` | `chat` | Cliente del Runtime. Gestiona historial y contexto. Renderiza UI de permisos. |
| `ChatView` | `chat` | Interfaz de usuario (Mensajes + Burbujas de Decisión). |

---

## 4. Estructura de Archivos Final

### Módulo `runtime` (Nuevo)
```
src/extension/modules/runtime/
├── background/
│   ├── index.ts                 ← RuntimeBackground (Permission Gateway)
│   ├── client.ts                ← JSON-RPC Client Wrapper
│   └── permission-engine.ts     ← Lógica de validación (Skills + User)
├── backend/
│   ├── index.ts                 ← RuntimeServer (Entrypoint físico)
│   ├── actions/                 ← Implementación real (fs, terminal)
│   └── rpc-server.ts            ← JSON-RPC Server
└── view/                        ← (Vacío, no tiene UI propia)
```

### Módulo `chat` (Nuevo)
```
src/extension/modules/chat/
├── background/
│   └── index.ts                 ← ChatBackground (Consume RuntimeService)
├── view/
│   └── index.ts                 ← ChatView (UI + Dialogs)
└── ...
```

---

## 5. Análisis de Impacto Actualizado

| Riesgo Detectado | Mitigación |
|---|---|
| **Complejidad de IPC** | Usar librería `vscode-jsonrpc` estándar reduce el riesgo de implementación manual. |
| **Coordinación Chat-Runtime** | `RuntimeBackground` emitirá eventos `onPermissionRequest` que `AppBackground` enrutará al módulo UI activo (Chat). |
| **Doble Sidecar** | Aceptable. AppServer para lógica "business" (ligera/virtual), RuntimeServer para "heavy duty" (aislado). |

---

## 6. Plan de Implementación (Fase 3)

1. **Scaffold Runtime Module**: Crear estructura básica y proceso sidecar.
2. **Implementar JSON-RPC**: Establecer canal de comunicación bidireccional.
3. **Acciones Base**: Implementar `fs` y `terminal` en el Server.
4. **Gateway de Permisos**: Lógica en `RuntimeBackground`.
5. **Scaffold Chat Module**: Crear UI básica.
6. **Integración**: Conectar Chat UI -> Runtime Gateway.

---

## 7. Aprobación Final

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-18T22:13:00+01:00
    comments: Approved by user
```
