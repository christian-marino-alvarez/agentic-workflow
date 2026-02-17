🏛️ **architect-agent**: Análisis técnico para T012 — Migración a npm workspaces.

---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 12-npm-workspaces
---

# Analysis — 12-npm-workspaces

## 1. Resumen ejecutivo

**Problema**
El proyecto es un monolito TypeScript donde todas las dependencias están centralizadas en un único `package.json` y los módulos se comunican mediante rutas relativas. Esto impide el aislamiento de dependencias y dificulta la escalabilidad.

**Objetivo**
Convertir `app`, `core` y `cli` en packages npm privados dentro de un monorepo con npm workspaces.

**Criterio de éxito**
Los tests e2e deben seguir pasando idénticamente tras la migración.

---

## 2. Estado del proyecto (As-Is)

- **Estructura relevante**
  - `src/extension/modules/app/` — módulo App (hereda de core)
  - `src/extension/modules/core/` — módulo Core (base classes, logger, messaging, view)
  - `src/cli/` — CLI con 3 comandos (init, create, mcp)
  - `src/infrastructure/` — utilidades de migración y mapping
  - `src/runtime/` — MCP server runtime

- **Componentes existentes**
  - **app**: depende de core (4 imports directos con rutas relativas `../core/`)
  - **core**: autónomo, sin dependencias a otros módulos internos
  - **cli**: depende de infrastructure y runtime (rutas `../../infrastructure/`, `../../runtime/`)

- **Nucleo / capas base**
  - `tsconfig.json` único con `rootDir: ./src`, `outDir: ./dist`
  - `tsconfig.build.json` excluye `src/extension/**` (solo compila cli/runtime/infra)
  - Build: `tsc -p ./` para extensión, `tsc -p tsconfig.build.json` para npm package

- **Limitaciones detectadas**
  - `cli` importa `infrastructure` y `runtime` que NO serán workspaces — rutas relativas deben mantenerse o necesitan otro enfoque
  - `extension.ts` vive fuera de modules y es el entry point de VSCode
  - El output `dist/extension/extension.js` debe mantenerse para que VSCode funcione

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Tests e2e pasan idénticamente
- **Interpretación**: `npm run test:e2e` (Playwright) debe producir el mismo resultado antes y después
- **Verificación**: Ejecutar `npx playwright test` antes y después de la migración
- **Riesgos**: Si la ruta de resolución de módulos cambia, la extensión podría no compilar

### AC-2: `npm install` instala todos los workspaces
- **Interpretación**: Un solo `npm install` en root resuelve deps de app, core y cli
- **Verificación**: `npm install && npm ls --ws`
- **Riesgos**: Versiones conflictivas de la misma dependencia entre packages

### AC-3: `npm run compile` compila todos los workspaces
- **Interpretación**: El comando root debe compilar TypeScript de todos los packages
- **Verificación**: `npm run compile` debe exit 0
- **Riesgos**: `tsconfig.json` actual asume `rootDir: ./src` — necesita ajuste

### AC-4: Cada package tiene `package.json` con `"private": true`
- **Interpretación**: Crear 3 package.json independientes
- **Verificación**: Verificar existencia y contenido de cada archivo
- **Riesgos**: Bajo

### AC-5: Root `package.json` contiene `"workspaces"`
- **Interpretación**: Configurar el campo `workspaces` apuntando a los 3 packages
- **Verificación**: Verificar campo en package.json
- **Riesgos**: Bajo

### AC-6: Dependencias inter-package vía `workspace:*`
- **Interpretación**: app debe declarar `"@agentic-workflow/core": "workspace:*"` en sus deps
- **Verificación**: `npm ls @agentic-workflow/core`
- **Riesgos**: Las rutas relativas de import en TypeScript deben cambiar de `../core/` a `@agentic-workflow/core`

### AC-7: Extensión VSCode funciona tras migración
- **Interpretación**: `npm run compile` + F5 Launch Extension funciona
- **Verificación**: Tests e2e (gate principal)
- **Riesgos**: El entry point `dist/extension/extension.js` debe seguir existiendo en la misma ruta

---

## 4. Research técnico — Alternativas

- **Alternativa A: npm workspaces sin TypeScript project references**
  - Cada package tiene `package.json` pero comparten un `tsconfig.json` root
  - Los imports cambian de rutas relativas a package names (`@agentic-workflow/core`)
  - TypeScript resuelve vía `node_modules` symlinks creados por npm workspaces
  - Ventajas: Más simple, menos configuración TypeScript
  - Inconvenientes: Sin compilación incremental, un tsconfig

- **Alternativa B: npm workspaces + TypeScript project references**
  - Cada package tiene `package.json` Y `tsconfig.json` propio con `composite: true`
  - Root tsconfig usa `references` para compilar en orden
  - Ventajas: Compilación incremental, mejor aislamiento de tipos
  - Inconvenientes: Mayor complejidad de configuración, cada package necesita `declaration: true`

**Decisión recomendada**: **Alternativa A** (npm workspaces sin TS project references), por minimizar cambios y riesgos. La Alternativa B se puede adoptar incrementalmente después.

---

## 5. Agentes participantes

- **🏛️ architect-agent**
  - Diseño de la estructura de workspaces
  - Configuración de package.json files
  - Actualización de tsconfig
  - Actualización de import paths

- **🛡️ qa-agent**
  - Verificación de tests e2e
  - Validación de que compile funciona

**Handoffs**
- architect implementa → qa verifica con tests e2e

**Componentes necesarios**
- **Crear**: 3 `package.json` (app, core, cli)
- **Modificar**: Root `package.json`, `tsconfig.json`, imports en app (de relativo a package name)
- **Eliminar**: Ninguno

**Demo**: No aplica.

---

## 6. Impacto de la tarea

- **Arquitectura**: Se añaden 3 packages internos al monorepo. No cambia la estructura de carpetas.
- **APIs / contratos**: Los exports de cada package se definen en su `package.json`. Las interfaces TS no cambian.
- **Compatibilidad**: Los imports cambian de `../core/` a `@agentic-workflow/core`. Es un breaking change interno pero no afecta APIs externas.
- **Testing**: Los tests e2e son el gate. Los unit tests de app necesitarán ajustar imports.

---

## 7. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| `cli` importa `infrastructure` y `runtime` con rutas relativas — no son workspaces | Medio | Mantener rutas relativas en cli (no cambiar lo que no es workspace) |
| `tsconfig.json` rootDir/outDir debe ajustarse para workspaces | Alto | Mantener tsconfig root, los packages heredan o aplican paths |
| Ruta `dist/extension/extension.js` debe existir para VSCode | Alto | Asegurar que compile produce output en la misma ubicación |
| Symlinks de npm workspaces pueden causar issues en VSCode bundling | Medio | Verificar con test e2e completo |

---

## 8. Preguntas abiertas
Ninguna tras Fase 0.

---

## 9. TODO Backlog

**Referencia**: `.agent/todo/`
**Estado actual**: No existe directorio todo
**Items relevantes para esta tarea**: Ninguno
**Impacto en el análisis**: Sin impacto

---

## 10. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-16T07:39:57+01:00"
    comments: null
```

> Sin aprobación, esta fase **NO puede darse por completada** ni avanzar a Phase 3.
