# Task: Modules Globals & Constants

## Identificación
- id: 7
- title: modules-globals-constants
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Aplicar a los módulos la misma norma que tienen los drivers para extender `globals.d.mts` y `constants.mts`, verificando su contenido cuando se crea, modifica o elimina un módulo.

## Objetivo
Los módulos deben extender el namespace `Extensio.<ModuleName>.<types>` en los archivos globales del proyecto, siguiendo el mismo patrón establecido para drivers.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "7"
  title: "modules-globals-constants"
  phase:
    current: "phase-8-commit-push"
    validated_by: "architect-agent"
    updated_at: "2026-01-07T21:18:31+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T20:45:47+01:00"
      phase-1-research:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T20:55:08+01:00"
      phase-2-analysis:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T20:58:48+01:00"
      phase-3-planning:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T21:02:25+01:00"
      phase-4-implementation:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-07T21:15:00+01:00"
      phase-5-verification:
        completed: true
        validated_by: qa-agent
        validated_at: "2026-01-07T21:18:00+01:00"
      phase-6-results-acceptance:
        completed: true
        validated_by: developer
        validated_at: "2026-01-07T21:16:47+01:00"
      phase-7-evaluation:
        completed: true
        validated_by: developer
        validated_at: "2026-01-07T21:18:31+01:00"
      phase-8-commit-push:
        completed: true
        validated_by: developer
        validated_at: "2026-01-07T21:20:16+01:00"
```

## Acceptance Criteria (verificables)

### 1. Alcance
- [ ] Solo aplica a módulos futuros (no existen módulos actualmente)
- [ ] Las normas se documentan en `constitution.modules`

### 2. Namespace
- [ ] Formato PascalCase: `Extensio.<ModuleName>` (mismo que drivers)
- [ ] Tipos públicos registrados bajo `Extensio.<ModuleName>.<TypeName>`

### 3. Tipos públicos
- [ ] Solo tipos marcados como "públicos" se registran en `globals.d.mts`
- [ ] Tipos internos permanecen en `types.d.mts` del módulo

### 4. Verificación automatizada
- [ ] Workflow de creación/modificación incluye validación de `globals.d.mts`
- [ ] Workflow de creación/modificación incluye validación de `constants.mts`

### 5. Integración MCP CLI
- [ ] Comando `extensio_create` genera estructura correcta para módulos
- [ ] Validar funcionamiento mediante creación de módulo de test

## Criterio de Done
- [ ] `constitution.modules` actualizada con secciones equivalentes a drivers (2.3, 2.4)
- [ ] Workflows de módulos actualizados con verificación de globals/constants
- [ ] MCP CLI actualizado si es necesario
- [ ] Módulo de test creado y validado

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-07T20:45:47+01:00"
    notes: "5 preguntas respondidas. Acceptance criteria definidos."
  - phase: "phase-2-analysis"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-07T20:58:48+01:00"
    notes: "Análisis aprobado. Alcance: 10 componentes, documentación de patrón y verificación en workflows."
```
