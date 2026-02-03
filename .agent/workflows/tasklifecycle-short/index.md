---
id: workflow.tasklifecycle-short
owner: architect-agent
version: 1.0.0
severity: PERMANENT
description: Orquesta el ciclo de vida simplificado (Short) de una tarea a partir de un init válido.
trigger:
  commands: ["tasklifecycle-short", "/tasklifecycle-short"]
blocking: true
---

# WORKFLOW: tasklifecycle-short (Index)

## Índices requeridos (OBLIGATORIO)
Este workflow **NO** define aliases fuera de su dominio (`tasklifecycle-short`).
Para artifacts y templates, **DEBE** cargar índices globales:

- Artifacts index: `.agent/artifacts/index.md`
- Templates index: `.agent/templates/index.md`

## Aliases del dominio `tasklifecycle-short` (OBLIGATORIO)
Este workflow define aliases **solo** del dominio `tasklifecycle-short` (task lifecycle short).
Existe **un único namespace** `aliases.tasklifecycle-short.phases.*` que contiene:
- `id` de fase
- `workflow` (path del workflow de la fase)

> [!IMPORTANT]
> **Trazabilidad Runtime (OBLIGATORIO)**:
> Para garantizar la transparencia y el logging, este workflow **DEBE** ejecutarse a través de:
> - `runtime_run`: Para iniciar la tarea o retomar tras un reinicio.
> - `runtime_advance_phase`: Para avanzar de fase tras aprobación del desarrollador.
> - `runtime_chat`: Para comunicaciones durante el ciclo.
> Saltar estas herramientas invalida la auditoría de la sesión.

## Aliases (YAML)
```yaml
aliases:
  tasklifecycle-short:
    phases:
      short_phase_1:
        id: short-phase-1-brief
        workflow: .agent/workflows/tasklifecycle-short/short-phase-1-brief.md
      short_phase_2:
        id: short-phase-2-implementation
        workflow: .agent/workflows/tasklifecycle-short/short-phase-2-implementation.md
      short_phase_3:
        id: short-phase-3-closure
        workflow: .agent/workflows/tasklifecycle-short/short-phase-3-closure.md
```

## Input (REQUIRED)
- Existe el artefacto `init` con `task.strategy == "short"`.
- El desarrollador ha definido título y objetivo de la tarea.

## Output (REQUIRED)
- Task candidate con `task.strategy: short`.
- Artefactos de cada fase: `brief.md`, `implementation.md`, `closure.md`.

## Objetivo (ONLY)
- Ejecutar un ciclo simplificado de 3 fases para tareas de baja complejidad.
- Mantener la integridad de los gates arquitectónicos.
- Si se detecta complejidad alta en Brief, ofrecer abortar a Long.

## Orden oficial de ejecución de fases
Las fases del ciclo Short **DEBEN ejecutarse estrictamente en orden**:

1. `aliases.tasklifecycle-short.phases.short_phase_1.id` (Brief)
2. `aliases.tasklifecycle-short.phases.short_phase_2.id` (Implementation)
3. `aliases.tasklifecycle-short.phases.short_phase_3.id` (Closure)

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existe `artifacts.candidate.task` con `task.strategy: short`.
2. Están disponibles todos los workflows de fase del dominio `tasklifecycle-short`.

Si Gate FAIL:
- Indicar exactamente qué requisito falta.
- Bloquear hasta resolver.
