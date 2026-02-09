---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: T010-chat-session-endpoint
---

# Research Report — T010-ChatKit Session Endpoint

🔍 **researcher-agent**: Iniciando investigación sobre la implementación segura del endpoint de sesión para ChatKit y su integración con el backend sidecar (Fastify) modular.

## 1. Resumen ejecutivo
Investigación técnica para implementar un endpoint `POST /sessions` que genere *client secrets* temporales para el SDK de OpenAI ChatKit. El objetivo es permitir que el frontend se conecte de forma segura sin exponer claves maestras, utilizando el patrón de plugin de Fastify.

## 2. Necesidades detectadas
- **Seguridad**: Validar que el endpoint no exponga API Keys reales, solo tokens temporales.
- **Protocolo**: Confirmar la estructura exacta del payload de respuesta esperado por `<openai-chatkit>`.
- **Modularidad**: Integrar esto como un plugin independiente dentro de la arquitectura de `dist-backend`.
- **Inyección**: Mecanismo para que el sidecar reciba la API Key maestra desde el Bridge (Extension Host).

## 3. Hallazgos técnicos
## 3. Hallazgos técnicos
### 3.1. Estado Actual (JIT Secret Injection)
El código en `chatkit/chatkit-routes.ts` implementa actualmente un mecanismo "Just-In-Time" (JIT) donde cada petición HTTP (`threads_create`, `add_message`, etc.) solicita la API Key al *Extension Host* a través del `eventBus` usando un `secret_key_id`.
- **Ventaja**: No se almacenan claves en el sidecar.
- **Desventaja**: Alta latencia (IPC en cada request), acoplamiento fuerte, y riesgo de timeout en cargas altas.
- **Seguridad**: El frontend debe conocer el `secret_key_id`.

### 3.2. Propuesta de Arquitectura de Sesión
Para cumplir T010, se debe implementar un patrón de **Token de Sesión Efímero**:
1. **Endpoint**: `POST /sessions`
   - Input: `{ secret_key_id: string, environment: 'dev' | 'pro' }`
   - Proceso:
     - Solicita la API Key real al Extension Host vía JIT (una sola vez).
     - Genera un `session_token` (UUID o JWT firmado).
     - Almacena en memoria (MemoryCache) la relación `token -> { apiKey, expiresAt }`.
   - Output: `{ client_secret: session_token, expires_in: 3600 }`
2. **Middleware de Autenticación**:
   - Intercepta las llamadas a la API de ChatKit.
   - Extrae el token (Header `Authorization` o campo `client_secret`).
   - Valida contra MemoryCache.
   - Inyecta `apiKey` en el contexto de la request.

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-09T08:11:00+01:00
    comments: Approved research findings. Proceed to Analysis.
```

### 3.3. Compatibilidad con `@openai/chatkit`
- El componente UI espera un `clientSecret` o `token`.
- Esta arquitectura permite que el frontend use el `session_token` como si fuera una API Key, logrando abstracción total.

### 3.4. Implementación en Fastify
- Crear plugin `session-plugin.ts` en `src/extension/modules/chat/backend/plugins/`.
- Utilizar `fastify-plugin` para encapsular.
- Implementar un `SessionStore` en memoria (simple Map con limpieza periódica).

## 4. APIs relevantes
- `crypto.randomUUID()` para generación de tokens.
- `fastify.decorateRequest('apiKey', ...)` para pasar la clave validada a los, handlers.

## 5. Riesgos identificados
- **Gestión de Memoria del Sidecar**: Si se crean muchas sesiones y no se limpian, el proceso puede consumir mucha RAM.
  - *Mitigación*: TTL estricto y limpieza activa (setInterval).
- **Reinicio del Sidecar**: Al ser en memoria, si el proceso sidecar se reinicia, todas las sesiones se pierden.
  - *Aceptable*: El frontend deberá re-autenticarse (obtener nuevo token). UX: "Session expired, reconnecting...".

## 6. Oportunidades AI-first
- El endpoint de sesión podría devolver también configuración inicial del agente (system prompt pre-cargado) para optimizar el primer *render*.
