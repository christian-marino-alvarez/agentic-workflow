---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: T010-chat-session-endpoint
---

# Analysis — T010-ChatKit Session Endpoint

🏛️ **architect-agent**: Análisis técnico para la implementación del endpoint de sesión de ChatKit en el backend sidecar.

## 1. Resumen ejecutivo
**Problema**
El componente UI (`openai-chatkit`) requiere un token de sesión seguro para conectarse, pero el sidecar actualmente no tiene un mecanismo para emitir estos tokens sin solicitar la API Key al Extension Host en cada petición, lo que genera latencia y riesgos de seguridad.

**Objetivo**
Implementar un endpoint `POST /sessions` en el sidecar que intercambie una credencial inyectada (JIT) por un token de sesión efímero, permitiendo al frontend autenticarse de forma autónoma.

**Criterio de éxito**
- Endpoint `/sessions` funcional y seguro.
- Integración con JIT Secret Injection (Bridge).
- Manejo correcto de CORS y errores.
- Modularidad mediante arquitectura de plugins Fastify.

---

## 2. Estado del proyecto (As-Is)
- **Estructura**:
  - `src/extension/modules/chat/backend/`: Contiene la lógica del sidecar.
  - `src/extension/modules/chat/backend/chatkit/chatkit-routes.ts`: Implementación actual con JIT en cada request.
- **Componentes**:
  - `ChatSidecarManager`: Orquesta el proceso Node.js.
  - `EventBus`: Comunicación IPC entre módulos (simulada o real).
- **Limitaciones**:
  - El sidecar es "stateless" respecto a credenciales; depende totalmente del Extension Host.
  - No hay un almacén de sesiones en el sidecar.

---

## 3. Cobertura de Acceptance Criteria
### AC-1: Endpoint POST /sessions
- **Interpretación**: Crear ruta en Fastify.
- **Verificación**: `curl -X POST ...` devuelve JSON con token.

### AC-2: Token de sesión válido
- **Interpretación**: El token devuelto debe ser aceptado por los endpoints protegidos del propio sidecar (middleware).
- **Verificación**: Usar el token en `Authorization: Bearer <token>` para llamar a `threads_create`.

### AC-3: Validación de seguridad
- **Interpretación**: Si el Extension Host no devuelve la API Key (por bloqueo de usuario o error), el endpoint debe fallar con 401/403.
- **Verificación**: Test de integración simulando fallo en JIT.

### AC-4: Modularidad
- **Interpretación**: Implementar como `session-plugin.ts` separado de `chatkit-routes.ts`.
- **Verificación**: Revisión de código (estructura de archivos).

---

## 4. Research técnico
**Alternativa A: JWT Firmado (Stateless)**
- **Descripción**: El sidecar firma un JWT con un secreto rotatorio autogenerado al inicio. El payload contiene la API Key encriptada (o referencia a ella).
- **Ventajas**: No requiere almacenamiento en memoria complejo.
- **Inconvenientes**: Revocación difícil. Si payload contiene key encriptada, aumenta tamaño.

**Alternativa B: Opaque Token + Memory Store (Stateful) [RECOMENDADA]**
- **Descripción**: Generar UUID. Guardar en `Map<string, SessionData>`.
- **Ventajas**: Control total, revocación inmediata, simpleza.
- **Inconvenientes**: Se pierde al reiniciar sidecar (aceptable según Research).

**Decisión**: **Alternativa B**. Es más simple y segura para un sidecar local que vive lo mismo que la ventana de VS Code.

---

## 5. Agentes participantes
- **backend-agent**
  - Implementación de `session-plugin.ts`.
  - Refactor de `chatkit-routes.ts` para usar middleware de autenticación.
  - Tests unitarios de los nuevos endpoints.

**Componentes necesarios**:
- Nuevo archivo: `src/extension/modules/chat/backend/plugins/session.ts`.
- Nuevo archivo: `src/extension/modules/chat/backend/middleware/auth.ts`.
- Modificación: `src/extension/modules/chat/backend/index.ts` (registro de plugin).

---

## 6. Impacto de la tarea
- **Arquitectura**: Introduce concepto de "Sesión" en el sidecar. Desacopla la dependencia JIT de cada request a solo una vez por sesión.
- **APIs**: Nueva API `/sessions`. Las APIs existentes de ChatKit requerirán Header de Auth.
- **Breaking Changes**: El componente UI deberá actualizarse para llamar primero a `/sessions`.

---

## 7. Riesgos y mitigaciones
- **Riesgo**: Memory Leak en `SessionStore`.
  - **Mitigación**: Implementar `setInterval` para limpieza de tokens expirados.
- **Riesgo**: Condición de carrera en JIT Injection.
  - **Mitigación**: Mantener el timeout y reintentos en `eventBus`.

---

## 8. TODO Backlog
- **Estado actual**: 0 items relevantes.

---

## 10. Aprobación
Este análisis requiere aprobación explícita del desarrollador.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-09T08:14:00+01:00
    comments: Analysis approved. Proceed to Planning.
```
