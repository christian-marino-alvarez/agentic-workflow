# Task: Review Agent Dev System & MCP Implementation

## Identificación
- id: 2
- title: review-mcp-agent-system
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: .agent/artifacts/candidate/task.md

## Descripción de la tarea
Revisar el sistema de desarrollo de agent que tenemos para implementar correctamente el nuevo servidor mcp para utilizar ext y corregir aquello que se necesite.

## Objetivo
Asegurar que el nuevo servidor MCP está correctamente implementado y alineado con el sistema de desarrollo de agentes (Extensio), permitiendo el uso de "ext" de forma efectiva y corrigiendo cualquier deficiencia técnica o estructural.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "2"
  title: "review-mcp-agent-system"
  phase:
    current: "phase-8-commit-push"
    validated_by: "architect-agent"
    updated_at: "2026-01-06T22:18:00+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T22:00:00+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T22:03:00+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T22:05:00+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T22:06:00+01:00"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T22:16:00+01:00"
      phase-5-verification:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T22:11:00+01:00"
      phase-6-results-acceptance:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T22:16:00+01:00"
      phase-7-evaluation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T22:18:00+01:00"
      phase-8-commit-push:
        completed: false
        validated_by: null
        validated_at: null
```

## Acceptance Criteria (Derivado de Fase 0)

1. **Adaptación de Herramientas**: Todas las referencias al tool `tools.extensio_cli` en la infraestructura de agentes (`.agent/rules/roles`, `.agent/workflows`) deben actualizarse para integrarse con el servidor MCP `@extensio/mcp-server`.
2. **Uso de "ext" vía MCP**: Se debe verificar que el comando `ext` funciona correctamente a través del túnel MCP, permitiendo a los agentes invocar comandos de la CLI.
3. **Auditoría Completa**: Realizar una auditoría técnica profunda de `tools/mcp-server/src` para identificar y corregir bugs, deudas técnicas o desalineamientos con la arquitectura Extensio.
4. **Testing Automatizado**: Implementar tests unitarios y de integración para el servidor MCP, asegurando que las herramientas MCP mapeen correctamente a los comandos de la CLI y manejen errores.
5. **Validación con Demo Real**: Crear (o usar) un Agente que utilice el MCP para generar un driver de Extensio real, verificando el flujo completo de "creación -> build -> test".

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-06T22:00:00+01:00"
    notes: "Preguntas respondidas y criterios de aceptación definidos explícitamente."
  - phase: "phase-1-research"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-06T22:04:00+01:00"
    notes: "Investigación aprobada por el desarrollador."
  - phase: "phase-2-analysis"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-06T22:05:00+01:00"
    notes: "Análisis técnico aprobado por el desarrollador."
  - phase: "phase-3-planning"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-06T22:06:00+01:00"
    notes: "Plan de implementación aprobado por el desarrollador."
  - phase: "phase-4-implementation"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-06T22:16:00+01:00"
    notes: "Implementación completada y auditada por el arquitecto."
  - phase: "phase-5-verification"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-06T22:11:00+01:00"
    notes: "Verificación aprobada por el desarrollador."
  - phase: "phase-6-results-acceptance"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-06T22:16:00+01:00"
    notes: "Resultados finales aceptados por el desarrollador."
  - phase: "phase-7-evaluation"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-06T22:18:00+01:00"
    notes: "Evaluación de agentes y métricas completada."
```

## Reglas contractuales
- Este fichero es la **fuente única de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- El avance de fase requiere validación explícita del architect y actualización de este fichero.
