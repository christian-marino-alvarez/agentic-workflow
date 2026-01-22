---
trigger: model_decision
description: Se aplica cuando se crean, modifican o auditan Shards, o cuando un agente toma decisiones sobre ellos, garantizando estructura contractual, ciclo de vida y cumplimiento arquitectónico.
---

---
id: constitution.shards
type: rule
owner: architect-agent
version: 2.0.0
severity: PERMANENT
scope: global
---

# CONSTITUTION: Shards (Extensio)

## Objetivo
Este documento define **reglas obligatorias** y contractuales para los Shards de Extensio.
Todo Shard **DEBE** cumplir estas reglas.
Los agentes **DEBEN** auditar y hacer cumplir este contrato.

---

## 1. Definición (qué es un Shard)

Un Shard es un **componente visual reutilizable** que se representa dentro de una Page o en una página de navegación orgánica.

Un Shard:
- Es un WebComponent registrado con `customElements.define()`
- Hereda de la clase `Surface` que extiende `Core`
- Tiene reactividad mediante `@property` y `@onChanged`
- Puede usar cualquier sistema de renderizado (Lit, React, Vanilla, etc.)
- Recibe estado y lo renderiza

Un Shard **NO**:
- Contiene lógica de negocio
- Almacena estado persistente de negocio
- Toma decisiones de dominio
- Ejecuta operaciones que afecten otras partes de la extensión

---

## 2. Jerarquía de Clases

```
Core
  └── Surface (clase abstracta)
        └── Shard (clase abstracta)
              ├── LitShard (ejemplo - no oficial)
              └── ReactShard (ejemplo - no oficial)
```

### Clase Base: `Surface`

La clase `Surface` proporciona hooks de ciclo de vida compartidos con Page:
- `onMount()`: Se ejecuta cuando la Surface está lista en el DOM
- `onUnmount()`: Se ejecuta antes de destruir la Surface
- Integración con Storage reactivo
- Gestión de listeners

### Clase: `Shard`

La clase `Shard` extiende `Surface` y añade:
- Registro como WebComponent: `Shard.register(tagName, Class)`
- Ciclo de renderizado: `mount()` → `render()` → `unmount()`
- Estados: `Loading`, `Mounted`, `Unmounted`, `Error`
- Comunicación con Engine: `notifyEngine()`, `notifyShardState()`
- Métodos abstractos: `_mount()`, `_unmount()`, `update()`, `getTagName()`

---

## 3. Estructura Obligatoria

Cada Shard **DEBE** seguir esta estructura dentro del módulo:

```
packages/modules/<module-name>/
└── src/
    └── surface/
        └── shards/
            ├── index.mts              # Índice de registro (OBLIGATORIO)
            └── <shard-name>/
                ├── index.mts          # Implementación del Shard
                └── styles.css         # Estilos (opcional)
```

### 3.1 Índice de Shards (`src/surface/shards/index.mts`)

Este archivo es **OBLIGATORIO** si el módulo define Shards.

**Responsabilidad**:
- Importar todos los Shards del módulo
- Registrar cada Shard como WebComponent
- Exportar los Shards para uso programático

```ts
// src/surface/shards/index.mts
import { Shard } from '@extensio/core/shard';
import { MyShard } from './my-shard/index.mts';
import { AnotherShard } from './another-shard/index.mts';

// Registrar WebComponents (OBLIGATORIO)
Shard.register('my-module-shard', MyShard);
Shard.register('my-module-another', AnotherShard);

// Exportar para uso programático
export { MyShard, AnotherShard };
```

### 3.2 Implementación del Shard

Cada Shard **DEBE** implementar:

```ts
// my-shard/index.mts
import { Shard } from '@extensio/core/shard';
import type { ShardContext } from '@extensio/core/shard';

export class MyShard extends Shard {
  constructor(context: ShardContext) {
    super('my-shard', context);
  }

  // OBLIGATORIO: Nombre del tag para WebComponent
  getTagName(): string {
    return 'my-module-shard';
  }

  // OBLIGATORIO: Montar el componente en el contenedor
  protected async _mount(container: HTMLElement): Promise<void> {
    container.innerHTML = '<div class="my-shard">Loading...</div>';
  }

  // OBLIGATORIO: Actualizar con nuevas propiedades
  update(props: Record<string, any>): void {
    // Re-renderizar con nuevas props
  }

  // OBLIGATORIO: Limpiar antes de destruir
  protected _unmount(): void {
    // Cleanup
  }

  // OPCIONAL: Renderizado personalizado
  public async render(): Promise<void> {
    // Implementación de renderizado
  }
}
```

---

## 4. Ciclo de Vida

### 4.1 Estados del Shard

| Estado | Descripción |
|--------|-------------|
| `Loading` | El Shard se está montando |
| `Mounted` | El Shard está activo y renderizado |
| `Unmounted` | El Shard ha sido desmontado |
| `Error` | Ocurrió un error durante el ciclo de vida |

### 4.2 Secuencia de Ejecución

| # | Método | Tipo | Descripción |
|---|--------|------|-------------|
| 1 | `constructor(context)` | Público | Inicializa con contexto (tabId, url, etc.) |
| 2 | `mount(container)` | Público | Punto de entrada. Dispara el ciclo. |
| 3 | `notifyShardState(Loading)` | Interno | Notifica al Engine que está cargando |
| 4 | `_mount(container)` | Abstracto | Implementación del montaje (subclase) |
| 5 | `render()` | Público | Renderiza el contenido |
| 6 | `notifyShardState(Mounted)` | Interno | Notifica al Engine que está montado |
| 7 | `update(props)` | Abstracto | Actualiza con nuevas propiedades |
| 8 | `unmount()` | Público | Desmonta el componente |
| 9 | `_unmount()` | Abstracto | Implementación del desmontaje |
| 10 | `notifyShardState(Unmounted)` | Interno | Notifica al Engine que fue desmontado |

### 4.3 Hooks de Surface

Los Shards heredan de Surface, por lo que también tienen:
- `onMount()`: Se puede usar para inicialización adicional
- `onUnmount()`: Se puede usar para cleanup adicional

---

## 5. Registro como WebComponent

### 5.1 Método de Registro

Todo Shard **DEBE** registrarse antes de poder usarse:

```ts
import { Shard } from '@extensio/core/shard';

Shard.register('my-tag-name', MyShardClass);
```

### 5.2 Reglas de Naming

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Tag WebComponent | kebab-case con prefijo de módulo | `my-module-widget` |
| Clase Shard | PascalCase + `Shard` | `MyModuleWidgetShard` |
| Carpeta | kebab-case | `widget/` |

### 5.3 Prevención de Duplicados

El método `Shard.register()` previene registros duplicados:
- Si el tag ya existe, muestra warning y retorna `false`
- Si es nuevo, lo registra y retorna `true`

---

## 6. Dos Contextos de Uso

### 6.1 Dentro de una Page (Orquestador: Page)

```ts
// En la Page
import { MyShard } from './surface/shards/index.mts';

class MyPage extends Page {
  override start() {
    // El Shard ya está registrado como WebComponent
    const container = document.getElementById('shard-container');
    const shard = new MyShard({ tabId: 0, url: window.location.href });
    shard.mount(container);
  }
}
```

### 6.2 En Navegación Orgánica (Orquestador: Engine)

El Engine carga Shards en páginas web externas mediante `loadShard()`:

```ts
// En el Engine
import { MyShard } from './surface/shards/index.mts';

class MyEngine extends Engine {
  override start() {
    // Cargar shard en la página actual del navegador
    this.loadShard(MyShard);
  }

  // Escuchar eventos del Shard
  @onShard('my-shard', ShardStatus.Mounted)
  onMyShardMounted(state: ShardState) {
    this.log('Shard montado:', state);
  }
}
```

### 6.3 Transformación del CLI

El CLI detecta el uso de `loadShard()` y transforma el código:

```ts
// Código fuente
import { MyShard } from './surface/shards/MyShard.mts';
this.loadShard(MyShard);

// Código transformado (build)
const MyShard = '../surface/shards/MyShard.mjs';
this.loadShard(MyShard);  // Ahora recibe la URL del archivo
```

---

## 7. Comunicación con Engine

### 7.1 Notificación de Estado

Los Shards notifican automáticamente al Engine sus cambios de estado:

```ts
// Interno - se ejecuta automáticamente
notifyShardState(status: ShardStatusType, error?: any)
```

Esto dispara un evento `shard:state-change` que el Engine puede escuchar.

### 7.2 Decorador @onShard

El Engine usa `@onShard` para reaccionar a cambios del Shard:

```ts
import { onShard } from '@extensio/core';
import { ShardStatus } from '@extensio/core';

class MyEngine extends Engine {
  @onShard('my-shard', ShardStatus.Mounted)
  onShardReady(state: ShardState) {
    // El shard está montado y listo
  }

  @onShard('my-shard', ShardStatus.Error)
  onShardError(state: ShardState) {
    this.error('Shard failed:', state.error);
  }
}
```

### 7.3 ShardState

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `shardId` | `string` | ID del Shard |
| `url` | `string` | URL donde está montado |
| `tabId` | `number` | ID del tab |
| `documentId` | `string?` | ID del documento |
| `status` | `ShardStatusType` | Estado actual |
| `error` | `Error?` | Error si aplica |
| `timestamp` | `number` | Timestamp del evento |

---

## 8. Responsabilidades (SRP)

Un Shard tiene **tres responsabilidades únicas**:

### 8.1 Reactividad
- Recibir propiedades mediante `@property`
- Reaccionar a cambios mediante `@onChanged`
- Actualizar su estado interno

### 8.2 Acciones
- Responder a eventos del usuario (clicks, inputs)
- Emitir eventos al Engine/Page
- Delegar decisiones de negocio al orquestador

### 8.3 Renderizado
- Mostrar estado visual
- Actualizar la UI cuando cambian las props
- Gestionar estilos y animaciones

---

## 9. Restricciones

Un Shard **NO DEBE**:

| Restricción | Razón |
|-------------|-------|
| Contener lógica de negocio | Page o Engine son los orquestadores |
| Almacenar estado persistente | El estado vive en Engine |
| Tomar decisiones de dominio | Solo renderiza y emite eventos |
| Acceder directamente a drivers | Comunicarse via Engine |
| Modificar estado global | Solo su propio estado de UI |

### Principio Fundamental

> **"Un Shard es un componente de UI puro: recibe estado, lo renderiza, y emite eventos."**

---

## 10. Build y CLI

### 10.1 Detección de Shards

El CLI detecta Shards mediante:
1. Registro en `src/surface/shards/index.mts`
2. Uso de `loadShard()` en el Engine
3. Imports que contengan `/shards/` en el path

### 10.2 Compilación Independiente

Cada Shard se compila como módulo ES independiente (`.mjs`):
- Permite carga dinámica en content scripts
- Evita bundlear el Shard con el Engine
- Facilita inyección via `Scripting.executeScript()`

### 10.3 Output

```
dist/
└── surface/
    └── shards/
        ├── my-shard.mjs      # Shard compilado
        └── another-shard.mjs
```

---

## 11. Adaptadores (Ejemplos - No Oficiales)

> **NOTA**: Los siguientes adaptadores son ejemplos no consolidados como oficiales.

### LitShard
Adaptador para usar Lit como sistema de renderizado.

### ReactShard
Adaptador para usar React como sistema de renderizado.

Estos adaptadores están en desarrollo y no deben considerarse como el patrón oficial todavía.

---

## 12. Auditoría

Criterios mínimos de auditoría para un Shard:

| Criterio | Verificación |
|----------|--------------|
| Estructura | Conforme a §3 |
| Hereda de Shard | `class X extends Shard` |
| Registrado | `Shard.register()` en índice |
| Métodos abstractos | `_mount()`, `_unmount()`, `update()`, `getTagName()` |
| Sin lógica de negocio | Conforme a §8-9 |
| Tag único | kebab-case con prefijo de módulo |

---

## 13. Severidad

Cualquier violación de:
- Estructura (§3)
- Ciclo de vida (§4)
- Responsabilidades (§8-9)

se considera **SEVERITY: HIGH** y bloquea la validación del Shard.

---
