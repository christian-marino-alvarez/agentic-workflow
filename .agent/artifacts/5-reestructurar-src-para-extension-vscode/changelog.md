---
artifact: changelog
phase: phase-8-commit-push
owner: architect-agent
status: approved
related_task: 5-reestructurar-src-para-extension-vscode
target_branch: develop
---

# Changelog — 5-reestructurar-src-para-extension-vscode

🏛️ **architect-agent**: Registro de cambios de la reestructuración.

## 1. Resumen general
Reestructuración completa del repositorio para soportar el desarrollo de una extensión de VSCode manteniendo el sistema legacy. `src` ahora actúa como raíz de la extensión, y el código existente se ha migrado a `src/agentic-system-structure`.

- **Objetivo dela tarea**: Preparar el terreno para la extensión VSCode.
- **Impacto principal**: Cambio de rutas de importación y estructura de carpetas. Entry point de VSCode añadido.
- **Áreas afectadas**: Core, CLI, Build Scripts, Configuración (package.json, tsconfig).

---

## 2. Commits incluidos

### Commit 1
- **Hash**: `HEAD` (Recién creado)
- **Mensaje**: `refactor(structure): reestructurar src para extension vscode`
- **Detalle**:
  - Mueve el código core a `src/agentic-system-structure`.
  - Añade scaffolding de extensión VSCode en raíz de `src` (`extension.ts`).
  - Actualiza `package.json` (scripts, deps, activationEvents).
  - Actualiza `tsconfig.json` y `launch.json`.
  - Actualiza `bin/cli.js` para apuntar a las nuevas rutas.
  - Elimina `scripts/build-bootstrap-test.mjs` (deprecado).
