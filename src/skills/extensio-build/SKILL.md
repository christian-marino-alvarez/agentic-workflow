---
name: Extensio Build System
description: Skill para compilar proyectos Extensio usando extensio-cli build system
---

# Extensio Build System

## 📋 Input

- **Proyecto existente** con estructura de directorios válida:
  - `src/manifest.json`
  - `src/engine/index.mts`
  - `src/images/*.png`
  - `package.json` con exports configurados

## 🎯 Output

- **Extensión compilada** en `dist/{browser}/`:
  - `manifest.json` (copiado y procesado)
  - `engine/index.mjs` (compilado)
  - `surface/` (páginas y shards procesados)
  - `images/` (copiadas)
  
## 🛠️ Tool

**MCP Tool**: `mcp_extensio-cli_extensio_build`

**Parámetros**:
```typescript
{
  browsers: "chrome" | "firefox" | "safari" | "chrome,firefox,safari"
  loadBrowser?: "chrome" | "firefox" | "safari"  // Opcional: auto-launch
}
```

---

## Reglas de Estructura (PERMANENT)

### 1. Manifest Location
```
src/manifest.json  ✅ CORRECTO
manifest.json      ❌ INCORRECTO
```

### 2. Images Location
```
src/images/*.png   ✅ CORRECTO (rutas relativas desde src/)
images/*.png       ❌ INCORRECTO
```

### 3. Package.json Exports
```json
{
  "exports": {
    "./engine": "./src/engine/index.mts",
    "./surface/pages/home": "./src/surface/pages/home.html",
    "./surface/shards/example": "./src/surface/shards/example.mts"
  }
}
```

### 4. TSConfig Paths
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "__IMAGE__/*": ["images/*"],
      "__PARENT_SRC__/*": ["../src/*"]
    }
  }
}
```

---

## Ejecución del Tool

### Caso 1: Build básico (Chrome)
```typescript
await mcp_extensio-cli_extensio_build({
  browsers: "chrome"
});
```

### Caso 2: Build multi-browser
```typescript
await mcp_extensio-cli_extensio_build({
  browsers: "chrome,firefox,safari"
});
```

### Caso 3: Build + Auto-launch
```typescript
await mcp_extensio-cli_extensio_build({
  browsers: "chrome",
  loadBrowser: "chrome"
});
```

---

## Validación Pre-Build

Antes de ejecutar el tool, verificar:

```javascript
const validation = {
  manifestExists: existsSync('src/manifest.json'),
  engineExists: existsSync('src/engine/index.mts'),
  imagesExist: existsSync('src/images/icon-16.png'),
  exportsConfigured: packageJson.exports['./engine'] !== undefined
};

if (!Object.values(validation).every(v => v)) {
  throw new Error('Estructura de proyecto inválida');
}
```

---

## Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| "No se ha podido cargar la secuencia de comandos" | `manifest.json` no existe o está incompleto | Verificar `src/manifest.json` y campo `background.service_worker` |
| Imágenes no aparecen | No están en `src/images/` | Mover a `src/images/` y verificar rutas en manifest |
| HTML no se copia | No registrado en exports | Agregar `"./surface/pages/X": "./src/surface/pages/X.html"` |

---

## Checklist Post-Build

Verificar que `dist/chrome/` contiene:

- [ ] `manifest.json` (con todos los campos)
- [ ] `engine/index.mjs`
- [ ] `images/icon-*.png`
- [ ] `surface/pages/*.html`
- [ ] `surface/shards/*.mjs`

---

## Ejemplo de Uso

```typescript
// 1. Validar estructura
if (!existsSync('src/manifest.json')) {
  throw new Error('Falta src/manifest.json');
}

// 2. Ejecutar build
await mcp_extensio-cli_extensio_build({
  browsers: "chrome"
});

// 3. Verificar output
const buildSuccess = existsSync('dist/chrome/manifest.json');
console.log(`Build exitoso: ${buildSuccess}`);
```
