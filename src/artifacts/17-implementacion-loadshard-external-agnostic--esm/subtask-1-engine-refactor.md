---
artifact: subtask-implementation
phase: phase-4-implementation
owner: architect-agent
status: completed
related_task: 17-implementacion-loadshard-external-agnostic--esm
subtask_id: 1
subtask_title: Refactorización Engine - Unificación de Listeners
completed_at: 2026-01-17T16:42:00Z
---

# Subtask Implementation — Refactorización Engine

## Objetivo
Eliminar la duplicidad de listeners de `Runtime.onMessage` en el `Engine`, centralizando toda la gestión de mensajes en el método `_listen()` → `onMessage()`.

## Problema Actual
- **Listener 1** (Engine constructor, líneas 55-59): Maneja específicamente `loadContext`
- **Listener 2** (Heredado de Core._listen): Vacío en Core, pero el patrón indica que debería usarse para todos los mensajes

## Solución Implementada

### 1. ✅ Eliminado listener del constructor
Removidas las líneas 54-60 del constructor de `Engine`.

### 2. ✅ Manejo de `loadContext` en `onMessage()`
Añadido el caso `loadContext` al inicio del método `onMessage`:

```typescript
// Handle loadContext command
if (channel === Channel.LoadContext && command === Command.loadContext) {
  this.loadContext = true;
  messageResponse = {
    channel: Channel.LoadContext,
    data: {
      command: Command.loadContext,
      payload: { status: 'loaded' }
    }
  };
  sendResponse(messageResponse as Message);
  return;
}
```

### 3. ✅ Actualizado test de regresión
Corregido `engine-advanced.test.mts` para buscar el listener correcto ahora que solo hay uno.

## Archivos Modificados
- `packages/core/src/engine/engine.mts`
- `packages/core/test/unit/core/engine-advanced.test.mts`

## Resultados de Tests
```
✅ Test Files  25 passed (25)
✅ Tests  181 passed (181)
```

## Criterios de Aceptación
- [x] Solo un listener de `Runtime.onMessage` en toda la jerarquía Engine
- [x] `loadContext` funciona correctamente
- [x] Tests unitarios pasando
- [x] No hay warnings de listeners duplicados en consola

## Estado: ✅ COMPLETADO
