---
name: Extensio Create Driver
description: Skill para crear drivers Extensio con adaptadores multi-browser usando extensio-cli
---

# Extensio Create Driver

## 📋 Input

- **Nombre del driver** (lowercase, alphanumeric, hyphens)
- **Configuración**:
  - `platforms`: Plataformas (chrome, firefox, safari, common)
  - `includeDemo`: Incluir carpeta demo
  - `testType`: Tipo de tests (vitest, playwright, none)

## 🎯 Output

- **Driver creado** en `packages/drivers/{name}/`:
  - `src/{platform}/index.mts` para cada plataforma
  - `src/common/index.mts` (común a todos)
  - `demo/` (si includeDemo)
  - `package.json`, `tsconfig.json`
  
## 🛠️ Tool

**MCP Tool**: `mcp_extensio-cli_extensio_create`

**Parámetros**:
```typescript
{
  type: "driver",
  name: string,                    // Nombre del driver
  platforms?: string,              // "chrome,firefox,safari,common"
  includeDemo?: boolean,           // Default: false
  testType?: "vitest" | "playwright" | "none",
  targetPath?: string              // Default: "packages/drivers"
}
```

---

## Ejecución del Tool

### Caso 1: Driver básico (todas las plataformas)
```typescript
await mcp_extensio-cli_extensio_create({
  type: "driver",
  name: "my-driver",
  platforms: "chrome,firefox,safari,common"
});
```

### Caso 2: Driver con demo y tests
```typescript
await mcp_extensio-cli_extensio_create({
  type: "driver",
  name: "my-driver",
  platforms: "chrome,common",
  includeDemo: true,
  testType: "vitest"
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
if (existsSync(`packages/drivers/${name}`)) {
  throw new Error(`El driver ${name} ya existe`);
}
```

---

## Post-Creación

Después de crear el driver:

1. **Build**: `cd packages/drivers/{name} && npm run build`
2. **Test**: `npm run test` (si testType !== "none")
3. **Demo**: Cargar `demo/` en navegador (si includeDemo)
