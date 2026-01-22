---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 11-revision-sistema-agentic
---

# Research Report — 11-revision-sistema-agentic

## 1. Resumen ejecutivo

### Problema investigado
Las constituciones actuales de **Modules**, **Pages** y **Shards** carecen de la profundidad técnica necesaria para que los agentes (AI) implementen correctamente estos componentes del framework Extensio. Los workflows asociados son incompletos y no garantizan la integración correcta con el sistema de build del CLI.

### Objetivo de la investigación
Identificar las debilidades específicas en las constituciones y workflows, y proponer un conjunto de mejoras basadas en la arquitectura del framework, el CLI existente y las buenas prácticas de extensiones multi-browser.

### Principales hallazgos
1. **Shards**: No existe una regla clara sobre el patrón "Adapter" (Lit/React/Vanilla) ni sobre el mecanismo de transformación de imports en tiempo de build.
2. **Pages**: La constitución actual tiene solo 3 secciones mínimas y no cubre: ciclo de vida, estilos, navegación programática ni integración con el índice de superficies.
3. **Modules**: Aunque más completa, tiene duplicación con `extensio-architecture.md` y carece de ejemplos sobre comunicación Engine↔Context↔Surface.
4. **Workflows**: `pages.create.md` y `shards.create.md` existen pero son esquemáticos (5-6 líneas cada uno) y no tienen validaciones de arquitectura.

---

## 2. Necesidades detectadas

### Requisitos técnicos identificados
- Definir el contrato técnico del **Shard** como WebComponent registrable.
- Documentar el flujo de build para Shards (detección, compilación independiente, transformación de imports).
- Establecer el ciclo de vida de una **Page** y su relación con el Engine (navegación y paso de datos).
- Crear workflows con "Gates" que validen la estructura antes de permitir avanzar.

### Suposiciones y límites
- El CLI (`extensio-cli`) es la fuente de verdad para el scaffolding. Los agentes deben usar `mcp_extensio-cli` como herramienta principal.
- No se modificará la lógica interna del Core (Engine, Context, Shard base classes) en esta tarea; solo la documentación contractual.

---

## 3. Alternativas técnicas

### A. Refactorizar las constituciones existentes
- **Descripción**: Actualizar `modules.md`, `pages.md` y `shards.md` in-place con las nuevas reglas.
- **Pros**: Menor número de archivos, historial de cambios claro.
- **Contras**: Posible pérdida de reglas antiguas durante el refactor.
- **Riesgo**: Medio.
- **Impacto**: Alto (mejora directa de la interpretación por agentes).

### B. Crear nuevas constituciones con versionado
- **Descripción**: Mantener los archivos actuales como `v1` y crear `modules.v2.md`, etc.
- **Pros**: Retrocompatibilidad explícita.
- **Contras**: Complejidad adicional en el sistema de reglas, mayor carga cognitiva para los agentes.
- **Riesgo**: Bajo.
- **Impacto**: Medio.

### C. Unificar en un único documento de arquitectura
- **Descripción**: Fusionar todo en `extensio-architecture.md`.
- **Pros**: Única fuente de verdad.
- **Contras**: Archivo muy largo; difícil de mantener y cargar en contexto de LLMs.
- **Riesgo**: Alto.
- **Impacto**: Negativo (empeora la mantenibilidad).

**Recomendación**: Alternativa **A** (refactorizar in-place).

---

## 4. APIs Web / WebExtensions relevantes

| API / Especificación | Estado Chrome | Estado Firefox | Estado Safari | Notas |
|----------------------|---------------|----------------|---------------|-------|
| `customElements.define` | ✅ Estable | ✅ Estable | ✅ Estable | Base para WebComponents/Shards |
| `chrome.scripting.executeScript` | ✅ MV3 | ✅ (con polyfill) | ⚠️ Limitado | Usado por `loadShard` |
| `chrome.runtime.getURL` | ✅ Estable | ✅ Estable | ✅ Estable | Resolución de assets |
| `chrome.tabs.create` / `update` | ✅ Estable | ✅ Estable | ✅ Estable | Navegación a Pages |
| HTML Imports (deprecated) | ❌ Eliminado | ❌ Eliminado | ❌ Eliminado | No usar; reemplazar con ES Modules |

---

## 5. Compatibilidad multi-browser

| Característica | Chrome | Firefox | Safari | Edge |
|----------------|--------|---------|--------|------|
| WebComponents v1 | ✅ | ✅ | ✅ | ✅ |
| ES Modules en content scripts | ✅ | ✅ | ⚠️ Experimental | ✅ |
| Manifest V3 | ✅ | 🚧 Parcial | ❌ MV2 only | ✅ |

### Estrategias de mitigación
- Para Safari: mantener fallback a MV2 y evitar uso de APIs exclusivas de MV3.
- Para Firefox: usar polyfills del `webextension-polyfill` cuando aplique.

---

## 6. Recomendaciones AI-first

| Oportunidad | API/Patrón Habilitador | Impacto Esperado |
|-------------|------------------------|------------------|
| Generación automática de Shards | `mcp_extensio-cli_extensio_create` con flags `--withShards` | Alto: reduce errores de scaffolding |
| Validación de estructura en workflows | Gates con checklist verificable (archivos, exports, registros) | Alto: bloquea implementaciones incompletas |
| Detección de errores de build pre-commit | Integración de `mcp_extensio-cli_extensio_build` en Phase 5 | Medio: feedback temprano |

---

## 7. Riesgos y trade-offs

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Constituciones muy extensas saturan el contexto del LLM | Media | Usar reglas `MEMORY` para recordar sin reinyectar texto completo |
| Cambios en workflows rompen tareas en curso | Baja | Los workflows se cargan al inicio de la tarea; tareas activas usan la versión cargada |
| Desalineación entre CLI templates y constitución | Alta | Sincronizar cambios de constitución con actualización de templates en `packages/cli/src/generators` |

---

## 8. Fuentes

- [WebExtensions API (MDN)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Custom Elements Spec (WHATWG)](https://html.spec.whatwg.org/multipage/custom-elements.html)
- [Lit Element Docs](https://lit.dev/)
- Código fuente de Extensio: `packages/core/src/surface/shards/`, `packages/cli/src/commands/process-shards.mts`

---

## 9. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: 
    date: 
    comments: 
```
