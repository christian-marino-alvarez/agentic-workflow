---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 17-implementacion-loadshard-external-agnostic--esm
---

# Implementation Plan — 17-Implementación de loadShard External

## 1. Resumen del plan
- **Contexto**: Implementar la inyección de Shards en páginas externas usando iframes para garantizar aislamiento total, simplificar el Engine unificando sus listeners de mensajes, e innovar con el uso de AI para el auto-dimensionado del iframe.
- **Resultado esperado**: Un `Engine` refactorizado, un método `loadShard` capaz de inyectar iframes en sitios externos, y Shards capaces de comunicar su tamaño al host.
- **Alcance**: 
    - Refactorización de `Core` y `Engine` (listeners de mensajes).
    - Implementación de la lógica de inyección de Iframe en el `Engine`.
    - Adaptación del componente base `Shard` para el envío de dimensiones.
    - Implementación experimental de `AIDriver` para estimación de layout.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/17-implementacion-loadshard-external-agnostic--esm/task.md`
- **Analysis**: `.agent/artifacts/17-implementacion-loadshard-external-agnostic--esm/analysis.md`
- **Acceptance Criteria**: 
    - AC1: Iframe ESM multi-browser.
    - AC2: Aislamiento total vía Iframe.
    - AC3: Prefijo `extensio-`.
    - AC4: Refactorización Engine.
    - AC5: AI Layout Estimation.

**Dispatch de dominios (OBLIGATORIO si aplica)**
```yaml
plan:
  workflows:
    drivers:
      action: none
      workflow: none

  dispatch:
    - domain: core
      action: refactor
      workflow: workflow.tasklifecycle-long
    - domain: modules
      action: refactor
      workflow: workflow.tasklifecycle-long
    - domain: surfaces
      action: refactor
      workflow: workflow.tasklifecycle-long
    - domain: qa
      action: verify
      workflow: workflow.tasklifecycle-long
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Refactorización del Engine (AC4)
- **Descripción**: Eliminar el listener de `Runtime.onMessage` del constructor de `Engine` y unificar todo en `_listen` -> `onMessage`. Asegurar que `loadContext` se maneje de forma normalizada.
- **Dependencias**: Ninguna.
- **Entregables**: `packages/core/src/engine/engine.mts` refactorizado.
- **Agente responsable**: architect-agent.

### Paso 2: Implementación de Iframe Container en loadShard (AC1, AC2, AC3)
- **Descripción**: Modificar `loadShard` para detectar si el target es externo. Si lo es, crear un elemento iframe con prefijo `extensio-`, inyectarlo en el DOM y cargar el recurso de la extensión.
- **Dependencias**: Paso 1.
- **Entregables**: Lógica de inyección en `Engine`.
- **Agente responsable**: module-agent.

### Paso 3: Shard Auto-Resize & Communication (AC5)
- **Descripción**: Actualizar la clase base `Shard` para que, al montarse, implemente un `ResizeObserver` que envíe mensajes de `resize` al Engine mediante `postMessage`.
- **Dependencias**: Paso 2.
- **Entregables**: `packages/core/src/surfaces/shard.mts` actualizado.
- **Agente responsable**: surface-agent.

### Paso 4: AI Layout Estimation (AC5)
- **Descripción**: Implementar un helper/driver experimental que use la Prompt API de Chrome/Google Extensio para predecir el tamaño inicial del Shard basado en su esquema CSS y enviarlo al iframe antes de la inyección.
- **Dependencias**: Paso 3.
- **Entregables**: `AIDriver` o helper de estimación.
- **Agente responsable**: architect-agent / module-agent.

### Paso 5: Creación de la Demo y Scripts de Test (AC1-AC5) (NUEVO)
- **Descripción**: Crear una carpeta `demo` en `packages/core/demo` que actúe como una extensión funcional. Incluirá un Engine de prueba y un Shard para verificar la inyección en dominios externos. Eliminar cualquier residuo de demos previas si existen.
- **Dependencias**: Paso 4.
- **Entregables**: Scaffolding de demo en `packages/core/demo`.
- **Agente responsable**: surface-agent / qa-agent.

### Paso 6: Configuración de Scripts de Testing (AC1-AC5) (NUEVO)
- **Descripción**: Añadir scripts a `packages/core/package.json` para facilitar las pruebas:
    - `demo:manual`: `extensio build --targetPath ./demo --loadBrowser chrome --watch`
    - `demo:automation`: `playwright test test/e2e --project chromium`
- **Dependencias**: Paso 5.
- **Entregables**: `package.json` actualizado con los nuevos scripts.
- **Agente responsable**: qa-agent.

### Paso 7: Verificación E2E con Playwright (AC1-AC5)
- **Descripción**: Implementar los tests E2E en `packages/core/test/e2e` que utilicen la demo compilada para inyectar shards en páginas externas y verificar el auto-resize y ESM.
- **Dependencias**: Paso 6.
- **Entregables**: Suite de tests E2E funcional.
- **Agente responsable**: qa-agent.

---

## 4. Asignación de responsabilidades (Agentes)

- **Architect-Agent**
  - Refactorización del Core/Engine. Diseño del protocolo de comunicación Iframe-Host.
- **Module-Agent**
  - Lógica de inyección en `loadShard`. Implementación del AI Prediction helper.
- **Surface-Agent**
  - Adaptación de la clase `Shard` (ResizeObserver). Creación del Shard de demo.
- **QA / Verification-Agent**
  - Creación de la infra de demo, configuración de scripts en `package.json` y desarrollo de tests E2E.

---

## 5. Estrategia de testing y validación

- **Unit tests**: 
  - Validar que `Engine.onMessage` recibe y procesa correctamente todos los comandos tras la refactorización.
- **Integration tests**: 
  - Simular la inyección de un Iframe y verificar el flujo de mensajes `resize`.
- **E2E / Manual**: 
  - **Prueba Manual**: Ejecutar `npm run demo:manual` y verificar visualmente la inyección en una página externa.
  - **Prueba Automática**: Ejecutar `npm run demo:automation` para validar regresiones en el flujo de inyección y resize.

---

## 6. Plan de demo
- **Objetivo de la demo**: Mostrar un Shard flotante inyectado en un dominio externo que se ajusta automáticamente a su contenido usando Iframe.
- **Escenario(s)**: Navegación a un dominio externo (ej. google.com o wikipedia.org), ejecución de `loadShard` y verificación del comportamiento.
- **Componentes**:
    - `DemoEngine`: Orquesta la carga.
    - `DemoShard`: Componente visual que cambia de tamaño dinámicamente.
- **Criterios de éxito**: 
    - El Shard se renderiza en un Iframe aislado.
    - El Iframe cambia de tamaño según el contenido del Shard.
    - Sin errores de CSP o ESM en consola.

---

## 7. Estimaciones y pesos de implementación
- **Paso 1**: Bajo (Refactorización).
- **Paso 2**: Medio (Lógica de inyección).
- **Paso 3**: Medio (Comunicación cross-origin).
- **Paso 4**: Alto (Investigación AI/Prompt API).
- **Paso 5, 6, 7**: Medio (Demo & Testing Infra).

---

## 8. Puntos críticos y resolución

- **Punto crítico 1: Comunicación postMessage**
  - Riesgo: Seguridad. Recibir mensajes de cualquier origen.
  - Resolución: Validar siempre que el mensaje provenga de nuestra propia extensión verificando `event.origin`.

- **Punto crítico 2: Resize dinámico del Iframe**
  - Riesgo: Layout shift agresivo.
  - Resolución: Uso de la AI para estimar el tamaño inicial y transiciones suaves de CSS para el ajuste final.

---

## 9. Dependencias y compatibilidad
- **Chrome / Chromium**: Soporte completo para ESM e Iframe.
- **Firefox**: Soporte para Iframe con ESM interno (ventaja de nuestra arquitectura).
- **Safari**: Compatible con la estrategia de Iframe.

---

## 10. Criterios de finalización
- [ ] Engine refactorizado y unificado.
- [ ] Demo funcional en `packages/core/demo`.
- [ ] Scripts `demo:manual` y `demo:automation` operativos.
- [ ] Tests E2E pasando en Chromium.
- [ ] Auto-resize validado con AI.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: PENDING
    date: null
    comments: null
```
