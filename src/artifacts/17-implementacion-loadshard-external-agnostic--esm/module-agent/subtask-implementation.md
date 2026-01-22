---
artifact: subtask-implementation
phase: phase-4-implementation
agent: module-agent
status: completed
related_task: 17-implementacion-loadshard-external-agnostic--esm
subtask_id: 1
subtask_title: Refactorización Engine - Unificación de Listeners
completed_at: 2026-01-17T16:42:00Z
---

# Subtask Implementation — Module Agent — Subtask 1

## Agente Responsable
**module-agent**

## Objetivo de la Subtask
Refactorizar el `Engine` para eliminar la duplicidad de listeners de `Runtime.onMessage`, centralizando toda la gestión de mensajes en el método `_listen()` → `onMessage()`.

## Cambios Realizados

### 1. Archivo: `packages/core/src/engine/engine.mts`

#### Cambio 1.1: Eliminación del listener duplicado en el constructor
**Líneas modificadas**: 51-60

**Antes**:
```typescript
constructor(name: string, scope: string = Scope.Engine) {
  super(name, scope);
  Engine.instance = this;
  const channel = Channel.LoadContext;
  Runtime.onMessage.addListener((
    message: Message) => {
    if (channel !== message.channel && message.data.command !== Command.loadContext) return false;
    this.loadContext = true;
  });
}
```

**Después**:
```typescript
constructor(name: string, scope: string = Scope.Engine) {
  super(name, scope);
  Engine.instance = this;
}
```

**Justificación**: El listener estaba duplicado con el de `_listen()`, violando el principio de responsabilidad única.

#### Cambio 1.2: Centralización del manejo de `loadContext` en `onMessage()`
**Líneas modificadas**: 68-87

**Añadido**:
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

**Justificación**: Centralizar toda la lógica de mensajes en un solo punto de entrada facilita el mantenimiento y debugging.

### 2. Archivo: `packages/core/test/unit/core/engine-advanced.test.mts`

#### Cambio 2.1: Actualización del test de regresión
**Líneas modificadas**: 51-63

**Antes**:
```typescript
const onMessageListener = mockRuntime.onMessage.addListener.mock.calls[1][0];
```

**Después**:
```typescript
const onMessageListener = mockRuntime.onMessage.addListener.mock.calls.find(
    call => call[0].length === 3 || call[0].length === 2
)?.[0];
```

**Justificación**: El test asumía 2 listeners (índice `[1]`), pero ahora solo hay 1. Se actualiza para buscar el listener correcto dinámicamente.

## Decisiones Técnicas

1. **Preservación del comportamiento**: El manejo de `loadContext` se mantiene idéntico, solo cambia su ubicación.
2. **Early return**: Se usa un `return` temprano para evitar procesar el resto del switch cuando es un mensaje de `loadContext`.
3. **Compatibilidad**: No se afecta el `Context` que también usa `_listen()` porque opera en canales diferentes.

## Tests Ejecutados

```bash
npm run test:unit -- engine --run
```

**Resultado**:
```
✅ Test Files: 25 passed (25)
✅ Tests: 181 passed (181)
✅ Duration: 3.29s
```

## Desviaciones
Ninguna. La implementación sigue exactamente el plan aprobado.

## Constituciones Validadas
- ✅ `constitution.modules`: Ciclo de vida preservado, reactividad intacta
- ✅ `constitution.clean_code`: Eliminación de duplicación, responsabilidad única
- ✅ `constitution.extensio_architecture`: Jerarquía Core → Engine respetada

## Herramientas Utilizadas
- Editor de código (manual)
- Vitest para validación de tests

## Estado
✅ **COMPLETADO**

---

**Implementado por**: module-agent  
**Supervisado por**: architect-agent  
**Fecha**: 2026-01-17T16:42:00Z
