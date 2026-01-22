---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 16-refactorizacion-demo-core
---

# Implementation Plan — 16-refactorizacion-demo-core

## 1. Resumen del plan

- **Contexto**: La demo actual del core usa React y no demuestra todas las capacidades del framework (inyección cross-context, E2E automation). Se requiere una demo vanilla, completa y automatizable.
- **Resultado esperado**: Nueva demo 100% vanilla que demuestre Surface Pages, Shards (en Page y inyectados), scripts npm para carga manual/automática, y tests E2E con Playwright.
- **Alcance**: 
  - ✅ Incluye: Eliminación completa de demo actual, nueva estructura, DemoEngine, MainPage, 2 Shards, tests E2E, scripts npm, README
  - ❌ Excluye: Modificación del core framework, soporte de popup (solo standalone page)

---

## 2. Inputs contractuales

- **Task**: `.agent/artifacts/16-refactorizacion-demo-core/task.md`
- **Research**: `.agent/artifacts/16-refactorizacion-demo-core/researcher/research.md`
- **Analysis**: `.agent/artifacts/16-refactorizacion-demo-core/analysis.md`
- **Acceptance Criteria**: AC1-5 del task.md

**Dispatch de dominios**
```yaml
plan:
  workflows:
    drivers: 
      action: none
    modules:
      action: none
    surfaces:
      action: create
      components:
        - MainPage (Surface Page)
        - OpenYoutubeButton (Shard)
        - FloatingButton (Shard)
  dispatch:
    - domain: qa
      action: create
      scope: E2E tests + rendimiento
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Eliminación de demo actual
- **Descripción**: Eliminar completamente `packages/core/demo/`
- **Dependencias**: Ninguna
- **Entregables**: Directorio vacío
- **Agente responsable**: architect-agent

### Paso 2: Scaffolding de nueva estructura
- **Descripción**: Crear estructura base (dirs, package.json, tsconfig.json, manifest.json)
- **Dependencias**: Paso 1 completado
- **Entregables**: 
  - `package.json` sin React
  - `manifest.json` con permisos `scripting`, `tabs`, `storage`, `<all_urls>`
  - `tsconfig.json`
- **Agente responsable**: architect-agent

### Paso 3: Implementación DemoEngine
- **Descripción**: Engine que escucha navegación y carga FloatingButton en páginas orgánicas
- **Dependencias**: Paso 2
- **Entregables**: `src/engine/index.mts`
- **Agente responsable**: architect-agent

### Paso 4: Implementación Surface Page (MainPage)
- **Descripción**: Página standalone que carga OpenYoutubeButton shard
- **Dependencias**: Paso 2
- **Entregables**: 
  - `src/surface/pages/main/index.html`
  - `src/surface/pages/main/index.mts`
- **Agente responsable**: surface-agent

### Paso 5: Implementación Shards
- **Descripción**: 2 shards vanilla WebComponents con Shadow DOM
- **Dependencias**: Paso 2
- **Entregables**:
  - `src/surface/shards/open-youtube-button.mts`
  - `src/surface/shards/floating-button.mts`
- **Agente responsable**: surface-agent

### Paso 6: Scripts npm
- **Descripción**: Comandos para build y carga manual/automática
- **Dependencias**: Pasos 3, 4, 5
- **Entregables**: Scripts en `package.json`
- **Agente responsable**: architect-agent

### Paso 7: Tests E2E (Playwright)
- **Descripción**: Suite de tests que valida funcionalidad + rendimiento
- **Dependencias**: Pasos 3-6
- **Entregables**: `test/e2e/demo.spec.ts`
- **Agente responsable**: qa-agent

### Paso 8: README y documentación
- **Descripción**: Guía de uso de la demo
- **Dependencias**: Todos los anteriores
- **Entregables**: `README.md`
- **Agente responsable**: architect-agent

---

## 4. Asignación de responsabilidades (Agentes)

### architect-agent
- Coordinación general y gates
- Eliminación demo actual (Paso 1)
- Scaffolding estructura (Paso 2)
- DemoEngine (Paso 3)
- Scripts npm (Paso 6)
- README (Paso 8)
- Review final

### surface-agent
- MainPage standalone (Paso 4)
- OpenYoutubeButton shard (Paso 5.1)
- FloatingButton shard (Paso 5.2)

### qa-agent
- Diseño tests E2E (Paso 7.1)
- Implementación tests funcionales (Paso 7.2)
- Medición rendimiento < 100ms (Paso 7.3)
- Validación final

**Handoffs**:
- architect → surface: Tras Paso 2, surface implementa componentes visuales
- surface → qa: Tras Paso 5, qa diseña tests
- qa → architect: Tras Paso 7, architect revisa y aprueba

---

## 5. Estrategia de testing y validación

### Unit tests
- **Alcance**: No aplica (demo es E2E-first por naturaleza)
- **Justificación**: La demo valida integración, no lógica aislada

### E2E tests (Playwright)
| Test | AC | Comando |
|------|----|---------| 
| Carga extensión y abre MainPage | AC3 | `npm run demo:auto` |
| Click botón YouTube → abre tab | AC3 | `npm run demo:auto` |
| Navegación orgánica → inyecta FloatingButton | AC3, AC4 | `npm run demo:auto` |
| FloatingButton visible en Shadow DOM | AC4 | `npm run demo:auto` |
| Rendimiento inyección < 100ms | AC3 | `npm run demo:auto` |

**Trazabilidad**:
- AC1 (eliminación) → verificar ausencia de React en package.json
- AC2 (scripts npm) → `npm run demo:manual --browser=chrome` funciona
- AC3 (funcionalidad) → tests E2E pasan
- AC4 (Shadow DOM) → test verifica `shadowRoot` existe
- AC5 (rendimiento) → test lee `data-inject-time < 100`

---

## 6. Plan de demo

- **Objetivo**: Mostrar todas las capacidades del core en acción
- **Escenario 1**: Desarrollador ejecuta `npm run demo:manual --browser=chrome` → ve MainPage con botón
- **Escenario 2**: Click botón → YouTube se abre en nueva tab
- **Escenario 3**: Navegar a cualquier sitio web → FloatingButton aparece
- **Datos de ejemplo**: N/A (demo visual)
- **Criterios de éxito**: 
  - MainPage carga sin errores
  - Botón YouTube funciona
  - FloatingButton aparece en < 100ms

---

## 7. Estimaciones y pesos de implementación

| Paso | Esfuerzo | Justificación |
|------|----------|---------------|
| 1 | Bajo | `rm -rf` simple |
| 2 | Bajo | Copiar estructura de demo anterior |
| 3 | Medio | Lógica de navegación + inyección |
| 4 | Bajo | HTML + Page básica |
| 5 | Medio | 2 shards con Shadow DOM |
| 6 | Bajo | Scripts npm directos |
| 7 | Alto | Tests E2E + medición rendimiento |
| 8 | Bajo | Documentación clara |

**Timeline aproximado**: 1-2 horas de trabajo continuo
**Suposiciones**: Playwright ya configurado, core sin bugs

---

## 8. Puntos críticos y resolución

### Punto crítico 1: Inyección lenta del FloatingButton
- **Riesgo**: `document_idle` puede ser tarde, `document_start` puede fallar en DOM
- **Impacto**: Alto (falla AC5 de rendimiento)
- **Resolución**: 
  1. Usar `injectImmediately: true` con `run_at: 'document_start'`
  2. FloatingButton debe auto-insertar en `document.body` al cargar
  3. Medir tiempo con `performance.now()` y exponer en `data-inject-time`

### Punto crítico 2: Firefox no soporta carga en Playwright
- **Riesgo**: Solo Chrome testeable automáticamente
- **Impacto**: Medio (limitación conocida)
- **Resolución**: 
  1. Documentar en README que Firefox requiere test manual
  2. Script `demo:manual --browser=firefox` para carga manual

### Punto crítico 3: CSP puede bloquear inyección
- **Riesgo**: Sitios con CSP estricto rechazan Shard
- **Impacto**: Medio
- **Resolución**: 
  1. Usar `world: 'ISOLATED'` por defecto en Scripting
  2. Documentar limitación en README

---

## 9. Dependencias y compatibilidad

### Dependencias internas
- `@extensio/core` (Engine, Page, Shard)
- `@extensio/driver-scripting` (inyección cross-context)
- `@extensio/driver-tabs` (navegación)
- `@extensio/driver-storage` (MV3 storage)
- `extensio-cli` (build)

### Dependencias externas
- Playwright (tests E2E)

### Compatibilidad navegadores
- ✅ **Chrome/Chromium**: Soporte completo (E2E + manual)
- ⚠️ **Firefox**: Solo manual (Playwright no soporta carga de extensión)
- ⚠️ **Safari**: Solo manual (mismo que Firefox)

### Restricciones arquitectónicas
- Cumplimiento estricto de `constitution.extensio_architecture`
- Shadow DOM obligatorio para Shards
- No usar librerías externas de UI (vanilla WebComponents)

---

## 10. Criterios de finalización

- [ ] Demo actual eliminada completamente
- [ ] Nueva estructura creada sin React
- [ ] DemoEngine implementado y funcional
- [ ] MainPage standalone funciona
- [ ] OpenYoutubeButton abre YouTube
- [ ] FloatingButton se inyecta en páginas orgánicas
- [ ] `npm run demo:manual --browser=chrome` funciona
- [ ] `npm run demo:auto` ejecuta todos los tests E2E
- [ ] Rendimiento inyección < 100ms verificado
- [ ] README documentado
- [ ] Todos los AC verificados

---

## 11. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-17T08:55:00Z
    comments: "Aprobado para implementación"
```

> Sin aprobación explícita (SI), este plan NO puede ejecutarse.
