---
id: constitution.core-module
type: rule
owner: architect-agent
version: 1.0.0
severity: PERMANENT
scope: module:core
---

# CONSTITUTION: Core Module

## 1. Identidad y Propósito
El módulo `Core` (`src/extension/modules/core`) es un conjunto de **Clases Base Abstractas** que definen el contrato del sistema.
- **Objetivo**: Proveer los cimientos arquitectónicos (Messaging, Lifecycle, Logger) para que los módulos funcionales extiendan de ellos.
- **Naturaleza**: Todo en Core debe ser, por defecto, `abstract` o una utilidad pura. Implementaciones concretas son excepciones mínimas.

## 2. Arquitectura de Capas

### 2.1 Lifecycle Layer (`App` Class)
- **Base**: `App` (Abstract Class).
- **Instanciación**: La extensión se activa instanciando una clase concreta que herede de `App`.
- **Registro**: Centraliza el registro de módulos via `this.register(id, provider)`.
- **Logger**: Inicializa el `Logger` centralizado (`vscode.OutputChannel`) en el constructor.

### 2.2 Background Layer (`core/background`)
- **Base**: `Background` (Abstract Class).
- **Responsabilidad**: Orquestación, Lógica de Negocio y Ciclo de Vida del WebviewProvider.
- **Regla de Tag**: Requiere un `viewTagName` en el constructor para definir el componente raíz de la UI.
- **Regla de HTML**: El método `getHtmlForWebview` es `abstract`. Las subclases DEBEN proveer el bootloader.

### 2.3 View Layer (`core/view`)
- **Base**: `View` (Abstract Class extends LitElement).
- **Responsabilidad**: Capa base para componentes UI en el navegador.
- **Estructura**: Sigue estrictamente la constitución `view-layer` (Separación de lógica y templates).
- **Logging**: Utiliza `this.log()` estilizado para visibilidad en consola del navegador.

### 2.4 Backend Layer (`core/backend`)
El módulo exporta dos abstracciones base para la implementación del lado del servidor:

#### A. AbstractBackend (Server Owner)
- **Clase**: `AbstractBackend`.
- **Uso**: Para módulos que poseen y gestionan su propio proceso de servidor (Sidecar).
- **Responsabilidad**: Iniciar servidor Fastify, gestionar ciclo de vida, health checks y endpoints base.

#### B. VirtualBackend (Server Guest)
- **Clase**: `VirtualBackend`.
- **Uso**: Para módulos que inyectan funcionalidad en un servidor existente (e.g., Chat en AppServer).
- **Responsabilidad**: Definir comandos/rutas que serán montados por el servidor anfitrión. NO gestiona proceso ni puerto.

- **IO**: Encapsulado en `MessagingBackend`.

## 3. Sistema de Registro y Mensajería

### 3.1 Logger Centralizado (`core/logger.ts`)
- **Punto de Verdad de Trazabilidad**: El `Logger` escribe simultáneamente en un `vscode.OutputChannel` dedicado ("Agentic Workflow") y en la consola de depuración.
- **Uso Obligatorio**: Todas las clases base (`App`, `Background`, `Backend`, `View`) DEBEN disponer y usar un método `log()` interno que delegue en este sistema.

### 3.2 Protocolo de Mensajes
Todo mensaje DEBE cumplir la interfaz estricta definida en `core/types.d.ts`. No se permiten payloads ad-hoc sin tipado en `from`, `to` y `origin`.

## 3.3 Tests
- **Ubicación**: Todos los tests deben residir en `src/extension/modules/<modulo>/test/unit`.
- **Prohibición**: No se permiten carpetas `test` anidadas dentro de subdirectorios funcionales (ej: `backend/test` ❌).

## 4. Gestión de Dependencias y Limpieza
- **Cero Dependencias Circulares**: Core no depende de ningún módulo funcional (`app`, `chat`, etc.).
- **Minimalismo**: El código muerto (decorators obsoletos, constantes de ciclo de vida antiguas como `ViewStage`) debe ser eliminado inmediatamente.
- **Types Co-localizados**: Los tipos compartidos residen en `core/types.d.ts`.

## 5. Extensibilidad
- Core es **cerrado a modificación, abierto a extensión**.
- Cualquier cambio en la infraestructura base DEBE ser validado por el `architect-agent` y reflejado en este documento.

---
**Cualquier violación de esta constitución invalida el Pull Request inmediatamente.**
