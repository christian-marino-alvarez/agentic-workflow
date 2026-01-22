---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 8-module-workflow-refactor
---

# Research Report — 8-module-workflow-refactor

## 1. Resumen ejecutivo

### Problema investigado
Refactorizar el sistema de creación de módulos para garantizar:
- Naming automático (kebab-case → CamelCase)
- Flags separados para Shards/Pages
- Registro de Shards en fichero dedicado
- Integración de globals/constants siguiendo patrón de drivers
- Demo funcional incluido por defecto

### Objetivo de la investigación
Identificar el estado actual del generator, workflow y constitution de módulos, y documentar las brechas respecto a los acceptance criteria.

### Principales hallazgos

| Área | Estado Actual | Brecha Detectada |
|------|---------------|------------------|
| **Naming** | ✅ Implementado (`_camelize`, `_getKebaName`) | Naming de clases ya funciona (ej: `session-manager` → `SessionManager`) |
| **Flags** | ✅ Implementado | `--withPage` y `--withShard` ya son flags separados |
| **Registro Shards** | ⚠️ Parcial | Template `shards/index.mts.ejs` existe pero NO incluye `Shard.registerShard()` |
| **Globals** | ✅ Implementado | `_extendGlobalTypes()` actualiza `global.d.mts` correctamente |
| **Constants** | ✅ Implementado | `_extendRootConstants()` actualiza `constants.mts` |
| **Demo** | ⚠️ Opcional | Demo existe pero `--includeDemo` default es `false` |
| **MCP Tool** | ⚠️ Desactualizado | `extensio-create.ts` no refleja `--withShards`/`--withPages` separados |

---

## 2. Necesidades detectadas

### 2.1 Estructura del Generator (`packages/cli/src/generators/module/index.mts`)

**Archivos clave analizados:**
- [index.mts](file:///Users/milos/Documents/workspace/extensio/packages/cli/src/generators/module/index.mts) (884 líneas)
- [engine.engine.ts.ejs](file:///Users/milos/Documents/workspace/extensio/packages/cli/src/generators/module/templates/engine.engine.ts.ejs)
- [shards/index.mts.ejs](file:///Users/milos/Documents/workspace/extensio/packages/cli/src/generators/module/templates/surface/shards/index.mts.ejs)

**Métodos existentes:**
```typescript
_getKebaName()      // Convierte nombre a kebab-case
_camelize(str)      // Convierte a camelCase
_capitalizeFirstLetter(str)  // Primera letra mayúscula
_extendGlobalTypes()    // Actualiza global.d.mts
_extendRootConstants()  // Actualiza constants.mts
_createDemoFolder()     // Crea demo
```

### 2.2 Brechas identificadas

1. **Template de Shards sin registro WebComponent**
   - El template actual NO incluye `Shard.registerShard(tagName, ElementClass)`
   - Debe agregarse patrón de registro automático

2. **Demo no incluido por defecto**
   - `includeDemo: false` en defaults
   - Según acceptance criteria, debe ser `true`

3. **MCP Tool desactualizado**
   - `extensio-create.ts` usa `--withSurface` (legacy)
   - No refleja `--withShards`/`--withPages` correctamente

4. **Constitution de módulos incompleta**
   - No documenta regla de naming (CamelCase para clases)
   - No documenta estructura de registro de Shards

---

## 3. Alternativas técnicas

### 3.1 Registro de Shards

| Alternativa | Descripción | Pros | Contras |
|-------------|-------------|------|---------|
| **A: Registro estático** | Llamar `Shard.registerShard()` al final del fichero | Simple, explícito | Manual |
| **B: Auto-registro en constructor** | Cada Shard se auto-registra | Automático | Menos control |
| **C: Decorador `@customElement`** | Decorador que registra | Limpio, DX moderno | Requiere cambio en Core |

**Recomendación:** Alternativa A - Registro estático es coherente con patrón WebComponents y no requiere cambios en Core.

### 3.2 Naming Transformation

El generator ya implementa la transformación correctamente:

```typescript
// En ModuleGenerator
_camelize(str?: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[-_]+(.)/g, (_, chr: string) => chr.toUpperCase());
}

_getKebaName() {
  const { name } = this.answers;
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
```

**Input → Outputs:**
- `"session-manager"` → folder: `session-manager/`, clase: `SessionManagerEngine`
- `"Session Manager"` → folder: `session-manager/`, clase: `SessionManagerEngine`
- `"sessionManager"` → folder: `session-manager/`, clase: `SessionManagerEngine`

---

## 4. APIs Web / WebExtensions relevantes

| API | Descripción | Relevancia |
|-----|-------------|------------|
| `customElements.define()` | Registro de WebComponents | Base para `Shard.registerShard()` |
| `chrome.runtime.getURL()` | URLs de recursos de extensión | Para rutas de Pages/Shards en demo |

**No se requieren APIs adicionales del navegador para esta tarea.**

---

## 5. Compatibilidad multi-browser

Esta tarea es **agnóstica del navegador** ya que:
- El generator produce código TypeScript
- Los templates son idénticos para todos los browsers
- La compilación browser-específica ocurre en build time (no en scaffolding)

| Navegador | Compatibilidad | Notas |
|-----------|----------------|-------|
| Chrome | ✅ Completo | Objetivo principal |
| Firefox | ✅ Completo | Sin diferencias |
| Safari | ✅ Completo | Sin diferencias |
| Edge | ✅ Completo | Sin diferencias |

---

## 6. Recomendaciones AI-first

### 6.1 Mejora del MCP Tool
El MCP tool `extensio_create` debe actualizarse para reflejar los flags reales:

```typescript
// Actualización propuesta para extensio-create.ts
withShards: z.boolean().optional().describe('Include Shards scaffold?'),
withPages: z.boolean().optional().describe('Include Pages scaffold?'),
// Eliminar o deprecar:
withSurface: z.boolean().optional().describe('[DEPRECATED] Use --withShards/--withPages'),
```

### 6.2 Validación automática
El generator podría validar nombres de módulos:
- Rechazar nombres vacíos
- Normalizar espacios a guiones
- Advertir sobre nombres reservados

### 6.3 Generación de documentación
Incluir README.md auto-generado con:
- Estructura del módulo
- Cómo usar Engine, Shards, Pages
- Ejemplo de integración

---

## 7. Riesgos y trade-offs

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Breaking changes en MCP tool | Media | Mantener `--withSurface` como alias deprecated |
| Conflictos en `global.d.mts` | Baja | El generator ya verifica duplicados |
| Demo muy grande | Baja | Demo minimalista, solo demuestra lo esencial |

---

## 8. Fuentes

| Recurso | URL/Path |
|---------|----------|
| Generator actual | [packages/cli/src/generators/module/index.mts](file:///Users/milos/Documents/workspace/extensio/packages/cli/src/generators/module/index.mts) |
| MCP Tool | [tools/mcp-server/src/tools/extensio-create.ts](file:///Users/milos/Documents/workspace/extensio/tools/mcp-server/src/tools/extensio-create.ts) |
| Constitution módulos | [.agent/rules/constitution/modules.md](file:///Users/milos/Documents/workspace/extensio/.agent/rules/constitution/modules.md) |
| Workflow crear módulo | [.agent/workflows/modules/create.md](file:///Users/milos/Documents/workspace/extensio/.agent/workflows/modules/create.md) |
| Patrón drivers (global.d.mts) | [global.d.mts](file:///Users/milos/Documents/workspace/extensio/global.d.mts) |
| Core Shard | [packages/core/src/surface/shards/index.mts](file:///Users/milos/Documents/workspace/extensio/packages/core/src/surface/shards/index.mts) |
| MDN: Custom Elements | https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define |

---

## 9. Conclusiones

### Cambios requeridos (resumen)

1. **Generator** (`packages/cli/src/generators/module/index.mts`):
   - Cambiar `includeDemo: false` → `includeDemo: true` por defecto
   - Actualizar template de Shards para incluir `Shard.register()` (Renombrado desde `registerShard` en Phase 2)

2. **MCP Tool** (`tools/mcp-server/src/tools/extensio-create.ts`):
   - Añadir `--withShards` y `--withPages` como flags separados
   - Deprecar `--withSurface` (mantener por compatibilidad)

3. **Constitution** (`.agent/rules/constitution/modules.md`):
   - Añadir sección de naming (CamelCase para clases)
   - Añadir sección de registro de Shards

4. **Workflow** (`.agent/workflows/modules/create.md`):
   - Actualizar para reflejar nuevos flags

---

## 10. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-07T21:43:14+01:00
    comments: Aprobado sin comentarios
```
