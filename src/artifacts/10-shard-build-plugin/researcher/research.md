---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: approved
related_task: 10-shard-build-plugin
---

# Research Report — 10-shard-build-plugin

## 1. Resumen ejecutivo
- **Problema investigado:** Los shards no se detectan ni compilan automáticamente durante el build. Actualmente requieren declaración manual en `package.json:exports`.
- **Objetivo:** Crear un plugin que detecte `loadShard(ShardClass)` en engines y compile los shards referenciados automáticamente.
- **Principales hallazgos:**
  - `loadShard(cssUrl, jsUrl)` requiere URLs manuales con `Runtime.getURL()`
  - Clase `Shard` no tiene propiedad estática `url`
  - Plugin `surface-pages` es el modelo a seguir

---

## 2. Necesidades detectadas
- **Requisitos técnicos:**
  - Nuevo plugin `surface-shards` para detección estática
  - Propiedad estática `url` en clase `Shard`
  - Nueva API: `loadShard(ShardClass, options?)`
- **Suposiciones:**
  - Los engines importan clases Shard explícitamente
  - Cada shard define su ruta relativa
- **Límites:**
  - Sin CSS por convención (shard importa su propio CSS)

---

## 3. Alternativas técnicas

### Alternativa A: Plugin de análisis estático (RECOMENDADA)
- **Descripción:** Analizar código de engines con regex buscando `import {X} from './shards/...'` + `loadShard(X)`
- **Pros:** Automatización completa, sin configuración adicional
- **Contras:** Regex puede fallar en casos edge
- **Riesgos:** Bajo - patrones de código son predecibles
- **Impacto:** Mínimo en arquitectura existente

### Alternativa B: Manifiesto explícito
- **Descripción:** Archivo `shards.json` declarando shards manualmente
- **Pros:** Control total, sin análisis estático
- **Contras:** Duplicación de información, mantenimiento extra
- **Riesgos:** Ninguno
- **Impacto:** Añade complejidad operativa

---

## 4. APIs Web / WebExtensions relevantes

| API | Estado | Chrome | Firefox | Safari |
|-----|--------|--------|---------|--------|
| `chrome.scripting.executeScript` | Stable | ✅ | ✅ | ✅ |
| `chrome.scripting.insertCSS` | Stable | ✅ | ✅ | ✅ |
| `chrome.runtime.getURL` | Stable | ✅ | ✅ | ✅ |

- **Restricciones:** Requiere permiso `scripting` en manifest

---

## 5. Compatibilidad multi-browser

| Funcionalidad | Chrome | Firefox | Safari | Edge |
|---------------|--------|---------|--------|------|
| `executeScript` | ✅ | ✅ | ✅ | ✅ |
| Static class properties | ✅ | ✅ | ✅ | ✅ |
| Dynamic imports | ✅ | ✅ | ✅ | ✅ |

- **Diferencias clave:** Ninguna significativa para esta feature
- **Mitigación:** Usar drivers existentes (@extensio/driver-scripting)

---

## 6. Recomendaciones AI-first
- **Oportunidades:** El plugin puede auto-detectar shards sin intervención manual
- **APIs habilitadoras:** Análisis estático con AST (futuro) o regex (MVP)
- **Impacto esperado:** Reducción de configuración manual, menos errores humanos

---

## 7. Riesgos y trade-offs

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Regex no detecta patrones complejos | Media | Documentar patrones soportados |
| Breaking change en API loadShard | Media | Mantener firma anterior deprecada |
| Shards npm no resueltos | Baja | Reutilizar `generateVendorModules()` |

---

## 8. Fuentes
- [Chrome Extensions Scripting API](https://developer.chrome.com/docs/extensions/reference/scripting/)
- [MDN WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- Plugin `surface-pages`: `packages/cli/src/commands/plugins/surface-pages/index.mts`
- Plugin `parent-src`: `packages/cli/src/commands/plugins/replacers/parent-src.mts`

---

## 9. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-12T07:50:13+01:00
    comments: Aprobado para continuar a Phase 2
```
