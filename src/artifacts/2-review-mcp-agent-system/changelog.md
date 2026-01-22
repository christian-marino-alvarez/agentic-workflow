# Changelog — 2-review-mcp-agent-system

## Resumen del cambio
Migración del sistema de agentes al servidor MCP y mejoras de robustez en la infraestructura de Extensio.

## Commits
- `refactor(mcp-server): improve robust path handling and logging in cli-executor`
  - Mejora de la ejecución de la CLI via `spawn`.
  - Logging detallado a `stderr`.
  - Detección de binario local para evitar fallos de `npx`.
- `refactor(agent-infra): migrate agent roles and workflows to mcp tools`
  - Actualización de `architect`, `driver`, `qa` y `researcher` para usar herramientas MCP.
  - Actualización de los workflows de ciclo de vida.
- `fix(cli): fix TypeError in driver generator non-interactive mode`
  - Corrección de error en el uso de Yeoman environment.
- `docs(artifacts): add task artifacts and metrics for task 2`
  - Inclusión de todo el historial de la tarea y métricas de agentes.

## Impacto
- Los agentes ahora operan de forma nativa con el servidor MCP de Extensio.
- Mayor estabilidad en la creación de drivers vía CLI.
- Trazabilidad completa del desempeño de agentes.
