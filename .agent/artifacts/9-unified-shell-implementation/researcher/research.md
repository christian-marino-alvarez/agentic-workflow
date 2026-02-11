🔬 **researcher-agent**: Investigación técnica para la unificación de vistas y soporte A2UI.

# Research Report — 9-Unified Tabbed Shell Implementation

## 1. Resumen ejecutivo
**Problema investigado**: Fragmentación de la arquitectura de Webviews (múltiples proveedores) e inconsistencia entre el código de módulos y la declaración en `package.json`.
**Objetivo**: Identificar los puntos de anclaje para unificar el registro en un único provider (`agw.mainView`) y asegurar compatibilidad con el bridge actual.
**Evidencias**:
- Solo `keyView` y `chatView` están registrados en `package.json`.
- Los controladores de `Workflow` y `History` existen pero son "invistibles".
- `AgwViewProviderBase` ya soporta streaming con ACKs, listo para A2UI.

## 2. Necesidades detectadas
- **Unificación de Manifiesto**: El `package.json` debe consolidar los 4 dominios bajo `agw.mainView`.
- **Orquestación de Mensajes**: El bridge debe multiplexar mensajes entre el Shell Único y los routers de cada módulo.
- **Persistencia en Lit**: Necesidad de usar Lit Signals o Estado compartido para evitar recargas constantes al cambiar de tabs.

## 3. Profundización Técnica y Hallazgos

### Hallazgo 1: Inconsistencia en Manifest
- **Descripción**: `package.json` declara `keyView` (Security) y `chatView` (Chat). Sin embargo, existen carpetas y controladores para `workflow` y `history` que utilizan IDs (`workflowView`, `historyView`) no registrados.
- **Impacto**: La unificación a `agw.mainView` resolverá este "gap" arquitectónico al permitir que el Shell cargue los componentes Lit de estos módulos dinámicamente.

### Hallazgo 2: Bridge y Capacidad de Streaming
- **Descripción**: La clase `AgwViewProviderBase` implementa un sistema de reintentos (MAX_ATTEMPTS=3) y ACKs.
- **Estado Técnico**: Compatible con SSE. `ChatController` ya usa `postMessage` con `expectAck: true` para tokens individuales (L182 de `background.ts`).
- **Referencia**: `src/extension/core/background/controller.ts:120`.

### Hallazgo 3: Estructura de ModuleRouter
- **Descripción**: `ModuleRouter` actúa como un factory simple. No orquesta la comunicación entre vistas. 
- **Límite**: Actualmente, el cambio de pestaña en `SecurityController` (GoChat) lanza un comando global de VS Code (`chatView.focus`).
- **Seguridad**: Se utiliza `crypto.randomUUID()` para cada mensaje, garantizando unicidad y trazabilidad.

## 4. APIs y Contratos Relevantes
- **registerWebviewViewProvider(viewId: string, provider: WebviewViewProvider)**: API de VS Code que se centralizará.
- **onMessage(MessageType.StateUpdate)**: Contrato que deberá ser extendido para incluir el estado de la pestaña activa globalmente.

## 5. Matriz de Compatibilidad y Entorno
| Componente | Soporte Extension Host | Soporte Webview | Notas |
|---|---|---|---|
| Lit Elements | N/A | Full | Base del Shell. |
| SSE Streaming | Full | via postMessage | Bridge ya verificado. |
| Secrets Storage | Full | N/A | Accedido vía Background. |

## 7. Riesgos Críticos Documentados
- **Riesgo**: Colisión de Nombres en el Bridge.
- **Severidad**: Media.
- **Evidencia**: Si los módulos `chat` y `workflow` usan el mismo `MessageType`, el Shell Único podría confundir los destinos sin un namespace claro.

## 9. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-11T08:13:00Z"
    comments: "Investigación aprobada. Proceder con el análisis de impacto y namespaces."
```
