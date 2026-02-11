🏛️ **architect-agent**: Análisis profundo para la implementación del Shell Unificado (Task 9).

# Analysis — 9-Unified Tabbed Shell Implementation

## 1. Resumen ejecutivo
**Problema**
Múltiples proveedores de Webview fragmentan el consumo de recursos y dificultan la gestión de estado consistente. Además, existe una inconsistencia donde los módulos de Workflow e History no están declarados en el manifiesto oficial de la extensión.

**Objetivo**
Unificar las vistas de la extensión en un solo panel lateral con pestañas (`agw.mainView`), **manteniendo la independencia total de los módulos actuales** (`chat`, `security`, `workflow`, `history`). Se implementará una arquitectura de delegación donde un proveedor único multiplexa la Webview a los controladores de cada módulo.

**Criterio de éxito**
- Registro único en `package.json`.
- Navegación fluida (Cmd+1..4) sin recargas de el bridge.
- Persistencia de estado entre pestañas mediante el Shell as-is.

## 2. Estado del proyecto (As-Is)
- **Estructura relevante**
  - `src/extension/modules/`: Módulos con controladores redundantes (`ChatController`, `SecurityController`, `WorkflowController`, etc.).
  - `src/extension/index.ts`: Punto de registro de todos los controladores vía `ModuleRouter`.
- **Componentes existentes**
  - `AgwViewProviderBase`: Ya implementa la lógica de ACKs y logs, pero está diseñado para una relación 1:1 con un `viewId`.
- **Limitaciones detectadas**
  - Solo un `viewId` puede estar activo en el sidebar a la vez si queremos una sola Webview.
  - El sistema actual de comandos (`chatView.focus`) se romperá al eliminar los viewIds antiguos.

## 3. Cobertura de Acceptance Criteria

### AC-1: Multiplexor único (AgwMainViewProvider)
- **Interpretación**: Crear un proveedor central que registre `agw.mainView` y delegue la instancia de la `WebviewView` a los controladores de módulo según sea necesario.
- **Verificación**: Un único registro en `package.json`. Los controladores existentes siguen existiendo pero ya no implementan `WebviewViewProvider`.
- **Riesgos**: Gestión de ciclo de vida (cuándo se inyecta la webview en cada controlador).

### AC-2: Preservación de Estructura de Módulos (REQUISITO CRÍTICO)
- **Interpretación**: Los archivos en `src/extension/modules/*` deben permanecer aislados. No se permite fusionar lógica de `Chat` con `Security`.
- **Verificación**: Cada módulo mantiene su propio Router y Controller. El Shell simplemente actúa como el "cableado" que los conecta a la interfaz.

### AC-3: Persistencia de Estado
- **Interpretación**: Asegurar que al cambiar de pestaña el estado de la UI (inputs, filtros) no se pierda.
- **Verificación**: El Shell mantendrá los componentes en el DOM (vía `hidden` o renderizado condicional inteligente) para preservar su estado interno de Lit.

## 4. Research técnico (Resumen)
- **Patrón de Delegación**: El `AgwMainViewProvider` actuará como un "Proxy". Al recibir `onResolve(webviewView)`, notificará a todos los controladores registrados interesadas para que puedan suscribirse a sus eventos de bridge.
- **Namespacing**: Se utilizará el campo `domain` en el payload de mensajes para evitar que un mensaje de `Workflow` sea procesado por el handler de `Security`.

## 5. Agentes participantes

- **🏛️ architect-agent**
  - Diseño del `AgwMainViewProvider` y del sistema de namespaces.
- **Implementation-Agent (Neo)**
  - Implementación del Shell functional.
  - Refactor de `package.json`.

**Componentes necesarios**
- Modificación de: `package.json`, `src/extension/extension.ts`.
- Creación de: `src/extension/core/background/main-view-provider.ts`.

## 6. Impacto de la tarea
- **Arquitectura**: Paso de **Multi-Provider** a **Unified Provider Pattern**.
- **APIs / contratos**: Introducción de un `domain` en el payload de los mensajes para que el Shell sepa a qué componente Lit dirigir la información.
- **Compatibilidad**: Rompe la compatibilidad con instalaciones previas (necesario recargar extensión para ver los nuevos View IDs).

## 7. Riesgos y mitigaciones
- **Riesgo 1**: Inutilización de atajos de teclado de VS Code.
  - **Mitigación**: Re-mapear los atajos nativos en `package.json` para que el comando invoque una acción interna del Shell.
- **Riesgo 2**: Overhead de memoria al mantener 4 vistas en un solo Webview.
  - **Mitigación**: Garbage collection agresiva de datos no visibles.

## 8. TODO Backlog (Consulta obligatoria)
- **Estado actual**: Vacío.

---

## 10. Aprobación
Este análisis requiere aprobación explícita del desarrollador.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-11T08:16:00Z"
    comments: "Estrategia de multiplexación aprobada. Mantener estructura de módulos es prioridad."
```
