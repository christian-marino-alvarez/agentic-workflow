---
artifact: acceptance
task_id: 7-node-js-backend-scaffolding
owner: architect-agent
status: pending_approval
---

# Acceptance Criteria: Node.js Backend Server - Scaffolding (T015)

🏛️ **architect-agent**: Definición consolidada de la tarea tras Q&A con desarrollador.

## 1. Definición Consolidada
Crear un servidor backend en Node.js independiente (sidecar) que exponga una API HTTP REST para la gestión y ejecución de agentes.
Este servidor debe estar preparado para streaming (SSE) y su arquitectura debe permitir que múltiples módulos de la extensión consuman sus servicios.

## 2. Respuestas a Preguntas de Definición

### Q1: Framework HTTP Base
**Respuesta**: Fastify.
**Justificación**: Mayor performance, validación de esquemas nativa con Zod, ecosistema de plugins ligero.

### Q2: Ubicación del Código
**Respuesta**: `src/backend`.
**Justificación**: Consistencia con la estructura actual (`src/extension`, `src/core`).

### Q3: Protocolo de Comunicación
**Respuesta**: HTTP REST para control + SSE para streaming.
**Justificación**: Simplicidad inicial, escalable a streaming sin complejidad de WebSockets full-duplex por ahora.

### Q4: Build Strategy
**Respuesta**: Independiente (`npm run build:backend`).
**Justificación**: Desacoplamiento del ciclo de vida de la extensión.

### Q5: Configuración Inicial
**Respuesta**: Variables de entorno inyectadas por el proceso padre (VS Code).
**Justificación**: Seguridad (API Keys no harcodeadas) y flexibilidad runtime.

## 3. Checklist de Acceptance Criteria (Verificables)

### Estructura y Configuración
- [ ] Directorio `src/backend` creado.
- [ ] `package.json` en raíz o en `src/backend` (monorepo style) con dependencias de Fastify.
- [ ] Configuración de TypeScript (`tsconfig.backend.json` o similar) que compile a `dist/backend`.

### Servidor HTTP (Fastify)
- [ ] Servidor levanta en puerto dinámico (o configurado por env `PORT`).
- [ ] Endpoint `GET /health` responde `200 OK { status: 'ok' }`.
- [ ] Integración básica de logs (Pino).

### Integración `@openai/agents`
- [ ] `@openai/agents` instalado y disponible en el scope del backend.
- [ ] Endpoint de prueba (ej: `/api/agent/dev`) que instancia un agente simple (o usa el del POC refactorizado) y devuelve una respuesta estática/mock, demostrando que la librería carga correctamente en este proceso aislado.

### Scripts de Ciclo de Vida
- [ ] `npm run build:backend` genera el JS en `dist/backend`.
- [ ] `npm run watch:backend` para desarrollo (opcional pero recomendado).

### Arquitectura Modular
- [ ] Estructura de código preparada para registrar módulos/rutas (`src/backend/routes`, `src/backend/agents`).

## 4. Aprobación del Desarrollador

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-08T16:48:46+01:00
    comments: Aprobado por usuario via chat.
```
