---
id: constitution.view-layer
type: rule
owner: architect-agent
version: 1.0.0
severity: PERMANENT
scope: global
---

# CONSTITUTION: View Layer

## Objetivo
Garantizar la separación de preocupaciones (Separation of Concerns) en la capa de UI, aislando la lógica del componente Lit de su representación visual y estilos.

## Reglas de Estructura
Toda vista (View) que extienda de `core/View` DEBE seguir esta estructura de carpetas:

```text
view/
├── index.ts                 # Lógica del componente (Clase View)
└── template/
    ├── html.ts              # Fragmentos de HTML (utilizando lit `html`)
    └── styles.ts            # Estilos CSS (utilizando lit `css`)
```

## Prohibiciones
1.  ❌ **No definir `static styles`** dentro del archivo `index.ts`.
2.  ❌ **No definir el método `render()`** con literales de plantilla (template literals) extensos dentro de `index.ts`.
3.  ❌ **Cualquier CSS o HTML** de más de 5 líneas debe residir en su respectivo archivo dentro de `template/`.

## Ejemplo de Implementación

### `template/styles.ts`
```typescript
import { css } from 'lit';
export const styles = css`:host { display: block; }`;
```

### `template/html.ts`
```typescript
import { html } from 'lit';
import { MyView } from '../index.js';

export const renderManual = (view: MyView) => html`
  <div>Status: ${view.status}</div>
`;
```

### `index.ts`
```typescript
import { View } from '../../core/index.js';
import { styles } from './template/styles.js';
import { renderManual } from './template/html.js';

export class MyView extends View {
  static styles = styles;
  render() { return renderManual(this); }
}
```
