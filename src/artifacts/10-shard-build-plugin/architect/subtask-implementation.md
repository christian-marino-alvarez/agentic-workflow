# Subtask Implementation Report — architect-agent

## Subtask: Plugin surface-shards + Engine.loadShard() refactor + Demo update

### Cambios realizados

#### 1. Plugin `surface-shards` creado
**Archivo:** `packages/cli/src/commands/plugins/surface-shards/index.mts`

**Funcionalidad:**
- Hook `resolveId`: Marca imports de shards como `external` para evitar bundlearlos con el engine
- Hook `transform`: 
  - Detecta pattern `import { ClassName } from './path/to/shard'` + `loadShard(ClassName)`
  - Compila cada shard detectado como entry point independiente
  - Inyecta mapping `ClassName.__EXTENSIO_COMPILED_PATH__ = 'surface/shards/ClassName.mjs'` al final del código del engine
- Función `compileShardScript()`: Usa `vite.build()` con todos los replacers necesarios

**Decisiones técnicas:**
- Usamos regex simple para detección (suficiente para patrones estándar)
- Shards se compilan con misma configuración que `surface-pages` (esbuild, replacers, etc.)
- Path del shard se normaliza a forward slashes para compatibilidad cross-platform

---

#### 2. Plugin integrado en build pipeline
**Archivo:** `packages/cli/src/commands/build.mts`

**Cambios:**
- Línea 19: Import de `surfaceShardsPlugin`
- Líneas 344-348: Añadido plugin a la lista de plugins de Vite

---

#### 3. Engine.loadShard() refactorizado
**Archivo:** `packages/core/src/engine/engine.mts`

**Nueva API:**
```typescript
public async loadShard<T extends typeof Shard>(
  ShardClass: T,
  options?: ShardOptions
): Promise<void>;
```

**Backward compatibility:**
```typescript
/** @deprecated */
public async loadShard(
  cssUrl: string,
  jsUrl: string,
  options?: ShardOptions
): Promise<void>;
```

**Lógica:**
- Detecta firma mediante `typeof ShardClassOrCssUrl`
- Nueva firma: Lee `ShardClass.__EXTENSIO_COMPILED_PATH__` y usa `Runtime.getURL()`
- Legacy firma: Usa URLs directamente (deprecada)
- CSS es opcional en nueva API (shard importa su propio CSS)

**Decisiones técnicas:**
- Usamos function overloading para mantener backward compatibility
- Error claro si `__EXTENSIO_COMPILED_PATH__` no existe (indica que plugin no detectó el shard)

---

#### 4. Demo actualizado
**Archivo:** `packages/core/demo/src/engine/index.mts`

**Cambios:**
- Línea 16: Import de `ActionButtonShard`
- Línea 97: Cambio de `loadShard(cssUrl, jsUrl, options)` a `loadShard(ActionButtonShard, options)`

**Nota:** NO se modificó `ActionButtonShard.mts` - el plugin inyecta `__EXTENSIO_COMPILED_PATH__` automáticamente

---

### Tests ejecutados

**Pendiente:** Build manual del demo para verificar que:
1. Plugin detecta el shard
2. Shard se compila en `dist/surface/shards/ActionButtonShard.mjs`
3. Engine tiene `ActionButtonShard.__EXTENSIO_COMPILED_PATH__` inyectado
4. No hay errores de compilación

---

### Desviaciones del plan

**Ninguna** - Implementación sigue exactamente el plan aprobado.

---

### Herramientas utilizadas

- Edición manual de código (no requiere scaffolding)
- Siguiendo patrón de `surface-pages` plugin existente

---

### Próximos pasos

1. Build manual del demo para verificación
2. Tests E2E si build es exitoso
3. Revisión arquitectónica del architect-agent
