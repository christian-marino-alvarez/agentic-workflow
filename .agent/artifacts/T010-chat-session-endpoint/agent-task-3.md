---
artifact: agent_task
phase: phase-4-implementation
owner: backend-agent
status: pending
related_task: T010-chat-session-endpoint
task_number: 3
---

# Agent Task — 3-backend-agent-integration

## Identificacion del agente (OBLIGATORIA)
`🏗️ **backend-agent**: Integración global de Sesión y Refactorización de ChatKit Routes.`

## Input (REQUIRED)
- **Objetivo**: Integrar el plugin de sesión en el bootstrap del servidor y refactorizar las rutas de ChatKit para usar el middleware de autenticación.
- **Alcance**:
  - `src/backend/app.ts` (Registrar plugin).
  - `src/extension/modules/chat/backend/chatkit/chatkit-routes.ts` (Usar middleware, eliminar JIT local).
- **Dependencias**: Task 2 completada (componentes core listos).

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
- Para que `verifySession` funcione en `chatkit-routes.ts`, el plugin `session` debe estar registrado en el contexto de Fastify.
- Se debe modificar `app.ts` para registrar `sessionPlugin` globalmente.
- Se deben limpiar las rutas de ChatKit para que deleguen la autenticación al nuevo sistema, eliminando código duplicado de JIT y mejorando la seguridad/performance.

### Opciones consideradas
- **Opción A**: Registrar plugin solo dentro del módulo Chat. (Descartada: el usuario pidió core integration).
- **Opción B**: Registrar en `app.ts` antes de los módulos. (Elegida).

### Decisión tomada
- **Opción B**: Registro global en `app.ts` y uso de middleware en rutas específicas.

---

## Output (REQUIRED)
- **Entregables**:
  - `src/backend/app.ts` actualizado.
  - `src/extension/modules/chat/backend/chatkit/chatkit-routes.ts` refactorizado y limpio.
- **Evidencia requerida**:
  - Código compilable y limpio de JIT redundancies.

---

## Execution

```yaml
execution:
  agent: "backend-agent"
  status: completed
  started_at: "2026-02-09T08:35:00+01:00"
  completed_at: "2026-02-09T08:38:00+01:00"

---

## Implementation Report

### Cambios realizados
- **src/backend/app.ts**:
  - Se importó y registró `sessionPlugin` globalmente.
  - Se corrigió instanciación de Fastify (`Fastify` -> `fastify`).
- **src/extension/modules/chat/backend/chatkit/chatkit-routes.ts**:
  - Se eliminó la función `getSecretJit` y la lógica de JIT local.
  - Se añadió `preHandler: verifySession` a la ruta POST `/chatkit`.
  - Se modificó para usar `request.apiKey` inyectada por el middleware.

### Decisiones técnicas
- El registro global en `app.ts` garantiza que `request.server.sessions` esté disponible para el middleware.
- El uso de middleware simplifica enormemente el handler de chat, eliminando ruido de infraestructura (obtención de secretos).

### Evidencia
- Archivos modificados y sintaxis verificada.
```

---

## Gate (REQUIRED)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-09T08:38:00+01:00
    comments: Verified refactor and dependency injection.
```
