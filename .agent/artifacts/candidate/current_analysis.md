---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Analysis — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Análisis de la implementación de workflows multi-agente.

## 1. Resumen ejecutivo
**Problema**
- El sistema actual carece de una orquestación centralizada para gestionar interacciones complejas entre múltiples agentes, persistencia de estado y flujos Human-in-the-Loop (HIL).

**Objetivo**
- Implementar un motor de workflows basado en `@openai/agents` que soporte handoffs dinámicos, ejecución de herramientas segura y persistencia.

**Criterio de éxito**
- El sistema puede instanciar agentes desde definiciones Markdown.
- El sistema persiste y restaura el estado de la conversación.
- Las herramientas sensibles requieren aprobación explícita (HIL).
- Se soportan handoffs fluidos entre agentes.

---

## 2. Estado del proyecto (As-Is)
**Estructura relevante**
- `src/backend/`: Contiene la lógica del servidor Fastify.
- `.agent/rules/roles/`: Definiciones de agentes en Markdown.
- `.agent/skills/`: Definiciones de skills y herramientas.

**Componentes existentes**
- **Fastify Server**: Infraestructura base lista.
- **ChatKit**: Sistema de chat básico (a ser potenciado).

**Limitaciones detectadas**
- No existe un mecanismo de "hidratación" de agentes desde archivos.
- La gestión de estado actual es efímera o básica.
- Faltan primitivas de control HIL en el backend.

---

## 3. Cobertura de Acceptance Criteria

### 1. Alcance (WorkflowRuntime, Triaje, Handoffs)
- **Interpretación**: Necesitamos un servicio `AgentRegistry` para cargar agentes y un `Runtime` para ejecutarlos.
- **Verificación**: Tests de integración y unitarios del registry.
- **Riesgos**: Complejidad en el parsing de Markdown y mapeo de skills.

### 2. Entradas / Datos (Lenguaje natural, Persistencia)
- **Interpretación**: El sistema debe aceptar texto y guardar `RunState` serializado.
- **Verificación**: Verificar persistencia en BD (SQLite/JSON).
- **Riesgos**: Tamaño del estado serializado.

### 3. Salidas / Resultado esperado (Eventos, HIL, Persistencia)
- **Interpretación**: Streaming de eventos estándar (`AgentEvent`) y soporte de interrupciones.
- **Verificación**: Consumo de eventos en frontend simulado.
- **Riesgos**: Latencia en handoffs.

### 4. Restricciones (Confirmación Manual, Notificación Handoff)
- **Interpretación**: Tools con `needsApproval: true` y eventos de cambio de agente.
- **Verificación**: Test de flujo HIL forzado.

### 5. Criterio de aceptación (Done)
- **Interpretación**: Flujo E2E completo (Refactor -> CodingAgent -> ReviewAgent).
- **Verificación**: Script de prueba E2E.

---

## 4. Research técnico
Basado en `research.md`:

- **SDK @openai/agents**: Confirmado como tecnología base.
- **Persistencia**: Uso de `RunState.toString()` / `fromString()`.
- **HIL**: Uso de `result.isInterrupted` y `state.approve()`.
- **Registro Dinámico**: Nuevo componente crítico para cargar roles/skills desde MD.

**Decisión recomendada**
- Implementar `AgentRegistryService` (carga dinámica).
- Implementar `WorkflowRuntimeService` (wrapper sobre Runner).
- Usar SQLite para persistencia de sesiones.

---

## 5. Agentes participantes

- **Architect Agent** (Rol del sistema)
  - Responsable de la orquestación global (definición).
- **Runtime Agent** (Componente software)
  - Triaje y enrutamiento inicial.
- **Generic/Domain Agents** (Cargados dinámicamente)
  - Instanciados desde `.agent/rules/roles/*.md`.

**Handoffs**
- Gestionados nativamente por el SDK vía `Handoff` class.

**Componentes necesarios**
- **Create**: `src/backend/agents/registry.ts` (AgentRegistry).
- **Create**: `src/backend/agents/runtime.ts` (WorkflowRuntime).
- **Create**: `src/backend/agents/persistence.ts`.
- **Modify**: `src/backend/server.ts` (Integración de rutas).

**Demo**
- No requerida explícitamente, pero el Test E2E servirá de demostración funcional.

---

## 6. Impacto de la tarea
- **Arquitectura**: Introduce una capa de "Agentes" formal en el backend.
- **APIs**: Nuevos endpoints para `chat/message`, `chat/history`, `agent/approve`.
- **Compatibilidad**: No rompe funcionalidad existente, se añade como módulo.
- **Testing**: Requiere mocks del SDK de OpenAI para tests unitarios.

---

## 7. Riesgos y mitigaciones
- **Riesgo**: Parsing de Markdown frágil.
  - **Mitigación**: Usar librerías robustas de frontmatter y validación estricta (Zod).
- **Riesgo**: Recursión infinita en Handoffs.
  - **Mitigación**: Limitar `maxTurns` en el Runner configuration.

---

## 8. Preguntas abiertas
Ninguna.

---

## 9. TODO Backlog
**Estado actual**: 0 items pendientes.
**Impacto**: N/A.

---

## 10. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-10T08:00:00Z
    comments: Aprobado análisis para implementación de registro dinámico y workflow engine.
```
