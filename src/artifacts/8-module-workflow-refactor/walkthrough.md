# Walkthrough: Module Workflow Refactor Validation

Este documento detalla los pasos seguidos para validar la refactorización.

## 1. Build del sistema
Se recompilaron los paquetes `@extensio/cli` y `@extensio/mcp-server` para asegurar que los cambios de código estaban activos.

```bash
npm run build -w @extensio/cli && npm run build -w @extensio/mcp-server
```

## 2. Creación de módulo de prueba
Se ejecutó el comando CLI utilizando los nuevos flags implementados.

```bash
node packages/cli/dist/index.mjs create \
  --type module \
  --name validation-test \
  --withShard \
  --withPage \
  --includeDemo \
  --non-interactive
```

**Resultado:**
- Carpeta `packages/modules/validation-test` creada.
- Estructura interna correcta:
  - `src/surface/shards/index.mts`
  - `src/surface/shards/example.mts`
  - `src/surface/pages/`
  - `demo/`

## 3. Verificación de código generado
### Registro de Shards
El archivo `src/surface/shards/index.mts` contiene el registro estático:

```typescript
import { ExampleShard } from './example.mts';
Shard.register('validation-test-example-shard', ExampleShard);
```

### Integración Global
El archivo `global.d.mts` raíz fue actualizado automáticamente:

```typescript
declare global {
  namespace Extensio {
    //@ts-ignore
    namespace ValidationTest {
      export type ModuleType = ModuleType;
    }
  }
}
```

## 4. Limpieza
Tras la validación, se eliminó el módulo de prueba y se revertieron los cambios en archivos globales para mantener el repositorio limpio.

```bash
rm -rf packages/modules/validation-test
```

## Conclusión
El workflow refactorizado es funcional y robusto.
