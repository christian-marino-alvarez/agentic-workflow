---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 14-core-tests-refactor
---

# Analysis — 14-core-tests-refactor

## 1. Resumen ejecutivo

**Problema**
El core de Extensio (`packages/core`) carece de tests funcionales. Los tests existentes son placeholders vacíos que no validan ningún comportamiento real. Esto impide certificar la estabilidad del framework.

**Objetivo**
Eliminar todos los tests existentes y crear una suite de tests nueva con criterio firme que cubra todos los componentes críticos: Core, Engine, Context, Surface, decorators, Navigation, Router y utilidades.

**Criterio de éxito**
- Todos los tests anteriores eliminados
- Nueva estructura `unit/`, `integration/`, `e2e/` funcional
- Tests por prioridad (🔴 Crítica → 🟡 Alta → 🟢 Media) implementados y pasando
- Cobertura ≥80%
- `npm run test` sin errores

---

## 2. Estado del proyecto (As-Is)

### Estructura relevante
```
packages/core/
├── src/
│   ├── engine/        # Core, Engine, Context, Logger, Router, Navigation
│   ├── decorator/     # @property, @onChanged, @measure, @onShard
│   ├── surface/       # Surface, Pages, Shards (React/Lit/Angular)
│   ├── utils/         # Logger, TypeUtils
│   ├── constants.mts
│   └── types.d.mts
├── test/
│   ├── unit/          # 3 placeholders (core.test, decorators.test, surface.test)
│   ├── e2e/           # 1 spec existente
│   ├── mocks/         # chrome-runtime, chrome-storage, index
│   └── manual/        # 1 test manual
├── vitest.config.mts  # Thresholds 80%, happy-dom
└── playwright.config.ts
```

### Drivers existentes (15 total)
Los drivers en `packages/drivers/` exponen interfaces estáticas que el core utiliza:
- `@extensio/driver-storage` → Storage.local/session/sync
- `@extensio/driver-runtime` → Runtime.sendMessage, onMessage
- `@extensio/driver-tabs` → Tabs.create, query, onUpdated
- `@extensio/driver-windows` → Windows.create, onFocusChanged
- `@extensio/driver-scripting` → Scripting.executeScript
- `@extensio/driver-offscreen` → Offscreen.createDocument
- Otros: tts, speech-recognition, side-panel, websocket, render-*, openai-api, document-pip

### Core / Engine / Surfaces
| Componente | Líneas | Métodos | Complejidad |
|------------|--------|---------|-------------|
| Core | 390 | 39 | Alta |
| Engine | 390 | 23 | Alta |
| Context | 110 | 10 | Media |
| Surface | 60 | 6 | Baja |
| @property | 76 | 3 | Alta (decorators) |
| @onChanged | 24 | 1 | Media |
| Navigation | 74 | 3 | Baja |
| Router | 68 | 6 | Baja |
| Logger | 105 | 2 | Baja |

### Limitaciones detectadas
1. **Mocks incompletos**: Solo existen mocks para `storage` y `runtime`
2. **Tests placeholders**: 100% de los tests son `expect(true).toBe(true)`
3. **Stage 3 decorators**: Requieren configuración específica en tests
4. **Offscreen**: Solo funciona en Chrome, necesita fallback en tests

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Eliminar todos los tests existentes
- **Interpretación**: Borrar contenido de `test/unit/`, `test/e2e/`, `test/mocks/`
- **Verificación**: `ls test/` muestra solo estructura vacía o nueva
- **Riesgos**: Ninguno técnico; es destructivo pero requerido

### AC-2: Nueva estructura unit/integration/e2e
- **Interpretación**: 
  - `test/unit/` → tests aislados con mocks
  - `test/integration/` → tests de comunicación Engine↔Context
  - `test/e2e/` → Playwright con extensión real
- **Verificación**: Estructura de carpetas existe y contiene `.test.mts`
- **Riesgos**: Confusión sobre qué va en cada nivel

### AC-3: Tests 🔴 Crítica implementados
- **Interpretación**: Core, Engine, Context, @property, @onChanged
- **Verificación**: Cada componente tiene suite de tests con casos reales
- **Riesgos**: Alta complejidad de mocking para decorators

### AC-4: Tests 🟡 Alta implementados
- **Interpretación**: Surface, Navigation, Router, Shards
- **Verificación**: Suites funcionales para lifecycle y navegación
- **Riesgos**: Shards requieren mocking de React/Lit/Angular

### AC-5: Tests 🟢 Media implementados
- **Interpretación**: @measure, @onShard, Logger
- **Verificación**: Tests básicos de funcionalidad
- **Riesgos**: Bajo impacto si se depriorizan

### AC-6: Cobertura ≥80%
- **Interpretación**: vitest --coverage cumple thresholds
- **Verificación**: `npm run test:coverage` pasa
- **Riesgos**: Posible gap en branches complejos

### AC-7: npm run test sin errores
- **Interpretación**: Todos los tests pasan en CI local
- **Verificación**: Exit code 0
- **Riesgos**: Tests flaky si no se mockea correctamente async

---

## 4. Research técnico

### Estrategia de mocking (decisión tomada en Phase 1)
- **Decisión**: Mocks manuales mejorados por driver
- **Justificación**: Control total, sin dependencias externas, coherencia con drivers existentes

### Estructura de mocks propuesta
```
test/mocks/
├── drivers/
│   ├── storage.mock.mts       # Storage.local/session/sync
│   ├── runtime.mock.mts       # Runtime.sendMessage, onMessage
│   ├── tabs.mock.mts          # Tabs.create, query
│   ├── windows.mock.mts       # Windows.create
│   ├── scripting.mock.mts     # Scripting.executeScript
│   └── offscreen.mock.mts     # Offscreen.createDocument
├── browser-globals.mock.mts   # chrome.* namespace consolidado
└── index.mts                  # setupAllMocks, resetAllMocks
```

### Patrón de testing para decorators
```typescript
// Crear clases de test que hereden de Engine/Core
class TestEngine extends Engine {
  @property({ storage: AreaName.Local })
  accessor testProp: string = 'initial';
}

// Instanciar y verificar comportamiento
const engine = new TestEngine('test', Scope.Engine);
expect(engine.propReader.has('testProp')).toBe(true);
```

---

## 5. Agentes participantes

### architect-agent (Owner)
- **Responsabilidades**:
  - Diseño de estructura de tests
  - Validación de coherencia arquitectónica
  - Revisión de cobertura de AC
- **Subáreas**: Core, Engine, Context

### qa-agent (Ejecutor principal)
- **Responsabilidades**:
  - Implementación de tests unitarios
  - Implementación de tests de integración
  - Configuración de mocks
  - Verificación de cobertura
- **Subáreas**: Todos los componentes

### Handoffs
1. `architect-agent` → `qa-agent`: Plan de tests aprobado
2. `qa-agent` → `architect-agent`: Revisión de implementación
3. `architect-agent` → `developer`: Resultados finales

### Componentes necesarios
- **Crear**: Nuevos mocks para 6 drivers adicionales (tabs, windows, scripting, offscreen, etc.)
- **Modificar**: vitest.config.mts (si se requiere ajustar aliases)
- **Eliminar**: Tests placeholders actuales, mocks obsoletos

### Demo
- **No aplica**: Esta tarea es de testing interno, no requiere demo funcional

---

## 6. Impacto de la tarea

### Arquitectura
- Sin cambios en código de producción
- Nueva estructura de tests en `packages/core/test/`

### APIs / contratos
- Sin cambios en APIs públicas
- Los tests documentan comportamiento esperado

### Compatibilidad
- Sin breaking changes
- Tests validan compatibilidad existente

### Testing / verificación
- Unit tests: Vitest con happy-dom
- Integration tests: Vitest con mocks de comunicación
- E2E: Playwright (opcional, si el tiempo permite)

---

## 7. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Decorators Stage 3 no transpilan en tests | 🔴 Alto | Verificar config esbuild/vite antes de implementar |
| Mocks desincronizados con drivers reales | 🟡 Medio | Tipos compartidos, revisar interfaces de drivers |
| Cobertura 80% difícil de alcanzar | 🟡 Medio | Priorizar componentes críticos, aceptar >70% en primera iteración |
| Tests flaky por async no controlado | 🟡 Medio | Usar vi.useFakeTimers(), waitFor patterns |
| E2E requiere más tiempo del estimado | 🟢 Bajo | Deprioritizar E2E, focalizarse en unit/integration |

---

## 8. Preguntas abiertas

~~Ninguna~~ — Todas las cuestiones fueron resueltas en Phase 0 y Phase 1.

---

## 9. Aprobación

Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-16T19:58:26+01:00
    comments: Aprobado sin cambios
```

> Sin aprobación, esta fase **NO puede darse por completada** ni avanzar a Fase 3.
