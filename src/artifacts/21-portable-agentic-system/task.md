# Task (Current)

## Identificación
- id: 21
- title: Portable Agentic System
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Crear un paquete npm portable que permita distribuir el sistema de agentes para ser usado en cualquier otro proyecto (agnóstico de Extensio).

## Objetivo
Desacoplar la lógica de orquestación del framework Extensio, implementar un CLI (`agentic-workflow`) para inicialización y proveer la base de la constitución y estructura de agentes.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "21"
  title: "Portable Agentic System"
  strategy: "long"
  phase:
    current: "cancelled"
    validated_by: "architect-agent"
    updated_at: "2026-01-19T09:35:00Z"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-19T09:27:00Z"
      phase-1-research:
        completed: false
        status: "cancelled"
        validated_by: "architect-agent"
        validated_at: "2026-01-19T09:35:00Z"
      phase-2-analysis:
        completed: false
        status: "cancelled"
      phase-3-planning:
        completed: false
        status: "cancelled"
      phase-4-implementation:
        completed: false
        status: "cancelled"
      phase-5-verification:
        completed: false
        status: "cancelled"
      phase-6-results-acceptance:
        completed: false
        status: "cancelled"
      phase-7-evaluation:
        completed: false
        status: "cancelled"
      phase-8-commit-push:
        completed: false
        status: "cancelled"
```

## 5 Preguntas Obligatorias (REQUERIDO - Phase 0)

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Qué nombre exacto tendrá el paquete npm (ej: `@cmarino/agentic-workflow`)? | @cmarino/agentic-workflow |
| 2 | ¿Cuál es el conjunto mínimo de archivos/reglas que deben ser "portados" (ej: workflows, rules/constitution, templates)? | Sistemas Long y Short, roles de desarrollo y templates agnósticos. |
| 3 | El CLI `init`, ¿qué estructura de directorios debería crear por defecto en el proyecto destino? | `AGENTS.md` en root y carpeta `.agent/` con estructura/scaffolding. |
| 4 | ¿Cómo manejaremos las dependencias de MCP servers si el proyecto destino no las tiene configuradas? | Un asistente de configuración guiado tras la instalación. |
| 5 | ¿Qué nivel de personalización de los agentes/roles permitiremos en esta primera versión portable? | Asistente guiará para customizar manteniendo formato y coherencia. |

---

## Acceptance Criteria (OBLIGATORIO PARA CURRENT TASK)

1. Alcance:
   - Creación de paquete npm `@cmarino/agentic-workflow`.
   - Implementación de CLI `agentic-workflow`.
   - Portabilidad de workflows (Long/Short), roles y templates contractuales.
   - Creación de `AGENTS.md` y carpeta `.agent/` en proyectos destino.

2. Entradas / Datos:
   - Workflows actuales del repositorio extensio.
   - Constituciones de roles y arquitectura (agnósticas).
   - Templates contractuales.

3. Salidas / Resultado esperado:
   - Paquete npm instalable.
   - Comando CLI funcional para inicializar el sistema.
   - Asistente interactivo de configuración post-instalación.
   - Documentación básica en `AGENTS.md`.

4. Restricciones:
   - El sistema debe ser agnóstico de Extensio (eliminar referencias a extensiones).
   - Mantener la coherencia del flow original (Gates, Roles, Fases).
   - El asistente debe guiar la customización sin romper el formato.

5. Criterio de aceptación (Done):
   - Un proyecto vacío puede ser inicializado con el CLI y el sistema de agentes queda funcional (capaz de iniciar `init`).
   - El asistente de configuración permite establecer la base del proyecto.
   - El código es Clean Code y sigue la arquitectura de Extensio (aplicada a orquestación).

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-19T09:27:00Z"
    notes: "Acceptance criteria definidos y validados. Pasando a Phase 1."
```
