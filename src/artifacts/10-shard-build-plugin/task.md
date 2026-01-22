# Task (Current)

## Identificación
- id: 10-shard-build-plugin
- title: Plugin de Detección y Compilación de Shards
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: /init
  - candidate_path: .agent/artifacts/candidate/task.md

## Descripción de la tarea
Crear un plugin de build que detecte en runtime el uso de `loadShard()` en los engines, analizando estáticamente los imports de clases Shard y compilando automáticamente los entry points correspondientes.

## Objetivo
Automatizar la detección y compilación de shards referenciados mediante `loadShard(ShardClass)` en engines, manteniendo las rutas relativas dentro del módulo y soportando dependencias de npm.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "10-shard-build-plugin"
  title: "Plugin de Detección y Compilación de Shards"
  phase:
    current: "phase-4-implementation"
    validated_by: "architect-agent"
    updated_at: "2026-01-12T08:05:33+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-12T07:37:16+01:00"
      phase-1-research:
        completed: true
        validated_by: "researcher-agent"
        validated_at: "2026-01-12T07:50:13+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-12T07:56:17+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-12T08:05:33+01:00"
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
| 1 | ¿Cada clase Shard debe tener una propiedad estática `url` o se deriva del path del import? | Cada clase Shard debe tener propiedad estática `url` (ej: `static url = './ActionButtonShard.mts'`) |
| 2 | ¿Deseas cambiar la API de `loadShard(cssUrl, jsUrl)` a `loadShard(ShardClass)`? | Sí, deseo este cambio |
| 3 | ¿Detección vía análisis estático de imports + loadShard o registro explícito? | Análisis estático buscando `import {X} from './shards/...'` + `loadShard(X)` |
| 4 | ¿Cómo resolver shards de node_modules? | Ya existe plugin para node_modules, revisar y reutilizar |
| 5 | ¿CSS asociado obligatorio por convención? | No aplicar CSS por ahora; el shard importará su propio CSS en la compilación |

---

## Acceptance Criteria (OBLIGATORIO PARA CURRENT TASK)

1. **Alcance:**
   - Crear plugin `surface-shards` para Vite/Rollup
   - Modificar API de `loadShard` en clase `Engine`
   - Añadir propiedad estática `url` en clase base `Shard`

2. **Entradas / Datos:**
   - Código fuente de engines (*.mts)
   - Imports de clases Shard
   - Propiedad estática `url` de cada Shard

3. **Salidas / Resultado esperado:**
   - Shards compilados en `dist/surface/shards/[ShardName].mjs`
   - Para npm: reutilizar plugin existente de node_modules
   - API: `loadShard(ShardClass, options?)` donde `ShardClass.url` contiene la referencia

4. **Restricciones:**
   - No incluir CSS por convención (el shard importa su propio CSS)
   - Mantener compatibilidad con arquitectura Extensio
   - No romper demos/tests existentes

5. **Criterio de aceptación (Done):**
   - Plugin `surface-shards` detecta `loadShard(X)` y compila entry points
   - `Engine.loadShard(ShardClass)` funciona correctamente
   - Demo existente actualizada y funcional
   - Tests unitarios pasan

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-12T07:37:16+01:00"
    notes: "Acceptance criteria definidos con respuestas del desarrollador"
```

## Reglas contractuales
- Este fichero es la **fuente única de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- Una fase **NO puede marcarse como completed** si no es la fase actual.
