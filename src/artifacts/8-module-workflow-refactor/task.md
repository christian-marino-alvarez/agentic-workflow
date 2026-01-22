# Task: Module Workflow Refactor

## Identificación
- id: 8
- title: module-workflow-refactor
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Refactorizar el workflow de creación de módulos, las reglas de arquitectura de módulos y el generator MCP para garantizar:
- Scaffolding correcto con naming CamelCase automático
- Estructura obligatoria con Engine y opciones separadas para Shards/Pages
- Registro de Shards en `src/surfaces/shards/index.mts`
- Integración de types y constants siguiendo el patrón de drivers
- Demo funcional incluido en el generator

## Objetivo
Consolidar el sistema de creación de módulos para que sea coherente con el patrón de drivers, con naming correcto, estructura clara, y demo funcional automático.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "8"
  title: "module-workflow-refactor"
  phase:
    current: "phase-8-commit-push"
    validated_by: "architect-agent"
    updated_at: "2026-01-07T22:15:00+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-07T21:37:29+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-07T21:43:14+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-07T21:48:46+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-07T21:56:02+01:00"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-07T22:05:00+01:00"
      phase-5-verification:
        completed: true
        validated_by: "qa-agent"
        validated_at: "2026-01-07T22:15:00+01:00"
      phase-6-results-acceptance:
        completed: true
        validated_by: "user"
        validated_at: "2026-01-07T22:18:00+01:00"
      phase-7-evaluation:
        completed: true
        validated_by: "user"
        validated_at: "2026-01-07T22:20:00+01:00"
      phase-8-commit-push:
        completed: true
        validated_by: "user"
        validated_at: "2026-01-07T22:25:00+01:00"
```

## Acceptance Criteria (OBLIGATORIO)

### 1. Alcance
- Refactorizar `constitution.modules` para incluir reglas de naming y estructura de surfaces
- Refactorizar workflow `modules/create.md` con flags separados para shards/pages
- Refactorizar MCP tool `extensio-create.ts` para soportar:
  - Transformación automática de naming (`session-manager` → `SessionManager`)
  - Flags `--withShards` y `--withPages` separados
  - Generación de demo funcional
- Template del generator debe crear estructura completa incluyendo registro de shards

### 2. Entradas / Datos
- Nombre del módulo (puede contener espacios o guiones, ej: "Session Manager" o "session-manager")
- Flags opcionales: `--withShards`, `--withPages`, `--withContext`
- Flag `--includeDemo` (default: true para módulos)

### 3. Salidas / Resultado esperado
El generator DEBE crear:

```
packages/modules/<nombre-modulo>/
├── src/
│   ├── index.mts                    # Entry point público
│   ├── types.d.mts                  # Tipos locales
│   ├── constants.mts                # Constantes tipadas
│   ├── engine/
│   │   └── <NombreModulo>Engine.mts # Engine del módulo (obligatorio)
│   ├── context/                     # Solo si --withContext
│   │   └── <NombreModulo>Context.mts
│   └── surfaces/                    # Solo si --withShards o --withPages
│       ├── shards/                  # Solo si --withShards
│       │   └── index.mts            # Registro de shards
│       └── pages/                   # Solo si --withPages
│           └── index.mts
├── demo/                            # Siempre incluido (--includeDemo default true)
│   └── ...                          # Demo funcional
├── package.json
├── tsconfig.json
└── README.md
```

**Integraciones obligatorias:**
- `global.d.mts` del proyecto actualizado con namespace `Extensio.<NombreModulo>`
- Patrón idéntico a drivers: importar desde `@extensio/module-xxx/types`

### 4. Restricciones
- Clases: **CamelCase** sin guiones (ej: `SessionManagerEngine`)
- Rutas/ficheros: **kebab-case** con guiones medios (ej: `session-manager/`)
- Engine es **OBLIGATORIO** en todo módulo
- Context y Surfaces son **OPCIONALES**
- Demo funcional **incluido por defecto**
- Shards se registran en `src/surfaces/shards/index.mts` usando `Shard.registerShard()`

### 5. Criterio de aceptación (Done)
- [ ] Generator transforma automáticamente naming (input → folder kebab-case + clase CamelCase)
- [ ] Flags `--withShards` y `--withPages` funcionan independientemente
- [ ] Estructura creada cumple el árbol definido en sección 3
- [ ] `global.d.mts` actualizado con namespace correcto
- [ ] Demo funcional creado y ejecutable
- [ ] Workflow `modules/create.md` actualizado
- [ ] Constitution `modules.md` actualizada con reglas de naming
- [ ] Tests unitarios validan el generator
- [ ] E2E valida creación de módulo completo

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-07T21:37:29+01:00"
    notes: "Acceptance criteria definidos basados en 5 preguntas al desarrollador"
```

## Reglas contractuales
- Este fichero es la **fuente única de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- El campo `task.lifecycle.phases.*` **SOLO puede ser marcado como completed por `architect-agent`**.
- Una fase **NO puede marcarse como completed** si no es la fase actual.
