---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 7-node-js-backend-scaffolding
---

# Implementation Plan — 7-node-js-backend-scaffolding

🏛️ **architect-agent**: Plan de scaffolding para Backend Node.js (Sidecar).

## 1. Resumen del plan
- **Contexto**: Se requiere un entorno de ejecución robusto y modular para agentes de IA, desacoplado del Extension Host.
- **Resultado esperado**: Un servidor Fastify funcional en `src/backend`, compilable independientemente, con soporte para módulos y `@openai/agents`.
- **Alcance**: Scaffolding inicial, configuración de build y ejemplo "hello world". No incluye la gestión del proceso desde VS Code (eso es T012).

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/7-node-js-backend-scaffolding/task.md`
- **Analysis**: `.agent/artifacts/7-node-js-backend-scaffolding/analysis.md`
- **Acceptance Criteria**: AC-1 (Framework), AC-2 (Ubicación), AC-3 (Protocolo), AC-4 (Build), AC-5 (Config).

---

## 3. Desglose de implementación (pasos)

### Paso 1: Infraestructura y Configuración
- **Descripción**: Crear estructura de carpetas y archivos de configuración.
- **Dependencias**: Ninguna.
- **Entregables**: `src/backend/`, `tsconfig.backend.json`, `package.json` actualizado.
- **Agente responsable**: `agent-sdk-specialist`.

### Paso 2: Core Server Implementation
- **Descripción**: Implementar servidor Fastify base con soporte de plugins.
- **Dependencias**: Paso 1.
- **Entregables**: `src/backend/server.ts`, `src/backend/app.ts` (factory).
- **Agente responsable**: `agent-sdk-specialist`.

### Paso 3: Integración de Agentes (Hello World)
- **Descripción**: Implementar un módulo de ejemplo que use `@openai/agents`.
- **Dependencias**: Paso 2.
- **Entregables**: `src/backend/modules/agents/hello-world.ts`.
- **Agente responsable**: `agent-sdk-specialist`.

---

## 4. Asignación de responsabilidades

- **agent-sdk-specialist**
  - Configurar TypeScript y scripts npm.
  - Implementar servidor Fastify.
  - Crear estructura modular.
  - Verificar compilación y ejecución.

**Componentes**
- [NEW] `src/backend`: Folder raiz del sidecar.
- [NEW] `tsconfig.backend.json`: Configuración estricta para Node.js (no DOM).

---

## 5. Estrategia de testing y validación

### Verificación Manual (Smoke Testing)
1. **Compilación**:
   ```bash
   npm run build:backend
   # Debe generar dist/backend sin errores
   ```
2. **Health Check**:
   ```bash
   # Terminal 1
   npm run backend:dev
   # Terminal 2
   curl http://localhost:PORT/health
   # Debe responder {"status":"ok"}
   ```
3. **Agente Demo**:
   ```bash
   curl http://localhost:PORT/api/agent/demo
   # Debe responder con mensaje del agente mockeado
   ```

---

## 6. Plan de demo
- **Objetivo**: Demostrar que el servidor levanta y responde.
- **Escenario**: Lanzar servidor manualmente y hacer peticiones HTTP.
- **Datos**: JSON simple.

---

## 7. Estimaciones
- **Esfuerzo**: Bajo (Scaffolding y Configuración).
- **Puntos críticos**: Configuración de TS para no colisionar con VS Code types.

---

## 8. Puntos críticos y resolución
- **Conflicto de Puertos**: El servidor debe iniciar en puerto 0 (aleatorio) o configurable por ENV.
  - *Resolución*: Implementar lógica de lectura de `PORT` env var.

---

## 10. Criterios de finalización
- `npm run build:backend` funciona.
- Estructura `src/backend` creada.
- Endpoint `/health` operativo.
- Librería `@openai/agents` importada sin errores de build.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-08T16:55:12+01:00
    comments: Aprobado por usuario via chat.
```
