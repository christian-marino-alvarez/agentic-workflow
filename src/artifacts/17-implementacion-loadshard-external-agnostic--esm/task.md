# Task (Template)

## Identificación
- id: 17
- title: Implementación de loadShard External (Agnostic & ESM)
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: .agent/artifacts/candidate/task.md

## Descripción de la tarea
Revisar el core, especialmente el Engine, para verificar y asegurar que `loadShard` es capaz de insertar shards en páginas que no son Surface Pages (externas). Un Shard debe ser un elemento agnóstico e aislado (WebComponents/ShadowRoot) que no altere la funcionalidad de la página huésped. Debe soportar ESM nativo en el navegador para permitir shards hijos sin necesidad de bundles, utilizando siempre la build actual de Extensio. Para Firefox, donde ESM en Content Scripts no es compatible, se debe generar un bundle específico.

Además, se debe analizar y refactorizar el `Engine` para unificar los listeners de `Runtime.onMessage`. Actualmente existen duplicados (en constructor y `_listen`) que complican la carga de módulos y el ciclo de vida.

## Objetivo
Permitir la inserción de shards en páginas de navegación externas, garantizando el aislamiento mediante WebComponents/ShadowRoot y comunicación ESM pura sin bundles (excepto en Firefox).

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "17"
  title: "Implementación de loadShard External (Agnostic & ESM)"
  strategy: "long"  # long | short
  phase:
    current: "phase-5-verification"
    validated_by: "architect-agent"
    updated_at: "2026-01-17T17:27:00Z"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T16:03:00Z"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T16:30:00Z"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T16:35:00Z"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T16:40:00Z"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T17:27:00Z"
      phase-5-verification:
        completed: true
        validated_by: "qa-agent"
        validated_at: "2026-01-17T17:29:00Z"
      phase-6-results-acceptance:
        completed: false
        validated_by: null
        validated_at: null
      phase-7-evaluation:
        completed: false
        validated_by: null
        validated_at: null
      phase-8-commit-push:
        completed: false
        validated_by: null
        validated_at: null
```

## 5 Preguntas Obligatorias (REQUERIDO - Phase 0)
> El architect-agent **DEBE** analizar la descripción/objetivo de la tarea y formular 5 preguntas específicas.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Debemos soportar navegadores que no tengan soporte completo de ESM en Content Scripts (como Firefox actualmente)? | Verifica que no es compatible. Si no lo es, la build debe subsanar este problema, y la forma mas limpia es crear un bundle para cuando es Firefox. |
| 2 | En cuanto al aislamiento, ¿Shadow Root "open" es suficiente o se requiere "closed" por algún requerimiento de seguridad extremo? | Close por requisitos de seguridad pero le preocupa mas el javascript. |
| 3 | ¿Cómo se debe gestionar el registro de Shards en la página externa para evitar colisiones de nombres de WebComponents (Custom Elements)? | Para evitar colisión de nombres los shards deben tener el prefijo extensio-<nombre-shard>. |
| 4 | Para shards hijos, ¿el motor debe inyectar un Import Map en la página huésped para resolver las dependencias de Extensio Core? | [Pendiente de confirmación técnica en Research, pero el objetivo es ESM puro sin bundles para Chrome] |
| 5 | ¿Existe alguna restricción de Content Security Policy (CSP) en las páginas destino que debamos considerar para la inyección de scripts ESM? | [Pendiente de confirmación técnica en Research] |

---

## Acceptance Criteria (OBLIGATORIO PARA CURRENT TASK)
> Esta sección se deriva de las 5 respuestas anteriores.

1. Alcance:
   - Implementación de inyección dinámica de Shards en dominios externos.
   - Soporte multi-browser (ESM para Chrome, Bundle para Firefox).

2. Entradas / Datos:
   - Ruta del Shard, opciones de inyección.

3. Salidas / Resultado esperado:
   - Shard renderizado dentro de un **Iframe contenedor**.
   - Iframe registrado con prefijo `extensio-`.
   - Aislamiento total de JS y CSS mediante iframe.

4. Restricciones:
   - Inyección externa SIEMPRE vía Iframe.
   - Prefijo obligatorio `extensio-`.
   - Soporte nativo de ESM dentro del iframe (sin Import Maps externos).

5. Criterio de aceptación (Done):
   - [ ] Refactorización de `Engine`: unificación de listeners de mensajes y simplificación de carga.
   - [ ] Implementación de `loadShard` para inyección de Iframe en dominios externos.
   - [ ] Mecanismo de auto-resize del iframe basado en `ResizeObserver` y AI de Google Extensio.
   - [ ] Verificación de ESM funcional en Chrome y Firefox dentro del iframe.

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-17T16:03:00Z"
    notes: "Acceptance criteria definidos y validados por el desarrollador. Se avanza a Phase 1."
  - phase: "phase-1-research"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-17T16:30:00Z"
    notes: "Research validado por el desarrollador. Se confirma la vía de Iframe + Shadow DOM y el bypass de CSP. Se avanza a Phase 2."
  - phase: "phase-2-analysis"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-17T16:35:00Z"
    notes: "Análisis aprobado por el desarrollador. Se simplifica la estrategia a inyección SIEMPRE vía Iframe y se elimina la necesidad de Import Maps externos. Se avanza a Phase 3."
  - phase: "phase-3-planning"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-17T16:40:00Z"
    notes: "Plan aprobado por el desarrollador. Se incluye infraestructura de demo en packages/core/demo con scripts manual y automation. Se avanza a Phase 4."
```

## Reglas contractuales
- Este fichero es la **fuente única de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- El campo `task.lifecycle.phases.*` **SOLO puede ser marcado como completed por `architect-agent`**.
- Una fase **NO puede marcarse como completed** si no es la fase actual.
- El avance de fase requiere:
  1. Marcar la fase actual como `completed: true`
  2. Validación explícita del architect
  3. Actualización de `task.phase.current` a la siguiente fase
