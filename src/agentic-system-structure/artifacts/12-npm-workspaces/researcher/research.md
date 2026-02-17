🔬 **researcher-agent**: Informe de investigación técnica para T012 — npm-workspaces.

---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 12-npm-workspaces
---

# Research Report — 12-npm-workspaces

> [!CAUTION]
> **REGLA PERMANENT**: Este documento es SOLO documentación.
> El researcher-agent documenta hallazgos SIN analizar, SIN recomendar, SIN proponer soluciones.
> El análisis corresponde a Phase 2.

## 1. Resumen ejecutivo
- **Problema investigado**: Migración del proyecto monolítico a npm workspaces con packages independientes
- **Objetivo de la investigación**: Documentar la estructura actual, dependencias entre módulos, y las capacidades de npm workspaces
- **Principales hallazgos**: El proyecto tiene dependencias cruzadas entre `app→core` y `cli→infrastructure+runtime`. npm workspaces soporta este patrón de forma nativa desde Node 16+

---

## 2. Necesidades detectadas

### Estructura actual del proyecto
```
src/
├── extension/
│   ├── extension.ts          → entry point VSCode (importa app)
│   └── modules/
│       ├── app/              → Package candidato @agentic-workflow/app
│       │   ├── index.ts      → importa '../core/index.js'
│       │   ├── backend/      → importa '../../core/backend/index.js'
│       │   ├── background/   → importa '../../core/index.js'
│       │   ├── view/         → importa '../../core/view/index.js'
│       │   └── test/unit/    → importa '../../../core/...'
│       └── core/             → Package candidato @agentic-workflow/core
│           ├── index.ts      → re-exports de submodules
│           ├── backend/      → AbstractBackend, VirtualServer
│           ├── background/   → Background base class
│           ├── messaging/    → Transport layer
│           ├── view/         → View base + templates
│           ├── logger.ts
│           ├── constants.ts
│           └── types.d.ts
├── cli/                      → Package candidato @agentic-workflow/cli
│   ├── index.ts              → re-exports commands
│   └── commands/
│       ├── init.ts           → importa '../../infrastructure/...'
│       ├── create.ts         → importa '../../infrastructure/...'
│       └── mcp.ts            → importa '../../runtime/...'
├── infrastructure/           → NO es package (dependencia de cli)
└── runtime/                  → NO es package (dependencia de cli)
```

### Mapa de dependencias cruzadas entre módulos
| Origen | Destino | Archivos que importan |
|--------|---------|----------------------|
| `app/index.ts` | `core/index.js` | `App extends CoreApp` |
| `app/backend/index.ts` | `core/backend/index.js` | `AbstractBackend` |
| `app/background/index.ts` | `core/index.js` | `Background, ViewHtml, Message` |
| `app/view/index.ts` | `core/view/index.js` | `View` |
| `app/test/unit/background.test.ts` | `core/messaging/background.js`, `core/index.js` | Test imports |
| `cli/commands/init.ts` | `infrastructure/...`, `runtime/...` | `detectAgentSystem`, `resolver`, `backup`, `startRuntimeMcpServer` |
| `cli/commands/create.ts` | `infrastructure/mapping/resolver.js` | Resolver |
| `cli/commands/mcp.ts` | `runtime/mcp/server.js` | `startRuntimeMcpServer` |

### Configuración TypeScript actual
- **tsconfig.json**: `rootDir: ./src`, `outDir: ./dist`, `module: NodeNext`
- **tsconfig.build.json**: Excluye `src/extension/**` y tests (build solo cli/runtime/infra)
- Sin TypeScript project references configuradas

### Tests existentes
- **E2E**: `test/e2e/extension.spec.ts` — Playwright, 1 archivo, config en `playwright.config.ts` (testDir: `./test/e2e`)
- **Unit**: `src/extension/modules/app/test/unit/background.test.ts` — Vitest
- **Scripts**: `npm run test:e2e` (Playwright), `npm run test:unit` (Vitest), `npm run compile` (tsc + build-view.mjs)

### Build pipeline actual
- `compile`: `tsc -p ./ && node scripts/build-view.mjs`
- `build`: `clean-dist && tsc -p tsconfig.build.json && copy-assets`
- `watch`: `tsc -watch -p ./ & node scripts/build-view.mjs --watch`

---

## 3. Hallazgos técnicos

### 3.1 npm Workspaces
- **Descripción**: Funcionalidad nativa de npm (desde v7 / Node 16) que permite gestionar múltiples packages dentro de un mismo repositorio.
- **Estado**: Estable, soportado en producción
- **Documentación oficial**: https://docs.npmjs.com/cli/v10/using-npm/workspaces
- **Limitaciones conocidas**:
  - Hoisting por defecto; se puede controlar con `.npmrc` (`install-strategy=nested`)
  - `node_modules` compartido en root por defecto
  - Requiere que cada workspace tenga su propio `package.json` con campo `name`

### 3.2 workspace: protocol
- **Descripción**: Protocolo para referenciar packages del workspace como dependencias (`"@agentic-workflow/core": "workspace:*"`)
- **Estado**: Soportado nativamente por npm desde v9+
- **Documentación**: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#workspace-dependencies
- **Limitaciones**: Packages con `workspace:*` no se pueden publicar directamente; npm los reemplaza en `npm pack`/`npm publish`

### 3.3 TypeScript Project References
- **Descripción**: Mecanismo nativo de TypeScript para compilar múltiples proyectos con dependencias entre ellos
- **Estado**: Estable desde TypeScript 3.0+
- **Documentación**: https://www.typescriptlang.org/docs/handbook/project-references.html
- **Limitaciones**: Requiere `composite: true` y `declaration: true` en cada sub-proyecto

### 3.4 VSCode Extension con Workspaces
- **Descripción**: Las extensiones VSCode usan webpack/esbuild para bundling; npm workspaces puede coexistir
- **Estado**: No documentado oficialmente por VSCode
- **Documentación**: https://code.visualstudio.com/api/working-with-extensions/bundling-extension
- **Limitaciones**: El entry point (`main` en package.json root) debe seguir apuntando al bundle final

---

## 4. APIs relevantes

### npm CLI workspace commands
| Comando | Descripción |
|---------|-------------|
| `npm install` | Instala deps de todos los workspaces automáticamente |
| `npm run -w <name> <script>` | Ejecuta script en un workspace específico |
| `npm run --ws <script>` | Ejecuta script en todos los workspaces |
| `npm ls --ws` | Lista dependencias de workspaces |

### package.json `workspaces` field
```json
{
  "workspaces": [
    "src/extension/modules/app",
    "src/extension/modules/core",
    "src/cli"
  ]
}
```

---

## 5. Compatibilidad

### Node.js / npm versions
| Feature | Mínimo requerido | Actual en proyecto |
|---------|:---:|:---:|
| npm workspaces | npm 7+ / Node 16+ | Node 20+ (by engines) |
| workspace: protocol | npm 9+ | Compatible |
| TypeScript project references | TS 3.0+ | TS 5.9.3 |

---

## 6. Oportunidades detectadas
- TypeScript project references podrían acelerar compilación incremental en monorepos
- npm workspace symlinking automático elimina necesidad de `npm link` manual

---

## 7. Riesgos identificados

| Riesgo | Severidad | Fuente |
|--------|:---------:|--------|
| `cli` importa `infrastructure` y `runtime` con rutas relativas `../../` — no son workspaces | Alta | Análisis de imports |
| `extension.ts` importa `./modules/app/index.js` — ruta relativa que depende de la estructura de carpetas | Media | Código fuente |
| Unit tests en app importan core con rutas relativas `../../../core/` | Media | Código fuente |
| El `tsconfig.json` tiene `rootDir: ./src` — habrá que ajustar si cada package tiene su propio tsconfig | Alta | tsconfig.json |
| VSCode extension main apunta a `./dist/extension/extension.js` — la ruta de output debe mantenerse | Alta | package.json |

---

## 8. Fuentes
- [npm Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
- [npm workspace: protocol](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [VSCode Extension Bundling](https://code.visualstudio.com/api/working-with-extensions/bundling-extension)
- [Node.js Subpath Exports](https://nodejs.org/api/packages.html#subpath-exports)

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-16T07:35:37+01:00"
    comments: null
```
