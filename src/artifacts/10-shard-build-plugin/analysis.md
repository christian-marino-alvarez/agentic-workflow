---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: approved
related_task: 10-shard-build-plugin
---

# Analysis — 10-shard-build-plugin

## 1. Resumen ejecutivo
**Problema**
- Los shards actualmente no se detectan ni compilan automáticamente durante el build. Requieren declaración manual en `package.json:exports` y el desarrollador debe calcular URLs manualmente con `Runtime.getURL()`.

**Objetivo**
- Automatizar la detección y compilación de shards referenciados mediante `loadShard(ShardClass)` en engines, manteniendo las rutas relativas dentro del módulo y soportando dependencias de npm.

**Criterio de éxito**
- Plugin `surface-shards` detecta `loadShard(X)` y compila entry points automáticamente
- Engine puede usar `loadShard(ShardClass)` sin calcular URLs manualmente
- Demo existente actualizado y funcional
- Tests unitarios pasan

---

## 2. Estado del proyecto (As-Is)

**Estructura relevante**
- `packages/cli/src/commands/plugins/` - Plugins de build existentes
  - `surface-pages/` - Plugin que detecta scripts en HTML
  - `replacers/` - Plugins de resolución de paths
- `packages/core/src/engine/engine.mts` - Clase Engine con método `loadShard()`
- `packages/core/src/surface/shards/` - Clase base Shard y adaptadores (React, Lit, Angular)
- `packages/core/demo/` - Demo actual con ActionButtonShard

**Drivers existentes**
- `@extensio/driver-scripting` - Usado por `loadShard()` para inyectar CSS/JS
- `@extensio/driver-runtime` - Provee `Runtime.getURL()`

**Core / Engine / Surfaces**
- **Engine:** Método `loadShard(cssUrl, jsUrl, options)` recibe URLs como strings
- **Shard:** Clase base abstracta sin propiedad `static url`
- **ReactShard:** Adaptador que extiende Shard, usado en demo

**Limitaciones detectadas**
- No existe plugin específico para shards
- Los shards solo se compilan si están en `package.json:exports`
- API de `loadShard` requiere URLs manuales (verbose, propenso a errores)

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Alcance
**Texto:** Crear plugin `surface-shards` para Vite/Rollup, modificar API de `loadShard` en clase `Engine`, añadir propiedad estática `url` en clase base `Shard`

**Interpretación:**
- Crear nuevo plugin siguiendo patrón de `surface-pages`
- Refactorizar `Engine.loadShard()` para aceptar clase en vez de URLs
- Extender clase `Shard` con propiedad estática

**Verificación:**
- Existe archivo `packages/cli/src/commands/plugins/surface-shards/index.mts`
- `Engine.loadShard()` acepta `ShardClass` como primer parámetro
- Clase `Shard` tiene declaración `static url: string`

**Riesgos / ambigüedades:**
- Ninguna detectada - requisitos claros

---

### AC-2: Entradas / Datos
**Texto:** Código fuente de engines (*.mts), imports de clases Shard, propiedad estática `url` de cada Shard

**Interpretación:**
- Plugin debe analizar archivos en `**/engine/**/*.mts`
- Buscar patrones: `import { X } from './shards/...'` + `loadShard(X)`
- Leer `static url` de cada clase Shard

**Verificación:**
- Plugin detecta imports de shards
- Plugin resuelve propiedad `static url` en tiempo de build

**Riesgos / ambigüedades:**
- Análisis estático con regex puede fallar en casos edge (imports dinámicos, destructuring complejo)
- Mitigación: Documentar patrones soportados

---

### AC-3: Salidas / Resultado esperado
**Texto:** Shards compilados en `dist/surface/shards/[ShardName].mjs`, para npm reutilizar plugin existente de node_modules, API: `loadShard(ShardClass, options?)`

**Interpretación:**
- Shards mantienen ruta relativa: `src/surface/shards/X.mts` → `dist/surface/shards/X.mjs`
- Dependencias npm usan carpeta `node-modules/` (ya implementado)
- Nueva firma de API

**Verificación:**
- Build genera shards en rutas esperadas
- `loadShard(ShardClass)` funciona en runtime
- Shards de npm se resuelven correctamente

**Riesgos / ambigüedades:**
- Ninguna - usa infraestructura existente

---

### AC-4: Restricciones
**Texto:** No incluir CSS por convención, mantener compatibilidad con arquitectura Extensio, no romper demos/tests existentes

**Interpretación:**
- No generar CSS automáticamente - el shard importa su propio CSS
- Seguir principios de `extensio-architecture.md`
- Mantener backward compatibility o migrar demo

**Verificación:**
- Plugin no procesa CSS por convención
- Tests existentes pasan o se actualizan
- Demo funcional tras cambios

**Riesgos / ambigüedades:**
- Demo actual usa API antigua - requiere actualización

---

### AC-5: Criterio de aceptación (Done)
**Texto:** Plugin `surface-shards` detecta `loadShard(X)` y compila entry points, `Engine.loadShard(ShardClass)` funciona, demo actualizada y funcional, tests unitarios pasan

**Interpretación:**
- Todas las piezas anteriores funcionando en conjunto

**Verificación:**
- Build exitoso con shards detectados
- Demo E2E pasa
- Unit tests pasan

**Riesgos / ambigüedades:**
- Ninguna

---

## 4. Research técnico

### Alternativa A: Plugin de análisis estático con regex (RECOMENDADA)
**Descripción:** Plugin de Rollup/Vite que analiza código de engines con regex buscando `import {X} from './shards/...'` + `loadShard(X)`

**Patrón de implementación:**
- Exportar función que retorna objeto con hooks de Rollup
- Hook `transform`: analizar archivos `**/engine/**/*.mts`
- Detectar imports + llamadas a `loadShard()`
- Compilar entry points detectados

**Ventajas:**
- Automatización completa
- Sin configuración adicional
- Sigue patrón establecido de `surface-pages` plugin
- Compatible con pipeline de build existente

**Inconvenientes:**
- Regex limitada para casos edge
- Requiere documentar patrones soportados

**Decisión recomendada:** Implementar Alternativa A
- Es la propuesta aprobada en research
- Patrones de código son predecibles
- Se puede mejorar con AST en futuras iteraciones

---

## 5. Agentes participantes

### architect-agent
**Responsabilidades:**
- Validar coherencia arquitectónica global
- Revisar cambios en Core (Engine, Shard)
- Aprobar plan de implementación

**Subáreas asignadas:**
- Revisión de arquitectura

---

### researcher-agent
**Responsabilidades:**
- Completado en Phase 1 ✅

---

### driver-agent (NO requerido)
- No se crean ni modifican drivers

---

### module-agent (NO requerido)
- No se crean módulos

---

### qa-agent
**Responsabilidades:**
- Diseñar tests unitarios para plugin `surface-shards`
- Actualizar tests E2E del demo
- Validar que no hay regresiones

**Subáreas asignadas:**
- Testing

---

**Handoffs:**
1. Research (researcher) → Analysis (architect) ✅
2. Analysis → Plan (architect)
3. Plan → Implementation (architect + qa)
4. Implementation → Verification (qa)

---

**Componentes necesarios:**

| Componente | Acción | Impacto |
|------------|--------|---------|
| `surface-shards` plugin | CREAR | Nuevo plugin en `packages/cli/src/commands/plugins/surface-shards/` |
| `Engine.loadShard()` | MODIFICAR | Breaking change en API (mantener backward compat deprecada) |
| `Shard` clase base | MODIFICAR | Añadir `static url: string` |
| Demo `ActionButtonShard` | MODIFICAR | Actualizar a nueva API |
| Tests E2E demo | MODIFICAR | Actualizar aserciones |

**Demo (si aplica):**
- Se requiere **actualizar** demo existente (`packages/core/demo`)
- Justificación: Validar nueva API y plugin en funcionamiento real
- Alineación con arquitectura: El demo ya existe y seguirá el mismo patrón Engine → loadShard → Context

---

## 6. Impacto de la tarea

**Arquitectura:**
- Nuevo plugin en la pipeline de build
- Cambio en API pública de `Engine.loadShard()`
- Extensión de clase base `Shard`

**APIs / contratos:**
- **Breaking change:** `loadShard(cssUrl, jsUrl, options)` → `loadShard(ShardClass, options)`
- **Mitigación:** Mantener firma anterior como deprecada durante 1 release

**Compatibilidad:**
- Código existente usando `loadShard()` con URLs directas dejará de funcionar
- Demo debe actualizarse
- Documentación debe actualizarse

**Testing / verificación:**
- **Unit tests:** Plugin `surface-shards` (detección de patrones)
- **Integration tests:** Build completo con shards
- **E2E tests:** Demo navegador (Chrome)

---

## 7. Riesgos y mitigaciones

**Riesgo 1: Regex no detecta patrones complejos**
- **Impacto:** Shards no compilados si usan imports no estándar
- **Mitigación:** Documentar patrones soportados, validar en tests

**Riesgo 2: Breaking change en loadShard**
- **Impacto:** Demo y código existente rompe
- **Mitigación:** Mantener API anterior deprecada, actualizar demo

**Riesgo 3: Shards de npm no se resuelven**
- **Impacto:** Módulos externos no funcionales
- **Mitigación:** Reutilizar lógica de `generateVendorModules()`

---

## 8. Preguntas abiertas
(Ninguna - todas resueltas en Phase 0 y Phase 1)

---

## 9. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-12T07:56:17+01:00
    comments: Aprobado. El plugin de shards debe seguir el patrón de los otros plugins de Rollup
```

> Sin aprobación, esta fase **NO puede darse por completada** ni avanzar a Fase 3.
