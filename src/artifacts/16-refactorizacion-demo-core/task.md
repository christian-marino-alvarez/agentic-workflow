# Task: Refactorización de Demo Core con Automatización

## Identificación
- id: 16
- title: Refactorización de Demo Core con Automatización
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle-long
  - source: init
  - candidate_path: artifacts.candidate.init

## Descripción de la tarea
Eliminar la demo actual del core y crear una nueva demo funcional que soporte carga automática (Playwright E2E) y manual (desarrollador). La demo debe incluir una página inicial con botón para abrir YouTube y un floating button que se inserte automáticamente en páginas orgánicas.

## Objetivo
Proveer una demo robusta y completa del core que sirva como validación E2E automatizada y como referencia para desarrolladores, demostrando el uso de Pages, Shards y Context.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "16"
  title: "Refactorización de Demo Core con Automatización"
  strategy: "long"
  phase:
    current: "phase-8-commit-push"
    validated_by: "architect-agent"
    updated_at: "2026-01-17T14:47:00Z"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T08:41:00Z"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T08:45:00Z"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T08:48:00Z"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T08:55:00Z"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T12:40:00Z"
      phase-5-verification:
        completed: true
        validated_by: "qa-agent"
        validated_at: "2026-01-17T14:45:00Z"
      phase-6-results-acceptance:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T14:46:00Z"
      phase-7-evaluation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T14:46:30Z"
      phase-8-commit-push:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-17T15:00:00Z"
        branch: "feature/module-workflow-refactor"
        commits: "2fd9a07, ab5ff4f, faebf0c, 8988dab, 90d2cbb"
```

## 5 Preguntas Obligatorias (REQUERIDO - Phase 0)

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿La demo actual debe eliminarse completamente o algunos componentes pueden reutilizarse? | Debe eliminarse completamente y crear una desde cero. |
| 2 | ¿El script npm para selección de modo debe permitir seleccionar el navegador? | Sí, pero solo en modo manual. En automático debe testear todos los navegadores a menos que se pase un flag específico. |
| 3 | ¿El floating button debe tener funcionalidad específica? | Por ahora solo demostrar la inserción de shards usando las capacidades del core. Objetivo: testear E2E las funcionalidades del core. |
| 4 | ¿La página inicial debe ser action popup o página standalone? | Debe ser una Surface Page. |
| 5 | ¿Los tests E2E deben incluir validación de rendimiento? | Ambos: validación funcional Y rendimiento/tiempo de inyección del floating button. |

---

## Acceptance Criteria (OBLIGATORIO PARA CURRENT TASK)

1. **Alcance**:
   - Eliminación completa de la demo actual de `packages/core/demo`.
   - Creación de nueva demo desde cero con Surface Page inicial, shards (botón YouTube + floating button) y scripts npm.
   
2. **Entradas/Datos**:
   - Comandos npm: `npm run demo:manual` (con flags `--browser=chrome|firefox|safari`) y `npm run demo:auto` (ejecuta E2E en todos los navegadores o con flag `--browser`).
   - Configuración de Playwright para carga automática de la extensión.

3. **Salidas esperadas**:
   - Surface Page inicial con botón shard funcional que abre YouTube.
   - Floating button shard inyectado automáticamente en páginas orgánicas (no-extensión).
   - Tests E2E (Playwright) que validen:
     - Carga de la extensión y apertura de la Surface Page.
     - Funcionalidad del botón YouTube.
     - Inyección del floating button en páginas orgánicas.
     - Rendimiento: tiempo de inyección del floating button < 100ms.

4. **Restricciones**:
   - El floating button debe ser agnóstico e isolado (Shadow DOM).
   - Inyección debe ocurrir lo más rápido posible (idealmente en `document_start` o `document_idle`).
   - Cumplimiento estricto de la arquitectura Extensio (Engine, Context, Surfaces, Shards).
   - No usar librerías externas para la UI de shards (vanilla WebComponents).

5. **Criterio de Done**:
   - El desarrollador puede ejecutar `npm run demo:manual --browser=chrome` y ver la demo funcionando.
   - `npm run demo:auto` ejecuta todos los tests E2E en todos los navegadores y pasan al 100%.
   - La demo está documentada con un README que explica su uso.

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "init"
    action: "started"
    validated_by: "architect-agent"
    timestamp: "2026-01-17T08:35:00Z"
    notes: "Tarea iniciada en modo Long"
```
