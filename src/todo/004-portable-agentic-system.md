---
artifact: todo_item
owner: architect-agent
status: open
priority: alta
---

# TODO: Portable Agentic System

## Origen
- **Detectado en tarea**: 21-portable-agentic-system
- **Fase**: phase-1-research
- **Fecha**: 2026-01-19
- **Agente**: researcher-agent

## Descripción
Crear un paquete npm portable (`@cmarino/agentic-workflow`) que permita distribuir el sistema de agentes (workflows, roles, templates) de forma agnóstica a Extensio. Incluye un CLI `agentic-workflow init` con asistente de configuración.

## Justificación
Permite aplicar este robusto sistema de orquestación a cualquier tipo de proyecto, desacoplándolo del framework Extensio.

## Impacto estimado
- **Complejidad**: alta
- **Áreas afectadas**: workflows, templates, rules, CLI (nuevo paquete)

## Criterio de aceptación
- [ ] Paquete npm `@cmarino/agentic-workflow` creado y funcional.
- [ ] CLI con comando `init` que crea `AGENTS.md` y carpeta `.agent/`.
- [ ] Asistente de configuración guiado.
- [ ] Workflows y templates desacoplados de Extensio.

## Notas
- Ver investigación inicial en `.agent/artifacts/21-portable-agentic-system/researcher/research.md`.
- **Auditoría Tarea 23**: Se confirma que `AGENTS.md` es el único descriptor contractual faltante para el descubrimiento externo.

---

## Historial
```yaml
history:
  - action: created
    date: 2026-01-19
    by: architect-agent
```
