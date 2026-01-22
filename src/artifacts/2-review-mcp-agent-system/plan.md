---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 2-review-mcp-agent-system
---

# Implementation Plan — 2-review-mcp-agent-system

## 1. Resumen del plan
- **Contexto**: Migración de la infraestructura de agentes de llamadas directas a la CLI (`tools.extensio_cli`) hacia el uso del servidor MCP `@extensio/mcp-server`.
- **Resultado esperado**: Sistema de agentes actualizado y coherente con la arquitectura MCP, servidor MCP robusto con tests y auditoría completa.
- **Alcance**: 
  - Actualización de todos los archivos `.md` en `.agent/`.
  - Refactorización de `tools/mcp-server` para mejorar robustez (gestión de paths y errores).
  - Implementación de suite de tests para el MCP.
  - Validación con demo.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/2-review-mcp-agent-system/task.md`
- **Analysis**: `.agent/artifacts/2-review-mcp-agent-system/analysis.md`
- **Acceptance Criteria**: AC-1 a AC-5.

**Dispatch de dominios**
```yaml
plan:
  workflows:
    drivers:
      action: none
      workflow: null
  dispatch:
    - domain: qa
      action: verify
      workflow: workflow.tasklifecycle.phase-5-verification
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Auditoría y Refactor de MCP Server
- **Descripción**: Mejorar `cli-executor.ts` para usar paths absolutos o detección dinámica del root. Mejorar logging de errores.
- **Dependencias**: Ninguna.
- **Entregables**: `tools/mcp-server/src/utils/cli-executor.ts` actualizado.
- **Agente responsable**: Implementer (Architect).

### Paso 2: Migración de Reglas y Roles
- **Descripción**: Actualizar `.agent/rules/roles/*.md` y `.agent/rules/constitution/drivers.md` para usar `mcp_extensio-cli_*`.
- **Dependencias**: Ninguna.
- **Entregables**: Archivos de reglas actualizados.
- **Agente responsable**: Architect-Agent.

### Paso 3: Migración de Workflows
- **Descripción**: Actualizar `.agent/workflows/**/*.md` (especialmente `drivers/create.md` y `tasklifecycle/phase-4-implementation.md`).
- **Dependencias**: Paso 2.
- **Entregables**: Workflows actualizados.
- **Agente responsable**: Architect-Agent.

### Paso 4: Suite de Tests para MCP
- **Descripción**: Implementar tests unitarios para las herramientas MCP usando mocks de `spawn`.
- **Dependencias**: Paso 1.
- **Entregables**: `tools/mcp-server/test/*.test.ts`.
- **Agente responsable**: QA-Agent.

### Paso 5: Demo y Validación Final
- **Descripción**: Ejecutar `mcp_extensio-cli_extensio_create` para crear un driver de prueba.
- **Dependencias**: Pasos 1-3.
- **Entregables**: Nuevo driver `demo-mcp-verify`.
- **Agente responsable**: Architect-Agent.

---

## 4. Asignación de responsabilidades (Agentes)

- **Architect-Agent**
  - Responsabilidades: Actualización de `.agent/`, auditoría de código, validación de demo.
- **Implementer (Architect)**
  - Responsabilidades: Mejoras en `tools/mcp-server/src`.
- **QA / Verification-Agent**
  - Responsabilidades: Creación de tests de infraestructura para el MCP.

**Componentes**
- **tools/mcp-server**: Se implementará con TypeScript y Vitest. Se usará el SDK de MCP.
- **.agent/**: Actualización masiva de documentos Markdown.

---

## 5. Estrategia de testing y validación
- **Unit tests**: Vitest en `tools/mcp-server`.
  - Comando: `cd tools/mcp-server && npm run test`
- **Manual / Agente**: Verificación de que Antigravity reconoce los nuevos nombres de tools tras la actualización de los `.md`.

---

## 6. Plan de demo (si aplica)
- **Objetivo**: Demostrar que un agente puede usar el MCP para crear un driver.
- **Escenario**: Crear un driver llamado `mcp-audit-test`.
- **Criterios de éxito**: El driver se crea en `packages/drivers/mcp-audit-test` con la estructura correcta.

---

## 7. Estimaciones y pesos de implementación
- **Auditoría MCP**: Bajo (2h).
- **Migración .agent**: Medio (4h - volumen de archivos).
- **Tests MCP**: Medio (3h).
- **Demo**: Bajo (1h).

---

## 8. Puntos críticos y resolución
- **Punto crítico: Inconsistencia de nombres**
  - Riesgo: Que un workflow use un nombre de parámetro que el MCP no espera.
  - Resolución: Validación cruzada entre `extensio-create.ts` y los manuales de workflows.

---

## 9. Dependencias y compatibilidad
- **Dependencias externas**: Node.js, MCP SDK.
- **Restricciones**: No romper la compatibilidad de la CLI original.

---

## 10. Criterios de finalización
- [ ] No hay referencias a `tools.extensio_cli` en `.agent/`.
- [ ] El MCP Server pasa los tests unitarios.
- [ ] La demo de creación de driver funciona correctamente.
- [ ] El `task.md` está actualizado hasta la Fase 8.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-06T22:06:00+01:00
    comments: Aprobado por el usuario.
```
