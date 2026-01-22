---
trigger: model_decision
description: Se aplica cuando se crean, modifican o auditan drivers, o cuando un agente toma decisiones sobre ellos, garantizando estructura contractual, aislamiento, compatibilidad multi-browser y ausencia de lógica de negocio
---

---
id: constitution.drivers
type: rule
owner: architect-agent
version: 1.0.0
severity: PERMANENT
scope: global
---

# CONSTITUTION: Drivers (Extensio)

## Objetivo
Este documento define **reglas obligatorias** y contractuales para los drivers de Extensio.
Todo driver **DEBE** cumplir estas reglas.  
El `role.driver-agent` **DEBE** auditar y hacer cumplir este contrato.

---

## 1. Definición (qué es un driver)
Un driver es una **fachada** (facade) que abstrae APIs del navegador (WebExtensions) o Web APIs
para que el resto del framework sea **browser-agnóstico**.

Un driver:
- adapta APIs (shape, compat, eventos, tipos)
- expone una API estable y documentada
- encapsula diferencias entre navegadores

Un driver:
- NO contiene lógica de negocio
- NO conoce módulos de negocio
- NO decide flujos o workflows
- NO persiste estado de negocio (solo adapta storage si es driver de storage)

---

## 2. Estructura obligatoria por driver
Cada driver **DEBE** seguir esta estructura mínima:

- `src/index.mts` → **wrapper público** (API estable + JSDoc)
- `src/__BROWSER__/index.mts` → implementación por navegador (chrome/firefox/safari)
- `src/types.d.mts` → tipos locales del driver
- `src/constants.mts` → constantes tipadas (`Record<string, string>`)
- `src/common/index.mts` → implementación compartida (si aplica)
- Integración de tipos en `globals.d.mts` (root) y de constantes en `constants.mts` (root)
  como parte obligatoria de la estructura del driver.

### 2.1 Wrapper (src/index.mts)
Reglas:
- `src/index.mts` **NO puede** ser un simple re-export.
- Debe exponer una clase o funciones wrapper que:
  - deleguen en la implementación específica (`__BROWSER__`)
  - añadan JSDoc
  - mantengan API estable
- Debe importar `__BROWSER__/index.mts` usando el patrón del build (ej. `__BROWSER__`).

### 2.2 Implementación por navegador (src/__BROWSER__/index.mts)
Reglas:
- Debe mapear a las APIs reales del navegador.
- Debe mantener el contrato de tipos definido por `types.d.mts`.
- Debe aislar diferencias específicas del navegador sin filtrar detalles al wrapper.

### 2.3 Types (src/types.d.mts)
Reglas:
- El driver **DEBE** definir sus tipos localmente.
- Import interno de tipos del mismo driver:
  - `import type { X } from '../types.d.mts'`
- Los drivers **NO** consumen tipos de otros drivers:
  - cada driver define sus propios tipos para mantener independencia y portabilidad
- Interfaces genéricas comunes (p.ej. `BrowserEvent`) **se duplican** localmente
  para evitar dependencias cruzadas indeseadas.
- La integracion de tipos **DEBE** reflejarse correctamente en `globals.d.mts`
  (imports/exports sin duplicados ni nombres corruptos).
- Todo driver **DEBE** registrar sus tipos en `globals.d.mts` dentro del
  namespace global `Extensio.<NamespaceDelDriver>`.

Ejemplo (globals.d.mts):
```ts
declare global {
  namespace Extensio {
    namespace Tabs {
      type TabStatusType = typeof TabStatus[keyof typeof TabStatus];
    }
  }
}
```

### 2.4 Constants (src/constants.mts)
Reglas:
- Todo string repetido o enumeración string-based debe centralizarse aquí.
- Toda enumeración **DEBE** definirse en `constants.mts` y usarse para crear tipos.
  - Objetivo: reutilizar los valores como objetos en runtime y como tipos en compile-time.
- Debe tiparse como `Record<string, string>`.
- Los drivers **NO** consumen constantes de otros drivers:
  - cada driver define sus propias constantes para mantener independencia y portabilidad
- Las constantes del driver **DEBEN** extender las constantes globales del proyecto
  para que puedan ser usadas por los módulos.
- La integracion de constantes **DEBE** reflejarse correctamente en el `constants.mts`
  del root (exports sin duplicados ni nombres corruptos).
- Todo driver **DEBE** exportar sus constantes en el `constants.mts` del root.

Ejemplo (constants.mts root):
```ts
export { TabStatus, WindowType } from '@extensio/driver-tabs/src/constants.mts';
```
- Prohibido hardcodear “magic strings” repetidos en el código del driver.

### 2.5 Common (src/common/index.mts)
Reglas:
- Solo si existe lógica compartible entre navegadores.
- No debe incluir lógica de negocio.
- Debe ser consumida por los `__BROWSER__/index.mts`, no por módulos.

### 2.6 Demo (demo/)
Reglas:
- Si un driver tiene carpeta `demo`, cualquier import hacia `src` **DEBE** usar
  el alias `__PARENT_SRC__` (nunca rutas relativas al `src`).
  - Ejemplo: `import { Tabs } from '__PARENT_SRC__/index.mts';`
- La demo **DEBE** mantener la estructura de Extensio y cumplir `constitution.extensio_architecture`.
- La demo **DEBE** generarse con `mcp_extensio-cli tools` cuando exista soporte aplicable.

---

## 3. Events (contrato obligatorio)
Los eventos **DEBEN** exponerse como wrappers que implementen una interfaz local `BrowserEvent`.

Ejemplo de forma:
- En `types.d.mts`:
  - `export interface BrowserEvent<T extends (...args: any) => void> { addListener(cb: T): void; removeListener(cb: T): void; hasListener(cb: T): boolean; }`
- En `src/__BROWSER__/index.mts`:
  - `static onCreated: BrowserEvent<(arg: X) => void> = { addListener: ..., removeListener: ..., hasListener: ... }`

Regla:
- Prohibido exponer directamente eventos crudos del navegador (ej. `chrome.tabs.onUpdated`).

---

## 4. Scoping y dependencias (aislamiento)
- Un driver no debe depender de otro driver por imports directos.
- Si necesita tipos externos, usar `Extension.*`.
- Un driver **NUNCA** debe usar otro driver; deben ser agnósticos e independientes.
- Los drivers **DEBEN** definir sus propios tipos; **NO** deben usar `@types` de otras librerías.
- Si necesita interactuar con otros drivers, hacerlo a través del dominio superior (módulo/core),
  nunca creando dependencia de paquete circular.

---

## 5. Clean Code (en drivers)
- Se aplica `clean-code.md` como contrato obligatorio para drivers.

---

## 6. Compatibilidad multi-browser
- La API del wrapper debe ser **estable** entre navegadores.
- Las divergencias deben resolverse en `__BROWSER__`.
- Si una API no existe en un navegador:
  - se define comportamiento fallback (documentado)
  - o se lanza error controlado (documentado)
- Debe evitarse divergencia silenciosa.

---

## 7. Tooling recomendado (scaffolding)
Cuando exista comando disponible, los drivers **DEBEN** generarse con `mcp_extensio-cli tools`.

Principio:
- Preferir generación por CLI para consistencia.
- Si el CLI no soporta una operación, la modificación manual es válida solo si:
  - cumple este contrato
  - queda registrada como “lección aprendida” por el `driver-agent`.

---

## 8. Auditoría de cumplimiento
Criterios mínimos de auditoría:
- estructura de carpetas correcta (Sección 2)
- wrapper no es re-export (2.1)
- types aislados (2.3)
- events como wrappers (3)
- constants centralizadas (2.4)
- no lógica de negocio (1)
- compatibilidad documentada (6)

---

## 9. Severidad
Cualquier violación de:
- estructura (Sección 2)
- types isolation (2.3)
- events wrappers (3)
- lógica de negocio en drivers (1)

se considera **SEVERITY: HIGH** y debe corregirse antes de integrar cambios.

---

## 10. Ejemplos (drivers reales)
Los ejemplos respetan la independencia entre drivers: no hay consumo de tipos ni
constantes de otros drivers dentro de un driver.

### 10.1 Enumeraciones en `constants.mts` (Tabs driver)
Fuente: `packages/drivers/tabs/src/constants.mts`
```ts
export const TabStatus: Record<string, string> = {
  Loading: 'loading',
  Complete: 'complete',
};

export const WindowType: Record<string, string> = {
  Normal: 'normal',
  Popup: 'popup',
  Panel: 'panel',
  App: 'app',
  Devtools: 'devtools',
};
```

### 10.2 Tipos derivados de constantes (Tabs driver)
Fuente: `packages/drivers/tabs/src/types.d.mts`
```ts
import { TabStatus, WindowType } from './constants.mts';

export type TabStatusType = typeof TabStatus[keyof typeof TabStatus];
export type WindowTypeType = typeof WindowType[keyof typeof WindowType];
```

### 10.3 Re-export de constantes (Tabs driver)
Fuente: `packages/drivers/tabs/src/types.d.mts`
```ts
export { TabStatus, WindowType };
```

---

### 10.4 Clase wrapper en `src/index.mts` (Tabs driver)
Fuente: `packages/drivers/tabs/src/index.mts`
```ts
import { Tabs as CommonTabs } from '__BROWSER__/index.mts';
import type { Tab, BrowserEvent } from './types.d.mts';

export class Tabs extends CommonTabs {
  static override get(tabId: number): Promise<Tab> {
    return CommonTabs.get(tabId);
  }

  static override onCreated: BrowserEvent<(tab: Tab) => void> = {
    addListener: (cb) => CommonTabs.onCreated.addListener(cb),
    removeListener: (cb) => CommonTabs.onCreated.removeListener(cb),
    hasListener: (cb) => CommonTabs.onCreated.hasListener(cb),
  };
}
```

---

### 10.5 Consumo desde Core/Modules (Navigation)
Fuente: `packages/core/src/engine/navigation/index.mts`
```ts
import { Tabs } from '@extensio/driver-tabs';
import { Windows } from '@extensio/driver-windows';

await Tabs.create({ url, active: true });
await Windows.create({ url, type: 'popup', focused: true });
```

---

### 10.6 Demo usando `__PARENT_SRC__`
Ejemplo (alias definido en `tsconfig.json` de drivers):
```ts
import { Tabs } from '__PARENT_SRC__/index.mts';
```

---

### 10.7 Extensión de globals (Prompt AI driver)
Fuente: `packages/drivers/prompt-ai/src/types.d.mts`
```ts
declare global {
  interface WindowOrWorkerGlobalScope {
    ai?: {
      languageModel: AILanguageModelFactory;
    };
  }
}
```

---

Fin de la constitución de drivers.
