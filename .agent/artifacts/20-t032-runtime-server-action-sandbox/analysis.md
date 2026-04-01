# T032: Servidor Runtime & Sandbox de Acciones - Análisis

🏛️ **architect-agent**

## 1. Decisión Arquitectónica

**Módulo Chat independiente con servidor físico dedicado (Opción B)**:
- `ChatBackground` → hereda de `Background` (core), spawna `ChatServer`.
- `ChatServer` → hereda de `AbstractBackend` (core), puerto 3001.
- `RuntimeVirtualBackend` → registrado en `ChatServer`, ejecuta acciones.

---

## 2. Mapping de Acceptance Criteria → Componentes

| AC | Componente | Módulo | Capa |
|---|---|---|---|
| 4.1 Proceso Runtime | `ChatServer` | `chat` | Backend |
| 4.1 Ciclo de vida | `ChatBackground.runBackend()` | `chat` | Background |
| 4.1 IPC | HTTP (Host→Server) + IPC nativo (Server→Host callbacks) | `chat` | Background + Backend |
| 4.1 Heartbeat | `ChatBackground` (ping periódico) | `chat` | Background |
| 4.2 Validación Skill | `PermissionEngine` | `chat` | Background |
| 4.2 Prompt Usuario | `ChatView` (diálogos) | `chat` | View |
| 4.2 Modos Sandbox/Full | `PermissionEngine` + `ChatView` toggle | `chat` | Background + View |
| 4.3 File Operations | `actions/fs.ts` | `chat` | Backend (Runtime) |
| 4.3 Command Execution | `actions/terminal.ts` | `chat` | Backend (Runtime) |
| 4.3 Error Handling | `RuntimeVirtualBackend` | `chat` | Backend |
| 4.4 Chat Dialogs UI | `ChatView` templates | `chat` | View |
| 4.4 Status Indicator | `ChatView` header | `chat` | View |

---

## 3. Responsabilidades por Agente

| Agente | Responsabilidad | Archivos |
|---|---|---|
| 🧠 **engine-agent** | `ChatServer`, `RuntimeVirtualBackend`, Actions (fs, terminal) | `chat/backend/**` |
| ⚙️ **background-agent** | `ChatBackground`, `PermissionEngine`, IPC bridge | `chat/background/**` |
| 🎨 **view-agent** | `ChatView`, Permission Dialogs, Status Indicator | `chat/view/**` |
| 🏛️ **architect-agent** | Supervisión, constitución, gates | Artifacts |

---

## 4. Estructura de Archivos (Propuesta)

```
src/extension/modules/chat/
├── constants.ts
├── index.ts                     ← IModule definition
├── background/
│   ├── index.ts                 ← ChatBackground
│   └── permission-engine.ts     ← Validación de skills + cache de permisos
├── backend/
│   ├── index.ts                 ← ChatServer (AbstractBackend, puerto 3001)
│   └── runtime/
│       ├── index.ts             ← RuntimeVirtualBackend
│       ├── actions/
│       │   ├── fs.ts            ← readFile, writeFile, listFiles, deleteFile, createDir
│       │   ├── terminal.ts      ← runCommand
│       │   └── types.ts         ← ActionRequest, ActionResult interfaces
│       └── registry.ts          ← Action Registry (mapa acción → handler)
└── view/
    ├── index.ts                 ← ChatView (Lit)
    └── templates/
        ├── main/                ← Chat messages, input
        ├── dialogs/             ← Permission request bubbles
        └── styles/              ← CSS
```

---

## 5. Flujo de Ejecución de una Acción

```
1. LLM genera Tool Call → respuesta del modelo
   ↓
2. ChatBackground recibe Tool Call result
   ↓
3. PermissionEngine.validate(agentRole, action)
   ├── Lee skills del role markdown
   ├── Compara con la acción solicitada
   └── Si no tiene skill → DENY (sin preguntar al usuario)
   ↓
4. PermissionEngine.checkMode()
   ├── Full Access → ALLOW (skip prompt)
   └── Sandbox → solicitar permiso al usuario
   ↓
5. ChatView muestra diálogo: "Agent X quiere [acción]. ¿Permitir?"
   ├── [Permitir] → resolve(true)
   └── [Denegar] → resolve(false)
   ↓
6. Si permitido → ChatBackground.sendToRuntime(action, params)
   ↓
7. HTTP POST → ChatServer → RuntimeVirtualBackend
   ↓
8. RuntimeVirtualBackend ejecuta handler (fs.readFile, etc.)
   ↓
9. Resultado → HTTP Response → ChatBackground
   ↓
10. ChatBackground envía Tool Result al LLM para continuar
```

---

## 6. Análisis de Impacto

### Archivos Existentes que se Modifican

| Archivo | Cambio | Riesgo |
|---|---|---|
| `app/background/index.ts` | Registrar ChatBackground como delegado | 🟢 Bajo |
| `app/view/index.ts` | Añadir tab "Chat" al Tab Bar | 🟢 Bajo |
| `.agent/rules/roles/*.md` | Añadir campo `skills` al frontmatter | 🟡 Medio |
| `core/background/index.ts` | Ninguno (ya soporta `runBackend`) | ✅ Sin cambio |
| `core/backend/*` | Ninguno (se reusan abstracciones) | ✅ Sin cambio |

### Archivos Nuevos (por capa)

- **Backend**: ~6 archivos (server, runtime, actions, types, registry)
- **Background**: ~3 archivos (background, permission-engine, constants)
- **View**: ~5 archivos (view, templates, styles)
- **Total**: ~14 archivos nuevos + 3 modificados

---

## 7. Dependencias Técnicas

| Dependencia | Tipo | Estado |
|---|---|---|
| `AbstractBackend` (core) | Herencia | ✅ Existe |
| `AbstractVirtualBackend` (core) | Herencia | ✅ Existe |
| `Background` (core) | Herencia | ✅ Existe |
| `fastify` | NPM | ✅ Instalado |
| Role Markdowns (skills) | Data | ⚠️ Necesitan campo `skills` |
| Chat UI (Lit) | Framework | ✅ Lit ya en uso |

---

## 8. Estimación de Complejidad

| Sub-tarea | Complejidad | Estimación |
|---|---|---|
| Scaffold módulo chat | 🟢 Baja | 1 sesión |
| ChatServer + RuntimeVirtualBackend | 🟡 Media | 1-2 sesiones |
| Acciones (fs, terminal) | 🟡 Media | 1 sesión |
| PermissionEngine | 🟡 Media | 1 sesión |
| ChatView + Dialogs | 🔴 Alta | 2-3 sesiones |
| Integración + Tests | 🟡 Media | 1-2 sesiones |
| **Total** | | **7-10 sesiones** |

---

## 9. Aprobación del Desarrollador

```yaml
approval:
  developer:
    decision: null
    date: null
    comments: null
```
