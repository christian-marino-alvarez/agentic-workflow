---
id: workflow.tasklifecycle-short.short-phase-1-brief
description: Fase 1 del ciclo Short. Fusiona Acceptance + Analysis + Planning. Incluye 5 preguntas obligatorias y detección de complejidad.
owner: architect-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["short-phase-1", "brief"]
blocking: true
---

# WORKFLOW: tasklifecycle-short.short-phase-1-brief

## Input (REQUIRED)
- Existe task candidate con `task.strategy: short`.
- El desarrollador ha proporcionado título y objetivo.

> [!IMPORTANT]
> **Constitución activa (OBLIGATORIO)**:
> - Cargar `constitution.clean_code` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)

## Output (REQUIRED)
- Artefacto: `.agent/artifacts/<taskId>-<taskTitle>/brief.md`
- Artefacto: `.agent/artifacts/<taskId>-<taskTitle>/acceptance.md` (NUEVO)
- Task actualizado con fase actual = `short-phase-1-brief`

## Objetivo (ONLY)
- Ejecutar las **5 preguntas obligatorias** para definir acceptance criteria.
- Realizar un **análisis profundo** para detectar complejidad.
- Crear un **plan simplificado** de implementación.
- Si se detecta complejidad alta, **ofrecer abortar** y reiniciar en modo Long.

> Esta fase **NO implementa código**.  
> Esta fase **REQUIERE aprobación explícita del desarrollador (SI/NO)**.

---

## Pasos obligatorios

0. Activar `architect-agent` y usar prefijo obligatorio en cada mensaje.

### 1. Verificar inputs
- Existe task candidate.
- `task.strategy == "short"`.
- Si falla → **FAIL**.

### 2. Ejecutar 5 preguntas obligatorias
El architect-agent **DEBE** formular 5 preguntas específicas basadas en la tarea:
- Las preguntas varían según la tarea concreta.
- Sin respuestas completas, la fase NO avanza.

### 3. Análisis de complejidad
Evaluar indicadores de complejidad:
- ¿Afecta más de 3 paquetes/módulos? → Alta
- ¿Requiere investigación de APIs externas? → Alta
- ¿Introduce cambios breaking? → Alta
- ¿Necesita tests E2E complejos? → Alta

**Si complejidad es ALTA**:
- Notificar al desarrollador.
- Ofrecer opción de abortar y crear nueva tarea en modo Long.
- Si decide abortar → terminar fase con estado "aborted".
### 4. Crear artefactos (brief.md y acceptance.md)
- Usar templates `templates.brief` y `templates.acceptance`.
- En `acceptance.md` incluir:
  - Acceptance criteria derivados de las 5 preguntas.
- En `brief.md` incluir:
  - Análisis simplificado del estado actual.
  - Plan de implementación con pasos ejecutables.
  - Evaluación de complejidad.
  - **Evaluación de Agentes**: Desempeño y propuestas de mejora.

### 5. Solicitar aprobación del desarrollador (por consola)
```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```
- Si `decision != SI` → **FAIL**.

### 6. PASS
- Informar que la Fase 1 (Brief) está completada correctamente.
- El `architect-agent` **DEBE realizar explícitamente** las siguientes acciones:
  - Marcar la fase como completada en el `task.md`.
  - Establecer `task.lifecycle.phases.short-phase-1-brief.completed = true`.
  - Establecer `task.lifecycle.phases.short-phase-1-brief.validated_at = <ISO-8601>`.
  - Actualizar `task.phase.updated_at = <ISO-8601>`.
  - Actualizar el estado:
    - `task.phase.current = short-phase-2-implementation`
- Esta actualización **NO es automática** y **NO puede ser inferida**.
- Hasta que este cambio no se refleje en el `task.md`, **no se puede iniciar la Fase 2**.
- Indicar rutas:
  - `brief.md`
  - `acceptance.md`
  - `task.md` actualizado

---

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existen `brief.md` y `acceptance.md` con templates correctos.
2. El `brief.md` inicia con el prefijo del `architect-agent`.
3. Las 5 preguntas están respondidas.
4. La evaluación de complejidad está documentada.
5. Existe aprobación explícita del desarrollador.
6. task.md refleja fase completada.
7. task.md refleja timestamp y estado:
   - `task.lifecycle.phases.short-phase-1-brief.completed == true`
   - `task.lifecycle.phases.short-phase-1-brief.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Indicar qué requisito falta.
- Bloquear hasta resolver.
