---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 2-review-mcp-agent-system
---

# Research Report — 2-review-mcp-agent-system

## 1. Resumen ejecutivo
- **Problema investigado**: Desalineamiento entre el sistema de agentes (`.agent`) y el nuevo servidor MCP `@extensio/mcp-server`. Actualmente, los agentes intentan usar la CLI directamente vía shell (`tools.extensio_cli`), lo cual rompe la abstracción MCP.
- **Objetivo de la investigación**: Auditar el servidor MCP actual, verificar su funcionalidad y localizar todas las referencias obsoletas en la infraestructura de agentes para su migración.
- **Principales hallazgos**: 
  - El servidor MCP está operativo y expone 4 herramientas: `extensio_create`, `extensio_build`, `extensio_test` y `extensio_demo`.
  - El ejecutor interno usa `npx @extensio/cli` garantizando independencia de instalación global.
  - Existen al menos 10 archivos en `.agent` con referencias "hardcoded" al tool antiguo.
  - No hay tests automatizados para el servidor MCP, solo scaffolding.

---

## 2. Necesidades detectadas
- **Actualización de Roles**: Los roles `architect`, `driver`, `qa` y `researcher` dependen de `tools.extensio_cli`. Deben migrar a `mcp_extensio-cli_*`.
- **Actualización de Workflows**: El workflow `drivers/create.md` y las fases de `tasklifecycle` necesitan actualizar sus instrucciones de herramientas.
- **Auditoría de Errores**: Se detectó que el servidor MCP asume `process.cwd()` como root del monorepo; debe verificarse que esto se mantiene en todos los entornos de ejecución del agente.
- **Consistencia de Schemas**: Zod se usa en el MCP pero los schemas de entrada en los `.md` de `.agent` son manuales.

---

## 3. Alternativas tecnicas
1. **Migración Directa (Recomendada)**: Actualizar todos los `.md` para usar los nombres de herramientas MCP (`mcp_extensio-cli_extensio_create`).
   - **Pros**: Alineación total con el ecosistema de agentes; aprovecha el Tipado/Zod del MCP.
   - **Contras**: Requiere edición múltiple de archivos.
2. **Wrapper de Adaptación**: Crear un alias de tool en Antigravity que mapee `extensio_cli` a llamadas MCP.
   - **Pros**: Menos cambios en workflows.
   - **Contras**: Añade una capa de complejidad innecesaria y oculta la naturaleza MCP del sistema.

---

## 4. APIs Web / WebExtensions relevantes
- No aplica directamente al servidor MCP (Node.js), pero el servidor facilita el acceso a las APIs de scaffolding para drivers.

---

## 5. Compatibilidad multi-browser
- El servidor MCP es agnóstico al browser (Node.js).
- Los comandos que lanza (`build`, `test`) sí manejan compatibilidad vía flags `--browsers`, lo cual está correctamente expuesto en los schemas MCP.

---

## 6. Recomendaciones AI-first
- **Resources**: Aprovechar los recursos MCP `extensio://drivers` y `extensio://modules` para que los agentes puedan realizar "auto-discovery" antes de proponer cambios, evitando errores de duplicidad.
- **Sugerencia de Error**: Mejorar los mensajes de error en `cli-executor.ts` para que incluyan sugerencias accionables para el agente basándose en el `stderr`.

---

## 7. Riesgos y trade-offs
- **Riesgo**: `npx` puede ser lento o fallar si no hay conexión o el registro está caído.
- **Severidad**: Media.
- **Mitigación**: Asegurar que `/packages/cli` esté built localmente y considerar usar el path relativo al bin si el entorno lo permite.

---

## 8. Fuentes
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Extensio Architecture Rules](file:///Users/milos/Documents/workspace/extensio/.agent/rules/constitution/extensio-architecture.md)

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-06T22:02:40+01:00
    comments: null
```
