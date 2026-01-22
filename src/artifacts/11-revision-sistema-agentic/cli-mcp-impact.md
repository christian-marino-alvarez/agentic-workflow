# Informe de Impacto: CLI y MCP Server

## Resumen Ejecutivo

Las nuevas constituciones de Modules, Pages y Shards requieren actualizaciones en el CLI y MCP Server para garantizar coherencia entre la documentación y la implementación.

---

## 1. Estado Actual del CLI

### 1.1 MCP Tool `extensio_create`

| Característica | Soportado | Flag |
|----------------|-----------|------|
| Crear módulo | ✅ | `--type module` |
| Con Shards | ✅ | `--withShard` |
| Con Pages | ✅ | `--withPage` |
| Con Demo | ✅ | `--includeDemo` |
| Con Tests | ✅ | `--testType` |

### 1.2 Plugins de Build

| Plugin | Estado | Función |
|--------|--------|---------|
| `surface-pages` | ✅ Funcional | Procesa HTML y compila scripts de Pages |
| `process-shards` | ✅ Funcional | Detecta y compila Shards independientes |

### 1.3 Templates de Generación

| Template | Estado | Problema |
|----------|--------|----------|
| `engine.engine.ts.ejs` | ✅ Completo | - |
| `shard.ts.ejs` | ⚠️ Parcial | Falta `getTagName()`, falta herencia de Surface |
| `page.ts.ejs` | ❌ Incompleto | Solo 2 líneas, no genera estructura correcta |

---

## 2. Gaps Identificados

### 2.1 Gap Crítico: Template de Page

**Archivo**: `packages/cli/src/generators/module/templates/page.ts.ejs`

**Estado actual** (2 líneas):
```ts
// Página de UI completa para el módulo <%= name %>
console.log('[<%= name %>] Page rendered');
```

**Estado requerido** (según `constitution.pages`):
```ts
import { Page } from '@extensio/core/surface/pages';

class <%= Name %>Page extends Page {
  constructor() {
    super('<%= name %>-page');
  }

  override listen() {
    super.listen();
  }

  override start() {
    this.render();
  }

  private render() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = '<h1><%= Name %> Page</h1>';
    }
  }
}

const page = new <%= Name %>Page();
page.run();
```

**Impacto**: 🔴 Alta - Los módulos creados con `--withPage` no tendrán estructura correcta.

---

### 2.2 Gap Medio: Template de Shard

**Archivo**: `packages/cli/src/generators/module/templates/shard.ts.ejs`

**Problemas**:
1. No implementa `getTagName()` (método abstracto obligatorio)
2. No hereda de Surface (cuando el código de Core se actualice)
3. Indentación incorrecta

**Estado actual**:
```ts
export class <%= Name %>Shard extends Shard {
  // Falta getTagName()
}
```

**Estado requerido**:
```ts
export class <%= Name %>Shard extends Shard {
  getTagName(): string {
    return '<%= moduleName %>-<%= name %>';
  }
  // ...
}
```

**Impacto**: 🟡 Media - Los Shards generados no cumplen el contrato completo.

---

### 2.3 Gap Funcional: No hay comandos para añadir Surfaces a módulos existentes

**Situación actual**:
- `--withShard` y `--withPage` solo funcionan al crear un módulo nuevo
- No existe `ext add-shard <module>` ni `ext add-page <module>`

**Impacto**: 🟡 Media - Los desarrolladores deben crear Shards/Pages manualmente en módulos existentes.

**Recomendación**: Crear comandos `extensio_add_shard` y `extensio_add_page` en el MCP server.

---

## 3. Cambios Requeridos en CLI

### 3.1 Actualizar Template de Page (Prioridad: Alta)

| Tarea | Archivo |
|-------|---------|
| Reescribir template completo | `templates/page.ts.ejs` |
| Añadir template HTML | `templates/surface/pages/index.html.ejs` |
| Añadir template de índice | `templates/surface/pages/index.mts.ejs` |

### 3.2 Actualizar Template de Shard (Prioridad: Media)

| Tarea | Archivo |
|-------|---------|
| Añadir `getTagName()` | `templates/shard.ts.ejs` |
| Corregir indentación | `templates/shard.ts.ejs` |
| Actualizar herencia cuando Core cambie | `templates/shard.ts.ejs` |

### 3.3 Nuevos Comandos MCP (Prioridad: Baja - Mejora)

| Comando | Descripción |
|---------|-------------|
| `extensio_add_shard` | Añadir Shard a módulo existente |
| `extensio_add_page` | Añadir Page a módulo existente |

---

## 4. Cambios Requeridos en MCP Server

Actualmente el MCP server delega todo al CLI. Los cambios serán automáticos cuando se actualice el CLI.

Aún así, considerar añadir:

| Tool | Descripción |
|------|-------------|
| `extensio_validate_module` | Validar que un módulo cumple `constitution.modules` |
| `extensio_validate_surface` | Validar que una Surface cumple su constitución |

---

## 5. Resumen de Prioridades

| Cambio | Prioridad | Tipo |
|--------|-----------|------|
| Reescribir `page.ts.ejs` | 🔴 Alta | CLI Template |
| Actualizar `shard.ts.ejs` con `getTagName()` | 🟡 Media | CLI Template |
| Actualizar Shard para heredar de Surface | 🔴 Alta | Core Code |
| Añadir comandos add-shard/add-page | 🟢 Baja | CLI Command |
| Añadir validadores MCP | 🟢 Baja | MCP Tool |

---

## 6. Criterio de Éxito

1. `ext create --type module --name test --withPage` genera estructura conforme a `constitution.pages`
2. `ext create --type module --name test --withShard` genera Shard con `getTagName()` implementado
3. Build procesa correctamente Pages y Shards
4. Demo funciona sin errores

---

Este informe fue generado como parte de la tarea `11-revision-sistema-agentic`.
