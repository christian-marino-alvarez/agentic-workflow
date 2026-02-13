---
id: skill.module-scaffolding
name: Module Scaffolding
description: Instructions and templates for creating new functional modules extending the Core architecture.
version: 1.0.0
---

# SKILL: Module Scaffolding

## Objetivo
Estandarizar la creación de nuevos módulos funcionales (ej: `chat`, `security`, `app`) asegurando que extiendan correctamente las clases base del `Core`.

## Estructura de Directorios
Un módulo nuevo debe seguir esta estructura mínima:
```text
src/extension/modules/<module-name>/
├── index.ts                 # Punto de entrada y exportaciones del módulo
├── background/
│   └── index.ts             # Clase que extiende Background (Extension Host)
├── backend/
│   └── index.ts             # Clase que extiende Backend (Lógica/Sidecar)
└── view/
    ├── index.ts             # Lógica del componente Lit (Clase View)
    └── template/
        ├── html.ts          # Templates HTML
        └── styles.ts        # Estilos CSS
```

## Paso 1: Implementar Background
Crea `background/index.ts` extendiendo la clase `Background` del core.

```typescript
import * as vscode from 'vscode';
import { Background } from '../../core/index.js';

export class MyModuleBackground extends Background {
  constructor(extensionUri: vscode.Uri) {
    super('my-module', extensionUri);
  }

  // Opcional: Sobrescribir el HTML si se necesita un bootloader custom
  // protected getHtmlForWebview(webview: vscode.Webview): string { ... }
}
```

## Paso 2: Implementar View
Las vistas deben separar lógica de presentación.

### 2.a: `view/template/styles.ts`
```typescript
import { css } from 'lit';
export const styles = css`:host { display: block; }`;
```

### 2.b: `view/template/html.ts`
```typescript
import { html } from 'lit';
import { MyModuleView } from '../index.js';

export const renderTemplate = (view: MyModuleView) => html`
  <div>Hello from Module</div>
`;
```

### 2.c: `view/index.ts`
```typescript
import { View } from '../../core/index.js';
import { customElement } from 'lit/decorators.js';
import { styles } from './template/styles.js';
import { renderTemplate } from './template/html.js';

@customElement('my-module-view')
export class MyModuleView extends View {
  static styles = styles;
  render() {
    return renderTemplate(this);
  }
}
```
## Paso 3: Implementar Backend
Crea `backend/index.ts` extendiendo la clase `Backend` del core.

```typescript
import { Backend } from '../../core/index.js';

export class MyModuleBackend extends Backend {
  constructor() {
    super('my-module');
  }

  public async initialize(): Promise<void> {
    // Lógica inicial, configuración de endpoints, etc.
  }
}
```

## Paso 4: Registrar en el Bundle
Añade el nuevo entry point en `scripts/build/bundle-webviews.mjs`:

```javascript
const entries = [
  // ...
  {
    entry: resolve('src/extension/modules/my-module/view/index.ts'),
    outfile: resolve('dist/extension/modules/my-module/view/index.js')
  }
];
```

## Paso 5: Exportar en el Index del Módulo
Crea `src/extension/modules/<module-name>/index.ts` para facilitar importaciones.

```typescript
export * from './background/index.js';
export * from './backend/index.js';
// No exportar la View aquí si causa conflictos de tipos en el Extension Host
```

## Paso 6: Activación
Para activar el módulo, regístralo en la instancia de `App` dentro del orquestador (`extension/index.ts`):

```typescript
import { MyModuleBackground } from './modules/my-module/background/index.js';

// En el activate de la extensión:
appInstance.register('my-module-view', new MyModuleBackground(context.extensionUri));
```
