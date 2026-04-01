🏛️ **architect-agent**: Acceptance Criteria — T24 Workflow Execution Engine

# Acceptance Criteria — 24-workflow-execution-engine

## 1. Consolidated Definition

Implementar un motor de ejecución de workflows en el Runtime Server (sidecar 2) que:

1. **Lea e interprete** los ficheros `.md` de workflows (`.agent/workflows/`) como instrucciones secuenciales de ejecución.
2. **Siga la cadena de PASS**: al completar un workflow, lea la siguiente fase definida en el paso PASS y cargue el siguiente workflow automáticamente.
3. **Identifique el agente owner** de cada workflow (campo `owner` del frontmatter YAML) y el architect orqueste las delegaciones.
4. **Gestione Gates** con UI interactiva: botones SI/NO, radio buttons para resolución de dudas, presentaciones visuales con A2UI o componentes equivalentes.
5. **Persista el estado** en el Runtime Server, con análisis de la mejor solución de persistencia/BBDD.
6. **Exponga un panel dedicado** (no en el chat) que muestre: workflow activo, constituciones cargadas, ficheros de contexto requeridos, progreso de fases.
7. **El chat muestra solo**: progreso de tarea, informes resumidos con link al artefacto completo. **NUNCA** el contenido raw de los ficheros de workflow.

## 2. Answers to Clarification Questions

| # | Question (formulated by architect) | Answer (from developer) |
|---|-----------------------------------|------------------------|
| 1 | ¿Qué workflows debe ejecutar en esta primera iteración? | Todos. Se lee primero init, se cargan contextos, y al completarse se sigue al PASS. El motor interpreta el workflow, identifica el agente owner, y el architect orquesta delegando. |
| 2 | ¿El engine vive en Chat o en un módulo nuevo? | En el **Runtime Server** (sidecar). |
| 3 | ¿Dónde se persiste el estado de progreso? | En el **Runtime Server**. Analizar la mejor solución de persistencia o BBDD. |
| 4 | ¿Cómo funciona el gate en el chat? | Mediante **botones de confirmación** (UI interactiva). Usar A2UI o una colección de componentes preparada. No solo confirmaciones sino presentaciones visuales en HTML con radio buttons para resolver dudas. |
| 5 | ¿Qué nivel de detalle se muestra en el chat? | **No mostrar** workflow internals. Panel dedicado para ver: workflow cargado, constituciones requeridas, ficheros de contexto. El chat es solo para información de tarea, presentación de informes resumidos con link al artefacto para abrir en página completa. |

---

## 3. Verifiable Acceptance Criteria

1. **Scope**:
   - Motor de ejecución de workflows en `RuntimeServer` (sidecar 2).
   - Parser de workflows `.md` con extracción de: frontmatter YAML, steps, gates, PASS/FAIL.
   - Panel dedicado de metadatos de workflow (UI, módulo nuevo o sección en Runtime).
   - Integración con Chat para gates interactivos y mensajes de progreso.

2. **Inputs / Data**:
   - Ficheros `.agent/workflows/**/*.md` (workflows).
   - Ficheros `.agent/rules/constitution/**/*.md` (constituciones).
   - `.agent/index.md` (índice de aliases).
   - Estrategia definida en `init.md` (`long` o `short`).

3. **Outputs / Expected Result**:
   - Workflows ejecutados secuencialmente según cadena PASS.
   - Gates presentados con botones interactivos en el chat.
   - Panel de metadatos visible con workflow activo, constituciones y contexto.
   - Artefactos creados automáticamente según templates.
   - Chat con resúmenes e informes + links a artefactos.

4. **Constraints**:
   - El Runtime Server es el único responsable de interpretar workflows.
   - El chat NO muestra contenido raw de los workflows.
   - Persistencia analizada y justificada (SQLite, JSON files, LevelDB, etc.).
   - UI de gates usa componentes estándar (A2UI o similar).
   - Arquitectura modular: modular-architecture constitution respetada.

5. **Acceptance Criterion (Done)**:
   - [ ] El Runtime Server puede cargar, parsear e interpretar un workflow `.md`.
   - [ ] Al completar un workflow (PASS), avanza automáticamente al siguiente definido.
   - [ ] Los gates se presentan con botones interactivos en el chat.
   - [ ] El panel dedicado muestra el workflow activo, constituciones cargadas y ficheros de contexto.
   - [ ] El chat muestra solo progreso, informes resumidos y links a artefactos.
   - [ ] El estado del workflow se persiste en el Runtime Server entre sesiones.
   - [ ] `npm run compile` pasa sin errores.

---

## Approval (Gate 0)
This document constitutes the task contract. Its approval is blocking to proceed to Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-21T23:22:12+01:00"
    comments: null
```

---

## Validation History (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-02-21T23:18:56+01:00"
    notes: "Acceptance criteria defined from developer's 5 answers"
```
