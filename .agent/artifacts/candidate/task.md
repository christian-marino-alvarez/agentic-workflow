---
kind: artifact
name: task
source: agentic-system-structure
---

# Task: Reorganización de estructura de archivos y backups

## Identificación
- id: task-20260128-reorganize-structure
- title: Reorganización de estructura
- scope: candidate
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle-short
  - source: init
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Reorganizar la carpeta `src` trasladando el sistema de markdowns a una nueva carpeta `agentic-system-structure` y mover las carpetas de backups a una carpeta unificada `.backups`.

## Objetivo
Mejorar la organización del repositorio siguiendo una estructura más clara y centralizada para los archivos del sistema y los respaldos.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "task-20260128-reorganize-structure"
  title: "Reorganización de estructura"
  strategy: "short"
  artifacts:
    supplemental: []
  phase:
    current: "short-phase-2-implementation"
    validated_by: "architect-agent"
    updated_at: "2026-01-28T08:21:00+01:00"
  lifecycle:
    phases:
      short-phase-1-brief:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-28T08:21:00+01:00"
      short-phase-2-implementation:
        completed: false
        validated_by: null
        validated_at: null
      short-phase-3-closure:
        completed: false
        validated_by: null
        validated_at: null
```

---

## 2. Definición y Alcance (Contrato)
- **Acceptance Criteria**: [.agent/artifacts/task-20260128-reorganize-structure/acceptance.md](file:///.agent/artifacts/task-20260128-reorganize-structure/acceptance.md)
- **Alias**: `task.acceptance`

---

## Reglas contractuales
- Este fichero es la **fuente única de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- El campo `task.lifecycle.phases.*` **SOLO puede ser marcado como completed por `architect-agent`**.
- Una fase **NO puede marcarse como completed** si no es la fase actual.
- El avance de fase requiere:
  1. Marcar la fase actual como `completed: true`
  2. Validación explícita del architect
  3. Actualización de `task.phase.current` a la siguiente fase
