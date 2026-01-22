---
id: workflow.tasklifecycle.phase-8-commit-push
description: Fase 8 del ciclo de tarea. Consolida y publica los cambios en la rama destino mediante commits normalizados (Conventional Commits), genera changelog y requiere aprobación explícita del desarrollador antes del push final.
owner: architect-agent
version: 1.0.0
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
- Actualizacion del estado en:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Reglas de commits
Ejemplos válidos:
- `feat(extension): add reactive storage driver`
- `fix(core): handle offscreen context lifecycle`
- `refactor(workflows): normalize tasklifecycle phases`
- No se permiten:
- mensajes genéricos (`update`, `changes`, `fix stuff`)
- commits sin scope
- commits que mezclen cambios no relacionados

---

## Pasos obligatorios

0. Activar `architect-agent` y usar prefijo obligatorio en cada mensaje.

1. Verificar inputs
 - Existe `metrics.md` y contiene `Aprobado: SI`.
 - Existe `task.md`.
 - `task.phase.current == aliases.taskcycle-long.phases.phase_8.id`
 - Si falla → ir a **Paso 10 (FAIL)**.

2. Preparar commits
 - Revisar `git status` y `git diff`.
 - Agrupar cambios de forma lógica.
 - Definir número y alcance de commits.

3. Crear commits (OBLIGATORIO)
 - Ejecutar commits siguiendo **Conventional Commits**.
 - Cada commit **DEBE**:
   - tener propósito claro
   - mapear a cambios reales
 - Si algún commit no cumple el formato → **FAIL**.

4. Generar changelog (OBLIGATORIO)
 - Crear:
   - `.agent/artifacts/<taskId>-<taskTitle>/changelog.md`
 - El changelog **DEBE** incluir:
   - lista de commits
   - mensaje completo de cada commit
   - resumen funcional del cambio

5. Solicitar aprobación del desarrollador (OBLIGATORIA, por consola)
 - El desarrollador **DEBE** aprobar explícitamente:
   - el contenido de los commits
   - el push a la rama destino
 - Decisión binaria:
   - **SI** → continuar
   - **NO** → ir a **Paso 10 (FAIL)**

6. Push a la rama destino
 - Ejecutar:
   ```bash
   git push <remote> <branch>
   ```
 - Confirmar que el push fue exitoso.

7. PASS
 - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md`:
   - marcar Fase 8 como completada
   - establecer `task.lifecycle.phases.phase-8-commit-push.validated_at = <ISO-8601>`
   - actualizar `task.phase.updated_at = <ISO-8601>`
   - marcar la tarea como **técnicamente cerrada**
 - Indicar:
   - rama destino
   - referencia de commits

---

## FAIL (OBLIGATORIO)

10. Declarar Fase 8 como **NO completada**
  - Casos de FAIL:
    - resultados no aprobados
    - fase incorrecta
    - commit no cumple Conventional Commits
    - changelog inexistente o incompleto
    - desarrollador no aprueba commit/push
    - fallo en `git push`
  - Acciones obligatorias:
    - corregir mensajes de commit
    - reestructurar commits
    - actualizar changelog
    - volver a solicitar aprobación
  - Terminar bloqueado: no avanzar.

---

## Gate (REQUIRED)

Requisitos (todos obligatorios):
1. Todos los commits cumplen **Conventional Commits**.
2. Existe `.agent/artifacts/<taskId>-<taskTitle>/changelog.md`.
3. El desarrollador ha aprobado explícitamente commit y push.
4. Working tree limpio (`git status` sin cambios).
5. Los cambios están correctamente subidos a la rama destino.
6. `task.md` refleja:
 - Fase 8 completada
 - Tarea cerrada técnicamente
 - `task.lifecycle.phases.phase-8-commit-push.completed == true`
 - `task.lifecycle.phases.phase-8-commit-push.validated_at` no nulo
 - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **Paso 10 (FAIL)**.
