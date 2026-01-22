---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 2-review-mcp-agent-system
---

# Analysis — 2-review-mcp-agent-system

## 1. Resumen ejecutivo
**Problema**
- El ecosistema de agentes (`.agent`) utiliza actualmente `tools.extensio_cli` mediante shell directa, lo cual es inconsistente con el nuevo servidor MCP `@extensio/mcp-server`. Además, el servidor MCP requiere una auditoría para asegurar que delega correctamente en la CLI y cumple con los estándares de Extensio.

**Objetivo**
- Migrar y unificar el acceso a la CLI via MCP, auditando y corrigiendo el servidor MCP para garantizar su robustez y alineación arquitectónica.

**Criterio de éxito**
- Todos los acceptance criteria (AC-1 a AC-5) han sido validados y mapeados a una solución técnica ejecutable.

---

## 2. Estado del proyecto (As-Is)
**Estructura relevante**
- `tools/mcp-server`: Servidor MCP basado en Node.js y MCP SDK.
- `.agent/`: Contiene `rules/roles`, `workflows` y `artifacts` que referencian la CLI antigua.
- `packages/cli`: La CLI real (`ext`).

**Drivers existentes**
- No aplica directamente (el MCP es un Tool de infraestructura).

**Core / Engine / Surfaces**
- El MCP debe integrarse como un `tool` global disponible para los agentes Antigravity.

**Artifacts / tareas previas**
- Tarea 1 (`1-mcp-server-extensio-cli`): Creación inicial del servidor (ya implementada).

**Limitaciones detectadas**
- El servidor MCP asume `process.cwd()` lo cual puede ser frágil en entornos distribuidos.
- Falta de logs detallados en `cli-executor.ts` para depuración de fallos de la CLI.

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Adaptación de Herramientas
- **Interpretación**: Reemplazar `tools.extensio_cli` por `mcp_extensio-cli_*` en todos los archivos `.md`.
- **Verificación**: `grep -r "extensio_cli" .agent` no debe devolver resultados (excepto en logs/archivos históricos).
- **Riesgos**: Rotura de workflows si los nombres de parámetros MCP no coinciden exactamente con lo esperado por los prompts del agente.

### AC-2: Uso de "ext" vía MCP
- **Interpretación**: Validar que `mcp_extensio-cli_extensio_create` ejecuta correctamente `npx @extensio/cli create`.
- **Verificación**: Ejecución manual controlada durante la fase de implementación.
- **Riesgos**: Fallos de permisos en `spawn` o falta de `node_modules` en `packages/cli`.

### AC-3: Auditoría Completa
- **Interpretación**: Revisar `src/tools`, `src/resources` y `src/utils`.
- **Verificación**: Checklist de revisión de código (Clean Code Extensio).
- **Riesgos**: Deuda técnica oculta en la gestión de errores del SDK de MCP.

### AC-4: Testing Automatizado
- **Interpretación**: Añadir `tools/mcp-server/test` con Vitest.
- **Verificación**: `npm run test` en la carpeta del servidor.
- **Riesgos**: Necesidad de mockear `child_process.spawn` para evitar efectos laterales durante tests unitarios.

### AC-5: Validación con Demo Real
- **Interpretación**: Usar el Agente (esta misma sesión) para crear un driver ficticio usando los nuevos tools.
- **Verificación**: Existencia de un nuevo driver funcional post-demo.
- **Riesgos**: Inconsistencia entre la versión local de la CLI y el servidor MCP.

---

## 4. Research técnico
Basado en `research.md`:

- **Alternativa A: Migración Directa (Elegida)**
  - Reemplazo total de referencias directas por llamadas MCP.
  - **Ventajas**: Coherencia técnica, tipado fuerte via Zod.
  - **Inconvenientes**: Esfuerzo de edición manual.

- **Alternativa B: Alias Wrapper**
  - Mantener nombres antiguos.
  - **Inconvenientes**: Confusión y desvío de la arquitectura MCP.

---

## 5. Agentes participantes
- **architect-agent**
  - Responsable de la coherencia en `.agent/` y la auditoría de `mcp-server`.
- **qa-agent**
  - Responsable de implementar los nuevos tests en `tools/mcp-server/test`.

**Handoffs**
- El architect define el contrato en `analysis.md` y `plan.md`.
- El implementador ejecuta cambios.
- El QA valida.

**Componentes necesarios**
- Modificar: `tools/mcp-server` (código), `.agent/` (documentación/reglas).

**Demo (si aplica)**
- Se requiere demo de creación de driver vía MCP para cerrar la tarea.

---

## 6. Impacto de la tarea
- **Arquitectura**: Consolidación definitiva de MCP como capa de abstracción para herramientas de desarrollo.
- **APIs / contratos**: Las herramientas ahora tienen esquemas Zod estrictos.
- **Testing**: Se introduce la cultura de testeo en herramientas de infraestructura del monorepo.

---

## 7. Riesgos y mitigaciones
- **Riesgo 1: Pathing del CLI**
  - Impacto: Fallo al encontrar el binario de la CLI.
  - Mitigación: Forzar `npx --yes` y verificar el `cwd` dinámicamente.
- **Riesgo 2: Breaking Changes en Workflows**
  - Impacto: Agentes dejan de saber cómo crear drivers.
  - Mitigación: Actualizar exhaustivamente todos los workflows en una sola fase atómica.

---

## 8. Preguntas abiertas
- ¿Existen servidores MCP adicionales planeados que deban seguir este mismo patrón de auditoría? (Idealmente abordado en el plan).

---

## 9. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

- **Aprobado por desarrollador:** ☑ Sí ☐ No  
- **Fecha:** 2026-01-06T22:03:45+01:00
- **Comentarios (opcional):** Aprobado por el usuario.
