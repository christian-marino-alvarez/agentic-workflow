---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: approved
related_task: 9-secrets-management
---

# Research Report — 9- Secrets Management

## Identificacion del agente (OBLIGATORIA)
<icono> **researcher-agent**: Investigando estado actual de gestión de secretos y arquitectura.

## 1. Resumen ejecutivo
- **Problema investigado**: Cómo gestionar secretos (API Keys) de forma segura en `vscode.SecretStorage` y compartirlos con un Backend Sidecar (Node.js) desacoplado.
- **Objetivo**: Validar el mecanismo de puente seguro (Bridge Server/Client) y la arquitectura actual del módulo de Chat para asegurar que cumple con el patrón Vertical Slice.
- **Principales hallazgos**: La infraestructura base (`BridgeServer`, `BridgeClient`, `SecretHelper`) ya existe en el módulo de Seguridad. El módulo de Chat tiene una estructura híbrida que necesita refactorización para cumplir estrictamente con Vertical Slice y consumir el Event Bus correctamente.

---

## 2. Necesidades detectadas
- **Security Module**:
  - `BridgeServer` y `SecretHelper` están implementados en `src/extension/modules/security/background`.
  - Falta soporte explícito para entornos (DEV/PRO) en la estructura de datos o UI.
  - La UI actual (`SecurityRouter`, `SecurityEngine`) gestiona modelos pero no parece tener selectores de entorno.

- **Chat Module**:
  - `ChatBackendManager` actualmente lanza el sidecar con `fork` e inyecta variables de entorno `AGW_*`.
  - `chatkit-routes.ts` intenta usar `eventBus` para obtener secretos JIT (`getSecretJit`), lo cual es correcto para comunicación intra-proceso en el sidecar.
  - Sin embargo, la estructura del módulo Chat en `src/extension/modules/chat` es confusa:
    - `background/` contiene lógica de controlador (`Controller`) y manager (`ChatBackendManager`).
    - `backend/` contiene rutas Fastify (`chatkit-routes.ts`).
    - La separación Runtime/Background/Templates no está tan clara como en Security.

---

## 3. Hallazgos técnicos
### 3.1 Infraestructura de Secretos (Existente)
- **Componentes**: `SecretHelper` (wrapper de `vscode.secrets`), `BridgeServer` (servidor HTTP local efímero), `BridgeClient` (cliente en sidecar).
- **Flujo**:
  1. Extension levanta `BridgeServer` en puerto aleatorio.
  2. Pasa `SESSION_KEY`, `BRIDGE_TOKEN` y `PORT` al sidecar via ENV.
  3. Sidecar usa `BridgeClient` para pedir secretos al `BridgeServer`.
  4. `BridgeServer` descifra request, consulta `vscode.secrets`, cifra respuesta y devuelve.
- **Estado**: Implementado y funcional (aparentemente).

### 3.2 Event Bus (Backend Sidecar)
- **Ubicación**: `src/backend/shared/event-bus.ts`.
- **Uso**: `security/backend/index.ts` escucha `SECURITY_EVENTS.SECRET_REQUEST`.
- **Problema**: `chatkit-routes.ts` en `chat/backend` usa `eventBus` directamente. Esto es válido SI ambos plugins ("security backend" y "chat backend") corren en el mismo proceso Fastify.
- **Confirmación**: `src/backend/app.ts` (visto en tarea anterior) carga ambos módulos. Por tanto, el `eventBus` en memoria funciona.

### 3.3 Arquitectura Módulo Chat
- **Estado actual**:
  - `src/extension/modules/chat/index.ts` exporta `ChatBackendManager`.
  - `src/extension/modules/chat/background/chatkit/backend-manager.ts` gestiona el proceso hijo.
- **Desviación**:
  - El módulo Chat parece mezclar conceptos de "ChatKit" con la infraestructura propia.
  - No hay un `SettingsStorage` propio o claro para configuración específica de chat (usa global o nada).

### 3.4 Soporte Multi-Entorno
- **Estado**: No implementado.
- **Impacto**: Se requiere modificar `ExtensionConfigSchema` y `ModelConfig` para soportar claves por entorno o prefijos de claves.
- **Estrategia recomendada**: Añadir campo `environment` ('dev' | 'pro') a la configuración o gestionar entornos a nivel global y filtrar modelos/claves disponibles.

---

## 4. APIs relevantes
- **VS Code SecretStorage**: API nativa, segura. Evento `onDidChange` para reactividad.
- **Node.js EventEmitter**: Base del Event Bus interno.
- **Fastify Plugins**: Mecanismo de encapsulación para los módulos backend.

---

## 5. Riesgos identificados
- **Riesgo**: La estructura de carpetas de Chat no sigue puramente Vertical Slice (`backend/chatkit` dentro de `backend`?).
  - **Severidad**: Media (Deuda técnica).
- **Riesgo**: `ChatBackendManager` hace `cp.fork` apuntando a `dist-backend`. Si la compilación de backend falla o no está sincronizada, el chat rompe.
  - **Severidad**: Alta (Runtime).
- **Riesgo**: Complejidad de `BridgeServer`. Si el puerto aleatorio falla o hay firewall local, el sidecar no arranca.
  - **Severidad**: Media.

---

## 6. Recomendaciones (Pre-Análisis)
- **Refactor Chat**: Normalizar estructura de `src/extension/modules/chat` para que sea idéntica a `security` (Runtime/Background/Backend/Templates).
- **Environment**: Implementar selector de entorno en `SecurityController` y persistirlo en `SettingsStorage`.
- **Multi-Key**: Permitir añadir múltiples entradas para el mismo Provider/Modelo con distintos nombres (ej: "GPT4-Dev", "GPT4-Pro").

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-08T20:45:00Z
    comments: "Investigación completada. La infraestructura base existe pero requiere extensión para entornos y limpieza en Chat."
```
