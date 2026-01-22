# Task: Refinar Sistema de Agentes y Ciclo de Vida

## Identificación
- id: 19
- title: refinar-sistema-agentes-ciclo-vida
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Optimizar el flujo de desarrollo agéntico del framework Extensio asegurando:
- Separación estricta entre Research (investigación pura) y Análisis (propuestas de solución)
- Delegación granular de tareas con aprobación obligatoria del desarrollador
- Rol auditor del QA que delega correcciones en lugar de aplicarlas
- Integración del backlog TODO en el ciclo de análisis

## Objetivo
Tener un flow de desarrollo ayudado por AI y auditado en todo momento por el desarrollador, donde cada fase tiene responsabilidades claras y los LLMs obedecen reglas arquitectónicas de forma estricta.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "19"
  title: "refinar-sistema-agentes-ciclo-vida"
  strategy: "long"
  phase:
    current: "phase-8-commit-push"
    validated_by: "architect-agent"
    updated_at: "2026-01-18T18:43:42+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-18T18:13:40+01:00"
      phase-1-research:
        completed: true
        validated_by: researcher-agent
        validated_at: "2026-01-18T18:23:49+01:00"
      phase-2-analysis:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-18T18:27:46+01:00"
      phase-3-planning:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-18T18:30:04+01:00"
      phase-4-implementation:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-18T18:41:32+01:00"
      phase-5-verification:
        completed: true
        validated_by: qa-agent
        validated_at: "2026-01-18T18:42:47+01:00"
      phase-6-results-acceptance:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-18T18:43:42+01:00"
      phase-7-evaluation:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-18T18:43:42+01:00"
      phase-8-commit-push:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-18T18:44:58+01:00"
```

## 5 Preguntas Obligatorias (Phase 0)

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | ¿La investigación debe incluir búsqueda web de best practices para prompting de LLMs, o se limita a documentación interna? | Ambas. Buscar información en web es crucial pero debe ser verídica y de sitios oficiales o de prestigio. |
| 2 | ¿Cuántas alternativas de solución mínimas debe proponer la fase de Análisis? | Las necesarias según el análisis, ya que depende de la investigación previa. |
| 3 | ¿Una subtarea puede abarcar múltiples archivos del mismo componente? | Una subtarea debe tener un objetivo único. Si se crea una issue, el objetivo es solucionar ese problema específico. |
| 4 | ¿Dónde debe residir la lista de TODOs detectados durante la Implementación? | En `.agent/todo/` al mismo nivel que rules. Será el backlog de mejora continua y debe incluirse en cada análisis. |
| 5 | ¿El agente QA solo ejecuta tests automatizados o también validación manual? | Ambas: tests automatizados (Vitest/Playwright) y validación manual de workflows/reglas. |

---

## Acceptance Criteria (OBLIGATORIO)

1. **Alcance**:
   - Modificar workflows de Phase 1 (Research), Phase 2 (Analysis), Phase 3 (Planning), Phase 4 (Implementation), Phase 5 (Verification)
   - Crear estructura `.agent/todo/` para backlog de mejora continua

2. **Entradas / Datos**:
   - Workflows actuales en `.agent/workflows/tasklifecycle-long/`
   - Templates actuales en `.agent/templates/`
   - Constituciones en `.agent/rules/constitution/`
   - Best practices de prompting de LLMs (fuentes oficiales)

3. **Salidas / Resultado esperado**:
   - Workflows actualizados con separación clara Research vs Análisis
   - Template de TODO integrado en el ciclo
   - Rol de QA reforzado como auditor final
   - Documentación de best practices para obediencia de LLMs

4. **Restricciones**:
   - Solo fuentes oficiales o de prestigio para investigación web
   - No romper compatibilidad con tareas existentes
   - Cada subtarea = un objetivo único

5. **Criterio de aceptación (Done)**:
   - [ ] Research documenta sin analizar, referenciando arquitectura Extensio
   - [ ] Análisis propone alternativas basadas exclusivamente en Research
   - [ ] Plan asigna subtareas con un agente y objetivo únicos
   - [ ] Implementación requiere Gate por cada subtarea
   - [ ] QA delega correcciones al Arquitecto sin modificar código
   - [ ] TODO backlog funcional en `.agent/todo/`

## Historial de validaciones (append-only)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-18T18:13:40+01:00"
    notes: "Acceptance criteria definidos tras 5 preguntas al desarrollador"
```

## Reglas contractuales
- Este fichero es la **fuente única de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- Una fase **NO puede marcarse como completed** si no es la fase actual.
