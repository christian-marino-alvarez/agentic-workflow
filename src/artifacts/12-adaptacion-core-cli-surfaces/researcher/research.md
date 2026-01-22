---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 12-adaptacion-core-cli-surfaces
---

# Research Report — 12-adaptacion-core-cli-surfaces

## 1. Resumen ejecutivo

### Problema investigado
Verificar qué cambios son necesarios en `@extensio/core` y `extensio-cli` para que la implementación actual esté alineada con las constituciones de Pages y Shards (Surfaces v2.0).

### Objetivo
Identificar gaps entre la implementación actual y las constituciones, proponer orden de implementación y estimar impacto.

### Principales hallazgos

| Área | Gap Crítico | Severidad |
|------|------------|-----------|
| **Core: Shard** | Hereda de `Core`, no de `Surface` | 🔴 HIGH |
| **Core: Page** | Implementación mínima (9 líneas) | 🟡 MEDIUM |
| **Core: Surface** | Falta ciclo de vida completo | 🟡 MEDIUM |
| **CLI: Comandos** | No existen `create page` / `create shard` | 🔴 HIGH |
| **CLI: Templates** | Desactualizados vs constitución | 🟡 MEDIUM |
| **Demo** | Incompleta, solo `manifest.json` | 🔴 HIGH |

---

## 2. Necesidades detectadas

### 2.1 Desde constitución Pages (v2.1.0)
- Page DEBE heredar de Surface → Core
- Page DEBE tener hooks `onMount()`, `onUnmount()` heredados de Surface
- Page DEBE seguir ciclo: `run()` → `_setup()` → `listen()` → `loadProps()` → `start()` → `render()` → `onMount()`
- Page se navega mediante `Engine.navigate()`

### 2.2 Desde constitución Shards (v2.0.0)
- Shard DEBE heredar de Surface → Core
- Shard DEBE registrarse como WebComponent
- Shard DEBE implementar: `_mount()`, `_unmount()`, `update()`, `getTagName()`
- Estados: Loading, Mounted, Unmounted, Error
- Comunicación con Engine vía `notifyShardState()`

### 2.3 Suposiciones
- La jerarquía correcta es: `Core` → `Surface` → `Page` / `Shard`
- Surface define hooks comunes (`onMount`, `onUnmount`)
- Demo debe ser funcional con E2E en 3 navegadores

---

## 3. Estado actual del código

### 3.1 Core: `Surface` ([surface.mts](file:///Users/milos/Documents/workspace/extensio/packages/core/src/surface/surface.mts))

```typescript
// Actual (57 líneas)
export abstract class Surface extends Core {
    constructor(name: string, scope: string = 'surface') {
        super(name, scope);
    }

    onMount(): void {
        this.run();  // ⚠️ Incorrecto según constitución
    }

    onUnmount(): void { }

    // Listener de Storage implementado ✅
    protected override async listenProperty(key: string): Promise<void> { ... }
    override _listen() { ... }
    async onStorageChanged(...) { ... }
    async checkListeners(...) { ... }
}
```

**Gaps identificados:**
- `onMount()` llama a `run()`, pero según constitución debe ejecutarse DESPUÉS de `render()`
- Falta secuencia clara del ciclo de vida

### 3.2 Core: `Page` ([pages/index.mts](file:///Users/milos/Documents/workspace/extensio/packages/core/src/surface/pages/index.mts))

```typescript
// Actual (9 líneas) - MÍNIMA
export class Page extends Surface {
    constructor(name: string, scope: string = Scope.Page) {
        super(name, scope);
    }
}
```

**Gaps identificados:**
- ✅ Hereda de Surface (correcto)
- ⚠️ No implementa ningún método específico de Page
- ⚠️ No tiene método `render()` propio

### 3.3 Core: `Shard` ([shards/index.mts](file:///Users/milos/Documents/workspace/extensio/packages/core/src/surface/shards/index.mts))

```typescript
// Actual (249 líneas)
export abstract class Shard extends Core implements ShardLifecycle {
    // ⚠️ HEREDA DE CORE, NO DE SURFACE ⚠️
    ...
}
```

**Gaps identificados:**
- 🔴 **CRÍTICO**: Hereda de `Core`, no de `Surface`
- La constitución exige: `Core` → `Surface` → `Shard`
- Tiene implementación robusta de:
  - Registro WebComponent (`Shard.register()`) ✅
  - Ciclo de vida (`mount`, `unmount`, `update`) ✅
  - Comunicación con Engine (`notifyShardState`) ✅
  - Estados (`Loading`, `Mounted`, `Unmounted`, `Error`) ✅
- **Problema**: Duplica lógica que debería estar en Surface

### 3.4 Package.json exports

```json
// Actual
"exports": {
  "./shard": "./src/surface/shards/index.mts",
  "./surface/pages": "./src/surface/pages/index.mts",
  "./surface/shards": "./src/surface/shards/index.mts"
}
```

**Gap**: Falta export explícito de `./surface` para la clase base Surface.

---

## 4. Estado actual del CLI

### 4.1 Generadores existentes

| Generador | Estado |
|-----------|--------|
| `driver` | ✅ Funcional |
| `module` | ✅ Funcional (con opciones `withPage`, `withShard`) |
| `project` | ✅ Funcional |
| `page` | ❌ **NO EXISTE** |
| `shard` | ❌ **NO EXISTE** |

### 4.2 Templates existentes (en generador module)

**Pages** (`templates/surface/pages/`):
- `index.mts.ejs` - índice de pages
- `home.mts.ejs` - página ejemplo
- `about.mts.ejs` - página ejemplo
- `styles.css.ejs` - estilos

**Shards** (`templates/surface/shards/`):
- `index.mts.ejs` - índice de shards
- `example.mts.ejs` - shard ejemplo
- `styles.css.ejs` - estilos

**Gaps en templates:**
- ⚠️ No siguen exactamente la estructura de constitución
- ⚠️ Falta template de HTML para Pages

### 4.3 Plugins de build

| Plugin | Archivo | Estado |
|--------|---------|--------|
| `surface-pages` | [index.mts](file:///Users/milos/Documents/workspace/extensio/packages/cli/src/commands/plugins/surface-pages/index.mts) | ✅ Funcional |
| `process-shards` | [process-shards.mts](file:///Users/milos/Documents/workspace/extensio/packages/cli/src/commands/process-shards.mts) | ✅ Funcional |

Los plugins de build están implementados correctamente.

---

## 5. Demo actual

**Ubicación**: `packages/core/demo/`

**Contenido actual**:
```
demo/
├── node_modules/
├── package.json
├── src/
│   └── manifest.json  # Solo esto
├── tsconfig.json
└── tsconfig.tsbuildinfo
```

**Gap crítico**: La demo está incompleta. Solo tiene un `manifest.json` sin:
- Engine
- Pages
- Shards
- Tests

---

## 6. Compatibilidad multi-browser

| Componente | Chrome | Firefox | Safari |
|------------|--------|---------|--------|
| Surface base | ✅ | ✅ | ✅ |
| Page (HTML) | ✅ | ✅ | ✅ |
| Shard (WebComponent) | ✅ | ✅ | ✅ |
| Storage reactivo | ✅ | ✅ | ✅ |
| `customElements.define` | ✅ | ✅ | ✅ |

No hay riesgos de compatibilidad identificados para los cambios propuestos.

---

## 7. Recomendaciones AI-first

### 7.1 Orden de implementación recomendado

1. **Refactorizar Surface** - Establecer ciclo de vida correcto
2. **Hacer Shard heredar de Surface** - Cambio crítico
3. **Completar Page** - Añadir métodos faltantes
4. **Actualizar exports** - package.json
5. **Crear generadores page/shard** - CLI independientes
6. **Actualizar templates** - Conformidad con constitución
7. **Reconstruir demo** - Usando CLI
8. **Tests E2E** - 3 navegadores

### 7.2 Estimación de esfuerzo

| Tarea | Complejidad | Estimación |
|-------|-------------|------------|
| Refactorizar Surface | Media | 1-2h |
| Migrar Shard → Surface | Alta | 2-3h |
| Completar Page | Baja | 30min |
| Generadores CLI | Media | 2h |
| Templates | Baja | 1h |
| Demo completa | Media | 2h |
| Tests E2E | Alta | 3-4h |

---

## 8. Riesgos y trade-offs

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Breaking change en Shard | 🔴 Alta | Migración gradual, tests exhaustivos |
| Compatibilidad con módulos existentes | 🟡 Media | Validar demos existentes |
| Ciclo de vida de Surface | 🟡 Media | Documentar claramente la secuencia |

---

## 9. Fuentes

- [MDN: Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- Constitución Pages: `.agent/rules/constitution/pages.md` (v2.1.0)
- Constitución Shards: `.agent/rules/constitution/shards.md` (v2.0.0)

---

## 10. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-14T07:26:50+01:00
    comments: Aprobado para avanzar a Phase 2
```
