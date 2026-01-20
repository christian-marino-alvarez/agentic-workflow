---
id: workflow.tasklifecycle-short.short-phase-3-closure
description: Fase 3 del ciclo Short. Fusiona Verification + Results + Commit.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["short-phase-3", "closure"]
blocking: true
---

# WORKFLOW: tasklifecycle-short.short-phase-3-closure

## Pasos obligatorios

0. **Activación de Rol y Prefijo (OBLIGATORIO)**
   - El `architect-agent` **DEBE** comenzar su intervención identificándose.
   - Mensaje: `🏛️ **architect-agent**: Iniciando Phase 3 Short - Closure.`

1. Protocolo de Validación Pre-Vuelo (OBLIGATORIO)
   - Leer físicamente el informe de implementación aprobado.
   - **Citar explícitamente** aprobación: `decision: SI`.

2. Ejecutar verificación técnica.

3. Crear artefacto `closure.md` usando `templates.closure`.

4. Solicitar aceptación final por consola (SI) y registrarla en `closure.md`.

5. Evaluar agentes (OBLIGATORIO)
   - Solicitar puntuación (1-10) del desarrollador para cada agente.
   - **GATE OBLIGATORIO**: Sin puntuación, la tarea NO puede cerrarse.

6. Consolidar commits siguiendo Conventional Commits.

7. PASS
   - Marcar tarea como **COMPLETADA** en `task.md` (usando prefijo).
   - Establecer timestamps finales.

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existe `closure.md` con aceptación final del desarrollador (**SI**).
2. Se han registrado las puntuaciones de los agentes.
3. `task.md` refleja tarea completada y cerrada.
4. `task.md` refleja timestamps y estado:
   - `task.lifecycle.phases.short-phase-3-closure.completed == true`
   - `task.lifecycle.phases.short-phase-3-closure.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Bloquear hasta resolver.
