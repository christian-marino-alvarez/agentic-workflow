# Plan de Implementación - T032: Runtime & Chat

## Objetivo
Implementar un módulo `runtime` desacoplado que actúe como servidor de acciones (File System, Terminal) y un módulo `chat` que consuma este servicio para ofrecer una interfaz conversacional con capacidades de ejecución segura (Sandbox).

## Decisión de Arquitectura
**Opción C (Híbrida)**:
- **Runtime Module**: Módulo independiente con su propio Sidecar Físico (Puerto 3001).
- **Chat Module**: Módulo UI que actúa como cliente del Runtime.
- **IPC**: `vscode-jsonrpc` para comunicación bidireccional (Permisos).
- **Governance**: Cumplimiento estricto de workflows `coding.*`.

## User Review Required
> [!IMPORTANT]
> **Cambio de patrón**: Se introduce un segundo proceso Node.js (Sidecar) en el puerto 3001. Esto requiere gestión de dos procesos hijos simultaneous en `AppBackground`.

## Governance & Workflows (Rule 4.1 Compliance)
Explicit mapping of technical components to Agentic Workflows and Owners.

| Component & Layer | Workflow | Agent Owner | Required Context |
|---|---|---|---|
| **Runtime Server** (fs, terminal, rpc) | `workflow.coding.backend` | `roles.backend` | `constitution.backend` |
| **Runtime Background** (lifecycle, gateway) | `workflow.coding.background` | `roles.background` | `constitution.background` |
| **Chat Background** (orchestration) | `workflow.coding.background` | `roles.background` | `constitution.background` |
| **Chat View** (UI, dialogs) | `workflow.coding.view` | `roles.view` | `constitution.view` |

### Context Loading Mechanism
How each agent loads its required context (Constitutions & Workflows):
1. **Invocation**: The Architect Agent calls the specific workflow (e.g., `/coding-backend`).
2. **Context Injection**: The workflow definition (YAML) mandates specific files (`constitution.backend`, `constitution.clean_code`).
3. **Agent Action**: The assigned agent (e.g., `roles.backend`) MUST `view_file` these mandatory constitutions at step 0/1 of their task.
4. **Runtime Awareness**: The Runtime Server (Task 1) will parse `.agent/index.md` to programmatically know where these files are located.

## Proposed Changes

### Componente 1: Runtime Module (Core Infrastructure)

#### [NEW] [src/extension/modules/runtime/](file:///Users/milos/Documents/workspace/agentic-workflow/src/extension/modules/runtime/)
Estructura base del módulo Runtime.

#### [NEW] [backend/index.ts](file:///Users/milos/Documents/workspace/agentic-workflow/src/extension/modules/runtime/backend/index.ts)
Entry point del servidor físico (Sidecar #2). Hereda de `AbstractBackend` (o reimplementa lo necesario para JSON-RPC si `AbstractBackend` es muy rígido con HTTP).
*Nota: Se usará `vscode-jsonrpc` sobre `process.stdin/stdout` o `ipc` channel, NO HTTP.*

#### [NEW] [background/index.ts](file:///Users/milos/Documents/workspace/agentic-workflow/src/extension/modules/runtime/background/index.ts)
`RuntimeBackground`. Responsable de spawnar el sidecar y gestionar el Gateway de Permisos.
approval:
  developer:
    decision: SI
    date: 2026-02-18T22:21:00+01:00
    comments: Approved by user

#### [NEW] [backend/actions/](file:///Users/milos/Documents/workspace/agentic-workflow/src/extension/modules/runtime/backend/actions/)
Implementación de acciones: `fs.readFile`, `fs.writeFile`, `terminal.runCommand`.

### Componente 2: Chat Module (UI & Consumer)

#### [NEW] [src/extension/modules/chat/](file:///Users/milos/Documents/workspace/agentic-workflow/src/extension/modules/chat/)
Estructura base del módulo Chat.

#### [NEW] [background/index.ts](file:///Users/milos/Documents/workspace/agentic-workflow/src/extension/modules/chat/background/index.ts)
`ChatBackground`. Intercepta Tool Calls del LLM y los delega a `RuntimeBackground`.

#### [NEW] [view/index.ts](file:///Users/milos/Documents/workspace/agentic-workflow/src/extension/modules/chat/view/index.ts)
`ChatView`. Interfaz Lit con soporte para burbujas de diálogo (Permission Request).

### Componente 3: Core Updates

#### [MODIFY] [src/extension/modules/app/](file:///Users/milos/Documents/workspace/agentic-workflow/src/extension/modules/app/)
Registrar los nuevos módulos `runtime` y `chat` en el `AppBackground` y `index.ts`.

---

## Workflow Execution Specifications (Detailed)

This section defines the EXACT configuration for each Agent Task when the Architect invokes the Workflow.

### Task 1: Runtime Backend (Server)
- **Workflow**: `coding.backend`
- **Agent**: `roles.backend`
- **Context Config**:
  - `constitution.backend`
  - `constitution.architecture`
  - `constitution.clean_code`
- **Objective**: Implement `RuntimeServer` (Sidecar 2) and `ActionRegistry`.

### Task 2: Runtime Background (Gateway)
- **Workflow**: `coding.background`
- **Agent**: `roles.background`
- **Context Config**:
  - `constitution.background`
  - `constitution.architecture`
  - `constitution.clean_code`
- **Objective**: Implement `RuntimeBackground`, `PermissionEngine`, and Sidecar Spawning logic.

### Task 3: Chat Background (Consumer)
- **Workflow**: `coding.background`
- **Agent**: `roles.background`
- **Objective**: Implement `ChatBackground` that delegates to RuntimeService.

### Task 4: Chat View (UI)
- **Workflow**: `coding.view`
- **Agent**: `roles.view`
- **Context Config**:
  - `constitution.view`
  - `constitution.architecture`
  - `constitution.clean_code`
- **Objective**: Implement `ChatView` and Permission Dialogs.

---

## Plan de Trabajo (Sub-tareas)

### Tarea 1: Runtime Server Scaffold
- Crear estructura de carpetas `runtime`.
- Implementar `RuntimeServer` (Sidecar) con `vscode-jsonrpc`.
- **Nuevo**: Implementar `IndexParser` en el servidor para leer `.agent/index.md` al inicio y resolver rutas de templates/workflows.
- Implementar `RuntimeBackground` que lanza el proceso.
- Prueba de conectividad (Ping RPC).

### Tarea 2: Acciones Basicas & IPC
- Implementar handlers para `fs.read` y `terminal.run` en el Sidecar.
- Implementar métodos de cliente en `RuntimeBackground` para invocar estas acciones.
- Verificar ejecución exitosa sin permisos (modo debug).

### Tarea 3: Permission Gateway (Lógica)
- Implementar `PermissionEngine` en `RuntimeBackground`.
- Añadir lógica de verificación de Skills (leer Markdown del rol).
- Implementar flujo de "Request Permission" (Host event).

### Tarea 4: Chat Module & UI Integration
- Scaffold módulo `chat`.
- Crear `ChatView` básico.
- Conectar evento "Request Permission" para mostrar diálogo en UI.
- Implementar botones "Allow" / "Deny" que resuelven la promesa RPC.

## Verificación

### Automated Tests
- **Unit**: Tests para `PermissionEngine` (validar skills mockeadas).
- **Integration**: Test de spawn del Sidecar y ronda de mensajes RPC (si es posible en entorno de test).

### Manual Verification
1. Abrir Chat.
2. Pedir al agente: "Lee el archivo package.json".
3. Verificar que aparece el diálogo de permiso.
4. Aprobar -> Ver contenido del archivo en el chat.
5. Pedir "Borra este archivo".
6. Verificar diálogo -> Denegar -> Ver error en el chat.
