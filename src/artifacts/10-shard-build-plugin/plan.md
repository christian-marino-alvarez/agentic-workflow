---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: approved
related_task: 10-shard-build-plugin
---

# Implementation Plan — 10-shard-build-plugin

## 1. Resumen del plan
- **Contexto**: Los shards actualmente requieren declaración manual en `package.json:exports` y la API `loadShard()` requiere URLs manuales. Se necesita automatización mediante un plugin de build.
- **Resultado esperado**: Plugin `surface-shards` que detecta y compila shards automáticamente, nueva API `loadShard(ShardClass)`, demo funcional actualizado.
- **Alcance**: 
  - **Incluye:** Plugin Rollup, refactor de Engine.loadShard(), extensión de clase Shard, actualización de demo
  - **Excluye:** CSS automático por convención (el shard importa su propio CSS)

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/10-shard-build-plugin/task.md`
- **Analysis**: `.agent/artifacts/10-shard-build-plugin/analysis.md`
- **Acceptance Criteria**: AC-1 (plugin + API + static url), AC-2 (detección estática), AC-3 (output paths), AC-4 (restricciones), AC-5 (done criteria)

**Dispatch de dominios**
```yaml
plan:
  workflows:
    drivers:
      action: none
    modules:
      action: none

  dispatch:
    - domain: core
      action: refactor
      workflow: none  # Refactor manual de Engine y Shard
    - domain: qa
      action: verify
      workflow: none  # QA Agent diseñará tests
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Crear plugin `surface-shards`
**Descripción:**
- Crear archivo `packages/cli/src/commands/plugins/surface-shards/index.mts`
- Seguir patrón de `surface-pages`: función que retorna objeto con hooks de Rollup
- Implementar hooks: `resolveId`, `load`, `transform`

**Dependencias:** Ninguna

**Entregables:**
- `packages/cli/src/commands/plugins/surface-shards/index.mts`

**Agente responsable:** architect-agent

---

### Paso 2: Implementar lógica de detección e inyección en plugin
**Descripción:**
- Hook `transform`: analizar archivos `**/engine/**/*.mts`
- Regex para detectar: `import { ClassName } from './path/to/shard'` + `loadShard(ClassName)`
- Extraer clase Shard y su import path
- **Marcar el import del shard como external** en la compilación del engine (el shard NO debe bundlearse con el engine)
- Compilar shard detectado como entry point independiente
- **Inyectar mapping** al final del código del engine:
  ```typescript
  // Inyectado por surface-shards plugin
  ClassName.__EXTENSIO_COMPILED_PATH__ = 'surface/shards/ClassName.mjs';
  ```
- El engine solo tendrá la referencia al path, NO el código del shard

**Dependencias:** Paso 1

**Entregables:**
- Detección de shards en engines
- Imports de shards marcados como external
- Mapping inyectado en engine

**Agente responsable:** architect-agent

---

### Paso 3: Implementar compilación de shards en plugin
**Descripción:**
- Para cada shard detectado, crear función de compilación siguiendo patrón existente
- Patrón de referencia: `compilePageScript()` (surface-pages) y `compileVendorModule()` (build.mts)
- Usar `vite.build()` con configuración:
  - `root`, `outDir` (mantener ruta relativa del shard)
  - `esbuild.target: 'es2022'`, `experimentalDecorators: true`
  - `rollupOptions.plugins`: todos los replacers (browser, parentSrc, modulePath, rootPath, image, version)
  - `rollupOptions.plugins`: viteNodeResolve + viteCommonjs
  - `lib.entry`: path absoluto del shard
  - `lib.formats: ['es']`
  - Output: `dist/surface/shards/X.mjs` (ruta relativa preservada)
- NO usar `compilePageScript` directamente, sino crear `compileShardScript()` en el plugin

**Dependencias:** Paso 2

**Entregables:**
- Función `compileShardScript()` en plugin
- Shards compilados en rutas correctas: `src/surface/shards/X.mts` → `dist/surface/shards/X.mjs`

**Agente responsable:** architect-agent

---

### Paso 4: Integrar plugin en pipeline de build
**Descripción:**
- Actualizar `packages/cli/src/commands/build.mts`
- Añadir `surfaceShardsPlugin` a la lista de plugins de Vite (línea ~339)
- Configurar con `root`, `outDir`, `targetBrowser`

**Dependencias:** Paso 3

**Entregables:**
- Plugin integrado en build pipeline

**Agente responsable:** architect-agent

---

### Paso 5: ~~Añadir `static url` a clase `Shard`~~ (INNECESARIO)
**Descripción:**
- Este paso se **elimina** del plan
- El plugin inyectará automáticamente `__EXTENSIO_COMPILED_PATH__` en las clases Shard
- No se requiere modificar la clase base `Shard`

**Dependencias:** N/A

**Entregables:**
- Ninguno (paso eliminado)

**Agente responsable:** N/A

---

### Paso 6: Refactorizar `Engine.loadShard()`
**Descripción:**
- Modificar `packages/core/src/engine/engine.mts` (líneas 344-388)
- Nueva firma: `loadShard<T extends typeof Shard>(ShardClass: T, options?: ShardOptions)`
- Lógica interna:
  - Leer `ShardClass.__EXTENSIO_COMPILED_PATH__` (inyectado por el plugin en build)
  - Calcular jsUrl con `Runtime.getURL(compiledPath)`
  - Mantener lógica de inyección existente (Scripting driver)
- **Backward compatibility:** Mantener firma anterior como sobrecarga deprecada

**Dependencias:** Paso 2 (plugin inyecta el mapping)

**Entregables:**
- `Engine.loadShard()` con nueva API que lee `__EXTENSIO_COMPILED_PATH__`
- Sobrecarga deprecada para backward compatibility

**Agente responsable:** architect-agent

---

### Paso 7: Actualizar demo `ActionButtonShard`
**Descripción:**
- Modificar `packages/core/demo/src/engine/index.mts` (líneas 98-102)
  - Importar clase: `import { ActionButtonShard } from '../surface/shards/ActionButtonShard.mts'`
  - Cambiar a: `await this.loadShard(ActionButtonShard, { tabId: event.tabId })`
- **NO modificar** `ActionButtonShard.mts` - el plugin inyectará `__EXTENSIO_COMPILED_PATH__` automáticamente

**Dependencias:** Paso 6

**Entregables:**
- Demo actualizado con nueva API

**Agente responsable:** architect-agent

---

### Paso 8: Actualizar tests E2E del demo
**Descripción:**
- Modificar `packages/core/test/e2e/shard-render.spec.ts`
- Actualizar aserciones si es necesario
- Verificar que test pasa con nueva implementación

**Dependencias:** Paso 7

**Entregables:**
- Tests E2E actualizados y pasando

**Agente responsable:** qa-agent

---

## 4. Asignación de responsabilidades (Agentes)

**Architect-Agent**
- Responsabilidades:
  - Crear plugin `surface-shards` (Pasos 1-4)
  - Refactorizar Core (Pasos 5-6)
  - Actualizar demo (Paso 7)
  - Validar coherencia arquitectónica global

**QA-Agent**
- Responsabilidades:
  - Diseñar unit tests para plugin (detección de patrones)
  - Actualizar tests E2E del demo (Paso 8)
  - Validar que no hay regresiones

**Handoffs:**
1. Architect completa implementación → QA diseña/ejecuta tests
2. QA valida tests pasan → Architect revisa y aprueba

**Componentes:**
- **CREAR:** `surface-shards` plugin
  - Responsable: architect-agent
  - Cómo: Crear archivo `.mts` siguiendo patrón de Rollup
  - Herramienta: Edición manual de código
  - Motivo: No requiere scaffolding, es un plugin simple

- **MODIFICAR:** `Engine.loadShard()`, clase `Shard`, demo
  - Responsable: architect-agent
  - Cómo: Refactor manual siguiendo clean code
  - Herramienta: Edición manual de código

**Demo:**
- Estructura esperada: Actualización de demo existente en `packages/core/demo`
- Alineación: Sigue arquitectura existente (Engine → Context → Shard)
- Tool: No requiere scaffolding - es actualización de código existente

---

## 5. Estrategia de testing y validación

**Unit tests**
- Alcance: Plugin `surface-shards` (detección de patrones)
- Herramientas: Vitest (según `constitution.extensio_architecture`)
- Comando: `npm test` o `mcp_extensio-cli_extensio_test` con `type: unit`
- Tests a crear:
  - Detección de `import + loadShard` pattern
  - Compilación de shard detectado
  - Rutas de output correctas

**Integration tests**
- Alcance: Build completo con shards
- Herramientas: Vitest
- Comando: `mcp_extensio-cli_extensio_test` con `type: integration`
- Flujos cubiertos:
  - Build de módulo con shards
  - Shards compilados en dist/
  - node_modules resueltos correctamente

**E2E tests**
- Alcance: Demo en navegador real (Chrome)
- Herramientas: Playwright (según `constitution.extensio_architecture`)
- Comando: `mcp_extensio-cli_extensio_test` con `type: e2e` y `browsers: chromium`
- Escenarios:
  - Demo carga shard correctamente
  - Shard se monta en DOM
  - Shard es funcional (botón clicable)

**Trazabilidad:**
- AC-1 (plugin + API): Unit tests + Integration tests
- AC-2 (detección): Unit tests del plugin
- AC-3 (output): Integration tests
- AC-4 (restricciones): E2E tests del demo
- AC-5 (done): Todos los tests pasan

---

## 6. Plan de demo (si aplica)
**Objetivo:** Validar que la nueva API funciona en un caso real

**Escenario:**
1. Construir demo: `mcp_extensio-cli_extensio_build` en `packages/core/demo`
2. Cargar extensión en Chrome
3. Abrir popup para iniciar flow
4. Navegar a google.es (trigger de inyección de shard)
5. Verificar que ActionButton se renderiza correctamente
6. Hacer clic en botón "Finalizar Flow"
7. Verificar que flow completa y cierra tab

**Datos de ejemplo:** Flow demo existente (START → IN_PROGRESS → FINISHED)

**Criterios de éxito:**
- Shard se inyecta automáticamente sin errores
- UI del shard es visible y funcional
- No hay errores en consola del navegador

---

## 7. Estimaciones y pesos de implementación

| Paso | Esfuerzo | Justificación |
|------|----------|---------------|
| Paso 1-4 (Plugin) | Medio-Alto | Análisis estático + inyección de mapping en código |
| ~~Paso 5 (static url)~~ | ~~Bajo~~ | **Eliminado del plan** |
| Paso 6 (loadShard) | Bajo-Medio | Refactor simple leyendo `__EXTENSIO_COMPILED_PATH__` |
| Paso 7 (Demo) | Bajo | Solo actualizar import, sin cambios en Shard |
| Paso 8 (Tests E2E) | Bajo | Mínimas modificaciones |

**Timeline aproximado:** Implementación secuencial ~4-5 horas (sin tests)

**Suposiciones:**
- Regex funciona para patrones estándar
- No hay casos edge complejos en demo

---

## 8. Puntos críticos y resolución

**Punto crítico 1: ~~Detección de static url en tiempo de build~~ (RESUELTO)**
- **Riesgo:** ~~Es difícil leer propiedad estática de clase sin ejecutar el código~~
- **Impacto:** ~~Plugin no puede determinar qué compilar~~
- **Resolución:** ✅ **Eliminado** - El plugin detecta el import path directamente desde `import { X } from './path/Y.mts'` y usa ese path para compilar. Luego inyecta `X.__EXTENSIO_COMPILED_PATH__ = 'surface/shards/Y.mjs'` en el código del engine. No se requiere `static url` en las clases Shard.
- **Nota importante:** El shard se compila **independientemente** del engine. El import del shard se marca como **external** en el build del engine para evitar incluir código de shard en el scope del Service Worker.

**Punto crítico 2: Breaking change en loadShard API**
- **Riesgo:** Demo y código existente rompe
- **Impacto:** Tests fallan, demo no funcional
- **Resolución:**
  1. Implementar sobrecarga con firma anterior marcada como `@deprecated`
  2. Actualizar demo inmediatamente
  3. Mantener backward compat por 1 release

**Punto crítico 3: Regex no detecta todos los patrones**
- **Riesgo:** Imports complejos (destructuring, aliases) no detectados
- **Impacto:** Shards no compilados
- **Resolución:**
  1. Documentar patrones soportados
  2. Validar con tests unitarios del plugin
  3. Si surge caso edge, extender regex o usar AST (futuro)

**Punto crítico 4: Separación de scopes Engine vs Shard**
- **Riesgo:** Si el shard se bundlea con el engine, se mezclan scopes (Service Worker vs Content Script)
- **Impacto:** El código del shard no funcionará en el engine (APIs no disponibles)
- **Resolución:** ✅ **Implementado en diseño** - El plugin marca los imports de shards como `external` durante la compilación del engine, evitando que se incluyan en el bundle del Service Worker.

**Punto crítico 2: Breaking change en loadShard API**
- **Riesgo:** Demo y código existente rompe
- **Impacto:** Tests fallan, demo no funcional
- **Resolución:**
  1. Implementar sobrecarga con firma anterior marcada como `@deprecated`
  2. Actualizar demo inmediatamente
  3. Mantener backward compat por 1 release

**Punto crítico 3: Regex no detecta todos los patrones**
- **Riesgo:** Imports complejos (destructuring, aliases) no detectados
- **Impacto:** Shards no compilados
- **Resolución:**
  1. Documentar patrones soportados
  2. Validar con tests unitarios del plugin
  3. Si surge caso edge, extender regex o usar AST (futuro)

---

## 9. Dependencias y compatibilidad

**Dependencias internas:**
- `@extensio/driver-scripting` (existente)
- `@extensio/driver-runtime` (existente)
- Vite (ya instalado)

**Dependencias externas:**
- Ninguna nueva

**Compatibilidad entre navegadores:**
- Chrome/Chromium: ✅ (prioridad)
- Firefox: ✅ (drivers compatibles)
- Safari: ✅ (drivers compatibles)

**Restricciones arquitectónicas:**
- Seguir `constitution.extensio_architecture`
- Seguir patrón de plugins Rollup existentes
- No romper Clean Code rules

---

## 10. Criterios de finalización

Checklist final:
- [  ] Plugin `surface-shards` creado y funcional
- [  ] Plugin detecta `loadShard(ShardClass)` en engines
- [  ] Plugin inyecta `__EXTENSIO_COMPILED_PATH__` automáticamente
- [  ] Plugin integrado en build pipeline
- [  ] `Engine.loadShard(ShardClass)` implementado y lee `__EXTENSIO_COMPILED_PATH__`
- [  ] Backward compatibility mantenida (sobrecarga deprecada)
- [  ] Demo actualizado con nueva API (solo engine, sin tocar shard)
- [  ] Build de demo exitoso sin errores
- [  ] Tests unitarios del plugin creados y pasando
- [  ] Tests E2E del demo actualizados y pasando
- [  ] No hay regresiones en tests existentes
- [  ] Demo manual funcional en Chrome

**Verificaciones obligatorias:**
1. `mcp_extensio-cli_extensio_build` en `packages/core/demo` exitoso
2. `mcp_extensio-cli_extensio_test` con `type: unit` pasa
3. `mcp_extensio-cli_extensio_test` con `type: e2e` y `browsers: chromium` pasa
4. Demo manual en navegador funcional (validado visualmente)

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
Este plan **requiere aprobación explícita y binaria**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-12T08:05:33+01:00
    comments: Aprobado con Paso 3 actualizado para usar patrón de compilación existente 
```
