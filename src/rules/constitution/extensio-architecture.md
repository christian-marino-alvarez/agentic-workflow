---
trigger: always_on
---

# EXTENSIO ARCHITECTURE - FRAMEWORK RULES

Este documento define los **principios arquitectónicos fundamentales** del framework Extensio.
Para reglas contractuales detalladas de cada componente, consultar su constitución específica.

---

## 1. PRINCIPIOS ARQUITECTÓNICOS (PERMANENT)

### 1.1 Filosofía Base
Extensio es un framework para construir extensiones de navegador complejas
de forma modular, reactiva y predecible.

Su filosofía se basa en los siguientes principios:

- Separar estrictamente la lógica de negocio de las APIs del navegador (Drivers) y de la UI (Surfaces).
- Aislar cada dominio funcional en paquetes independientes del monorepo, sin dependencias cruzadas.
- Utilizar un modelo reactivo como único mecanismo de comunicación entre los módulos.
- Priorizar la predecibilidad del comportamiento frente a la flexibilidad implícita.
- Diseñar el sistema para escalar en complejidad sin degradar mantenibilidad.
- Mantener el código agnóstico del navegador y del entorno de ejecución.

### 1.2 Independencia y Dirección de Dependencias
- Todos los paquetes DEBEN ser independientes y versionables.
- El acoplamiento directo entre paquetes del mismo tipo está PROHIBIDO.
- El uso de capacidades externas DEBE realizarse exclusivamente mediante Drivers.
- Core NO DEBE conocer ni depender de ningún paquete del proyecto.

### 1.3 Prohibición de Dependencias Cruzadas
- Un módulo NO DEBE depender de otro módulo.
- Un driver NO DEBE depender de otro driver.
- El uso de drivers por parte de los módulos NO constituye una dependencia conceptual.
- Ningún paquete DEBE introducir ciclos de dependencias, directos o indirectos.

### 1.4 Separación de Responsabilidades
- El principio SRP (Single Responsibility Principle) DEBE aplicarse estrictamente.
- Está PROHIBIDO mezclar UI con lógica de negocio dentro de módulos.
- Los drivers NO DEBEN contener lógica de negocio.
- Los bucles reactivos están PROHIBIDOS.

---

## 2. SCOPES DEL FRAMEWORK (PERMANENT)

El framework define tres scopes principales. Cada uno tiene su propia constitución con reglas detalladas.

### 2.1 Engine
- El Engine es el componente central y obligatorio de todo módulo.
- Se ejecuta en el entorno de Service Worker.
- Es responsable del estado reactivo y persistente del módulo.
- **NO DEBE** renderizar UI ni acceder al DOM.
- **Constitución detallada**: `constitution.modules`

### 2.2 Context
- Un Context es una extensión opcional del Engine.
- Encapsula lógica que requiere acceso al DOM o APIs no disponibles en el Service Worker.
- El Engine controla completamente el ciclo de vida del Context.
- **NO DEBE** contener lógica de negocio ni renderizar UI.
- **Constitución detallada**: `constitution.modules`

### 2.3 Surfaces
Las Surfaces representan la capa visual del framework. Se dividen en:

#### Pages
- Documentos completos que se renderizan en un tab del navegador.
- Representan vistas de alto nivel (opciones, dashboards).
- **Constitución detallada**: `constitution.pages`

#### Shards
- Componentes visuales reutilizables (WebComponents).
- Componentes de UI puros, sin estado persistente propio.
- **Constitución detallada**: `constitution.shards`

---

## 3. DRIVERS (PERMANENT)

Los Drivers son adaptadores que envuelven APIs del navegador.
Representan la frontera de efectos laterales del sistema.

**Constitución detallada**: `constitution.drivers`

---

## 4. CORE PACKAGE (PERMANENT)

- Core DEBE exponer Engine, Context y Surfaces.
- Core DEBE proveer el sistema reactivo (@property, @onChanged).
- Core NO DEBE depender de ningún paquete del proyecto.
- Core NO DEBE contener lógica de negocio de ningún módulo.

---

## 5. EXTENSIO CLI (PERMANENT)

El tool `mcp_extensio-cli` es el ÚNICO punto de entrada para build y test.
- Unit e Integration **DEBEN** ejecutarse con **Vitest**.
- E2E **DEBE** ejecutarse con **Playwright**.
- Scaffolding de módulos, drivers y surfaces **DEBE** usar `mcp_extensio-cli`.

---

## 6. ORDEN DE COMPOSICIÓN DE CLASES (PERMANENT)

1. Propiedades estáticas
2. Métodos estáticos
3. Propiedades de instancia
4. Constructor
5. Event handlers
6. Métodos privados
7. Métodos públicos

---

## 7. CONSTITUCIONES ESPECÍFICAS

Para reglas contractuales detalladas, consultar:

| Componente | Constitución |
|------------|--------------|
| Módulos | `constitution.modules` |
| Drivers | `constitution.drivers` |
| Pages | `constitution.pages` |
| Shards | `constitution.shards` |
| Clean Code | `constitution.clean_code` |

---
