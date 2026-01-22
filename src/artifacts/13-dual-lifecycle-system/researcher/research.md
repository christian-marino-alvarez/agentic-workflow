---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: approved
related_task: 13-dual-lifecycle-system
---

# Research Report — 13-dual-lifecycle-system

## 1. Resumen ejecutivo

**Problema investigado**: El ciclo de vida actual del sistema agéntico (`tasklifecycle`) impone 9 fases obligatorias para cualquier tarea, generando overhead innecesario para tareas simples.

**Objetivo**: Diseñar un sistema de ciclo dual (Long/Short) que permita al desarrollador elegir la estrategia adecuada según la complejidad, sin perder la integridad de los gates arquitectónicos.

**Principales hallazgos**:
1. El ciclo Long actual tiene 9 fases (P0-P8) con gates bloqueantes en cada transición.
2. Las fases se pueden agrupar lógicamente en 3 macro-bloques para el ciclo Short.
3. El switch debe ser persistente en `task.md` para permitir continuidad entre sesiones.
4. El modelo de 5 preguntas es crucial y debe mantenerse en ambos ciclos.

---

## 2. Necesidades detectadas

### Requisitos del desarrollador
- **Agilidad**: Ejecutar tareas simples sin pasar por 9 fases.
- **Persistencia**: La decisión de ciclo debe sobrevivir a cambios de sesión/contexto.
- **Seguridad**: Mantener gates que prevengan errores arquitectónicos.
- **Reversibilidad limitada**: Si se detecta complejidad, permitir abortar y reiniciar en Long.

### Límites arquitectónicos
- El switch NO puede modificar el comportamiento del ciclo Long existente.
- Los workflow files del ciclo Short deben ser nuevos, no modificaciones de los existentes.
- El campo `task.strategy` debe añadirse al template `task.md`.

---

## 3. Análisis del ciclo actual (Long)

### Fases existentes y su propósito

| Fase | ID | Propósito | Artefacto |
|------|----|-----------|-----------|
| P0 | acceptance-criteria | Definir alcance y 5 preguntas | task.md |
| P1 | research | Investigación técnica profunda | research.md |
| P2 | analysis | Análisis arquitectónico | analysis.md |
| P3 | planning | Plan de implementación | plan.md |
| P4 | implementation | Escritura de código | subtask-implementation.md |
| P5 | verification | Tests y validación | verification.md |
| P6 | results-acceptance | Presentación de resultados | results-acceptance.md |
| P7 | evaluation | Métricas de agentes | metrics.md |
| P8 | commit-push | Consolidación y commit | changelog.md |

---

## 4. Diseño propuesto del ciclo Short

### Mapeo de fases fusionadas

```
CICLO SHORT (3 fases)
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ SHORT-P1: Brief (Análisis + Planificación)                  │
│                                                             │
│ Fusiona:                                                    │
│   - P0 (Acceptance): 5 preguntas obligatorias               │
│   - P2 (Analysis): Análisis profundo para detectar          │
│     complejidad                                             │
│   - P3 (Planning): Plan de implementación simplificado      │
│                                                             │
│ NOTA: P1 (Research) se OMITE pero el análisis debe ser      │
│       profundo para compensar.                              │
│                                                             │
│ Artefacto: brief.md                                         │
│ Gate: Detectar complejidad → ofrecer abortar a Long         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SHORT-P2: Implementation                                    │
│                                                             │
│ Equivale a:                                                 │
│   - P4 (Implementation): Ejecución del plan                 │
│                                                             │
│ Artefacto: implementation.md                                │
│ Gate: Revisión arquitectónica obligatoria                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SHORT-P3: Closure (Verificación + Resultados + Commit)      │
│                                                             │
│ Fusiona:                                                    │
│   - P5 (Verification): Tests y validación                   │
│   - P6 (Results): Presentación al desarrollador             │
│   - P8 (Commit): Consolidación y push                       │
│                                                             │
│ NOTA: P7 (Evaluation) se OMITE en Short.                    │
│                                                             │
│ Artefacto: closure.md                                       │
│ Gate: Aprobación del desarrollador + commit                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Impacto en la arquitectura

### Renombrado de carpeta (Breaking Change controlado)

| Actual | Nuevo | Motivo |
|--------|-------|--------|
| `.agent/workflows/tasklifecycle/` | `.agent/workflows/tasklifecycle-long/` | Simetría semántica con `tasklifecycle-short` |

### Ficheros a crear

| Tipo | Path | Propósito |
|------|------|-----------|
| Workflow Index | `.agent/workflows/tasklifecycle-short/index.md` | Índice del ciclo Short |
| Fase 1 | `.agent/workflows/tasklifecycle-short/short-phase-1-brief.md` | Brief (Análisis + Plan) |
| Fase 2 | `.agent/workflows/tasklifecycle-short/short-phase-2-implementation.md` | Implementación |
| Fase 3 | `.agent/workflows/tasklifecycle-short/short-phase-3-closure.md` | Cierre (Verificación + Commit) |
| Template | `.agent/templates/brief.md` | Template para Brief |
| Template | `.agent/templates/closure.md` | Template para Closure |

### Ficheros a modificar

| Fichero | Cambio |
|---------|--------|
| `.agent/workflows/tasklifecycle-long/index.md` | Actualizar ID y aliases tras rename |
| `.agent/workflows/init.md` | Añadir paso de selección Long/Short + actualizar referencia |
| `.agent/templates/task.md` | Añadir campo `task.strategy: long \| short` |
| `.agent/workflows/index.md` | Actualizar alias `tasklifecycle` → `tasklifecycle-long` + registrar `tasklifecycle-short` |
| `.agent/templates/index.md` | Registrar nuevos templates `brief` y `closure` |

---

## 6. Mecanismo de detección de complejidad

En SHORT-P1 (Brief), el arquitecto debe evaluar si la tarea es apta para Short:

**Indicadores de complejidad alta** (requieren Long):
- La tarea afecta más de 3 paquetes/módulos.
- Requiere investigación de APIs externas.
- Introduce cambios breaking en interfaces públicas.
- Necesita tests E2E complejos.

**Flujo de decisión**:
```
┌─────────────────────────────┐
│ Análisis en Brief           │
└─────────────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ ¿Complejidad alta?  │
    └─────────────────────┘
         │          │
        YES        NO
         │          │
         ▼          ▼
   ┌───────────┐  ┌──────────────┐
   │ Notificar │  │ Continuar    │
   │ y ofrecer │  │ con Short    │
   │ abortar   │  └──────────────┘
   └───────────┘
```

---

## 7. Verificación del sistema de índices y aliases (OBLIGATORIO)

Tras el rename y la creación de nuevos workflows, se **DEBE** verificar la integridad del sistema de índices:

### Checklist de verificación

| Verificación | Fichero | Criterio de éxito |
|--------------|---------|-------------------|
| Alias `tasklifecycle-long` registrado | `.agent/workflows/index.md` | El alias apunta a la nueva ruta |
| Alias `tasklifecycle-short` registrado | `.agent/workflows/index.md` | El alias apunta al nuevo index.md |
| Aliases de fases Long actualizados | `.agent/workflows/tasklifecycle-long/index.md` | Rutas correctas post-rename |
| Aliases de fases Short definidos | `.agent/workflows/tasklifecycle-short/index.md` | 3 fases con rutas válidas |
| Templates `brief` y `closure` registrados | `.agent/templates/index.md` | Aliases funcionales |
| Campo `task.strategy` en template | `.agent/templates/task.md` | Acepta `long \| short` |

### Prueba de resolución de alias

El agente **DEBE** poder resolver la siguiente cadena sin errores:

```
.agent/index.md 
  → workflows.index 
    → tasklifecycle-long.index 
      → phase_0.workflow (debe existir y ser legible)
    → tasklifecycle-short.index 
      → short_phase_1.workflow (debe existir y ser legible)
```

### Gate de verificación

Si algún alias no resuelve correctamente:
- **FAIL**: No se puede completar la implementación.
- **Acción**: Corregir el índice o fichero faltante antes de continuar.

---

## 8. Riesgos y mitigaciones

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Subestimar complejidad en Short | ALTA | Análisis profundo + detección obligatoria en Brief |
| Pérdida de métricas (sin P7) | MEDIA | Aceptable según requisitos del desarrollador |
| Inconsistencia entre ciclos | ALTA | Templates diferentes, gates comunes |
| Confusión en sesiones mixtas | MEDIA | `task.strategy` persistido en task.md |
| Alias rotos tras rename | ALTA | Verificación obligatoria de cadena de resolución |

---

## 9. Fuentes

- Análisis directo de workflows existentes:
  - `phase-2-analysis.md` (142 líneas)
  - `phase-3-planning.md` (171 líneas)
  - `phase-4-implementation.md` (161 líneas)
  - `phase-5-verification.md` (150 líneas)
  - `phase-6-results-acceptance.md` (130 líneas)
- Arquitectura de Extensio: `extensio-architecture.md`
- Template de tareas: `templates.task`

---

## 10. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-16T00:02:48+01:00
    comments: Aprobado con scope ampliado (rename + verificación de aliases)
```
