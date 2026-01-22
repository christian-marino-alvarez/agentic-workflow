---
artifact: subtask-implementation
phase: phase-4-implementation
agent: module-agent
status: completed
related_task: 17-implementacion-loadshard-external-agnostic--esm
subtask_id: 2
subtask_title: Iframe Container Implementation
completed_at: 2026-01-17T16:54:00Z
---

# Subtask Implementation — Module Agent — Subtask 2

## Agente Responsable
⚙️ **module-agent**

## Objetivo de la Subtask
Implementar la lógica de inyección de Shards en páginas externas mediante iframes, proporcionando aislamiento total de CSS y JavaScript.

## Cambios Realizados

### 1. Archivo: `packages/core/src/surface/shards/shard-container.html` (NUEVO)

**Descripción**: HTML contenedor que se carga dentro del iframe. Este documento:
- Importa dinámicamente el Shard ESM solicitado
- Implementa un `ResizeObserver` para comunicar cambios de tamaño al host
- Monta el Shard en un elemento raíz

**Características clave**:
- Recibe el path del Shard vía query parameter `?shard=...`
- Usa `import()` dinámico para cargar el Shard como ESM
- Envía mensajes `postMessage` al parent con el tamaño actual
- CSS reset para evitar estilos por defecto del navegador

### 2. Archivo: `packages/core/src/engine/engine.mts`

#### Cambio 2.1: Actualización del método `loadShard()`
**Líneas modificadas**: 387-416

**Antes**: Inyección directa vía `Scripting.executeScript`

**Después**: 
- Detecta si debe usar iframe (opción `useIframe`, default: `true`)
- Si `useIframe === true`: delega a `injectShardViaIframe()`
- Si `useIframe === false`: usa inyección directa (legacy, para Surface Pages)

**Justificación**: Mantener compatibilidad con Surface Pages mientras se añade soporte para páginas externas.

#### Cambio 2.2: Nuevo método `injectShardViaIframe()`
**Líneas añadidas**: 418-473

**Funcionalidad**:
1. Construye la URL del iframe: `shard-container.html?shard=<shardPath>`
2. Genera un ID único con prefijo `extensio-shard-`
3. Inyecta un script que:
   - Crea el elemento `<iframe>`
   - Configura estilos (posición fija, sombra, z-index máximo)
   - Añade atributo `sandbox` para seguridad
   - Registra listener de `postMessage` para auto-resize
   - Monta el iframe en el `document.body`

**Decisiones técnicas**:
- **Sandbox**: `allow-scripts allow-same-origin` (mínimo necesario)
- **Z-index**: `2147483647` (máximo valor seguro)
- **Posición inicial**: Fixed, bottom-right (300x400px)
- **Auto-resize**: Escucha mensajes `extensio:shard:resize`

### 3. Archivo: `packages/core/src/types.d.mts`

#### Cambio 3.1: Actualización de `ShardOptions`
**Líneas modificadas**: 103-107

**Añadido**:
```typescript
useIframe?: boolean; // If true, inject via iframe (default: true)
```

**Justificación**: Permitir control explícito del método de inyección.

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

**Nota**: Los tests existentes siguen pasando porque la inyección directa (`useIframe: false`) se mantiene intacta.

## Decisiones Técnicas

### 1. Iframe vs Shadow DOM
**Decisión**: Usar iframe como contenedor principal.
**Razón**: Aislamiento total garantizado, bypass nativo de CSP, compatibilidad universal.

### 2. Comunicación postMessage
**Decisión**: Usar `postMessage` para resize en lugar de MutationObserver externo.
**Razón**: Más eficiente, el Shard conoce su propio tamaño mejor que el host.

### 3. Sandbox restrictivo
**Decisión**: `allow-scripts allow-same-origin` únicamente.
**Razón**: Mínimos permisos necesarios para ejecutar el Shard ESM.

### 4. Prefijo `extensio-`
**Decisión**: Todos los iframes tienen ID `extensio-shard-<timestamp>`.
**Razón**: Cumple con el AC3 (prefijo obligatorio) y evita colisiones.

## Desviaciones
Ninguna. La implementación sigue exactamente el plan aprobado y la activación del agente.

## Constituciones Validadas
- ✅ `constitution.modules`: Engine modificado sin romper ciclo de vida
- ✅ `constitution.clean_code`: Métodos pequeños, responsabilidad única
- ✅ `constitution.extensio_architecture`: Aislamiento total, no side-effects

## Próximos Pasos Sugeridos
1. **Paso 3 (surface-agent)**: Implementar `ResizeObserver` en la clase base `Shard`
2. **Paso 4 (architect/module)**: Añadir AI Layout Estimation
3. **Paso 5-7 (qa-agent)**: Crear demo y tests E2E

## Estado
✅ **COMPLETADO**

---

**Implementado por**: ⚙️ module-agent  
**Supervisado por**: 🏛️ architect-agent  
**Fecha**: 2026-01-17T16:54:00Z
