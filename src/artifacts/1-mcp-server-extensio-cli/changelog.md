# Changelog — 1-mcp-server-extensio-cli

Todas las anotaciones notables de este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-06

### Added
- **MCP Server Core:** Implementación del servidor MCP en `tools/mcp-server`.
- **MCP Tools:**
  - `extensio_create`: Automatización de creación de drivers, módulos y proyectos.
  - `extensio_build`: Compilación multi-browser (chrome, firefox, safari).
  - `extensio_test`: Ejecución de suites de test (unit, e2e, integration).
  - `extensio_demo`: Generación de scaffolding para demos.
- **MCP Resources:**
  - `extensio://drivers`: Listado dinámico de drivers en el monorepo.
  - `extensio://modules`: Listado dinámico de módulos en el monorepo.
- **CLI Executor:** Wrapper robusto para `@extensio/cli` con gestión de timeouts y señales de proceso.
- **Documentación:**
  - `README.md`: Guía de instalación y arquitectura.
  - `SETUP-GUIDE.md`: Guía paso a paso para Google Antigravity.
- **Testing:** Suite de tests unitarios con Vitest.

### Changed
- **Monorepo:** Actualización de `package.json` raíz para incluir el workspace `tools/**/*`.

---
*Generado automáticamente por architect-agent.*
