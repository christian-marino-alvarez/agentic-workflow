---
id: workflow.tasklifecycle-long
owner: architect-agent
version: 6.0.0
severity: PERMANENT
description: Orquesta el ciclo de vida completo (Long) de una tarea a partir de un init válido.
trigger:
  commands: ["tasklifecycle-long", "/tasklifecycle-long"]
blocking: true
---

# WORKFLOW: tasklifecycle-long (Index)

## Índices requeridos (OBLIGATORIO)
Este workflow **NO** define aliases fuera de su dominio (`taskcycle-long`).
Para artifacts y templates, **DEBE** cargar índices globales:

- Artifacts index: `.agent/artifacts/index.md`
- Templates index: `.agent/templates/index.md`

## Aliases del dominio `taskcycle-long` (OBLIGATORIO)
Este workflow define aliases **solo** del dominio `taskcycle-long` (task lifecycle long).
Existe **un único namespace** `aliases.taskcycle-long.phases.*` que contiene:
- `id` de fase
- `workflow` (path del workflow de la fase)

## Aliases (YAML)
```yaml
aliases:
  taskcycle-long:
    phases:
      phase_0:
        id: phase-0-acceptance-criteria
        workflow: .agent/workflows/tasklifecycle-long/phase-0-acceptance-criteria.md
      phase_1:
        id: phase-1-research
        workflow: .agent/workflows/tasklifecycle-long/phase-1-research.md
      phase_2:
        id: phase-2-analysis
        workflow: .agent/workflows/tasklifecycle-long/phase-2-analysis.md
      phase_3:
        id: phase-3-planning
        workflow: .agent/workflows/tasklifecycle-long/phase-3-planning.md
      phase_4:
        id: phase-4-implementation
        workflow: .agent/workflows/tasklifecycle-long/phase-4-implementation.md
      phase_5:
        id: phase-5-verification
        workflow: .agent/workflows/tasklifecycle-long/phase-5-verification.md
      phase_6:
        id: phase-6-results-acceptance
        workflow: .agent/workflows/tasklifecycle-long/phase-6-results-acceptance.md
      phase_7:
        id: phase-7-evaluation
        workflow: .agent/workflows/tasklifecycle-long/phase-7-evaluation.md
      phase_8:
        id: phase-8-commit-push
        workflow: .agent/workflows/tasklifecycle-long/phase-8-commit-push.md
```

## Input (REQUIRED)
- Existe el artefacto `init` (contrato de bootstrap) definido en el **Artifacts index**:
  - `artifacts.candidate.init`
- El artefacto `init` **DEBE** contener en su bloque YAML:
  - `language.value` no vacío
  - `language.confirmed == true`
- El desarrollador **DEBE haber respondido** a la pregunta del **Paso 10 (PASS) del workflow `init`**:
  - definición de la tarea
  - objetivo de la tarea

## Output (REQUIRED)
- Crear task candidate (definido en el **Artifacts index**):
  - `artifacts.candidate.task`
- El fichero `task candidate` **DEBE** seguir exactamente el template (definido en el **Templates index**):
  - `templates.task`

## Objetivo (ONLY)
- Verificar los requisitos mínimos para **iniciar la Fase 0** (inputs obligatorios).
- Crear el **task candidate** usando el template contractual.
- Verificar que los workflows de fase del dominio `taskcycle-long` existen y se pueden cargar.
- Si falta algún requisito, **bloquear** y pedir la acción mínima para poder iniciar la **Fase 0**.

> Este workflow **NO** controla si las fases se han completado.
> La validación y avance de fase es responsabilidad del `architect-agent` dentro de cada fase (gate propio).

## Dispatch / Routing (OBLIGATORIO)
- El routing de fases **DEBE** basarse en `task.phase.current`.
- La fase activa **DEBE** mapearse a `aliases.taskcycle-long.phases.*.workflow`.
- Si no existe mapping → **FAIL** (fase inválida o índice corrupto).
- Solo el `architect-agent` puede cambiar `task.phase.current`.

## Pasos obligatorios
1. Cargar índices globales:
   - Cargar `.agent/artifacts/index.md` y `.agent/templates/index.md`.
   - Si no se pueden cargar → ir a **Paso 7 (FAIL)**.

2. Verificar input:
   - Comprobar que existe `artifacts.candidate.init`.
   - Leer su bloque YAML y validar:
     - `language.value` no vacío
     - `language.confirmed == true`
   - Si falla → ir a **Paso 7 (FAIL)**.

3. Cargar el template contractual de task:
   - `templates.task`
   - Si no existe o no se puede cargar → ir a **Paso 7 (FAIL)**.

4. Crear el directorio de candidate (si no existe):
   - `artifacts.candidate.dir`

5. Crear el artefacto task candidate:
   - Escribir `artifacts.candidate.task`
   - El contenido **DEBE** ser conforme al template (sin omitir claves obligatorias).
   - **DEBE incluir** la información proporcionada por el desarrollador:
     - descripción de la tarea
     - objetivo de la tarea
   - Inicializar `task.phase.current` a `aliases.taskcycle-long.phases.phase_0.id`.
   - Si no se puede crear/escribir → ir a **Paso 7 (FAIL)**.

6. Verificar disponibilidad de fases (solo existencia/carga)
   - Los workflows de fase **DEBEN** existir como ficheros (no se ejecutan aquí):
     - `aliases.taskcycle-long.phases.phase_0.workflow`
     - `aliases.taskcycle-long.phases.phase_1.workflow`
     - `aliases.taskcycle-long.phases.phase_2.workflow`
     - `aliases.taskcycle-long.phases.phase_3.workflow`
     - `aliases.taskcycle-long.phases.phase_4.workflow`
     - `aliases.taskcycle-long.phases.phase_5.workflow`
     - `aliases.taskcycle-long.phases.phase_6.workflow`
     - `aliases.taskcycle-long.phases.phase_7.workflow`
     - `aliases.taskcycle-long.phases.phase_8.workflow`
   - Si falta alguno → ir a **Paso 7 (FAIL)**.

7. FAIL (obligatorio)
   - Declarar `tasklifecycle` como **NO listo para iniciar la Fase 0**.
   - Indicar exactamente qué caso aplica (uno o más):
     - índices globales no cargables (`.agent/artifacts/index.md` / `.agent/templates/index.md`)
     - `init` no existe (`artifacts.candidate.init`)
     - idioma no definido o no confirmado en `init`
     - template inaccesible (`templates.task`)
     - no se pudo crear `task candidate` (`artifacts.candidate.task`)
     - falta uno o más workflows de fase (`aliases.taskcycle-long.phases.*.workflow`)
   - Pedir la acción mínima para solventar:
     - ejecutar `init`
     - confirmar idioma
     - corregir índices globales
     - corregir permisos/ruta para crear el candidate
     - crear/restaurar el workflow de fase faltante
   - Terminar bloqueado: hasta solventar errores, **no se puede comenzar la Fase 0**.

## Orden oficial de ejecución de fases
Las fases del ciclo de vida **DEBEN ejecutarse estrictamente en el orden numérico establecido**.
No se permite saltar, reordenar ni paralelizar fases.

Orden obligatorio:
0. `aliases.taskcycle-long.phases.phase_0.id`
1. `aliases.taskcycle-long.phases.phase_1.id`
2. `aliases.taskcycle-long.phases.phase_2.id`
3. `aliases.taskcycle-long.phases.phase_3.id`
4. `aliases.taskcycle-long.phases.phase_4.id`
5. `aliases.taskcycle-long.phases.phase_5.id`
6. `aliases.taskcycle-long.phases.phase_6.id`
7. `aliases.taskcycle-long.phases.phase_7.id`
8. `aliases.taskcycle-long.phases.phase_8.id`

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existe `artifacts.candidate.task`.
2. `artifacts.candidate.task` cumple el template `templates.task`.
3. Están disponibles (existencia) todos los workflows de fase listados en el Paso 6.

Si Gate FAIL:
- Ejecutar **Paso 7 (FAIL)**.
