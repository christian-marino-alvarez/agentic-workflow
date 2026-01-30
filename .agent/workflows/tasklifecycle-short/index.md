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
Este workflow **NO** define aliases fuera de su dominio (`taskcycle-short`).
Para artifacts y templates, **DEBE** cargar índices globales:

- Artifacts index: `.agent/artifacts/index.md`
- Templates index: `.agent/templates/index.md`

## Aliases del dominio `taskcycle-short` (OBLIGATORIO)
Este workflow define aliases **solo** del dominio `taskcycle-short` (task lifecycle short).
Existe **un único namespace** `aliases.taskcycle-short.phases.*` que contiene:
- `id` de fase
- `workflow` (path del workflow de la fase)

## Aliases (YAML)
```yaml
aliases:
  taskcycle-short:
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

1. `aliases.taskcycle-short.phases.short_phase_1.id` (Brief)
2. `aliases.taskcycle-short.phases.short_phase_2.id` (Implementation)
3. `aliases.taskcycle-short.phases.short_phase_3.id` (Closure)

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existe `artifacts.candidate.task` con `task.strategy: short`.
2. Están disponibles todos los workflows de fase del dominio `taskcycle-short`.

Si Gate FAIL:
- Indicar exactamente qué requisito falta.
- Bloquear hasta resolver.
