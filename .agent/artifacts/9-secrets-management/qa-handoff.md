🛡️ **security-agent** — Handoff Fase 4 (en progreso)

- Estado: fase-4-implementation en curso. Selector DEV/PRO operativo en Security; entorno se persiste y se incluye en `StateUpdate`.
- Backend: `security` escucha `SECRET_REQUEST` (ahora incluye `environment`) y responde por EventBus. Chat backend emite `SECRET_REQUEST` con `secretKeyId` y `environment` recibido en `payload.params`.
- Datos: nuevos modelos guardan `environment` y `secretKeyId` lleva prefijo de entorno.
- Pendiente: client/chat debe enviar `environment` y `secret_key_id` en los payloads a `/api/chat/chatkit`; validar flujo end-to-end y registrar `metrics.md` cuando esté listo.
- Rutas tocadas: `src/extension/modules/security/templates/*`, `background/background.ts`, `runtime/index.ts`, `types.d.ts`, `src/backend/shared/event-bus.ts`, `src/extension/modules/chat/backend/chatkit/chatkit-routes.ts`, `src/extension/modules/security/backend/index.ts`.
