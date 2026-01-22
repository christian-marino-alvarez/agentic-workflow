---
id: tool.extensio_cli
type: tool
owner: architect-agent
version: 1.0.0
severity: PERMANENT
scope: global

name: "@extensio/cli"
runtime: node
invocation: shell

allowed_commands:
  - "npx @extensio/cli --help"
  - "npx @extensio/cli create --type driver --name <name> <params>"
  - "npx @extensio/cli create --type module --name <name> <params>"
  - "npx @extensio/cli create --type project --name <name> <params>"
  - "npx @extensio/cli demo --type <type> --name <name> <params>"
  - "npx @extensio/cli build"
  - "npx @extensio/cli test"

constraints:
  destructive_requires_approval: true
  requires_constitution:
    - constitution.drivers
---

# TOOL: @extensio/cli

## Objetivo
Tool oficial para **scaffolding, build y testing** en Extensio.
Permite crear entidades (drivers, modules, projects) y ejecutar build/test siguiendo la constitucion.

## Uso
- Los agentes **DEBEN** usar este tool para crear drivers cuando el comando exista.
- La ejecución real del comando se realiza fuera de Antigravity
  (IDE, CI o intervención humana).
- `ext build` compila el `src/` del directorio actual. Debe ejecutarse desde el root
  del modulo. Si una demo es un modulo dentro de un modulo padre, tambien se usa
  `ext build` ejecutandolo desde la carpeta de la demo.

## Ejemplos de uso
- Ayuda:
  - `npx @extensio/cli --help`
- Crear driver:
  - `npx @extensio/cli create --type driver --name prompt-ai --methods "createSession,prompt,close" --platforms "chrome" --includeDemo true --non-interactive`
- Crear modulo:
  - `npx @extensio/cli create --type module --name storage-core --inheritsCore true --withEngine true --withSurface false --non-interactive`
- Crear proyecto:
  - `npx @extensio/cli create --type project --name extensio-app --targetPath ./packages --non-interactive`
- Crear demo para driver existente:
  - `npx @extensio/cli demo --type driver --name prompt-ai --non-interactive`
- Crear demo para modulo existente:
  - `npx @extensio/cli demo --type module --name storage-core --non-interactive`
- Build:
  - `npx @extensio/cli build --browsers chrome,firefox --types --no-launch`
- Tests:
  - `npx @extensio/cli test --type unit --coverage --non-interactive`
  - `npx @extensio/cli test --type e2e --browsers chromium --no-headless --non-interactive`

## Seguridad
- Los comandos destructivos requieren aprobación explícita del desarrollador (`SI | NO`).

## Notas
- Usar siempre `npx` para evitar dependencias globales.

## Guia rapida (CLI local)
Si agregas un comando nuevo al CLI, debes regenerar `dist/`:
1. Instalar dependencias del workspace:
   - `npm install`
2. Compilar el CLI:
   - `cd packages/cli && npm run build`
3. Verificar el bin:
   - `node dist/index.mjs --help`

Nota: `packages/**/dist` esta en `.gitignore`, por lo que el bin requiere build local.
