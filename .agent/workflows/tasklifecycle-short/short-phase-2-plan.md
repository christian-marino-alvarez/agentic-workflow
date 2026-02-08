---
id: workflow.tasklifecycle-short.short-phase-2-plan
description: Fase 2 del ciclo Short. Define el plan de implementacion basado en el analisis aprobado.
owner: architect-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["short-phase-2", "plan", "planning"]
blocking: true
---

# WORKFLOW: tasklifecycle-short.short-phase-2-plan

## Input (REQUIRED)
- Existe analisis aprobado: `.agent/artifacts/<taskId>-<taskTitle>/analisis.md`
- task.md refleja `task.phase.current == "short-phase-2-plan"`

> [!IMPORTANT]
> **Constitucion activa (OBLIGATORIO)**:
> - Cargar `constitution.clean_code` antes de iniciar
> - Cargar `constitution.architecture` (Principios de desacoplamiento y Facades)
> - Cargar `constitution.oocss` (Mandatorio para tareas con UI/CSS)
> - Cargar `constitution.agents_behavior` (seccion 7: Gates, seccion 8: Constitucion)

## Output (REQUIRED)
- Plan de implementacion: `.agent/artifacts/<taskId>-<taskTitle>/plan.md`
- Task actualizado.

## Objetivo (ONLY)
- Traducir el analisis a un plan ejecutable.
- Definir pasos, entregables y verificacion.

> Esta fase **NO implementa codigo**.
> Esta fase **REQUIERE aprobacion explicita del desarrollador (SI/NO)**.

---

## Pasos obligatorios

0. Activar `architect-agent` y usar prefijo obligatorio en cada mensaje.

### 1. Verificar inputs
- Existe `analisis.md` aprobado.
- `task.phase.current == "short-phase-2-plan"`.
- Si falla -> **FAIL**.

### 2. Crear artefacto plan.md
- Usar template `templates.plan`.
- Incluir pasos ordenados, entregables y estrategia de verificacion.

### 3. Solicitar aprobacion del desarrollador (por consola)
```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```
- Si `decision != SI` -> **FAIL**.

### 4. PASS
- Actualizar task.md:
  - Marcar fase como completada.
  - Establecer `task.lifecycle.phases.short-phase-2-plan.validated_at = <ISO-8601>`.
  - Actualizar `task.phase.updated_at = <ISO-8601>`.
  - Avanzar a `short-phase-3-implementation`.

---

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existe `plan.md` con template correcto.
2. El `plan.md` inicia con el prefijo del `architect-agent`.
3. Existe aprobacion explicita del desarrollador.
4. task.md refleja fase completada.
5. task.md refleja timestamp y estado:
   - `task.lifecycle.phases.short-phase-2-plan.completed == true`
   - `task.lifecycle.phases.short-phase-2-plan.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Indicar que requisito falta.
- Bloquear hasta resolver.
