---
id: workflow.tasklifecycle.phase-8-commit-push
description: Fase 8 del ciclo de tarea. Consolida y publica los cambios en la rama destino mediante commits normalizados (Conventional Commits), genera changelog y requiere aprobación explícita del desarrollador antes del push final.
owner: architect-agent
version: 1.1.0
severity: PERMANENT
trigger:
  commands: ["phase8", "phase-8", "commit", "push"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-8-commit-push

## Input (REQUIRED)
- Existe el informe de evaluacion de agentes:
  - `.agent/artifacts/<taskId>-<taskTitle>/metrics.md`
- Existe la current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- El `task.md` **DEBE** reflejar:
  - `task.phase.current == aliases.taskcycle-long.phases.phase_8.id`

> [!IMPORTANT]
> **Constitución activa (OBLIGATORIO)**:
> - Cargar `constitution.extensio_architecture` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)

## Output (REQUIRED)
- Crear changelog:
  - `.agent/artifacts/<taskId>-<taskTitle>/changelog.md`
- Actualizacion del estado en `task.md`.

## Objetivo (ONLY)
- Consolidar y publicar los cambios.
- Obtener aprobación (SI) del desarrollador para el push final.

---

## Pasos obligatorios

0. **Activación de Rol y Prefijo (OBLIGATORIO)**
   - El `architect-agent` **DEBE** comenzar su intervención identificándose.
   - Mensaje: `🏛️ **architect-agent**: Iniciando Phase 8 - Commit & Push.`

1. Verificar inputs (`task.md`, `metrics.md`).

2. Preparar y ejecutar commits siguiendo **Conventional Commits**.

3. Generar changelog (`changelog.md`).

4. Solicitar aprobación del desarrollador (OBLIGATORIA, por consola)
   - Exigir decisión binaria **SI**.
   - Registrar aprobación en el historial o changelog si aplica.

5. Push a la rama destino.

6. PASS
   - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md` (usando prefijo).
   - Marcar fase completada y tarea cerrada técnicamente.

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Todos los commits cumplen **Conventional Commits**.
2. Existe `changelog.md`.
3. El desarrollador ha aprobado explícitamente (SI).
4. `task.md` refleja timestamps y estado final:
   - Tarea cerrada técnicamente
   - `task.lifecycle.phases.phase-8-commit-push.completed == true`
   - `task.lifecycle.phases.phase-8-commit-push.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **FAIL**.
