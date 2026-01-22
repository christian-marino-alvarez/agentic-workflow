# Task

## Identificación
- id: 4
- title: ADR Workflows Módulos
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: artifacts.candidate.task
  - candidate_path: .agent/artifacts/candidate/task.md

## Descripción de la tarea
Crear un ADR (Architecture Decision Record) para implementar un sistema de workflows para crear, modificar y eliminar módulos en Extensio. El sistema debe seguir un modelo similar al existente para drivers.

## Objetivo
Diseñar y documentar la arquitectura completa para gestionar el ciclo de vida de módulos, incluyendo:
- Agentes necesarios
- Workflows necesarios
- Templates necesarios
- Constitution (reglas) necesarias
- Herramientas MCP necesarias

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "4"
  title: "ADR Workflows Módulos"
  phase:
    current: "completed"
    validated_by: "architect-agent"
    updated_at: "2026-01-07T07:46:41+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T07:23:53+01:00"
      phase-1-research:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T07:30:07+01:00"
      phase-2-analysis:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T07:35:17+01:00"
      phase-3-planning:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T07:37:29+01:00"
      phase-4-implementation:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T07:43:59+01:00"
      phase-5-verification:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T07:43:59+01:00"
      phase-6-results-acceptance:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T07:46:41+01:00"
      phase-7-evaluation:
        completed: false
        validated_by: null
        validated_at: null
      phase-8-commit-push:
        completed: false
        validated_by: null
        validated_at: null
```

## Acceptance Criteria (OBLIGATORIO)

### 1. Alcance
- El ADR debe incluir **documentación técnica y funcional detallada** de cada componente:
  - Workflows (create, refactor, delete)
  - Templates
  - Reglas de constitución
  - Herramientas MCP
- NO es solo un design doc; es especificación técnica completa.

### 2. Entradas / Datos
- Arquitectura existente de drivers como modelo de referencia:
  - `.agent/workflows/drivers/` (create, refactor, delete)
  - `.agent/templates/driver-*.md`
  - `.agent/rules/constitution/drivers.md`
  - `extensio-cli` MCP tools
- Constitución de Extensio (`extensio-architecture.md`)
- Diferencias arquitectónicas entre drivers y módulos

### 3. Salidas / Resultado esperado
- **ADR documentado y aprobado** que especifique:
  - `module-agent` como owner del dominio de módulos
  - Workflows: create, refactor, delete (mismo ciclo que drivers)
  - Templates necesarios para módulos
  - Reglas de constitución para módulos
  - Extensiones del MCP `extensio-cli` existente

### 4. Restricciones
- El `module-agent` es owner del scope de módulos y su ciclo de vida
- El `architect-agent` detecta qué agente necesita y delega a `module-agent`
- Las herramientas MCP se integran en `extensio-cli` existente (ya dispone de comandos para crear módulos)
- Debe respetarse la separación arquitectónica entre drivers y módulos según la constitución

### 5. Criterio de aceptación (Done)
- [ ] ADR completo con especificación técnica de todos los componentes
- [ ] Documentación del rol `module-agent` y su relación con `architect-agent`
- [ ] Especificación de workflows (create, refactor, delete)
- [ ] Especificación de templates necesarios
- [ ] Especificación de reglas de constitución
- [ ] Especificación de extensiones MCP en `extensio-cli`
- [ ] ADR aprobado explícitamente por el desarrollador

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-07T07:23:53+01:00"
    notes: "Acceptance criteria definidos. 5 preguntas respondidas por el desarrollador."
```

## Respuestas del desarrollador (referencia)
1. **Alcance**: Documentación detallada técnica y funcional de cada workflow, template, regla y MCP
2. **Ciclo de vida**: Mismo ciclo que drivers (create → refactor → delete)
3. **Agentes**: `module-agent` como owner, delegado por `architect-agent`
4. **MCP**: Integrar en `extensio-cli` existente
5. **Done**: Solo el ADR documentado y aprobado (opción A)

## Reglas contractuales
- Este fichero es la **fuente única de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- El campo `task.lifecycle.phases.*` **SOLO puede ser marcado como completed por `architect-agent`**.
- Una fase **NO puede marcarse como completed** si no es la fase actual.
- El avance de fase requiere:
  1. Marcar la fase actual como `completed: true`
  2. Validación explícita del architect
  3. Actualización de `task.phase.current` a la siguiente fase
