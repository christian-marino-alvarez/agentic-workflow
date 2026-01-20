---
id: workflow.tasklifecycle-short.short-phase-1-brief
description: Fase 1 del ciclo Short. Fusiona Acceptance + Analysis + Planning. Incluye 5 preguntas obligatorias y detección de complejidad.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["short-phase-1", "brief"]
blocking: true
---

# WORKFLOW: tasklifecycle-short.short-phase-1-brief

## Pasos obligatorios

0. **Activación de Rol y Prefijo (OBLIGATORIO)**
   - El `architect-agent` **DEBE** comenzar su intervención identificándose.
   - Mensaje: `🏛️ **architect-agent**: Iniciando Phase 1 Short - Brief.`

1. Verificar inputs
   - Existe task candidate.
   - `task.strategy == "short"`.

2. Ejecutar 5 preguntas obligatorias.

3. Análisis de complejidad.

4. Crear artefactos (`brief.md` y `acceptance.md`) usando templates.

5. Solicitar aprobación del desarrollador (por consola)
   - Exigir decisión binaria **SI**.
   - Registrar en `brief.md`: `decision: SI`.

6. PASS
   - Actualizar `task.md` (usando prefijo):
     - Marcar fase como completada.
     - Establecer timestamps y avanzar a Phase 2 Short.

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existen `brief.md` y `acceptance.md` con templates correctos.
2. Existe aprobación explícita del desarrollador registrada en `brief.md`:
   - `approval.developer.decision == SI`
3. `task.md` refleja timestamps y estado:
   - `task.lifecycle.phases.short-phase-1-brief.completed == true`
   - `task.lifecycle.phases.short-phase-1-brief.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Bloquear hasta resolver.
