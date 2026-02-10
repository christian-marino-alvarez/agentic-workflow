---
kind: template
name: acceptance
source: agentic-system-structure
---

# Acceptance Criteria — 4-backend-http-client

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Criteria de aceptación definidos para el cliente de backend.

## 1. Definición Consolidada
Implementación de una clase `AgwBackendClient` que actúe como eslabón de comunicación entre el Extension Host de VS Code y el servidor Fastify. El cliente debe ser instanciable por dominio, soportar streaming mediante SSE, integrarse de forma transparente con el Security Bridge para la gestión de secretos y proporcionar validación opcional de esquemas.

## 2. Respuestas a Preguntas de Clarificación
> Esta sección documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Transporte: HTTP/REST, WebSockets o SSE? | SSE es la vía recomendada; se valorarán pros/cons en investigación. |
| 2 | ¿Seguridad: Integración con Security Bridge? | Sí, el cliente debe obtener los tokens dinámicamente. |
| 3 | ¿Arquitectura: Singleton o instancia por dominio? | Instancia por dominio para mantener el aislamiento. |
| 4 | ¿Resiliencia: Política de reintentos? | Simple (reintento básico). |
| 5 | ¿Validación: Zod integrado o en controladores? | Se analizará la mejor opción (integrado vs consumo directo). |

---

## 3. Criterios de Aceptación Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - Creación de la clase `AgwBackendClient` en la infraestructura de la extensión.
   - Soporte para métodos GET, POST y Streaming (SSE).

2. Entradas / Datos:
   - Configuración de URL base del servidor Fastify.
   - Tokens de sesión obtenidos del `Security Bridge` dinámicamente.

3. Salidas / Resultado esperado:
   - Respuestas tipadas de la API del servidor.
   - Flujo de eventos (tokens) en tiempo real para las peticiones de streaming.

4. Restricciones:
   - Debe funcionar dentro del entorno restrictivo del Extension Host.
   - No debe exponer secretos en texto plano en los logs.

5. Criterio de aceptación (Done):
   - El módulo de Chat puede realizar una petición de streaming al servidor Fastify usando el nuevo cliente, validando correctamente el token de sesión y recibiendo los tokens de respuesta sin cortes.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-09T20:18:15Z"
    comments: "Acceptance criteria approved. Ready for Phase 1."
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-02-09T20:20:00Z"
    notes: "Acceptance criteria definidos y consolidados tras preguntas"
```
