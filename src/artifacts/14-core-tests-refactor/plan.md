---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 14-core-tests-refactor
---

# Implementation Plan — 14-core-tests-refactor

## 1. Resumen del plan

**Contexto**
El core de Extensio carece de tests funcionales. Los tests actuales son placeholders que no validan comportamiento real.

**Resultado esperado**
Suite de tests completa con estructura `unit/`, `integration/`, mocks para 6+ drivers, y cobertura ≥80%.

**Alcance**
- ✅ Incluye: eliminación de tests actuales, creación de mocks, tests unitarios, tests de integración
- ❌ Excluye: tests E2E (se abordarán en tarea futura si el tiempo no permite), modificaciones al código de producción

---

## 2. Inputs contractuales

- **Task**: `.agent/artifacts/14-core-tests-refactor/task.md`
- **Analysis**: `.agent/artifacts/14-core-tests-refactor/analysis.md`
- **Research**: `.agent/artifacts/14-core-tests-refactor/researcher/research.md`
- **Acceptance Criteria**: AC-1 a AC-7 definidos en task.md

**Dispatch de dominios**
```yaml
plan:
  workflows:
    drivers:
      action: none
    modules:
      action: none
    core:
      action: none  # Solo testing, no modificaciones

  dispatch:
    - domain: qa
      action: verify
      workflow: workflow.tasklifecycle.phase-5-verification
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Eliminar tests y mocks existentes
- **Descripción**: Borrar contenido de `test/unit/`, `test/mocks/`, `test/e2e/`, `test/manual/`
- **Dependencias**: Ninguna
- **Entregables**: Directorio `test/` vacío o con estructura nueva
- **Agente responsable**: qa-agent

### Paso 2: Crear estructura de directorios
- **Descripción**: Crear nueva estructura organizada por dominio
  ```
  test/
  ├── unit/
  │   ├── core/
  │   ├── decorator/
  │   ├── surface/
  │   ├── navigation/
  │   └── utils/
  ├── integration/
  ├── mocks/
  │   └── drivers/
  └── setup.mts
  ```
- **Dependencias**: Paso 1
- **Entregables**: Estructura de carpetas creada
- **Agente responsable**: qa-agent

### Paso 3: Crear mocks de drivers
- **Descripción**: Implementar mocks para los drivers usados por el core
- **Ficheros a crear**:
  - `test/mocks/drivers/storage.mock.mts`
  - `test/mocks/drivers/runtime.mock.mts`
  - `test/mocks/drivers/tabs.mock.mts`
  - `test/mocks/drivers/windows.mock.mts`
  - `test/mocks/drivers/scripting.mock.mts`
  - `test/mocks/drivers/offscreen.mock.mts`
  - `test/mocks/index.mts` (consolidador)
  - `test/setup.mts` (configuración global)
- **Dependencias**: Paso 2
- **Entregables**: 8 ficheros de mocks funcionales
- **Agente responsable**: qa-agent

### Paso 4: Tests unitarios — Core (🔴 Crítica)
- **Descripción**: Implementar tests para `src/engine/core.mts`
- **Fichero**: `test/unit/core/core.test.mts`
- **Casos a cubrir**:
  - `constructor()` — inicialización con id y scope
  - `registerProperty()` — registro en propReader
  - `getKey()` / `getValue()` — acceso a propiedades
  - `getArray()` / `getSet()` / `getMap()` — proxies reactivos
  - `propsLoaded` getter/setter
  - `startTrace()` / `endTrace()` / `getMetrics()` — métricas
  - `log()` / `warn()` / `error()` — logging
- **Dependencias**: Paso 3
- **Entregables**: Suite de tests Core pasando
- **Agente responsable**: qa-agent

### Paso 5: Tests unitarios — Engine (🔴 Crítica)
- **Descripción**: Implementar tests para `src/engine/engine.mts`
- **Fichero**: `test/unit/core/engine.test.mts`
- **Casos a cubrir**:
  - `onMessage()` — routing por command
  - `onStorageChanged()` — propagación de cambios
  - `sendMessage()` — envío de mensajes
  - `checkListeners()` / `notifyUpdate()` — listeners
  - `createContext()` / `closeContext()` — gestión de contextos
  - `loadShard()` — carga de shards
  - `navigate()` — navegación
- **Dependencias**: Paso 3, Paso 4
- **Entregables**: Suite de tests Engine pasando
- **Agente responsable**: qa-agent

### Paso 6: Tests unitarios — Context (🔴 Crítica)
- **Descripción**: Implementar tests para `src/engine/context.mts`
- **Fichero**: `test/unit/core/context.test.mts`
- **Casos a cubrir**:
  - `sendMessage()` — comunicación con Engine
  - `getStorageProps()` / `setStorageProps()` — persistencia
  - `onMessage()` — manejo de respuestas
  - `listenProperty()` — suscripción a cambios
- **Dependencias**: Paso 3
- **Entregables**: Suite de tests Context pasando
- **Agente responsable**: qa-agent

### Paso 7: Tests unitarios — Decorators (🔴 Crítica)
- **Descripción**: Implementar tests para decorators
- **Ficheros**:
  - `test/unit/decorator/property.test.mts`
  - `test/unit/decorator/onchanged.test.mts`
- **Casos a cubrir**:
  - `@property`: init, get, set, persistence
  - `@onChanged`: registro de listener, invocación de callback
- **Dependencias**: Paso 3
- **Entregables**: Suite de tests Decorators pasando
- **Agente responsable**: qa-agent

### Paso 8: Tests unitarios — Surface/Navigation/Utils (🟡 Alta)
- **Descripción**: Implementar tests para componentes de prioridad Alta
- **Ficheros**:
  - `test/unit/surface/surface.test.mts`
  - `test/unit/navigation/navigation.test.mts`
  - `test/unit/navigation/router.test.mts`
  - `test/unit/utils/logger.test.mts`
- **Casos a cubrir**:
  - Surface: lifecycle hooks, listenProperty
  - Navigation: open(), onChange()
  - Router: navigate(), getPageUrl()
  - Logger: parseConsoleMessage()
- **Dependencias**: Paso 3
- **Entregables**: Suites de tests Alta prioridad pasando
- **Agente responsable**: qa-agent

### Paso 9: Tests de integración — Engine↔Context
- **Descripción**: Tests de comunicación bidireccional
- **Fichero**: `test/integration/engine-context.test.mts`
- **Casos a cubrir**:
  - Flujo completo GetPropsRequest → GetPropsResponse
  - Flujo listenPropertyRequest → listenPropertyResponse
  - Propagación de cambios vía Storage
- **Dependencias**: Paso 4, 5, 6
- **Entregables**: Tests de integración pasando
- **Agente responsable**: qa-agent

### Paso 10: Verificar cobertura y ajustar
- **Descripción**: Ejecutar cobertura, identificar gaps, añadir tests faltantes
- **Comando**: `npm run test -- --coverage`
- **Dependencias**: Pasos 4-9
- **Entregables**: Cobertura ≥80% en todas las métricas
- **Agente responsable**: qa-agent + architect-agent (revisión)

---

## 4. Asignación de responsabilidades (Agentes)

### architect-agent (Owner)
- Diseño de estructura de tests
- Validación de coherencia arquitectónica
- Revisión final de cobertura
- Aprobación de avance de fases

### qa-agent (Ejecutor principal)
- Implementación de todos los tests
- Creación de mocks
- Ejecución de cobertura
- Reporte de métricas

### Handoffs
1. `architect-agent` → `qa-agent`: Plan aprobado (este documento)
2. `qa-agent` → `architect-agent`: Revisión post-implementación
3. `architect-agent` → `developer`: Resultados de verificación

### Componentes
- **Crear**: Mocks de drivers (6 ficheros)
- **Modificar**: Ninguno (si se requiere ajustar `vitest.config.mts`, documentar)
- **Eliminar**: Tests placeholders actuales

### Demo
- **No aplica**: Tarea de testing interno

---

## 5. Estrategia de testing y validación

### Unit tests
- **Herramienta**: Vitest
- **Entorno**: happy-dom
- **Alcance**: Todos los componentes del core aislados con mocks
- **Comando**: `npm run test`

### Integration tests
- **Herramienta**: Vitest
- **Alcance**: Comunicación Engine↔Context
- **Comando**: `npm run test test/integration/`

### E2E / Manual
- **Deprioritizado** en esta tarea
- Si hay tiempo: Playwright con extensión real en Chrome

### Trazabilidad tests ↔ AC

| AC | Tests |
|----|-------|
| AC-1: Eliminar tests | Verificación manual (paso 1) |
| AC-2: Nueva estructura | Verificación estructura (paso 2) |
| AC-3: Tests 🔴 | `core.test`, `engine.test`, `context.test`, `property.test`, `onchanged.test` |
| AC-4: Tests 🟡 | `surface.test`, `navigation.test`, `router.test` |
| AC-5: Tests 🟢 | `logger.test` (opcional: `measure.test`) |
| AC-6: Cobertura 80% | `npm run test -- --coverage` |
| AC-7: npm test ok | Exit code 0 |

---

## 6. Plan de demo

**No aplica** — Esta tarea es de testing interno y no requiere demo visual.

---

## 7. Estimaciones y pesos de implementación

| Paso | Descripción | Esfuerzo | Tiempo estimado |
|------|-------------|----------|-----------------|
| 1 | Eliminar tests | Bajo | 5 min |
| 2 | Crear estructura | Bajo | 10 min |
| 3 | Crear mocks | Medio | 30 min |
| 4 | Tests Core | Alto | 45 min |
| 5 | Tests Engine | Alto | 45 min |
| 6 | Tests Context | Medio | 30 min |
| 7 | Tests Decorators | Alto | 45 min |
| 8 | Tests Alta prioridad | Medio | 30 min |
| 9 | Tests integración | Medio | 30 min |
| 10 | Cobertura/ajustes | Medio | 20 min |

**Total estimado**: ~4.5 horas

**Suposiciones**:
- Decorators Stage 3 transpilan correctamente
- Mocks de drivers son suficientes para aislar dependencias
- No se requieren cambios en código de producción

---

## 8. Puntos críticos y resolución

### Punto crítico 1: Decorators Stage 3
- **Riesgo**: No transpilan correctamente en Vitest
- **Impacto**: Alto — bloquea tests de @property/@onChanged
- **Resolución**: Verificar config `tsconfig.json` y `vitest.config.mts`. Si falla, crear wrapper manual sin decorator syntax.

### Punto crítico 2: Mocks de Storage con eventos
- **Riesgo**: `onChanged` listener difícil de simular
- **Impacto**: Medio — afecta tests de reactividad
- **Resolución**: Implementar mock con registry de listeners y método `triggerChange()` para simular eventos.

### Punto crítico 3: Cobertura 80%
- **Riesgo**: Branches complejos no cubiertos
- **Impacto**: Medio — bloqueante según thresholds
- **Resolución**: Priorizar cobertura de líneas/funciones primero. Ajustar thresholds a 70% si es necesario (con justificación).

---

## 9. Dependencias y compatibilidad

### Dependencias internas
- `@extensio/driver-storage`
- `@extensio/driver-runtime`
- `@extensio/driver-tabs`
- `@extensio/driver-windows`
- `@extensio/driver-scripting`
- `@extensio/driver-offscreen`

### Dependencias externas
- Vitest (dev)
- @vitest/coverage-v8 (dev)
- happy-dom (dev)

### Compatibilidad entre navegadores
- Tests unit: browser-agnostic (happy-dom)
- E2E: Solo Chrome (si se implementa)

### Restricciones arquitectónicas
- No modificar código de producción
- Mantener thresholds de cobertura
- Usar Vitest para unit/integration según `constitution.extensio_architecture`

---

## 10. Criterios de finalización

- [ ] Paso 1: Tests anteriores eliminados
- [ ] Paso 2: Estructura creada
- [ ] Paso 3: 8 ficheros de mocks
- [ ] Paso 4: Tests Core pasando
- [ ] Paso 5: Tests Engine pasando
- [ ] Paso 6: Tests Context pasando
- [ ] Paso 7: Tests Decorators pasando
- [ ] Paso 8: Tests Alta prioridad pasando
- [ ] Paso 9: Tests integración pasando
- [ ] Paso 10: Cobertura ≥80%
- [ ] `npm run test` exit code 0

---

## 11. Aprobación del desarrollador (OBLIGATORIA)

Este plan **requiere aprobación explícita y binaria**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-16T20:02:56+01:00
    comments: Aprobado sin cambios
```
