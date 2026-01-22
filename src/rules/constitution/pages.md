---
trigger: model_decision
description: Se aplica cuando se crean, modifican o auditan Pages, o cuando un agente toma decisiones sobre ellas, garantizando estructura contractual, ciclo de vida y cumplimiento arquitectónico.
---

---
id: constitution.pages
type: rule
owner: architect-agent
version: 2.1.0
severity: PERMANENT
scope: global
---

# CONSTITUTION: Pages (Extensio)

## Objetivo
Este documento define **reglas obligatorias** y contractuales para las Pages de Extensio.
Toda Page **DEBE** cumplir estas reglas.
Los agentes **DEBEN** auditar y hacer cumplir este contrato.

---

## 1. Definición (qué es una Page)

Una Page es una **Surface de nivel superior** que representa un documento HTML completo dentro de la extensión.

Una Page:
- Es un documento HTML que vive dentro de la extensión
- Se renderiza en su propio contexto (popup, tab, panel)
- Hereda de la clase `Page` que extiende `Surface` → `Core`
- Carga JavaScript mediante `<script type="module" src="...">`
- Su documento HTML puede tener de 1 a N scripts asociados
- Sigue el ciclo de vida estándar de Extensio: `run()` → `listen()` → `start()`

Una Page **NO**:
- Almacena estado de negocio persistente (eso vive en Engine + Storage)
- Accede directamente al estado del módulo sin usar el sistema reactivo
- Se instancia directamente; se navega mediante `Engine.navigate()`

---

## 2. Jerarquía de Clases

```
Core
  └── Surface (clase abstracta)
        └── Page (clase concreta)
```

### Clase Base: `Surface`

La clase `Surface` extiende `Core` y añade:
- Hooks DOM: `onMount()` (inicia ciclo con `run()`), `onUnmount()` (cleanup)
- Listener de Storage: `onStorageChanged()`, `checkListeners()`
- El sistema reactivo (`@property`, `@onChanged`) viene de `Core`

### Clase: `Page`

```ts
import { Surface } from '../surface.mts';
import { Scope } from '../../constants.mts';

export class Page extends Surface {
    constructor(name: string, scope: string = Scope.Page) {
        super(name, scope);
    }
}
```

---

## 3. Estructura Obligatoria

Cada Page **DEBE** seguir esta estructura dentro del módulo:

```
packages/modules/<module-name>/
└── src/
    └── surface/
        └── pages/
            ├── index.mts              # Índice de Pages (OBLIGATORIO)
            └── <page-name>/
                ├── index.html         # Documento HTML
                ├── index.mts          # Script principal (lógica de la Page)
                └── styles.css         # Estilos (opcional)
```

### 3.1 Índice de Pages (`src/surface/pages/index.mts`)

Este archivo es **OBLIGATORIO** si el módulo define Pages.

**Responsabilidad**:
- Importar todos los archivos `.html` del módulo
- Exportar las URLs resueltas para uso con `navigate()`
- Permitir al CLI detectar y procesar las páginas

```ts
// src/surface/pages/index.mts
import dashboard from "./dashboard/index.html";
import settings from "./settings/index.html";

export const Pages = {
  dashboard,
  settings,
};
```

> **IMPORTANTE**: El import de un `.html` es transformado por el CLI en una URL runtime.
> El valor exportado es un `string` (la URL), **NO** un objeto JavaScript.

### 3.2 Documento HTML (`index.html`)

El archivo HTML **DEBE**:
- Ser un documento HTML5 válido
- Incluir al menos un `<script type="module" src="...">` que cargue el entry point
- No contener lógica inline (todo en archivos externos)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./index.mts"></script>
</body>
</html>
```

### 3.3 Script Principal (`index.mts`)

El script de entrada **DEBE**:
- Extender la clase `Page`
- Implementar el ciclo de vida de Extensio
- Llamar a `run()` para iniciar

```ts
// index.mts
import { Page } from '@extensio/core/surface/pages';

class DashboardPage extends Page {
  constructor() {
    super('dashboard-page');
  }

  // Opcional: configurar listeners de eventos/drivers
  override listen() {
    super.listen();
    // Registrar listeners aquí
  }

  // Punto de entrada principal - se ejecuta después de cargar props
  override start() {
    this.render();
  }

  private render() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = '<h1>Dashboard</h1>';
    }
  }
}

// Iniciar la Page
const page = new DashboardPage();
page.run();
```

---

## 4. Ciclo de Vida de una Page

El ciclo de vida de una Page sigue el patrón estándar de Extensio:

### 4.1 Secuencia de Ejecución

| # | Método | Tipo | Descripción |
|---|--------|------|-------------|
| 1 | `constructor()` | Público | Inicializa la Page con nombre |
| 2 | `run()` | Público | **Punto de entrada**. Inicia el ciclo de vida completo. |
| 3 | `_setup()` | Privado (Core) | Inicializa infraestructura reactiva. Llama a `_listen()`, `listen()`, `loadProps()`. |
| 4 | `_listen()` | Privado (Surface) | Registra listener de Storage |
| 5 | `listen()` | Público | Punto para registrar listeners de eventos y drivers |
| 6 | `loadProps()` | Interno | Carga propiedades persistentes |
| 7 | `start()` | Público | **Método principal**. Aquí se ejecuta la lógica de la Page. |

### 4.2 Reglas del Ciclo de Vida

- `run()` es el **único** punto de arranque de la Page
- `listen()` es para registrar listeners, **NO** para lógica de negocio
- `start()` es el primer punto donde se puede leer estado y renderizar

---

## 5. Navegación

### 5.1 Cargar una Page desde el Engine

Las Pages se cargan mediante el método `navigate()` del Engine:

```ts
// En el Engine
import { Pages } from './surface/pages/index.mts';

// Navegar a una Page de la extensión
// Pages.dashboard es un STRING (la URL del HTML)
await this.navigate(Pages.dashboard);

// Navegar con opciones
await this.navigate(Pages.settings, {
  type: 'popup',
  rect: { width: 400, height: 600 },
  active: true,
});
```

> **NOTA**: `navigate()` recibe el **path del HTML** (string), nunca un objeto JavaScript.

### 5.2 Cómo funciona `navigate()`

```ts
public async navigate(url: string | { default: string }, options?: NavigationOptions) {
  const resolvedUrl = typeof url === 'object' && 'default' in url
    ? url.default
    : this.getUrl(url as string);

  return Navigation.open(resolvedUrl, options);
}
```

El método acepta:
- Un `string` directo (URL o path)
- Un objeto con `{ default: string }` (para compatibilidad con imports)

### 5.3 NavigationOptions

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `type` | `'regular' \| 'popup'` | `'regular'` | Tipo de ventana |
| `rect.width` | `number` | - | Ancho de la ventana (solo popup) |
| `rect.height` | `number` | - | Alto de la ventana (solo popup) |
| `rect.top` | `number` | - | Posición Y (solo popup) |
| `rect.left` | `number` | - | Posición X (solo popup) |
| `active` | `boolean` | `true` | Si la ventana debe tener foco |

### 5.4 Escuchar Navegación (onNavigate)

Cada Engine tiene un listener `onNavigate` que captura eventos de navegación:

```ts
// En el Engine
override onNavigate(event: NavigationEvent) {
  console.log('Navegación detectada:', event);
  
  if (event.isExtensionPage) {
    // Es una Page de la extensión
  } else {
    // Es una URL externa
  }
}
```

### 5.5 NavigationEvent

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `event` | `string` | Tipo de evento: `'load'`, `'focus'`, `'window'` |
| `url` | `string` | URL de la página |
| `title` | `string?` | Título de la página |
| `tabId` | `number` | ID del tab |
| `windowId` | `number` | ID de la ventana |
| `isExtensionPage` | `boolean` | `true` si es una Page de la extensión |

---

## 6. Integración con Shards (PENDIENTE)

> **NOTA**: Esta funcionalidad está pendiente de implementar en Core.

Una Page **PODRÁ**:
- Registrar Shards locales
- Cargar Shards dinámicamente en su DOM
- Comunicarse con Shards mediante el sistema reactivo

---

## 7. Build y Compilación

### 7.1 Plugin `surface-pages`

El CLI usa el plugin `surface-pages` para procesar Pages:

1. **Detección**: Intercepta imports de archivos `.html`
2. **Parsing**: Lee el HTML y busca `<script src="...">` 
3. **Compilación**: Compila cada script como módulo ES (`.mjs`)
4. **Transformación**: Actualiza las referencias en el HTML de `.mts/.ts` a `.mjs`
5. **Copia**: Escribe el HTML transformado en `dist/`
6. **Export**: Retorna la URL runtime del HTML

### 7.2 Transformación del Import

```ts
// Código fuente
import dashboard from "./dashboard/index.html";

// Código transformado por el CLI
const runtimeUrl = globalThis.Extension?.Runtime?.getURL("surface/pages/dashboard/index.html") || "surface/pages/dashboard/index.html";
export default runtimeUrl;
```

### 7.3 Output

```
dist/
└── surface/
    └── pages/
        └── dashboard/
            ├── index.html    # HTML con referencias actualizadas
            ├── index.mjs     # Script compilado
            └── styles.css    # Estilos copiados
```

---

## 8. Naming Conventions

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Carpeta de Page | kebab-case | `user-settings/` |
| Archivo HTML | `index.html` | `index.html` |
| Archivo Script | `index.mts` | `index.mts` |
| Clase Page | PascalCase + `Page` | `UserSettingsPage` |

---

## 9. Auditoría

Criterios mínimos de auditoría para una Page:

| Criterio | Verificación |
|----------|--------------|
| Estructura | Conforme a §3 |
| Índice de Pages | Existe y exporta la Page |
| HTML válido | Documento HTML5 con `<script type="module">` |
| Ciclo de vida | Extiende `Page`, usa `run()` y `start()` |
| Navegación | Se carga mediante `Engine.navigate()` |
| No lógica de negocio | Solo UI y comunicación reactiva |

---

## 10. Severidad

Cualquier violación de:
- Estructura (§3)
- Ciclo de vida (§4)
- Navegación (§5)

se considera **SEVERITY: HIGH** y bloquea la validación de la Page.

---

## 11. Responsabilidades de una Page (SRP)

Una Page tiene **tres responsabilidades únicas**:

### 11.1 Lógica de Presentación
- Cómo se muestran los datos al usuario
- Formateo, ordenación, filtrado visual
- Transformación de datos para la UI

### 11.2 Lógica de Interacción
- Respuesta a eventos del usuario (clicks, inputs)
- Validación de formularios
- Estados de UI (loading, error, success)
- Navegación interna dentro de la Page

### 11.3 Orquestación de Shards
- Cargar y descargar Shards dinámicamente
- Coordinar comunicación entre Shards
- Gestionar el layout de Shards en la Page

---

## 12. Restricciones de una Page

Una Page **NO DEBE**:

| Restricción | Razón |
|-------------|-------|
| Almacenar estado de negocio persistente | Usar Engine + Storage |
| Ejecutar lógica que afecte otras partes de la extensión | Pasar por Engine |
| Duplicar lógica que existe en el Engine | Principio DRY |
| Acceder directamente a drivers para operaciones de negocio | Engine es el orquestador |

### Principio Fundamental

> **"La Page es el controlador de la vista, no el propietario del estado."**

El estado de negocio vive en el Engine (persistente).
La Page consume ese estado y lo presenta al usuario.

---

## 13. Hooks de Ciclo de Vida (Automáticos)

Los hooks de Surface se ejecutan **automáticamente**, no son llamados por el desarrollador:

### 13.1 onMount()
- **Cuándo salta**: Automáticamente DESPUÉS de `render()`
- **Uso**: Lógica post-renderizado (animaciones, focus, inicialización de librerías)
- **Cómo usarlo**: Sobrescribir el método en la subclase

```ts
class MyPage extends Page {
  protected override onMount(): void {
    // Se ejecuta automáticamente después de renderizar
    console.log('Page montada y visible');
  }
}
```

### 13.2 onUnmount()
- **Cuándo salta**: Automáticamente ANTES de destruir el componente
- **Uso**: Cleanup (remover listeners, cancelar timers, liberar recursos)
- **Cómo usarlo**: Sobrescribir el método en la subclase

```ts
class MyPage extends Page {
  protected override onUnmount(): void {
    // Se ejecuta automáticamente antes de destruir
    this.cleanup();
  }
}
```

### 13.3 Secuencia Completa

```
run() → _setup() → listen() → loadProps() → start() → render() → onMount()
                                                                      ↓
                                                            [Page activa]
                                                                      ↓
                                                        [usuario cierra tab]
                                                                      ↓
                                                               onUnmount()
```

---
