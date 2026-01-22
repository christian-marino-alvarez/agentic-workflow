---
artifact: agent-activation
phase: phase-4-implementation
subtask_id: 3
activated_agent: surface-agent
activated_by: architect-agent
activation_date: 2026-01-17T17:15:00Z
---

# Agent Activation — Subtask 3: Shard Auto-Resize & Communication

## Agente Activado
🎨 **surface-agent**

## Contexto
Según el plan aprobado (Paso 3), se requiere actualizar la clase base `Shard` para que implemente auto-resize mediante `ResizeObserver` y comunique sus dimensiones al iframe contenedor.

## Responsabilidades Asignadas

### 1. Actualizar la clase base `Shard`
- Implementar `ResizeObserver` en el lifecycle hook `onMount()`
- Detectar cambios de tamaño del Shard
- Enviar mensajes `postMessage` al parent con las nuevas dimensiones
- Limpiar el observer en `onUnmount()`

### 2. Protocolo de comunicación
- **Tipo de mensaje**: `extensio:shard:resize`
- **Payload**: `{ width: number, height: number }`
- **Target**: `window.parent` (el iframe host)
- **Validación**: Verificar que estamos dentro de un iframe antes de enviar

### 3. Seguridad
- Validar que el mensaje solo se envíe si `window !== window.parent` (estamos en iframe)
- No enviar datos sensibles en el mensaje
- Documentar el protocolo de comunicación

## Constituciones Aplicables
- `constitution.shards` (estructura y lifecycle de Shards)
- `constitution.clean_code` (funciones pequeñas, responsabilidad única)
- `constitution.extensio_architecture` (aislamiento, comunicación reactiva)

## Dependencias
- **Paso 1 completado**: ✅ Engine refactorizado
- **Paso 2 completado**: ✅ Iframe container implementado
- **Archivo relacionado**: `packages/core/src/surface/shards/shard-container.html` (ya tiene ResizeObserver, usar como referencia)

## Criterios de Validación

### Funcionales
- [ ] El `ResizeObserver` se inicializa correctamente en `onMount()`
- [ ] Los mensajes de resize se envían al parent cuando el Shard cambia de tamaño
- [ ] El observer se limpia correctamente en `onUnmount()`
- [ ] Solo se envían mensajes si el Shard está dentro de un iframe

### Técnicos
- [ ] No se introducen memory leaks (observer limpiado)
- [ ] El código cumple clean code (funciones < 10 líneas)
- [ ] La clase `Shard` sigue siendo agnóstica del framework de UI

### Arquitectónicos
- [ ] El Shard no conoce detalles del Engine (comunicación unidireccional)
- [ ] Compatible con todos los adaptadores (Lit, React, Angular)
- [ ] No rompe la compatibilidad con Shards existentes

## Entregable Esperado
- `surface-agent/subtask-3-implementation.md`
- Código modificado en:
  - `packages/core/src/surface/shard.mts`
  - Posiblemente `packages/core/src/surface/shards/index.mts`

## Restricciones
- **NO** modificar el comportamiento existente de Shards que no están en iframes
- **NO** introducir dependencias externas
- **NO** acoplar el Shard al Engine directamente
- El `ResizeObserver` debe ser **opcional** (solo activo si está en iframe)

---

**Activado por**: 🏛️ architect-agent  
**Fecha**: 2026-01-17T17:15:00Z  
**Estado**: ACTIVO
