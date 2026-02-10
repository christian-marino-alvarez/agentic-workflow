---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 7-chatkit-integration
---

# Analysis — 7-chatkit-integration

🏛️ **architect-agent**: Análisis técnico para la migración de la UI de chat a OpenAI ChatKit.

## 1. Resumen ejecutivo
**Problema**
La interfaz de chat actual es un "placeholder" primitivo que no soporta las ricas capacidades del backend de ChatKit (markdown, hilos, streaming avanzado, widgets interactivos).

**Objetivo**
Integrar el componente web oficial de ChatKit para ofrecer una experiencia de chat de nivel de producción, integrada con el backend de Fastify y el diseño de VS Code.

**Criterio de éxito**
- Integración exitosa vía npm.
- ChatKit consumiendo el stream SSE del backend local.
- Estilos perfectamente alineados con el tema de VS Code mediante OOCSS.

---

## 2. Estado del proyecto (As-Is)
**Estructura relevante**
- `src/extension/modules/chat/web/`: Contiene la vista actual (`view.ts`) y plantillas Lit.
- `src/extension/modules/chat/backend/chatkit/`: Contiene el protocolo y rutas del backend que ya implementan SSE.

**Componentes existentes**
- `ChatView`: Web component Lit que carga `renderMain`.
- `ChatBackendClient`: Cliente que se comunica con el sidecar.
- `chatkit-routes.ts`: Implementación de referencia para hilos y mensajes asistidos.

**Limitaciones detectadas**
- El bundle actual de webviews debe incluir las nuevas dependencias de npm.
- La gestión de `Session Key` debe ser fluida para que ChatKit se conecte al backend sin fricción.

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Integración npm
- **Interpretación**: Añadir `@openai/chatkit` a `package.json` y asegurar que el bundler (`esbuild`) lo incluya.
- **Verificación**: El componente `<openai-chatkit>` se registra y renderiza en el webview.
- **Riesgos**: Aumento de tamaño del bundle.

### AC-2: Sesión única reiniciable
- **Interpretación**: Configurar ChatKit para usar un único hilo por sesión de webview.
- **Verificación**: Al recargar la vista o iniciar nueva tarea, se crea un hilo nuevo pero solo se interactúa con uno a la vez.

### AC-3: Minimalismo de Tools
- **Interpretación**: Configurar las opciones de visualización de ChatKit para ocultar detalles técnicos excesivos de las llamadas a funciones.
- **Verificación**: Las llamadas a herramientas se muestran como indicadores de progreso simples.

### AC-4: Respeto al Tema VS Code + OOCSS
- **Interpretación**: Mapear `--vscode-*` a las variables de ChatKit y usar clases OOCSS para overrides.
- **Verificación**: El chat cambia de Dark a Light automáticamente según VS Code.

---

## 4. Research técnico
**Enfoque seleccionado**: Integración Directa como Custom Element.
ChatKit es agnóstico al framework. Lo inyectaremos directamente en la plantilla Lit (`renderMain`) pasando la configuración mediante propiedades o atributos.

---

## 5. Agentes participantes
- **ui-agent**:
  - Responsabilidades: Implementación del componente visual, mapeo de CSS y eliminación de la UI antigua.
- **architect-agent**:
  - Responsabilidades: Definición de contratos, validación de integración y supervisión de la visibilidad.

**Handoffs**
El análisis aprobado servirá como input para que `ui-agent` ejecute la implementación en Fase 4.

**Componentes necesarios**
- Modificar `view.ts` para registrar el nuevo componente.
- Crear `chatkit-styles.ts` con el mapeo de temas.

**Demo**
No se requiere demo adicional, la propia vista de Chat es la funcionalidad core.

---

## 6. Impacto de la tarea
- **Arquitectura**: Ninguno mayor; es una mejora de la capa de presentación.
- **APIs / contratos**: Sincronización de la obtención de `SessionToken` desde el frontend.
- **Compatibilidad**: Reemplazo total de la UI de "Demo logs".

---

## 7. Riesgos y mitigaciones
- **Inyección de estilos**: ChatKit usa Shadow DOM, lo que protege los estilos internos pero dificulta algunos overrides. *Mitigación*: Uso extensivo de CSS variables soportadas por el componente.

---

## 9. TODO Backlog (Consulta obligatoria)
**Referencia**: `.agent/todo/`
**Estado actual**: 0 items relevantes para esta tarea.

---

## 10. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-10T17:58:00Z
    comments: Aprobado por el desarrollador. Procediendo a la planeación.
```
