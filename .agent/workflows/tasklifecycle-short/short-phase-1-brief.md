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
> - Cargar `constitution.runtime_integration` para trazabilidad MCP

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
5.1 **Auditoría Pre-Gate (OBLIGATORIO)**:
- Antes de solicitar la aprobación, el `architect-agent` **DEBE** usar `runtime.validate_gate` para la fase actual.
- El agente **DEBE** usar `debug_read_logs` para confirmar que todos los pasos técnicos previos han sido registrados.
- Estrictamente **PROHIBIDO** consolidar este paso con la solicitud de aprobación en una misma respuesta (esperar confirmación de la herramienta).

6. **PASS**
- Actualizar task.md:
  - Marcar fase como completada.
  - Establecer `task.lifecycle.phases.short-phase-1-brief.validated_at = <ISO-8601>`.
  - Establecer `task.lifecycle.phases.short-phase-1-brief.runtime_validated = true`.
  - Establecer `task.lifecycle.phases.short-phase-1-brief.validation_id = <ID de runtime>`.
  - Actualizar `task.phase.updated_at = <ISO-8601>`.
  - Avanzar a `short-phase-2-implementation`.

---

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existen `brief.md` y `acceptance.md` con templates correctos.
2. El `brief.md` inicia con el prefijo del `architect-agent`.
3. Las 5 preguntas están respondidas.
4. La evaluación de complejidad está documentada.
5. **Auditoría de Runtime**: El agente ha ejecutado `runtime.validate_gate` y el resultado es PASS.
6. **Trazabilidad de Logs**: Los logs (`debug_read_logs`) confirman la ejecución de los pasos 1 a 4.
7. Existe aprobación explícita del desarrollador.
8. task.md refleja fase completada y datos de validación de runtime.
9. task.md refleja timestamp y estado:
   - `task.lifecycle.phases.short-phase-1-brief.completed == true`
   - `task.lifecycle.phases.short-phase-1-brief.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Indicar qué requisito falta.
- Bloquear hasta resolver.
