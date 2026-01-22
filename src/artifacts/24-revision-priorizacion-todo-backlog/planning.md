---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 24-revision-priorizacion-todo-backlog
---

# Implementation Plan — 24-revision-priorizacion-todo-backlog

## 1. Resumen del plan
- **Contexto**: Tras la auditoría y análisis, se procede a ejecutar la re-priorización del backlog y la mejora estructural de los templates de agentes.
- **Resultado esperado**: 
  - Backlog de TODOs actualizado y priorizado (con el reset de 'reasoning').
  - Templates de agentes actualizados con secciones `Reasoning` y ejemplos `Few-Shot`.
  - Descriptor `AGENTS.md` creado.
  - Roadmap de portabilidad documentado.
  - Nuevos TODOs de mejora arquitectónica añadidos.
- **Alcance**: Modificación de archivos en `.agent/todo/`, `.agent/templates/` y creación de `AGENTS.md`. No incluye la implementación del paquete npm `@cmarino/agentic-workflow` ni de la paralelización.

## 2. Inputs contractuales
- **Task**: [task.md](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/24-revision-priorizacion-todo-backlog/task.md)
- **Analysis**: [analysis.md](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/24-revision-priorizacion-todo-backlog/analysis.md)
- **Acceptance Criteria**: Profundidad de revisión, prioridad a portabilidad, reset de ítem 001, plan de fases para portable system.

## 3. Desglose de implementación (pasos)

### Paso 1: Actualización y Saneamiento del Backlog (TODOs)
- **Descripción**: Modificar los archivos `.md` en `.agent/todo/` para reflejar las nuevas prioridades y estados (especialmente el reset del 001).
- **Dependencias**: Ninguna.
- **Entregables**: Archivos en `todo/*.md` actualizados.
- **Agente responsable**: architect-agent.

### Paso 2: Excelencia en Templates (Reasoning + Few-Shot)
- **Descripción**: Actualizar los templates (`agent-task.md`, `research.md`, `analysis.md`, `planning.md`, `acceptance.md`) para incluir la sección `Reasoning` (si falta) y un bloque de ejemplo `Few-Shot` realista.
- **Dependencias**: Paso 1.
- **Entregables**: Templates actualizados en `.agent/templates/`.
- **Agente responsable**: architect-agent (en este caso, por ser mejora de estructura de orquestación).

### Paso 3: Infraestructura de Portabilidad (Descriptor)
- **Descripción**: Crear el archivo `AGENTS.md` en la raíz del proyecto para habilitar el descubrimiento externo del sistema.
- **Dependencias**: Ninguna.
- **Entregables**: `AGENTS.md`.
- **Agente responsable**: architect-agent.

### Paso 4: Roadmap y Nuevos TODOs
- **Descripción**: Crear el documento de Roadmap para el sistema portable y añadir los nuevos items de TODO (005, 006) propuestos en el análisis.
- **Dependencias**: Análisis aprobado.
- **Entregables**: `todo/005-*.md`, `todo/006-*.md` y `portable-roadmap.md` (o similar dentro de artifacts).
- **Agente responsable**: architect-agent.

## 4. Asignación de responsabilidades
- **Architect-Agent**: Ejecutará todos los pasos de implementación directamente dado que se trata de la infraestructura de orquestación propia.

## 5. Estrategia de testing y validación
- **Verificación Visual**: Comprobar que los templates renderizan correctamente la sección Reasoning y los ejemplos.
- **Verificación de Enlaces**: Asegurar que los nuevos TODOs están correctamente indexados en `todo/index.md`.
- **Auditoría de AGENTS.md**: Validar que el archivo descriptor contiene los roles y rutas correctas.

## 6. Estimaciones y pesos
- **Paso 1**: Bajo (1 pt).
- **Paso 2**: Alto (5 pts) - Requiere redactar ejemplos de calidad para cada fase.
- **Paso 3**: Bajo (1 pt).
- **Paso 4**: Medio (3 pts).

## 7. Puntos críticos y resolución
- **Punto crítico**: Calidad de los ejemplos Few-Shot.
- **Resolución**: Dedicar tiempo específico a redactar ejemplos que no sean solo "texto dummy", sino que guíen al agente en la toma de decisiones reales.

---

## 8. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-19T17:32:48+01:00"
    comments: "Usuario aprueba el plan de implementación."
```
