🏛️ **architect-agent**: Análisis profundo para la migración a Unified Tabbed View y A2UI.

# Analysis — 8-ADR e Inclusión en el Roadmap: Unified Tabbed Chat View

## 1. Resumen ejecutivo
**Problema**
La arquitectura actual utiliza 4 Webviews independientes (Chat, Workflow, History, Security) para el sidebar de VS Code. Esto genera:
1.  **Overhead de Performance**: Cada Webview consume memoria y procesos de renderizado de Chromium.
2.  **UX Fragmentada**: No hay una navegación fluida ni persistencia de estado compartida fácil entre vistas.
3.  **Rigidez de UI**: ChatKit impide inyectar componentes interactivos propios (A2UI) dentro de la conversación.

**Objetivo**
Unificar las vistas en un único componente host (`<agw-unified-shell>`) y migrar el chat a un sistema extensible basado en Lit + A2UI Protocol.

**Criterio de éxito**
- Cumplimiento de los AC definidos en el `task.md`.
- Reducción del uso de recursos al cargar una sola instancia de Webview.
- Soporte nativo para botones y formularios interactivos mediante A2UI.

## 2. Estado del proyecto (As-Is)
- **Estructura relevante**
  - `src/extension/modules/`: Contiene los módulos de `chat`, `workflow`, `history` y `security`.
  - Cada módulo tiene su propio `AgwViewProviderBase` y registra su propio `viewId` en `package.json`.
- **Componentes existentes**
  - `AgwViewProviderBase` e `AgwViewBase`: Clases base que ya gestionan ACKs y logs, lo que facilita el soporte de streaming para A2UI.
- **Límites detectados**
  - ChatKit es un Iframe opaco; no podemos acceder a su Shadow DOM para añadir pestañas superiores integradas.
  - La sincronización de estado (modelos, claves) entre las 4 vistas requiere una orquestación costosa en el Background.

## 3. Cobertura de Acceptance Criteria

### AC-1: Unificar tabs, standalone y migración a componentes lit
- **Interpretación**: Crear un único `WebviewViewProvider` que renderice un componente Lit con navegación interna (Tabs).
- **Verificación**: Solo un `viewId` consumirá recursos en el sidebar; las pestañas alternarán componentes Lit en memoria.
- **Riesgos**: Posible pérdida de estado al cambiar de pestaña si no se gestiona correctamente con Lit `@state()`.

### AC-2: Performance y Accesibilidad (Prioridad)
- **Interpretación**: Priorizar la velocidad de carga eliminando Iframes externos y asegurar navegación por teclado.
- **Verificación**: Benchmarks de memoria y pruebas con Screen Reader / Teclado.
- **Riesgos**: Accesibilidad en Web Components (Shadow DOM) requiere gestión manual de foco.

### AC-3: Roadmap y ADR
- **Interpretación**: Documentar formalmente la decisión y actualizar el backlog.
- **Verificación**: Archivo ADR creado y `ROADMAP-BACKLOG.md` modificado con los hito: Tabs -> Standalone Shell -> A2UI.

## 4. Research técnico (Resumen)
Basado en `research.md`:
- **Protocolo A2UI**: Se utilizará la versión v0.8. Permite enviar UI declarativa en JSON.
- **Lit Shell**: Implementación 100% personalizada para el historial de mensajes e input, integrando el catálogo de componentes nativos de VS Code.

## 5. Agentes participantes

- **🏛️ architect-agent**
  - Responsable de la definición del ADR y la orquestación del Roadmap.
- **🔬 researcher-agent** (Fase 1 completada)
  - Investigación de APIs y compatibilidad.

**Componentes necesarios**
- Modificación de: `package.json` (unificar views), `controller.ts` (Core).
- Creación de: `<agw-unified-shell>`, `<agw-chat-standalone>`.

## 6. Impacto de la tarea
- **Arquitectura**: Cambio de arquitectura multi-webview a **Unified Host Architecture**.
- **APIs / contratos**: El bridge de comunicación deberá soportar el payload de A2UI (`surface_update`).
- **Compatibilidad**: Breaking change para los módulos actuales si no se migran al Unified Host.

## 7. Riesgos y mitigaciones
- **Riesgo 1**: Inestabilidad de A2UI v0.8.
  - **Mitigación**: Implementar un fallback a Markdown estándar si el renderizado de A2UI falla.
- **Riesgo 2**: Complejidad en el refactor del Core View Provider.
  - **Mitigación**: Seguir la estrategia de 3 fases (Tabs -> Shell -> A2UI) para validar incrementos.

## 8. TODO Backlog (Consulta obligatoria)
- **Estado actual**: Vacío.
- **Items relevantes**: Ninguno detectado.

---

## 10. Aprobación
Este análisis requiere aprobación explícita del desarrollador.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-11T07:23:00Z"
    comments: "Análisis aprobado. Proceder con el Planning y la redacción del ADR."
```
