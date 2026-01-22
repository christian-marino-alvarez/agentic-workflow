---
artifact: agent-activation
phase: phase-4-implementation
subtask_id: 2
activated_agent: module-agent
activated_by: architect-agent
activation_date: 2026-01-17T16:50:00Z
---

# Agent Activation — Subtask 2: Iframe Container Implementation

## Agente Activado
**module-agent**

## Contexto
Según el plan aprobado (Paso 2), se requiere modificar el método `loadShard` del `Engine` para soportar la inyección de Shards en páginas externas mediante iframes.

## Responsabilidades Asignadas

### 1. Modificar `Engine.loadShard()`
- Detectar si el target es una página externa (no es una Surface Page)
- Crear dinámicamente un elemento `<iframe>` con:
  - ID/clase con prefijo `extensio-`
  - `src` apuntando a un recurso interno de la extensión
  - Atributos de seguridad (`sandbox`, `allow`)
- Inyectar el iframe en el DOM de la página externa

### 2. Crear recurso HTML para el iframe
- Crear `packages/core/src/surface/shards/shard-container.html`
- Este HTML será el documento que carga el iframe
- Debe importar el Shard ESM solicitado

### 3. Actualizar tipos y constantes
- Añadir nuevas opciones a `ShardOptions` si es necesario
- Definir constantes para el prefijo `extensio-`

## Constituciones Aplicables
- `constitution.modules` (Engine es parte del core/módulos)
- `constitution.clean_code` (funciones pequeñas, responsabilidad única)
- `constitution.extensio_architecture` (aislamiento, no side-effects)

## Dependencias
- **Paso 1 completado**: ✅ Engine refactorizado
- **Drivers necesarios**: `Scripting`, `Runtime`, `Tabs`

## Criterios de Validación

### Funcionales
- [ ] `loadShard()` detecta correctamente páginas externas
- [ ] El iframe se crea con el prefijo `extensio-`
- [ ] El iframe carga el recurso interno de la extensión
- [ ] El Shard se renderiza dentro del iframe

### Técnicos
- [ ] No se introducen dependencias cruzadas
- [ ] El código cumple clean code (funciones < 10 líneas)
- [ ] Tests unitarios actualizados

### Arquitectónicos
- [ ] El iframe proporciona aislamiento total (CSS + JS)
- [ ] No se inyectan Import Maps en la página huésped
- [ ] Compatible con Chrome, Firefox y Safari

## Entregable Esperado
- `module-agent/subtask-2-implementation.md`
- Código modificado en:
  - `packages/core/src/engine/engine.mts`
  - `packages/core/src/surface/shards/shard-container.html` (nuevo)
  - `packages/core/src/types.d.mts` (si aplica)

## Restricciones
- **NO** modificar la API pública de `loadShard` (mantener compatibilidad)
- **NO** introducir lógica de negocio en el iframe (solo carga)
- **NO** usar Shadow DOM en este paso (el iframe ya proporciona aislamiento)

---

**Activado por**: architect-agent  
**Fecha**: 2026-01-17T16:50:00Z  
**Estado**: ACTIVO
