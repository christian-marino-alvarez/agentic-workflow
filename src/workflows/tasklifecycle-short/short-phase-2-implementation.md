---
id: workflow.tasklifecycle-short.short-phase-2-implementation
description: Fase 2 del ciclo Short. Ejecuta la implementación según el brief aprobado.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["short-phase-2", "implementation"]
blocking: true
---

# WORKFLOW: tasklifecycle-short.short-phase-2-implementation

## Pasos obligatorios

0. **Activación de Rol y Prefijo (OBLIGATORIO)**
   - El `architect-agent` **DEBE** comenzar su intervención identificándose.
   - Mensaje: `🏛️ **architect-agent**: Iniciando Phase 2 Short - Implementation.`

1. Protocolo de Validación Pre-Vuelo (OBLIGATORIO)
   - Leer físicamente `brief.md`.
   - **Citar explícitamente** aprobación: `decision: SI`.

2. Ejecutar implementación según `brief.md`.
   - **Gate A (Activación)**: El agente debe esperar a ser activado por el desarrollador.
   - **Gate B (Reasoning)**: El agente debe presentar su razonamiento antes de ejecutar.
   - **PROHIBIDO**: No usar herramientas sin Gates PASS.

3. Revisión arquitectónica (OBLIGATORIA)
   - El `architect-agent` **DEBE** verificar el cumplimiento de AC y arquitectura.

4. Crear informe de implementación.
   - Crear `.agent/artifacts/<taskId>-<taskTitle>/architect/implementation.md`.

5. Solicitar aprobación del desarrollador (OBLIGATORIA, por consola)
   - Exigir decisión binaria **SI**.
   - Registrar en `architect/implementation.md`: `decision: SI`.

6. PASS
   - Actualizar `task.md` (usando prefijo):
     - Marcar fase como completada.
     - Establecer timestamps y avanzar a Phase 3 Short.

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existe informe de implementación con estado APROBADO.
2. Existe aprobación explícita del desarrollador registrada en `architect/implementation.md`:
   - `approval.developer.decision == SI`
3. `task.md` refleja timestamps y estado:
   - `task.lifecycle.phases.short-phase-2-implementation.completed == true`
   - `task.lifecycle.phases.short-phase-2-implementation.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Bloquear hasta resolver.
