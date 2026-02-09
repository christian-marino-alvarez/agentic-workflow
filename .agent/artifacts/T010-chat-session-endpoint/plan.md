---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: T010-chat-session-endpoint
---

# Implementation Plan — T010-ChatKit Session Endpoint

🏛️ **architect-agent**: Plan de implementación detallado para el endpoint de sesión de ChatKit en el sidecar.

## 1. Resumen del plan
**Contexto**: Implementar un mecanismo seguro para que el frontend obtenga tokens de sesión de ChatKit sin exponer API Keys.
** Resultado esperado**: Un endpoint `POST /sessions` funcional en el sidecar, respaldado por un sistema de plugins modular y almacenamiento en memoria.
**Alcance**: Backend sidecar (Fastify) exclusivamente.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/T010-chat-session-endpoint/task.md`
- **Analysis**: `.agent/artifacts/T010-chat-session-endpoint/analysis.md`
- **Acceptance Criteria**: AC-1 (Endpoint), AC-2 (Valid Token), AC-3 (Security), AC-4 (Modularidad).

---

## 3. Desglose de implementación (pasos)

### Paso 1: Scaffolding de Plugins
- **Descripción**: Crear la estructura de directorios y archivos base.
- **Entregables**:
  - `src/extension/modules/chat/backend/plugins/session.ts` (skeleton)
  - `src/extension/modules/chat/backend/middleware/auth.ts` (skeleton)
- **Agente**: `backend-agent`

### Paso 2: Implementación de Session Store
- **Descripción**: Crear la lógica de almacenamiento en memoria para tokens efímeros.
- **Detalles**: `Map<string, { apiKey: string, expiresAt: number }>` con limpieza automática.
- **Entregables**: Lógica de `SessionStore` dentro de `session.ts` o utilidad separada.
- **Agente**: `backend-agent`

### Paso 3: Middleware de Autenticación
- **Descripción**: Implementar middleware `verifySession` que intercepte requests, valide el token del header `Authorization`, y decore la `request` con la `apiKey` real.
- **Entregables**: `auth.ts` funcional.
- **Agente**: `backend-agent`

### Paso 4: Endpoint POST /sessions
- **Descripción**: Implementar la lógica de creación de sesión.
  - Recibir `secret_key_id`.
  - Pedir clave al Bridge (JIT).
  - Generar token.
  - Guardar en Store.
  - Devolver token.
- **Entregables**: Endpoint funcional en `session.ts`.
- **Agente**: `backend-agent`
- **Dependencias**: Paso 2.

### Paso 5: Refactorización de ChatKit Routes
- **Descripción**: Modificar `chatkit-routes.ts` para usar el middleware de autenticación en lugar de pedir JIT en cada request.
- **Entregables**: `chatkit-routes.ts` actualizado y simplificado.
- **Agente**: `backend-agent`
- **Dependencias**: Paso 3.

---

## 4. Asignación de responsabilidades

- **Architect-Agent**
  - Supervisión y Code Review.
- **Backend-Agent**
  - Implementación completa (Pasos 1-5).
  - Unit Tests.

---

## 5. Estrategia de testing y validación

- **Unit Tests (Vitest)**
  - Testear `SessionStore` (creación, expiración, limpieza).
  - Testear `verifySession` middleware (casos éxito, 401, 403).
  - Testear endpoint `/sessions` (mock del Bridge).
- **Integration**
  - Verificar flujo completo: `/sessions` -> Token -> `threads_create`.

---

## 7. Estimaciones
- Paso 1 & 2: Bajo
- Paso 3: Medio (Middleware logic)
- Paso 4: Medio (Async flow con Bridge)
- Paso 5: Medio (Refactor)
- **Total**: ~3-4 horas de desarrollo.

---

## 8. Puntos críticos
- **Seguridad**: Asegurar que el token tenga suficiente entropía (`crypto.randomUUID` es suficiente para MVP).
- **Timeouts**: La llamada JIT al Bridge puede tardar. Implementar timeout defensivo en `/sessions`.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-09T08:22:00+01:00
    comments: Plan approved. Proceed to Implementation.
```
