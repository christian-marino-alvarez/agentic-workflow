🏛️ **architect-agent**: Plan de implementación para T012 — Migración a npm workspaces.

---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 12-npm-workspaces
---

# Implementation Plan — 12-npm-workspaces

## 1. Resumen del plan
- **Contexto**: Convertir los módulos app, core y cli en packages npm privados dentro de un monorepo con npm workspaces.
- **Resultado esperado**: Proyecto configurado como npm workspaces con 3 packages independientes, build unificado funcional y tests e2e pasando.
- **Alcance**:
  - **Incluye**: Crear 3 `package.json`, configurar workspaces en root, actualizar imports de app→core a package name, ajustar tsconfig
  - **Excluye**: TypeScript project references (se puede adoptar después), cambio de rutas en cli (mantiene relativas a infrastructure/runtime)

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/12-npm-workspaces/task.md`
- **Analysis**: `.agent/artifacts/12-npm-workspaces/analysis.md`
- **Acceptance Criteria**: AC-1 a AC-7 (tests e2e como gate principal)

```yaml
plan:
  workflows:
    - domain: extension-modules
      action: refactor
      workflow: tasklifecycle-long

  dispatch:
    - domain: core-package
      action: create
      workflow: tasklifecycle-long
    - domain: app-package
      action: refactor
      workflow: tasklifecycle-long
    - domain: cli-package
      action: create
      workflow: tasklifecycle-long
    - domain: root-config
      action: refactor
      workflow: tasklifecycle-long
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Crear `package.json` para `@agentic-workflow/core`
- **Descripción**: Crear `src/extension/modules/core/package.json` con nombre `@agentic-workflow/core`, `private: true`, y las dependencias que usa core (`vscode` como peer, `@fastify/cors`, `fastify` si aplica)
- **Dependencias**: Ninguna
- **Entregables**: `src/extension/modules/core/package.json`
- **Agente responsable**: architect-agent

### Paso 2: Crear `package.json` para `@agentic-workflow/app`
- **Descripción**: Crear `src/extension/modules/app/package.json` con nombre `@agentic-workflow/app`, `private: true`, dependencia a `@agentic-workflow/core` via `workspace:*`, y sus propias deps
- **Dependencias**: Paso 1 (core package existe)
- **Entregables**: `src/extension/modules/app/package.json`
- **Agente responsable**: architect-agent

### Paso 3: Crear `package.json` para `@agentic-workflow/cli`
- **Descripción**: Crear `src/cli/package.json` con nombre `@agentic-workflow/cli`, `private: true`, y sus dependencias de CLI (`commander`, `@clack/prompts`)
- **Dependencias**: Ninguna
- **Entregables**: `src/cli/package.json`
- **Agente responsable**: architect-agent

### Paso 4: Configurar workspaces en root `package.json`
- **Descripción**: Añadir campo `"workspaces"` al root `package.json` apuntando a los 3 packages. Mover dependencias exclusivas de cada package a sus respectivos `package.json`
- **Dependencias**: Pasos 1-3
- **Entregables**: Root `package.json` actualizado
- **Agente responsable**: architect-agent

### Paso 5: Actualizar imports en `app` (de relativos a package name)
- **Descripción**: Cambiar todos los imports de `../core/...` y `../../core/...` en app a `@agentic-workflow/core`. Archivos afectados:
  - `app/index.ts`: `'../core/index.js'` → `'@agentic-workflow/core'`
  - `app/backend/index.ts`: `'../../core/backend/index.js'` → `'@agentic-workflow/core/backend'` o `'@agentic-workflow/core'`
  - `app/background/index.ts`: `'../../core/index.js'` → `'@agentic-workflow/core'`
  - `app/view/index.ts`: `'../../core/view/index.js'` → `'@agentic-workflow/core'`
  - `app/test/unit/background.test.ts`: imports de core → package name
- **Dependencias**: Paso 4
- **Entregables**: Imports actualizados en 5 archivos
- **Agente responsable**: architect-agent

### Paso 6: Configurar exports en core `package.json`
- **Descripción**: Definir `"exports"` en core package.json para exponer los submodules necesarios (backend, view, messaging, etc.) via subpath exports
- **Dependencias**: Paso 5 (saber qué subpaths se necesitan)
- **Entregables**: `src/extension/modules/core/package.json` con exports map
- **Agente responsable**: architect-agent

### Paso 7: Ejecutar `npm install` y verificar symlinks
- **Descripción**: Ejecutar `npm install` desde root para que npm cree los symlinks de workspace. Verificar que `node_modules/@agentic-workflow/core` y `@agentic-workflow/app` existen
- **Dependencias**: Paso 6
- **Entregables**: `npm install` exitoso
- **Agente responsable**: architect-agent

### Paso 8: Verificar compilación
- **Descripción**: Ejecutar `npm run compile` y solucionar errores TypeScript si los hay
- **Dependencias**: Paso 7
- **Entregables**: Build exitoso
- **Agente responsable**: architect-agent

### Paso 9: Ejecutar tests e2e
- **Descripción**: Ejecutar `npm run test:e2e` (Playwright) y verificar que pasan
- **Dependencias**: Paso 8
- **Entregables**: Tests e2e passing
- **Agente responsable**: qa-agent

---

## 4. Asignación de responsabilidades (Agentes)

- **🏛️ architect-agent**
  - Crear package.json files (Pasos 1-4)
  - Actualizar imports y exports (Pasos 5-6)
  - Configurar y verificar build (Pasos 7-8)

- **🛡️ qa-agent**
  - Ejecutar y verificar tests e2e (Paso 9)
  - Validar todos los AC

**Handoffs**
- architect-agent → qa-agent: al completar Paso 8 (build exitoso)

**Componentes**
- **Crear**: 3 `package.json` (core, app, cli) — herramienta: editor de archivos
- **Modificar**: Root `package.json`, imports en app (5 archivos) — herramienta: editor de archivos
- **Eliminar**: Ninguno

**Demo**: No aplica.

---

## 5. Estrategia de testing y validación

- **E2E (Gate principal)**
  - Comando: `npx playwright test`
  - Cobertura: Extensión VSCode se activa, módulos se registran, UI funciona
  - Trazabilidad: AC-1

- **Unit tests**
  - Comando: `npm run test:unit`
  - Cobertura: `background.test.ts` — verificar que imports de core funcionan con package name
  - Trazabilidad: AC-3, AC-6

- **Build verification**
  - Comando: `npm run compile`
  - Cobertura: TypeScript compila sin errores
  - Trazabilidad: AC-3

- **Workspace verification**
  - Comando: `npm ls --ws`
  - Cobertura: Todos los workspaces resueltos correctamente
  - Trazabilidad: AC-2, AC-5

**Trazabilidad AC → Tests**:
| AC | Test |
|----|------|
| AC-1: Tests e2e pasan | `npx playwright test` |
| AC-2: npm install funciona | `npm install && npm ls --ws` |
| AC-3: compile funciona | `npm run compile` |
| AC-4: package.json con private | Verificación manual de archivos |
| AC-5: workspaces configurado | `cat package.json \| grep workspaces` |
| AC-6: deps via workspace:* | `npm ls @agentic-workflow/core` |
| AC-7: VSCode funciona | `npx playwright test` (e2e) |

---

## 6. Plan de demo
No aplica (cambio de infraestructura sin impacto visible en UI).

---

## 7. Estimaciones y pesos de implementación

| Paso | Esfuerzo | Notas |
|------|----------|-------|
| 1-3: Crear package.json | Bajo | Archivos nuevos simples |
| 4: Configurar root workspaces | Bajo | Un campo en package.json |
| 5: Actualizar imports | Medio | 5 archivos, requiere cuidado |
| 6: Configurar exports | Medio | Subpath exports pueden ser complejos |
| 7: npm install | Bajo | Verificación |
| 8: Verificar compilación | Medio | Posibles errores de resolución |
| 9: Tests e2e | Bajo | Ejecución y validación |

**Suposiciones**: La estructura de carpetas no cambia. Los outputs de compilación deben mantenerse en las mismas rutas.

---

## 8. Puntos críticos y resolución

- **Punto crítico 1: Resolución de módulos TypeScript**
  - Riesgo: TypeScript puede no resolver `@agentic-workflow/core` sin TS project references
  - Impacto: Alto — build falla
  - Estrategia: npm workspaces crea symlinks en `node_modules/`, TypeScript con `moduleResolution: NodeNext` los resuelve. Si falla, añadir `paths` en tsconfig.

- **Punto crítico 2: Output path de extensión VSCode**
  - Riesgo: El `dist/extension/extension.js` podría generarse en otra ruta
  - Impacto: Alto — extensión no arranca
  - Estrategia: Mantener `rootDir: ./src` y `outDir: ./dist` en el tsconfig root. No crear tsconfig por package.

- **Punto crítico 3: Imports de subpaths en core**
  - Riesgo: app importa de `core/backend/index.js` directamente — requiere subpath exports
  - Impacto: Medio — imports específicos fallan
  - Estrategia: Configurar `"exports"` en core package.json para cada subpath usado, o consolidar re-exports en core/index.ts.

---

## 9. Dependencias y compatibilidad
- **Dependencias internas**: app → core (workspace:*), cli → infrastructure/runtime (rutas relativas, sin cambio)
- **Dependencias externas**: npm 9+, Node 20+, TypeScript 5.9.3 — todas compatibles
- **Restricciones arquitectónicas**: Entry point VSCode (`main` en root package.json) debe apuntar a `./dist/extension/extension.js`

---

## 10. Criterios de finalización
- [ ] `npm install` exitoso desde root
- [ ] `npm run compile` exitoso
- [ ] `npx playwright test` pasa idénticamente
- [ ] 3 package.json creados con `"private": true`
- [ ] Root package.json tiene `"workspaces"` configurado
- [ ] Imports de app→core usan `@agentic-workflow/core`

---

## 11. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-16T07:42:30+01:00"
    comments: null
```
