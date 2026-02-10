---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 4-backend-http-client
---

# Analysis — 4-backend-http-client

## Identificación del agente (OBLIGATORIA)
🏛️ **architect-agent**: Análisis de arquitectura para la implementación del cliente backend.

## 1. Resumen ejecutivo
**Problema**
Actualmente el Extension Host se comunica con el backend Fastify mediante llamadas `fetch` ad-hoc, sin gestión centralizada de URLs, headers de seguridad ni soporte para streaming robusto.

**Objetivo**
Crear una abstracción `AgwBackendClient` que centralice la comunicación HTTP y SSE, gestionando la inyección dinámica de tokens desde el Security Bridge.

**Criterio de éxito**
- Existencia de una clase reutilizable `AgwBackendClient`.
- Capacidad de instanciar clientes aislados por dominio (Chat, History).
- Soporte transparente para SSE usando `ReadableStream` y `TransformStream`.

---

## 2. Estado del proyecto (As-Is)
**Estructura relevante**
- `src/extension/modules/chat/background/background.ts`: Usa `fetch` directo.
- `src/extension/modules/security/background/bridge-server.ts`: Expone el endpoint de secretos, pero no hay cliente que lo consuma fácilmente.

**Limitaciones detectadas**
- **Duplicación**: Cada módulo debe saber cómo construir la URL y headers.
- **Seguridad frágil**: El manejo de `sessionKey` y `bridgeToken` es manual.
- **Sin Streaming**: No hay utilidad estándar para procesar SSE.

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Clase AgwBackendClient (Core)
- **Interpretación**: `AgwBackendClient` debe residir en `src/extension/core/client/` como una clase base abstracta o componente reutilizable del Core de la extensión.
- **Verificación**: 
  - Existencia de `src/extension/core/client/backend-client.ts`.
  - Los módulos específicos (ej: Chat) deben extender esta clase o componerla para añadir métodos de dominio específicos (ej: `ChatClient extends AgwBackendClient`).

### AC-2: Soporte Transporte Híbrido
- **Interpretación**: Métodos `get`, `post` y `stream`.
- **Verificación**: Tests unitarios simulando respuestas JSON y SSE.

### AC-3: Integración Security Bridge
- **Interpretación**: El cliente debe llamar internamente a `http://127.0.0.1:[port]/secrets/query` antes de firmar peticiones al backend real si se requiere un secreto.
- **Riesgo**: Latencia adicional por la "doble petición" (buscar secreto -> llamar backend).
- **Mitigación**: Cache en memoria de corta duración para secretos (opcional en esta fase).

---

## 4. Research técnico
**Alternativa A: Cliente Singleton Global**
- **Pros**: Fácil de usar.
- **Contras**: Acoplamiento fuerte, difícil limpiar recursos al desactivar módulos.

**Alternativa B: Cliente por Dominio (Recomendada)**
- **Pros**: Aislamiento total. Si el módulo Chat muere, su cliente y sockets se limpian.
- **Contras**: Requiere inyectar configuración en cada módulo.

**Decisión**: **Alternativa B**. Alineada con la Arquitectura Hexagonal del proyecto.

---

## 5. Agentes participantes
- **architect-agent**
  - Validación de diseño y contratos.
- **developer** (fase implementación)
  - Codificación de `AgwBackendClient`.
  - Refactor de `ChatController` para usar el cliente.

---

## 6. Impacto de la tarea
- **Arquitectura**: Nuevo componente core `src/extension/infrastructure/client`.
- **Refactoring**: `ChatController` dejará de usar `fetch` nativo.

---

## 7. Riesgos y mitigaciones
- **Riesgo 1**: Timeouts en SSE por proxies.
  - **Mitigación**: Implementar "Heartbeat monitoring" en el cliente (si no llega ping en 30s, reconectar).

---

## 8. Preguntas abiertas
Ninguna.

---

## 9. TODO Backlog (Consulta obligatoria)
**Estado actual**: 0 items pendientes relevantes para esta tarea.

---

## 10. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-09T20:32:15Z"
    comments: "Analysis approved. Proceeding to Planning."
```

> Sin aprobación, esta fase **NO puede darse por completada** ni avanzar a Phase 3.
