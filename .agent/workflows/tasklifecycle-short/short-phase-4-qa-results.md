---
id: workflow.tasklifecycle-short.short-phase-4-qa-results
description: Fase 4 del ciclo Short. QA y presentacion de resultados.
owner: architect-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["short-phase-4", "qa", "qa-results"]
blocking: true
---

# WORKFLOW: tasklifecycle-short.short-phase-4-qa-results

## Input (REQUIRED)
- Existe implementacion completada.
- task.md refleja `task.phase.current == "short-phase-4-qa-results"`

> [!IMPORTANT]
> **Constitucion activa (OBLIGATORIO)**:
> - Cargar `constitution.clean_code` antes de iniciar
> - Cargar `constitution.agents_behavior` (seccion 7: Gates, seccion 8: Constitucion)

## Output (REQUIRED)
- Artefacto QA y resultados: `.agent/artifacts/<taskId>-<taskTitle>/qa-results.md`
- Task actualizado.

## Objetivo (ONLY)
- Registrar verificaciones y resultados finales.
- Presentar cambios y estado de acceptance criteria.

> Esta fase **NO implementa codigo**.
> Esta fase **REQUIERE aprobacion explicita del desarrollador (SI/NO)**.

---

## Pasos obligatorios

0. Activar `architect-agent` y usar prefijo obligatorio en cada mensaje.

### 1. Verificar inputs
- Existe implementacion y reporte de implementacion.
- `task.phase.current == "short-phase-4-qa-results"`.
- Si falla -> **FAIL**.

### 2. Crear artefacto qa-results.md
- Usar template `templates.qa_results`.
- Incluir:
  - Tests ejecutados.
  - Estado de acceptance criteria.
  - Resumen de cambios.

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
  - Establecer `task.lifecycle.phases.short-phase-4-qa-results.validated_at = <ISO-8601>`.
  - Actualizar `task.phase.updated_at = <ISO-8601>`.
  - Avanzar a fase final de cierre del short (si aplica en el flujo general).

---

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existe `qa-results.md` con template correcto.
2. El `qa-results.md` inicia con el prefijo del `architect-agent`.
3. Existe aprobacion explicita del desarrollador.
4. task.md refleja fase completada.
5. task.md refleja timestamp y estado:
   - `task.lifecycle.phases.short-phase-4-qa-results.completed == true`
   - `task.lifecycle.phases.short-phase-4-qa-results.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Indicar que requisito falta.
- Bloquear hasta resolver.
