# Task

## Identificación
- id: 12
- title: adaptacion-core-cli-surfaces
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Verificar qué cambios a nivel de core (`@extensio/core`) y CLI (`extensio-cli`) son necesarios para adaptarse a la nueva arquitectura de Pages y Shards (Surfaces).

## Objetivo
Analizar el estado actual de `@extensio/core` y `extensio-cli`, contrastarlos con las constituciones de Pages y Shards recientemente definidas, e identificar:
- Gaps de implementación en core (Surface base class, lifecycle hooks, exports)
- Gaps en CLI (generadores, templates, comandos)
- Cambios de breaking/non-breaking necesarios
- Orden de implementación recomendado

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "12"
  title: "adaptacion-core-cli-surfaces"
  phase:
    current: "phase-4-implementation"
    validated_by: "architect-agent"
    updated_at: "2026-01-14T08:07:44+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-14T07:18:46+01:00"
      phase-1-research:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-14T07:26:50+01:00"
      phase-2-analysis:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-14T08:03:49+01:00"
      phase-3-planning:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-14T08:07:44+01:00"
      phase-4-implementation:
        completed: false
        validated_by: null
        validated_at: null
      phase-5-verification:
        completed: false
        validated_by: null
        validated_at: null
      phase-6-results-acceptance:
        completed: false
        validated_by: null
        validated_at: null
      phase-7-evaluation:
        completed: false
        validated_by: null
        validated_at: null
      phase-8-commit-push:
        completed: false
        validated_by: null
        validated_at: null
```

## 5 Preguntas Obligatorias (REQUERIDO - Phase 0)

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Cuál es el alcance exacto de "Surfaces"? ¿Incluye únicamente Pages y Shards, o también otros componentes visuales como popups, sidepanels u offscreen documents? | Solo Surfaces ya que con ambos Pages y Shards se pueden construir cualquier elemento visual |
| 2 | ¿Existe ya una clase base `Surface` en core? ¿O debe crearse desde cero? Si existe, ¿qué funcionalidad tiene actualmente vs. lo que necesita según la constitución? | Sí existe, revisarlo para validar conformidad con constitución |
| 3 | ¿Los lifecycle hooks (`onMount`, `onUnmount`) deben ser uniformes para Pages y Shards, o cada uno puede tener hooks específicos adicionales? | Sí deben ser a nivel de Surface (uniformes) |
| 4 | ¿Qué nivel de cambios es aceptable en CLI? ¿Solo ajustes a templates existentes, o también nuevos comandos/generadores? | Lo necesario para que se pueda construir Pages y Shards correctamente sin fallos |
| 5 | ¿Hay una demo existente que deba validar la nueva arquitectura? ¿O se debe crear una nueva demo específica? | Sí, en core existe carpeta demo. Borrar la actual y construir una nueva con el CLI, validar mediante E2E y Unit test de que todo es funcional en Chrome, Firefox y Safari |

---

## Acceptance Criteria (OBLIGATORIO PARA CURRENT TASK)

### 1. Alcance
- Surfaces = Pages + Shards únicamente
- La clase base `Surface` debe definir hooks uniformes que heredan tanto `Page` como `Shard`
- No se contemplan otros tipos de componentes visuales en este alcance

### 2. Entradas / Datos
- Código actual de `@extensio/core`:
  - `src/surface/surface.mts` (clase Surface existente)
  - `src/surface/pages/index.mts` (clase Page existente)
  - `src/surface/shards/index.mts` (clase Shard existente)
- Código actual del CLI (`extensio-cli`):
  - Generadores de modules, drivers
  - Plugins de build (surface-pages, surface-shards)
- Constituciones definidas:
  - `constitution.pages` (v2.1.0)
  - `constitution.shards` (v2.0.0)
- Demo actual en `packages/core/demo/`

### 3. Salidas / Resultado esperado
- **Informe de gaps** documentando:
  - Gaps entre implementación actual y constitución (core)
  - Gaps en CLI (comandos, templates, plugins)
  - Lista priorizada de cambios con clasificación breaking/non-breaking
- **Core actualizado** (si aplica):
  - Clase `Surface` con hooks `onMount()`, `onUnmount()` uniformes
  - Clase `Page` conforme a constitución
  - Clase `Shard` conforme a constitución
  - Exports en `package.json` alineados
- **CLI actualizado** (si aplica):
  - Generadores `extensio create page`, `extensio create shard`
  - Templates conformes a constitución
  - Plugins de build funcionales
- **Nueva demo** en `packages/core/demo/`:
  - Construida con CLI
  - Demuestra Pages y Shards funcionando
  - Tests E2E y Unit pasando en Chrome, Firefox, Safari

### 4. Restricciones
- No mezclar lógica de negocio en Surfaces (solo UI)
- Lifecycle hooks deben definirse en `Surface`, no duplicarse en subclases
- La demo debe ser creada con el CLI, no manualmente
- Tests deben pasar en los 3 navegadores antes de considerar la tarea completa

### 5. Criterio de aceptación (Done)
- [ ] Informe de gaps documentado
- [ ] Clase `Surface` con hooks uniformes (`onMount`, `onUnmount`)
- [ ] Clase `Page` hereda de `Surface` y cumple constitución
- [ ] Clase `Shard` hereda de `Surface` y cumple constitución (nota: actualmente hereda de `Core`, hay gap potencial)
- [ ] CLI puede generar Pages con `extensio create page`
- [ ] CLI puede generar Shards con `extensio create shard`
- [ ] Demo eliminada y reconstruida con CLI
- [ ] Tests unitarios pasan
- [ ] Tests E2E pasan en Chrome, Firefox, Safari
- [ ] Build sin errores para los 3 navegadores

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-14T07:18:46+01:00"
    notes: "Acceptance criteria definidos. Se identificó un gap potencial: Shard hereda de Core, no de Surface."
  - phase: "phase-1-research"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-14T07:26:50+01:00"
    notes: "Research completado y aprobado. Gaps críticos identificados: Shard hereda Core no Surface, no hay comandos CLI para page/shard, demo incompleta."
```

## Reglas contractuales
- Este fichero es la **fuente única de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- El campo `task.lifecycle.phases.*` **SOLO puede ser marcado como completed por `architect-agent`**.
- Una fase **NO puede marcarse como completed** si no es la fase actual.
- El avance de fase requiere:
  1. Marcar la fase actual como `completed: true`
  2. Validación explícita del architect
  3. Actualización de `task.phase.current` a la siguiente fase
