---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 7-node-js-backend-scaffolding
---

# Analysis — 7-node-js-backend-scaffolding

🏛️ **architect-agent**: Análisis de arquitectura para Backend Node.js (Sidecar).

## 1. Resumen ejecutivo
**Problema**
La extensión requiere ejecutar agentes de IA complejos (`@openai/agents`) y lógica de negocio pesada que no debe bloquear el Extension Host de VS Code. Actualmente no existe un entorno dedicado para esto.

**Objetivo**
Crear el scaffolding de un servidor backend en Node.js (Fastify) que corra como un proceso independiente (sidecar), gestionado por la extensión, para alojar la lógica de agentes de forma modular y escalable.

**Criterio de éxito**
- Servidor Fastify compilable y ejecutable independientemente.
- Estructura de código modular (`src/backend`).
- Comunicación HTTP funcional (Health check).
- Integración básica de librería de agentes demostrable.

---

## 2. Estado del proyecto (As-Is)
- **Estructura**: `src/extension`, `src/core`, `src/mcp` ya existen. No hay `src/backend`.
- **Extension Host**: Actualmente ejecuta toda la lógica.
- **POC T014**: Demostró compatibilidad de `@openai/agents` en Node.js, pero corriendo *in-process*, lo cual no es escalable para producción.

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Framework Fastify & Estructura
- **Interpretación**: Usar Fastify v5+ con TypeScript.
- **Verificación**: `package.json` con dependencias, `tsconfig.backend.json` presente.
- **Riesgos**: Conflicto de tipos si se mezcla con `tsconfig.json` de la extensión. Se mitiga con configuración separada.

### AC-2: Ubicación `src/backend`
- **Interpretación**: Nueva carpeta raíz para el código del servidor.
- **Verificación**: Existencia de `src/backend/server.ts`.

### AC-3: Protocolo HTTP REST + SSE
- **Interpretación**: Servidor HTTP estándar. Preparado para Server-Sent Events (streaming).
- **Verificación**: Curl al endpoint `/health` y respuesta JSON.

### AC-4: Build Independiente
- **Interpretación**: Scripts npm `build:backend` que generan `dist/backend`.
- **Verificación**: Ejecutar script y verificar output en `dist/`.

### AC-5: Configuración via Env Vars
- **Interpretación**: El servidor lee `process.env.API_KEY` etc., inyectado al lanzarlo.
- **Verificación**: Test manual lanzando con variables dummy.

---

## 4. Research técnico
Basado en `research.md` (Fase 1), se opta por **Monolito Modular** sobre **Múltiples Sidecars**.

**Decisión**: Fastify con sistema de plugins.
- **Justificación**: Minimiza consumo de RAM (1 proceso vs N procesos) y simplifica gestión de puertos, cumpliendo el requisito de modularidad lógica mediante encapsulación de plugins.

---

## 5. Agentes participantes

- **agent-sdk-specialist**
  - Responsable de:
    - Configuración inicial de Fastify (`server.ts`).
    - Estructura de carpetas (`modules/`, `routes/`, `plugins/`).
    - Configuración de TypeScript y Build scripts.
    - Integración de `@openai/agents` hello-world.

**Componentes necesarios**
- [NEW] `src/backend/` (Estructura completa).
- [NEW] `tsconfig.backend.json`.
- [MOD] `package.json` (Scripts y dependencias).

**Demo**
- Se requiere un script de demo o test manual que levante el servidor y haga una petición a un agente mock para validar la integración end-to-end del scaffolding.

---

## 6. Impacto de la tarea
- **Arquitectura**: Introduce un nuevo componente mayor (Backend Sidecar).
- **Build**: Aumenta tiempo de build total (aunque es paralelo).
- **Runtime**: La extensión deberá encargarse de gestionar el ciclo de vida de este proceso (start/stop) en futuras tareas (T012), por ahora en T015 solo es scaffolding.

---

## 7. Riesgos y mitigaciones
- **Riesgo**: Aumento de tamaño del paquete `.vsix`.
  - **Mitigación**: Bundling eficiente (esbuild/webpack) para el backend, o `npm install --production` en carpeta separada. (Se abordará en detalle en implementación).
- **Riesgo**: Complejidad de desarrollo (2 procesos a depurar).
  - **Mitigación**: Scripts de `npm run watch:backend` y configuración de `launch.json` para attach al proceso node.

---

## 8. Preguntas abiertas
Ninguna. Acceptance Criteria claros.

---

## 9. TODO Backlog
**Estado actual**: Items pendientes en roadmap, pero ninguno bloqueante para scaffolding.

---

## 10. Aprobación
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-08T16:53:49+01:00
    comments: Aprobado por usuario via chat.
```
