---
name: Extensio Create Module
description: Skill para crear módulos Extensio con Engine, Pages y Shards usando extensio-cli
---

# Extensio Create Module

## 📋 Input

- **Nombre del módulo** (lowercase, alphanumeric, hyphens)
- **Opciones de scaffold**:
  - `withPages`: Incluir Surface Pages
  - `withShards`: Incluir Shards
  - `inheritsCore`: Heredar de @extensio/core
  - `includeDemo`: Incluir carpeta demo

## 🎯 Output

- **Módulo creado** en `packages/modules/{name}/`:
  - `src/engine/index.mts`
  - `src/surface/pages/` (si withPages)
  - `src/surface/shards/` (si withShards)
  - `demo/` (si includeDemo)
  - `package.json`, `tsconfig.json`, `manifest.json`
  
## 🛠️ Tool

**MCP Tool**: `mcp_extensio-cli_extensio_create`

**Parámetros**:
```typescript
{
  type: "module",
  name: string,                    // Nombre del módulo
  withPages?: boolean,             // Default: false
  withShards?: boolean,            // Default: false
  inheritsCore?: boolean,          // Default: true
  includeDemo?: boolean,           // Default: false
  targetPath?: string              // Default: "packages/modules"
}
```

---

## Ejecución del Tool

### Caso 1: Módulo básico
```typescript
await mcp_extensio-cli_extensio_create({
  type: "module",
  name: "my-module"
});
```

### Caso 2: Módulo completo con UI
```typescript
await mcp_extensio-cli_extensio_create({
  type: "module",
  name: "my-module",
  withPages: true,
  withShards: true,
  includeDemo: true
});
```

---

## Validación Pre-Creación

```javascript
// Verificar nombre válido
const isValidName = /^[a-z0-9-]+$/.test(name);
if (!isValidName) {
  throw new Error('Nombre inválido: solo lowercase, números y guiones');
}

// Verificar que no existe
if (existsSync(`packages/modules/${name}`)) {
  throw new Error(`El módulo ${name} ya existe`);
}
```

---

## Post-Creación

Después de crear el módulo:

1. **Build**: `cd packages/modules/{name} && npm run build`
2. **Test**: `npm run test` (si tiene tests)
3. **Demo**: `npm run demo` (si includeDemo)
