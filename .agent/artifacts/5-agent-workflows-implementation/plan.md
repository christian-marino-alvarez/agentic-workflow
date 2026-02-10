---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Implementation Plan — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Plan de implementación para workflows de agentes con instanciación dinámica desde Markdown.

## 1. Resumen del plan
- **Contexto**: Implementar un motor de workflows multi-agente en el backend que soporte handoffs y ejecución segura de herramientas.
- **Resultado esperado**: Un sistema funcional donde los agentes se cargan dinámicamente desde `.agent/rules/roles/` y skills desde `.agent/skills/`.
- **Alcance**: Includes `WorkflowRuntime`, `AgentRegistry`, Persistencia básica, y lógica HIL. Excluye interfaz de usuario final (solo backend).

---

## 2. Inputs contractuales
- **Task**: [.agent/artifacts/5-agent-workflows-implementation/task.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/5-agent-workflows-implementation/task.md)
- **Analysis**: [.agent/artifacts/5-agent-workflows-implementation/analysis.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/5-agent-workflows-implementation/analysis.md)
- **Acceptance Criteria**: Ver sección 3 de `task.md`.

**Dispatch de dominios (OBLIGATORIO si aplica)**
```yaml
plan:
  workflows:
    - domain: agents
      action: create
      workflow: workflow.tasklifecycle-long.phase-4-implementation

  dispatch: []
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Infraestructura Base y Persistencia
- **Descripción**: Crear la estructura de directorios y el servicio de persistencia de sesiones (SQLite/File-based para MVP).
- **Dependencias**: Ninguna.
- **Entregables**: `src/extension/modules/chat/backend/agents/persistence.ts` con métodos `saveSession` y `loadSession`.
- **Agente responsable**: **Coding-Agent**

### Paso 2: Servicio de Registro de Agentes (Markdown Loader)
- **Descripción**: Implementar `AgentRegistryService` que escanea, parsee y cargue agentes desde `.agent/rules/roles/*.md` y skills desde `.agent/skills/`.
- **Dependencias**: Paso 1.
- **Entregables**: `src/extension/modules/chat/backend/agents/registry.ts` capaz de instanciar objetos `Agent` del SDK.
- **Agente responsable**: **Coding-Agent**

### Paso 3: Workflow Runtime (Wrapper SDK)
- **Descripción**: Implementar `WorkflowRuntime` que envuelva el `Runner` de OpenAI. Debe manejar la hidratación del `RunState` y la ejecución del loop principal.
- **Dependencias**: Paso 2.
- **Entregables**: `src/extension/modules/chat/backend/agents/runtime.ts` con método `processMessage(sessionId, text)`.
- **Agente responsable**: **Coding-Agent**

### Paso 4: Implementación de Human-in-the-Loop (HIL)
- **Descripción**: Añadir lógica para detectar `isInterrupted` y exponer métodos para `approve/reject` interrupciones.
- **Dependencias**: Paso 3.
- **Entregables**: Métodos de aprobación en `runtime.ts` y persistencia de interrupciones pendientes.
- **Agente responsable**: **Coding-Agent**

### Paso 5: Integración API Fastify
- **Descripción**: Exponer los servicios mediante endpoints REST (`POST /chat`, `GET /chat/:id`, `POST /chat/:id/approve`).
- **Dependencias**: Paso 4.
- **Entregables**: `src/extension/modules/chat/backend/index.ts` (Integrando servicios).
- **Agente responsable**: **Coding-Agent**

### Paso 6: Verificación E2E
- **Descripción**: Crear un script de prueba que simule un flujo completo con handoff y aprobación manual.
- **Dependencias**: Paso 5.
- **Entregables**: `tests/e2e/agent-workflow.test.ts`.
- **Agente responsable**: **QA-Agent**

---

## 4. Asignación de responsabilidades (Agentes)

- **Architect-Agent**
  - Supervisión y validación de diseño (especialmente el parsing de MD).
- **Coding-Agent**
  - Implementación de todo el código backend (Pasos 1-5).
  - Herramientas: `write_file`, `read_file`.
- **QA-Agent**
  - Creación y ejecución del test E2E (Paso 6).
  - Herramienta: `run_command` (para ejecutar tests).

**Componentes**
- **Agente**: `Coding-Agent`
- **Cómo**: Escribirá código TypeScript siguiendo principios SOLID.
- **Tool**: `write_file`.

---

## 5. Estrategia de testing y validación

- **Unit tests**
  - `registry.test.ts`: Validar que parsea correctamente frontmatter de markdowns.
  - `persistence.test.ts`: Validar guardado/carga de JSON.
- **Integration tests**
  - Validar que el `Runner` se inicializa correctamente con un agente cargado dinámicamente.
- **E2E / Manual**
  - Flujo: Usuario -> Runtime -> Agente A -> Handoff Agente B -> Tool (Pause) -> Usuario Aprueba -> Tool Exec -> Resultado.

**Trazabilidad**
- AC-1 (Scope) -> Test Integración Registry.
- AC-3 (HIL) -> Test E2E.

---

## 6. Plan de demo (si aplica)
- **Objetivo**: Demostrar que un agente definido en MD puede recibir, procesar y delegar una tarea.
- **Escenario**: "Analiza este archivo y dame un resumen".
- **Criterio**: El log muestra la carga del agente, ejecucion del tool y respuesta final.

---

## 7. Estimaciones y pesos de implementación
- **Paso 1**: Bajo (1 story point).
- **Paso 2**: Alto (5 SP) - Parsing robusto es complejo.
- **Paso 3**: Medio (3 SP).
- **Paso 4**: Medio (3 SP).
- **Paso 5**: Bajo (1 SP).
- **Paso 6**: Medio (2 SP).

**Timeline**: ~2 días de trabajo agente.

---

## 8. Puntos críticos y resolución

- **Riesgo**: Parsing de Markdown inconsistente (diferentes formatos de frontmatter).
  - **Resolución**: Definir esquema estricto de Zod para validación de roles.
- **Riesgo**: Referencias circulares en handoffs.
  - **Resolución**: Limite de profundidad en el grafo de agentes.

---

## 9. Dependencias y compatibilidad
- **Internas**: `@openai/agents` (ya instalado).
- **Externas**: API OpenAI (requiere key configurada).

---

## 10. Criterios de finalización
- [ ] Tests unitarios de Registry pasando.
- [ ] Endpoint de Chat respondiendo a `curl`.
- [ ] Flujo HIL verificado manualmente o por test.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
Este plan **requiere aprobación explícita y binaria**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-10T08:10:00Z
    comments: "Plan sólido. Proceder a implementación."
```
