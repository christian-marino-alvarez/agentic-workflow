---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 4-backend-http-client
---

# Plan — 4-backend-http-client

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Plan de implementación para T012 - Backend HTTP Client.

## 1. Resumen del plan
- **Objetivo resumido**: Implementar la clase base `AgwBackendClient` en el Core y refactorizar el `ChatController` para utilizarla.
- **Resultado esperado**: Una infraestructura de comunicación centralizada y tipada, con soporte para SSE y autenticación automática.

---

## 2. Pasos de implementacion

### Paso 1: Infraestructura Core (Client)
- **Descripcion**: Crear la clase abstracta `AgwBackendClient` en `src/extension/core/client/backend-client.ts`.
  - Debe implementar métodos `get`, `post`, `stream`.
  - Debe gestionar la inyección de `sessionKey` y `bridgeToken`.
  - Debe implementar el decodificador de SSE usando `TransformStream`.
- **Entregables**: `src/extension/core/client/backend-client.ts` + Tests unitarios.

### Paso 2: Implementación de Dominio (ChatClient)
- **Descripcion**: Crear `ChatBackendClient` que extienda de `AgwBackendClient`.
  - Ubicación: `src/extension/modules/chat/backend/client.ts`.
  - Implementar métodos específicos de negocio (ej: `sendMessage`, `streamMessage`).
- **Entregables**: `ChatBackendClient` y su integración en el módulo Chat.

### Paso 3: Refactorización de ChatController
- **Descripcion**: Modificar `src/extension/modules/chat/background/background.ts` (`ChatController`) para eliminar `fetch` directos y usar `ChatBackendClient`.
- **Entregables**: `ChatController` limpio y desacoplado de la red directa.

---

## 3. Verificacion prevista
- **Tests Unitarios**:
  - `AgwBackendClient`: Mockear `fetch` y verificar headers de seguridad.
  - `SSE Parsing`: Verificar que el `TransformStream` reconstruye correctamente chunks fragmentados.
- **Validación Manual**:
  - Ejecutar un chat streaming y verificar que los tokens fluyen sin errores en la UI.
  - Verificar en logs que no hay errores de autenticación con el Bridge.

---

## 4. Aprobacion del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-09T20:33:30Z"
    comments: "Plan approved. Proceeding to Implementation."
```

> Sin aprobacion, esta fase NO puede avanzar a Implementacion.
