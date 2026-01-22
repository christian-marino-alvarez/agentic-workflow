---
artifact: analysis-addendum
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 12-adaptacion-core-cli-surfaces
---

# Análisis de Cambio Arquitectónico: Page como Controller

## Propuesta del Desarrollador

> "Page debe disponer del método del engine para poder cargar shards para mantener la misma coherencia con el ciclo de cargar shards. Por eso creo que Pages debe actuar más como un controller persistente en memoria a diferencia de engine que es más event driven. Creo conveniente por tanto quitar la capacidad de render a Pages y que sean solo los Shards quienes dispongan de esa capacidad."

---

## 1. Análisis Comparativo: Engine vs Page

| Aspecto | Engine | Page (propuesta) |
|---------|--------|------------------|
| **Entorno** | Service Worker (background) | DOM (documento HTML) |
| **Persistencia** | Ephemeral (puede morir/revivir) | Persistente mientras tab esté abierto |
| **Acceso DOM** | ❌ No tiene acceso | ✅ Acceso directo |
| **Modelo** | Event-driven (listeners de Storage, Runtime) | Controller persistente en memoria |
| **Renderizado** | ❌ No renderiza | ❌ **No renderiza** (propuesta) |
| **Carga Shards** | `loadShard()` vía Scripting driver | `loadShard()` directo en DOM |
| **Comunicación** | Runtime.sendMessage | Directo a Shards (mismo contexto) |

---

## 2. Implicaciones del Cambio

### 2.1 Page como Controller (sin render)

**Ventajas:**
- **Separación de responsabilidades clara**: Page orquesta, Shard renderiza
- **Coherencia arquitectónica**: Un único patrón de renderizado (Shards)
- **Reutilización**: El mismo Shard puede usarse en Page o en navegación orgánica
- **Simplicidad en templates**: No hay que decidir si Page renderiza con Lit/React/Vanilla
- **Testabilidad**: Shards se testean aislados, Pages se testean como controllers

### 2.2 Page con `loadShard()`

**Implementación propuesta:**

```typescript
// Page como controller
class MyPage extends Page {
  override start() {
    // Cargar shards en el DOM de la Page
    const container = document.getElementById('shards-container');
    this.loadShard(MyShard, { container });
  }
}
```

**Diferencia con Engine.loadShard():**

| Engine.loadShard() | Page.loadShard() |
|--------------------|------------------|
| Usa `Scripting.executeScript` | Instancia directa en DOM |
| Inyecta en tab externo | Monta en contenedor de la Page |
| Cross-context (Service Worker → Tab) | Same-context (Page DOM) |

---

## 3. Nueva Jerarquía Propuesta

```
Core
  └── Surface (abstracta)
        ├── onMount() / onUnmount()
        ├── Sistema reactivo (@property, @onChanged)
        │
        ├── Page (controller, SIN render)
        │     ├── loadShard(shardClass, options)
        │     ├── unloadShard(shardId)
        │     └── getShards(): Shard[]
        │
        └── Shard (visual, CON render)
              ├── mount(container)
              ├── render()
              ├── update(props)
              └── unmount()
```

---

## 4. Cambios en Constitución de Pages

### Antes (constitución actual)
```
Page se renderiza en su propio contexto
Page puede tener método render()
```

### Después (propuesta)
```
Page NO renderiza directamente
Page actúa como CONTROLLER:
  - Orquesta Shards
  - Gestiona lifecycle de Shards
  - Responde a eventos del usuario delegando a Shards
```

### Nuevas responsabilidades de Page:
1. **Orquestación de Shards**: Cargar/descargar Shards según lógica de UI
2. **Layout management**: Definir dónde se montan los Shards
3. **Comunicación inter-Shard**: Coordinar datos entre Shards
4. **Navegación interna**: Cambiar vistas (cargar diferentes Shards)

---

## 5. Implementación de `Page.loadShard()`

```typescript
// Page con capacidad de cargar Shards
export class Page extends Surface {
  private _shards: Map<string, Shard> = new Map();

  /**
   * Carga un Shard en el DOM de la Page.
   * Similar a Engine.loadShard() pero para contexto DOM directo.
   */
  public async loadShard<T extends Shard>(
    ShardClass: new (context: ShardContext) => T,
    options: PageShardOptions = {}
  ): Promise<T> {
    const { container, containerId, props } = options;
    
    // Resolver contenedor
    const targetContainer = container || 
      (containerId ? document.getElementById(containerId) : document.body);
    
    if (!targetContainer) {
      throw new Error(`Container not found for Shard`);
    }

    // Crear contexto para el Shard
    const context: ShardContext = {
      tabId: 0, // Mismo tab
      url: window.location.href,
      documentId: document.documentElement.id,
    };

    // Instanciar y montar
    const shard = new ShardClass(context);
    await shard.mount(targetContainer);
    
    if (props) {
      shard.update(props);
    }

    this._shards.set(shard.id, shard);
    return shard;
  }

  public unloadShard(shardId: string): void {
    const shard = this._shards.get(shardId);
    if (shard) {
      shard.unmount();
      this._shards.delete(shardId);
    }
  }

  public getShards(): Shard[] {
    return Array.from(this._shards.values());
  }

  // Override onUnmount para limpiar Shards
  protected override onUnmount(): void {
    for (const shard of this._shards.values()) {
      shard.unmount();
    }
    this._shards.clear();
    super.onUnmount();
  }
}
```

---

## 6. Ejemplo de Uso

```typescript
// MyDashboardPage.mts
import { Page } from '@extensio/core/surface/pages';
import { ChartShard, TableShard, FilterShard } from './shards';

class MyDashboardPage extends Page {
  constructor() {
    super('dashboard-page');
  }

  override async start() {
    // Page no renderiza, solo carga Shards
    await this.loadShard(FilterShard, { 
      containerId: 'filters-container' 
    });
    
    await this.loadShard(ChartShard, { 
      containerId: 'chart-container',
      props: { type: 'bar' }
    });
    
    await this.loadShard(TableShard, { 
      containerId: 'table-container' 
    });
  }
}
```

```html
<!-- dashboard/index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Dashboard</title>
</head>
<body>
  <!-- Page no renderiza, solo define containers para Shards -->
  <div id="filters-container"></div>
  <div id="chart-container"></div>
  <div id="table-container"></div>
  
  <script type="module" src="./index.mts"></script>
</body>
</html>
```

---

## 7. Impacto en Templates CLI

Los templates de Page deberían:
- **NO** usar Lit/React/decoradores de renderizado
- **SÍ** definir containers HTML para Shards
- **SÍ** importar y cargar Shards

```typescript
// Template de Page propuesto
import { Page } from '@extensio/core/surface/pages';
// import Shards que usará la Page

class <%= name %>Page extends Page {
  constructor() {
    super('<%= name.toLowerCase() %>-page');
  }

  override async start() {
    // Cargar Shards aquí
    // await this.loadShard(MyShard, { containerId: 'container' });
  }
}

const page = new <%= name %>Page();
page.run();
```

---

## 8. Validación de Coherencia Arquitectónica

| Principio | Cumplimiento |
|-----------|--------------|
| **SRP**: Page orquesta, Shard renderiza | ✅ Claro |
| **Consistencia**: loadShard() en Engine y Page | ✅ Mismo patrón |
| **Reusabilidad**: Shards en cualquier contexto | ✅ Máxima |
| **Mantenibilidad**: Menos código en Page | ✅ Simplicidad |
| **Extensio Architecture**: Surface → Page/Shard | ✅ Respeta jerarquía |

---

## 9. Recomendación del Architect

**✅ APRUEBO** el cambio arquitectónico propuesto.

**Razones:**
1. Page como controller sin render es más coherente con el rol de orquestador
2. Shards como único componente de render simplifica el modelo mental
3. `loadShard()` en Page mantiene coherencia con Engine
4. Facilita testing: Page se testea como controller, Shard como componente visual

**Cambios requeridos:**
1. Actualizar constitución de Pages (quitar render, añadir loadShard)
2. Implementar `Page.loadShard()`, `Page.unloadShard()`, `Page.getShards()`
3. Actualizar templates CLI de Pages
4. Actualizar demo para reflejar nuevo patrón

---

## 10. Próximos pasos

Si el desarrollador aprueba, se actualizará:
1. `analysis.md` con este cambio
2. Constitución de Pages (v2.2.0)
3. Plan de implementación

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-14T08:03:49+01:00
    comments: Aprobado
```
