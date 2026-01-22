---
trigger: model_decision
description: Se aplica cuando se crean, modifican o auditan módulos, o cuando un agente toma decisiones sobre ellos, garantizando estructura contractual, reactividad y cumplimiento arquitectónico.
---

---
id: constitution.modules
type: rule
owner: architect-agent
version: 2.0.0
severity: PERMANENT
scope: global
---

# CONSTITUTION: Módulos (Extensio)

## Objetivo
Este documento define **reglas obligatorias** y contractuales para los módulos de Extensio.
Todo módulo **DEBE** cumplir estas reglas.
El `role.module-agent` **DEBE** auditar y hacer cumplir este contrato.

---

## 1. Definición (qué es un módulo)

Un módulo es una **unidad de negocio** que organiza lógica reactiva y persistente.

Un módulo:
- Gobierna un dominio funcional concreto
- Expone un estado reactivo propio
- Interactúa con drivers mediante APIs

Un módulo **NO**:
- Es UI (las Surfaces son sus vistas)
- Contiene drivers (los consume como puertos)
- Depende de otros módulos

---

## 2. Scopes del Módulo

| Scope | Obligatorio | Descripción |
|-------|-------------|-------------|
| **Engine** | ✅ Sí | Componente central. Se ejecuta en Service Worker. Gestiona estado reactivo. |
| **Context** | ❌ Opcional | Extensión del Engine para lógica que requiere DOM o APIs no disponibles en SW. |
| **Surfaces** | ❌ Opcional | Capa visual: Pages (documentos) y Shards (componentes). |

**Regla**: Si existe Context o Surfaces, **DEBE** documentarse el motivo y relación con Engine.

---

## 3. Estructura Obligatoria

Cada módulo **DEBE** seguir esta estructura mínima:

```
packages/modules/<module-name>/
├── src/
│   ├── index.mts              # Entry point público
│   ├── types.d.mts            # Tipos locales del módulo
│   ├── constants.mts          # Constantes tipadas
│   ├── engine/
│   │   └── index.mts          # Engine del módulo (OBLIGATORIO)
│   ├── context/               # (si aplica)
│   │   └── index.mts
│   └── surface/
│       ├── pages/
│       │   └── index.mts      # Índice de Pages (si usa Pages)
│       └── shards/
│           └── index.mts      # Registro de Shards (si usa Shards)
├── package.json
└── tsconfig.json
```

### 3.1 Types (`src/types.d.mts`)

- El módulo **DEBE** definir sus tipos localmente.
- Import interno: `import type { X } from '../types.d.mts'`
- Los módulos **NO** consumen tipos de otros módulos directamente.
- Tipos consumidos externamente **DEBEN** registrarse en `global.d.mts`:

```ts
// global.d.mts
declare global {
  namespace Extensio {
    namespace SessionManager {
      export type SessionState = SessionState;
      export type SessionConfig = SessionConfig;
    }
  }
}
```

### 3.2 Constants (`src/constants.mts`)

- Todo string repetido o enumeración string-based debe centralizarse aquí.
- Toda enumeración **DEBE** definirse como `Record<string, string>`.
- Prohibido hardcodear "magic strings" en el código.

```ts
// constants.mts
export const SessionStatus = {
  Active: 'active',
  Idle: 'idle',
  Expired: 'expired',
} as const;

export type SessionStatusType = typeof SessionStatus[keyof typeof SessionStatus];
```

### 3.3 Naming Conventions

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Archivos/carpetas | kebab-case | `session-manager/`, `user-profile.mts` |
| Clases | PascalCase | `SessionManagerEngine`, `UserProfileContext` |
| Registro de Shards | kebab-case con guión | `session-manager-widget` |
| Namespace global | PascalCase | `Extensio.SessionManager` |

---

## 4. Ciclo de Vida del Módulo (PERMANENT)

Todo módulo **DEBE** respetar estrictamente la siguiente secuencia:

### Secuencia de Ejecución

| # | Método | Tipo | Descripción |
|---|--------|------|-------------|
| 1 | `run()` | Público | Único punto de entrada. Inicia el ciclo completo. |
| 2 | `_setup()` | Privado (Core) | Inicializa infraestructura reactiva. **NO sobrescribir.** |
| 3 | `_listen()` | Privado (Core) | Registra listeners internos del framework. **NO sobrescribir.** |
| 4 | `setup()` | Público | Configuración del dominio. **NO acceder a props persistentes.** |
| 5 | `listen()` | Público | Registro de listeners con `@onChanged`. **NO lógica de negocio.** |
| 6 | `loadProps()` | Interno | Carga propiedades persistentes desde storage. |
| 7 | `start()` | Público | Ejecución inicial. **PUEDE** leer props y ejecutar lógica. |

### Reglas del Ciclo de Vida

- `run()` es el **único** punto de arranque.
- `_setup()` y `_listen()` son privados y gestionados por Core.
- `setup()` y `listen()` **NO DEBEN** acceder a estado persistente.
- `start()` es el primer punto donde se puede leer estado y ejecutar lógica inicial.

---

## 5. Reactividad (PERMANENT)

### Decoradores Obligatorios

| Decorador | Uso | Regla |
|-----------|-----|-------|
| `@property` | Declarar propiedades persistentes | **OBLIGATORIO** para todo estado reactivo |
| `@onChanged` | Reaccionar a cambios de propiedades | **OBLIGATORIO** para listeners |

### Sincronización

En clases que extienden de Core (Engine, Context):
- **OBLIGATORIO** usar `await this.waitingLoadProps()` si un listener accede a props reactivas.

```ts
@onChanged('session')
async onSessionChanged(value: SessionState) {
  await this.waitingLoadProps();
  // Ahora es seguro acceder a otras props
}
```

### Event Listeners de Drivers (PERMANENT)

**REGLA OBLIGATORIA**: Los event listeners de drivers **SIEMPRE** deben registrarse en `listen()`, **NUNCA** en `start()`.

```ts
// ❌ INCORRECTO - Event listener en start()
override async start() {
  Runtime.onInstalled.addListener(...); // MAL
}

// ✅ CORRECTO - Event listener en listen()
override async listen() {
  // Event listeners de drivers DEBEN estar aquí
  Runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install' || details.reason === 'update') {
      this.handleInstall();
    }
  });
  
  Tabs.onActivated.addListener((info) => {
    this.handleTabActivated(info);
  });
}
```

**Justificación**: El método `listen()` es el espacio designado para configurar event listeners en extensiones. Esto garantiza:
- Separación clara entre inicialización (`start()`) y escucha de eventos (`listen()`)
- Coherencia con el ciclo de vida de Extensio
- Facilita testing y debugging

---

## 6. Aislamiento (PERMANENT)

- Un módulo **NO PUEDE** depender de otro módulo.
- No se permiten dependencias cruzadas (ni directas ni indirectas).
- Los drivers se consumen como **puertos de acceso**, sin acoplamiento conceptual.
- El módulo **NO CONOCE** la implementación interna del driver.

---

## 7. Integración con Surfaces

### 7.1 Pages (`src/surface/pages/index.mts`)

Si el módulo define Pages:
- Este archivo es **OBLIGATORIO**.
- **Responsabilidad**: Importar archivos `.html` y exportar URLs resueltas.

```ts
// src/surface/pages/index.mts
import dashboard from "./dashboard/dashboard.html";
export const Pages = { dashboard };
```

- El Engine debe importar este índice para que el CLI detecte las páginas.

### 7.2 Shards (`src/surface/shards/index.mts`)

Si el módulo implementa Shards:
- Este archivo es **OBLIGATORIO**.
- **Único lugar** donde se registran los WebComponents.
- Usar `Shard.register(tagName, ComponentClass)`.

```ts
// src/surface/shards/index.mts
import { Shard } from '@extensio/core/shard';
import { MyShard } from './my-shard.mts';

Shard.register('my-module-shard', MyShard);
export { MyShard };
```

- El Engine debe importar los Shards para que el CLI los compile independientemente.

---

## 8. Tooling

- Los módulos **DEBEN** generarse con `mcp_extensio-cli` cuando esté disponible.
- Si no existe soporte CLI, la creación manual es válida solo si:
  - Cumple este contrato
  - Queda registrada como lección aprendida

---

## 9. Auditoría

Criterios mínimos de auditoría para un módulo:

| Criterio | Verificación |
|----------|--------------|
| Estructura de carpetas | Conforme a §3 |
| Ciclo de vida | Conforme a §4 |
| Reactividad | `@property` y `@onChanged` correctos |
| Types/Constants | Aislados en sus archivos |
| Aislamiento | Sin dependencias cruzadas |
| Surfaces indexadas | Si aplica, conforme a §7 |

---

## 10. Severidad

Cualquier violación de:
- Estructura (§3)
- Ciclo de vida (§4)
- Reactividad (§5)
- Aislamiento (§6)

se considera **SEVERITY: HIGH** y bloquea la validación del módulo.

---
