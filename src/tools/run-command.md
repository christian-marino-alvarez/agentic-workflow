---
id: tool.run_command
type: tool
owner: architect-agent
version: 1.0.0
severity: PERMANENT
scope: global

name: run_command
runtime: shell
invocation: shell

allowed_commands:
  - "npx tsc --noEmit"
  - "npx eslint . --ext .ts,.mts,.tsx"
  - "git diff --name-only --diff-filter=ACMR"

constraints:
  destructive_requires_approval: true
  network_access_requires_approval: true
---

# TOOL: run_command

## Objetivo
Tool generico para ejecutar comandos de terminal cuando no existe un MCP tool especifico.
Se usa principalmente para validaciones locales (TypeScript, ESLint) y utilidades de git.

## Uso
- Usar este tool solo cuando no haya un tool dedicado en `.agent/tools/index.md`.
- Si el comando es destructivo o requiere red, pedir aprobacion explicita.

## Ejemplos de uso
- Validacion TypeScript:
  - `npx tsc --noEmit`
- Validacion ESLint:
  - `npx eslint . --ext .ts,.mts,.tsx`
- Archivos modificados:
  - `git diff --name-only --diff-filter=ACMR`

## Seguridad
- Comandos destructivos o con acceso a red requieren aprobacion explicita del desarrollador.
