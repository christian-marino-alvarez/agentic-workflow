---
name: Extensio Demo
description: Skill para crear scaffolding de demo para módulos y drivers existentes
---

# Extensio Demo

## 📋 Input

- **Módulo o driver existente** en el proyecto
- **Tipo**: "module" o "driver"
- **Nombre**: Nombre del módulo/driver

## 🎯 Output

- **Demo creada** en `packages/{type}/{name}/demo/`:
  - `src/engine/index.mts` (usa el módulo/driver)
  - `src/surface/pages/` (páginas demo)
  - `src/surface/shards/` (shards demo)
  - `test/e2e/` (tests E2E)
  - `manifest.json`, `package.json`
  
## 🛠️ Tool

**MCP Tool**: `mcp_extensio-cli_extensio_demo`

**Parámetros**:
```typescript
{
  type: "module" | "driver",
  name: string,                    // Nombre del módulo/driver
  targetPath?: string              // Override base path
}
```

---

## Ejecución del Tool

### Caso 1: Demo para módulo
```typescript
await mcp_extensio-cli_extensio_demo({
  type: "module",
  name: "my-module"
});
```

### Caso 2: Demo para driver
```typescript
await mcp_extensio-cli_extensio_demo({
  type: "driver",
  name: "my-driver"
});
```

---

## Validación Pre-Creación

```javascript
// Verificar que el módulo/driver existe
const basePath = type === "module" 
  ? "packages/modules" 
  : "packages/drivers";

if (!existsSync(`${basePath}/${name}`)) {
  throw new Error(`${type} ${name} no existe`);
}

// Verificar que no existe demo
if (existsSync(`${basePath}/${name}/demo`)) {
  throw new Error(`Demo para ${name} ya existe`);
}
```

---

## Post-Creación

Después de crear la demo:

1. **Build demo**: `cd {basePath}/{name}/demo && npm run build`
2. **Test E2E**: `npm run test:e2e`
3. **Cargar manualmente**: Cargar `dist/chrome` en navegador
