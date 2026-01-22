---
name: Extensio Test
description: Skill para ejecutar tests unitarios, integración y E2E en proyectos Extensio
---

# Extensio Test

## 📋 Input

- **Proyecto con tests** configurados:
  - Vitest para unit/integration
  - Playwright para E2E
- **Tipo de test** a ejecutar
- **Opciones**:
  - `coverage`: Generar reporte de cobertura
  - `watch`: Modo watch
  - `browsers`: Para E2E (chromium, firefox, safari)
  - `headless`: Modo headless para E2E

## 🎯 Output

- **Resultados de tests**:
  - Pass/Fail por test
  - Coverage report (si coverage=true)
  - Playwright HTML report (si E2E)
  
## 🛠️ Tool

**MCP Tool**: `mcp_extensio-cli_extensio_test`

**Parámetros**:
```typescript
{
  type: "unit" | "integration" | "e2e" | "all",
  coverage?: boolean,              // Default: false
  watch?: boolean,                 // Default: false
  browsers?: string,               // "chromium,firefox,safari"
  headless?: boolean               // Default: true
}
```

---

## Ejecución del Tool

### Caso 1: Tests unitarios
```typescript
await mcp_extensio-cli_extensio_test({
  type: "unit"
});
```

### Caso 2: Tests E2E en Chrome
```typescript
await mcp_extensio-cli_extensio_test({
  type: "e2e",
  browsers: "chromium",
  headless: false
});
```

### Caso 3: Todos los tests con coverage
```typescript
await mcp_extensio-cli_extensio_test({
  type: "all",
  coverage: true
});
```

---

## Validación Pre-Test

```javascript
// Verificar configuración de tests
const hasVitest = existsSync('vitest.config.mts');
const hasPlaywright = existsSync('playwright.config.ts');

if (type === "unit" && !hasVitest) {
  throw new Error('Falta vitest.config.mts');
}

if (type === "e2e" && !hasPlaywright) {
  throw new Error('Falta playwright.config.ts');
}
```

---

## Post-Test

Después de ejecutar tests:

1. **Revisar coverage**: Si coverage=true, revisar `coverage/index.html`
2. **Revisar E2E report**: Si E2E, revisar `playwright-report/index.html`
3. **Arreglar fallos**: Iterar sobre tests fallidos
