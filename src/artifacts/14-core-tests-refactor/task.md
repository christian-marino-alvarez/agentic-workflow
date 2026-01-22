# Task: Core Tests Refactor

## Identificación
- id: 14
- title: core-tests-refactor
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Eliminar todos los tests existentes del core de Extensio y crear una suite de tests nueva con criterio firme, basada en un análisis exhaustivo de las funcionalidades actuales del módulo.

## Objetivo
Certificar la estabilidad y funcionalidad del core mediante tests unitarios, de integración y E2E que cubran todos los componentes críticos: Core, Engine, Context, Surface, decorators, Navigation, Router y utilidades.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "14"
  title: "core-tests-refactor"
  strategy: "long"
  phase:
    current: "phase-6-results-acceptance"
    validated_by: "architect-agent"
    updated_at: "2026-01-16T21:46:00+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-16T19:24:24+01:00"
      phase-1-research:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-16T19:50:39+01:00"
      phase-2-analysis:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-16T19:58:26+01:00"
      phase-3-planning:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-16T20:02:56+01:00"
      phase-4-implementation:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-16T21:42:00+01:00"
      phase-5-verification:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-16T21:45:00+01:00"
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

## 5 Preguntas Obligatorias (Phase 0)

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | ¿Qué nivel de cobertura esperas? | Cobertura completa de todas las funcionalidades |
| 2 | ¿Cuál es el criterio para eliminar tests actuales? | Eliminar todos sin excepción, incluyendo librerías de test |
| 3 | ¿Qué tipos de tests priorizas? | Analizar módulo y hacer propuesta (aceptada la estructura unit/integration/e2e) |
| 4 | ¿Hay funcionalidades críticas específicas? | Acepta priorización propuesta: 🔴 Core/Engine/Context/decorators → 🟡 Navigation/Router/Shards → 🟢 Logger/Measure |
| 5 | ¿Cuál es el criterio de Done? | Todos los tests pasando según la tabla de prioridades |

---

## Acceptance Criteria (OBLIGATORIO)

### 1. Alcance
- Eliminar **todos** los tests existentes en `packages/core/test/`
- Eliminar mocks actuales en `packages/core/test/mocks/`
- Crear nueva estructura de tests: `unit/`, `integration/`, `e2e/`
- Cubrir los siguientes componentes:

| Componente | Prioridad | Tests mínimos |
|------------|-----------|---------------|
| Core | 🔴 Crítica | constructor, registerProperty, getKey/getValue, getArray/getSet/getMap, propsLoaded, metrics, logging |
| Engine | 🔴 Crítica | onMessage routing, onStorageChanged, sendMessage, createContext/closeContext, loadShard, navigate |
| Context | 🔴 Crítica | sendMessage, getStorageProps/setStorageProps, onMessage, listenProperty |
| @property | 🔴 Crítica | init, get, set, persistence |
| @onChanged | 🔴 Crítica | registration, callback invocation |
| Surface | 🟡 Alta | lifecycle (onMount/onUnmount), listenProperty, checkListeners |
| Navigation | 🟡 Alta | open (regular/popup), onChange |
| Router | 🟡 Alta | navigate, getPageUrl, init, persistPath |
| Shards | 🟡 Alta | React/Lit/Angular base classes |
| @measure | 🟢 Media | trace wrapping, metrics |
| @onShard | 🟢 Media | event filtering, callback |
| Logger | 🟢 Media | parseConsoleMessage |

### 2. Entradas / Datos
- Código fuente: `packages/core/src/`
- Mocks de drivers: `@extensio/driver-*`
- Config existente: `vitest.config.mts`, `playwright.config.ts`

### 3. Salidas / Resultado esperado
- Nueva suite de tests funcional
- Cobertura ≥80% (según config actual)
- Todos los tests pasando
- Sin placeholders (`expect(true).toBe(true)`)

### 4. Restricciones
- Unit tests con **Vitest**
- E2E con **Playwright**
- No modificar lógica del core (solo tests)
- Mantener thresholds de cobertura (100%)

### 5. Criterio de aceptación (Done)
- [ ] Todos los tests anteriores eliminados
- [ ] Nueva estructura `unit/`, `integration/`, `e2e/` creada
- [ ] Tests 🔴 Crítica implementados y pasando
- [ ] Tests 🟡 Alta implementados y pasando
- [ ] Tests 🟢 Media implementados y pasando
- [ ] Cobertura 100%
- [ ] `npm run test` pasa sin errores
- [ ] E2E con Playwright pasa (si aplica)
- [ ] **AC-8**: Ningún test tiene fallos de linter o errores de TypeScript.

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-16T19:24:24+01:00"
    notes: "5 preguntas respondidas. Acceptance criteria definidos con prioridades y estructura de tests."
  - phase: "phase-1-research"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-16T19:50:39+01:00"
    notes: "Research aprobado. Estrategias de mocking, decorators Stage 3, compatibilidad multi-browser."
  - phase: "phase-2-analysis"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-16T19:58:26+01:00"
    notes: "Analysis aprobado. 7 ACs mapeados, agentes definidos (architect + qa), estructura de mocks."
  - phase: "phase-3-planning"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-16T20:02:56+01:00"
    notes: "Plan aprobado. 10 pasos, ~4.5h estimadas, qa-agent ejecutor, puntos críticos identificados."
```

## Reglas contractuales
- Este fichero es la **fuente única de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- El campo `task.lifecycle.phases.*` **SOLO puede ser marcado como completed por `architect-agent`**.
