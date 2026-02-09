---
artifact: agent_task
phase: phase-4-implementation
owner: backend-agent
status: pending
related_task: T010-chat-session-endpoint
task_number: 2
---

# Agent Task — 2-backend-agent-session-logic

## Identificacion del agente (OBLIGATORIA)
`🏗️ **backend-agent**: Refactorización al Core Backend e implementación de lógica de sesión.`

## Input (REQUIRED)
- **Objetivo**: Mover el scaffolding de sesión y autenticación al Core Backend (`src/backend`) para reutilización global, e implementar la lógica de almacenamiento y generación de tokens.
- **Alcance**: 
  - `src/backend/plugins/session.ts` (Nuevo ubicación core)
  - `src/backend/middleware/auth.ts` (Nueva ubicación core)
  - `src/extension/modules/chat/backend/plugins/session.ts` (Eliminar)
  - `src/extension/modules/chat/backend/middleware/auth.ts` (Eliminar)
- **Dependencias**: Task 1 (scaffolding previo).

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- El usuario solicitó explícitamente que la autenticación sea parte del Core para que cualquier módulo pueda usarla.
- Esto implica mover el código generado en Task 1 a `src/backend/` y adaptarlo para ser un plugin global.
- Además, se debe implementar la lógica real de `SessionStore` (Map en memoria) y el endpoint `/sessions` que interactúe con el Bridge.

### Opciones consideradas
- **Opción A**: Mantener en módulo `chat` y exportar. (Descartada: acopla el core al módulo `chat`).
- **Opción B**: Mover a `src/backend/plugins` y `src/backend/middleware`. (Elegida: arquitectura limpia y modular).

### Decisión tomada
- **Opción B**: Mover lógica de sesión al core backend.

---

## Output (REQUIRED)
- **Entregables**:
  - `src/backend/plugins/session.ts` funcional con endpoint `/sessions`.
  - `src/backend/middleware/auth.ts` funcional.
  - Eliminación de archivos redundantes en `src/extension/modules/chat`.
- **Evidencia requerida**:
  - Archivos movidos y lógica implementada.

---

## Execution

```yaml
execution:
  agent: "backend-agent"
  status: completed
  started_at: "2026-02-09T08:31:00+01:00"
  completed_at: "2026-02-09T08:33:00+01:00"

---

## Implementation Report

### Cambios realizados
- **Movido plugin de Sesión al Core Backend**:
  - Nuevo: `src/backend/plugins/session.ts` (Implementación real con JIT logic).
  - Eliminado: `src/extension/modules/chat/backend/plugins/session.ts`.

- **Movido Middleware de Autenticación al Core Backend**:
  - Nuevo: `src/backend/middleware/auth.ts`.
  - Eliminado: `src/extension/modules/chat/backend/middleware/auth.ts`.

### Decisiones técnicas
- Se optó por centralizar esta lógica en `src/backend/` para evitar duplicación y permitir que otros módulos usen la autenticación por sesión.
- Se implementó la lógica real de `getSecretJit` usando el `eventBus` compartido para solicitar la API Key al Extension Host de forma segura.

### Evidencia
- Archivos en `src/backend/` existen.
- Archivos en `src/extension/modules/chat/backend/` eliminados.
```

---

## Gate (REQUIRED)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-09T08:33:00+01:00
    comments: Core integration successful.
```
