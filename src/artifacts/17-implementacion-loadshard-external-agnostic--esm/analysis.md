---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 17-implementacion-loadshard-external-agnostic--esm
---

# Analysis — 17-Implementación de loadShard External

## 1. Resumen ejecutivo
**Problema**
- Actualmente, `loadShard` en el `Engine` es básico y no está optimizado para páginas de terceros (externas).
- Falta de aislamiento estricto (Shadow Root closed).
- Incompatibilidad de ESM en Firefox Content Scripts.
- Duplicidad de listeners de mensajes en el `Engine` que complica el mantenimiento.

**Objetivo**
- Implementar una inyección de Shards agnóstica y aislada para páginas externas, soportando ESM nativo (Chrome) y un bundle fallback (Firefox).
- Refactorizar el `Engine` para unificar la gestión de mensajes.
- Innovar con estimación de layout vía AI para mitigar saltos visuales (CLS).

**Criterio de éxito**
- Todos los Acceptance Criteria de `task.md` cubiertos y verificables.
- Un solo punto de entrada para `Runtime.onMessage` en el `Engine`.

---

## 2. Estado del proyecto (As-Is)
- **Engine**: Localizado en `packages/core/src/engine/engine.mts`. Tiene `loadShard` usando `Scripting.executeScript`.
- **Message Handling**: Existen dos listeners de `Runtime.onMessage` (uno en el constructor para `loadContext` y otro en `_listen` para el resto).
- **Core**: `packages/core/src/engine/core.mts` define la clase base con métodos de log y propiedades.
- **Build System**: `packages/cli/src/commands/build.mts` y `process-shards.mts` gestionan la compilación, pero no diferencian estrategias por browser para Shards externos.

---

## 3. Cobertura de Acceptance Criteria

### AC1: Soporte Multi-browser (Iframe ESM)
- **Interpretación**: Se inyectará un iframe que apunta a un recurso interno de la extensión. Esto permite usar ESM nativo en todos los navegadores (incluyendo Firefox) sin necesidad de inyectar nada complejo en el DOM del huésped.
- **Verificación**: Inspección de red verificando que el iframe carga desde `chrome-extension://`.
- **Riesgos**: Mínimos, el iframe es el método más estándar.

### AC2: Aislamiento (iFrame Total)
- **Interpretación**: El aislamiento es físico mediante el iframe. No se requiere Shadow DOM adicional para el Shard raiz, aunque el Shard interno puede usarlo.
- **Verificación**: Comprobar que los estilos globales de la página host no entran en el Shard.

### AC3: Registration (Prefijo extensio-)
- **Interpretación**: El contenedor iframe en la página huésped tendrá el ID o la clase con prefijo `extensio-`.
- **Verificación**: Verificación en el DOM de la página host.

### AC4: Refactorización Engine
- **Interpretación**: Eliminar el listener del constructor y centralizar todo en `onMessage` vía `_listen`.
- **Verificación**: Tests unitarios del `Engine` y trazas de ejecución.

### AC5: AI Layout Estimation (Innovación)
- **Interpretación**: Usar Gemini Nano para predecir el tamaño del contenido y ajustar el iframe del Shard dinámicamente.
- **Verificación**: Medición de CLS (Cumulative Layout Shift) en la carga.

---

## 4. Research técnico
Decisión Final:
1. **Container**: SIEMPRE `iframe`. Máxima compatibilidad y seguridad.
2. **ESM**: Soportado nativamente dentro del iframe de la extensión. No requiere Import Maps inyectados en el huésped.
3. **CSP**: Sigue siendo necesario `declarativeNetRequest` para permitir el `frame-src`.

---

## 5. Agentes participantes

- **architect-agent** (Owner)
  - Supervisión, validación de arquitectura y refactorización del Engine.
- **module-agent**
  - Implementación de los cambios en `Engine` y lógica de inyección ESM.
- **surface-agent**
  - Adaptación de la clase base `Shard` para soportar Shadow Root `closed` y auto-resize.
- **qa-agent**
  - Creación de tests E2E con Playwright en páginas externas (ej. wikipedia.org).

---

## 6. Impacto de la tarea
- **Arquitectura**: Simplificación del flujo de mensajes del Engine. Introducción de un contenedor de Shards externo.
- **APIs**: `Engine.loadShard` ahora aceptará opciones de contenedor (`shadow` | `iframe`).
- **Compatibilidad**: Ningún breaking change esperado, solo adición de funcionalidad.

---

## 7. Riesgos y mitigaciones
- **Riesgo**: Colisión de Import Maps.
  - **Mitigación**: El motor detectará si ya existe un Import Map y usará un cargador dinámico alternativo o inyectará el Shard con rutas ya resueltas.
- **Riesgo**: Bloqueo de iframes por CSP estrictas.
  - **Mitigación**: Uso obligatorio de `declarativeNetRequest` en el manifest del proyecto.

---

## 8. Preguntas abiertas
- ¿Iniciaremos el AI Layout Estimation como experimental o como parte del core inicial? (Decidido: Experimental pero incluido en el plan).

---

## 9. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

- **Aprobado por desarrollador:** ☑ Sí ☐ No  
- **Fecha:** 2026-01-17
- **Comentarios (opcional):** El desarrollador prefiere usar SIEMPRE iframes y eliminar la necesidad de Import Maps externos en la página huésped.
