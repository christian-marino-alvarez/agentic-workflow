---
name: Extensio Validate Code
description: Skill para validar código TypeScript y ESLint, detectando errores antes de commit
---

# Extensio Validate Code

## 📋 Input

- **Proyecto con código TypeScript**:
  - `tsconfig.json` configurado
  - `.eslintrc` (opcional pero recomendado)
- **Scope de validación**:
  - Proyecto completo
  - Archivos específicos
  - Solo archivos modificados

## 🎯 Output

- **Reporte de validación**:
  - Errores de TypeScript (type errors)
  - Warnings/Errores de ESLint
  - Lista de archivos con problemas
  - Exit code (0 = ok, 1 = errores)
  
## 🛠️ Tool

**Comando Terminal**: No hay MCP tool específico, usar `run_command`

### Validación TypeScript
```bash
npx tsc --noEmit
```

### Validación ESLint
```bash
npx eslint . --ext .ts,.mts,.tsx
```

### Validación Completa (ambos)
```bash
npx tsc --noEmit && npx eslint . --ext .ts,.mts,.tsx
```

---

## Ejecución del Skill

### Caso 1: Validar TypeScript solo
```typescript
await run_command({
  CommandLine: "npx tsc --noEmit",
  Cwd: projectPath,
  SafeToAutoRun: true,
  WaitMsBeforeAsync: 10000
});

// Verificar exit code
if (exitCode !== 0) {
  // Hay errores de TypeScript
  console.error("TypeScript validation failed");
}
```

### Caso 2: Validar ESLint solo
```typescript
await run_command({
  CommandLine: "npx eslint . --ext .ts,.mts,.tsx",
  Cwd: projectPath,
  SafeToAutoRun: true,
  WaitMsBeforeAsync: 10000
});
```

### Caso 3: Validación completa (TypeScript + ESLint)
```typescript
await run_command({
  CommandLine: "npx tsc --noEmit && npx eslint . --ext .ts,.mts,.tsx",
  Cwd: projectPath,
  SafeToAutoRun: true,
  WaitMsBeforeAsync: 15000
});
```

### Caso 4: Validar solo archivos modificados (Git)
```typescript
// Obtener archivos modificados
await run_command({
  CommandLine: "git diff --name-only --diff-filter=ACMR | grep -E '\\.(ts|mts|tsx)$' | xargs npx eslint",
  Cwd: projectPath,
  SafeToAutoRun: true,
  WaitMsBeforeAsync: 10000
});
```

---

## Pre-Validación

Antes de ejecutar, verificar:

```javascript
// Verificar que existe tsconfig.json
const hasTsConfig = existsSync('tsconfig.json');
if (!hasTsConfig && validateTypeScript) {
  throw new Error('tsconfig.json not found');
}

// Verificar que existe .eslintrc (opcional)
const hasEslint = existsSync('.eslintrc.json') || 
                  existsSync('.eslintrc.js') ||
                  existsSync('.eslintrc.cjs');
```

---

## Interpretación de Resultados

### TypeScript (tsc --noEmit)

**Exit code 0**: ✅ Sin errores
```
No output = success
```

**Exit code 1**: ❌ Hay errores
```
src/engine/index.mts:25:5 - error TS2322: Type 'string' is not assignable to type 'number'.
```

### ESLint

**Exit code 0**: ✅ Sin errores/warnings (o solo warnings si configurado así)

**Exit code 1**: ❌ Hay errores
```
/path/to/file.ts
  10:5  error  'variable' is never reassigned. Use 'const' instead  prefer-const
```

---

## Estrategia por Contexto

### Pre-Commit (antes de commit)
```bash
# Solo archivos staged
git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(ts|mts|tsx)$' | xargs npx tsc --noEmit --skipLibCheck
```

### Pre-Push (antes de push)
```bash
# Validación completa
npx tsc --noEmit && npx eslint . --ext .ts,.mts,.tsx
```

### CI/CD (integración continua)
```bash
# Validación estricta con warnings como errores
npx tsc --noEmit && npx eslint . --ext .ts,.mts,.tsx --max-warnings 0
```

### Durante desarrollo
```bash
# Solo archivos modificados desde main
git diff main --name-only | grep -E '\.(ts|mts|tsx)$' | xargs npx eslint
```

---

## Flags Útiles

### TypeScript (tsc)
- `--noEmit`: No generar archivos, solo validar
- `--skipLibCheck`: Saltar validación de archivos .d.ts (más rápido)
- `--pretty`: Output con colores (mejor legibilidad)

### ESLint
- `--ext .ts,.mts,.tsx`: Extensiones a validar
- `--max-warnings 0`: Tratar warnings como errores
- `--fix`: Auto-fix de problemas corregibles
- `--quiet`: Solo mostrar errores, no warnings

---

## Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| "Cannot find module" | Falta `npm install` | Ejecutar `npm install` primero |
| "tsc: command not found" | TypeScript no instalado | `npm install -D typescript` |
| "eslint: command not found" | ESLint no instalado | `npm install -D eslint` |
| Muchos errores en node_modules | No está excluido | Verificar `tsconfig.json` exclude |

---

## Checklist de Calidad

Antes de considerar el código válido:

- [ ] `npx tsc --noEmit` completa con exit code 0
- [ ] `npx eslint . --ext .ts,.mts,.tsx` completa con exit code 0
- [ ] No hay warnings críticos sin justificar
- [ ] Imports están organizados y correctos
- [ ] No hay código comentado sin razón

---

## Integración con Workflows

### En Phase 4 (Implementation)
```markdown
Antes de crear architect/review.md:
1. architect-agent usa skill `extensio_validate_code`
2. Si hay errores → corregir antes de continuar
3. Solo con validación ✅ → proceder a review
```

### En Phase 5 (Verification)
```markdown
Antes de ejecutar tests:
1. qa-agent usa skill `extensio_validate_code`
2. Validar que tests no tienen errores de TypeScript/lint
3. Solo con validación ✅ → ejecutar tests
```

---

## Ejemplo de Uso Completo

```typescript
// 1. Validar TypeScript
const tsResult = await run_command({
  CommandLine: "npx tsc --noEmit",
  Cwd: "/path/to/project",
  SafeToAutoRun: true,
  WaitMsBeforeAsync: 10000
});

if (tsResult.exitCode !== 0) {
  console.error("TypeScript errors found:");
  console.error(tsResult.stderr);
  throw new Error("Fix TypeScript errors before continuing");
}

// 2. Validar ESLint
const lintResult = await run_command({
  CommandLine: "npx eslint . --ext .ts,.mts,.tsx",
  Cwd: "/path/to/project",
  SafeToAutoRun: true,
  WaitMsBeforeAsync: 10000
});

if (lintResult.exitCode !== 0) {
  console.error("ESLint errors found:");
  console.error(lintResult.stdout);
  throw new Error("Fix ESLint errors before continuing");
}

// 3. Todo OK
console.log("✅ Code validation passed");
```
