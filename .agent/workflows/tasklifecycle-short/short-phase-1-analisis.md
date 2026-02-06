---
id: workflow.tasklifecycle-short.short-phase-1-analisis
description: Fase 1 del ciclo Short. Ejecuta analisis y define acceptance criteria basados en 5 preguntas obligatorias.
owner: architect-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["short-phase-1", "analisis", "analysis"]
blocking: true
---

# WORKFLOW: tasklifecycle-short.short-phase-1-analisis

## Input (REQUIRED)
- Existe task candidate con `task.strategy: short`.
- El desarrollador ha proporcionado titulo y objetivo.

> [!IMPORTANT]
> **Constitucion activa (OBLIGATORIO)**:
> - Cargar `constitution.clean_code` antes de iniciar
> - Cargar `constitution.agents_behavior` (seccion 7: Gates, seccion 8: Constitucion)
> - **Activar `skill.runtime-governance`** (Para validacion de gate y trazabilidad por el Architect)

## Output (REQUIRED)
- Artefacto: `.agent/artifacts/<taskId>-<taskTitle>/analisis.md`
- Artefacto: `.agent/artifacts/<taskId>-<taskTitle>/acceptance.md`
- Task actualizado con fase actual = `short-phase-1-analisis`

## Objetivo (ONLY)
- Ejecutar las **5 preguntas obligatorias** para definir acceptance criteria.
- Documentar el analisis de la tarea (estado actual y riesgos basicos).
- Si se detecta complejidad alta, **ofrecer abortar** y reiniciar en modo Long.

> Esta fase **NO implementa codigo**.
> Esta fase **REQUIERE aprobacion explicita del desarrollador (SI/NO)**.

---

## Pasos obligatorios

0. Activar `architect-agent` y usar prefijo obligatorio en cada mensaje.

### 1. Verificar inputs
- Existe task candidate.
- `task.strategy == "short"`.
- Si falla -> **FAIL**.

### 2. Ejecutar 5 preguntas obligatorias
El architect-agent **DEBE** formular 5 preguntas especificas basadas en la tarea:
- Las preguntas varian segun la tarea concreta.
- Sin respuestas completas, la fase NO avanza.

### 2.1 Definir owner de implementacion (OBLIGATORIO)
- El desarrollador **DEBE** indicar el agente responsable de la implementacion.
- Registrar el valor en `analisis.md` como `implementation_owner`.
- Si no se define, usar `architect-agent` por defecto y dejar trazado en el analisis.

### 3. Analisis de complejidad
Evaluar indicadores de complejidad:
- Afecta mas de 3 paquetes/modulos? -> Alta
- Requiere investigacion de APIs externas? -> Alta
- Introduce cambios breaking? -> Alta
- Necesita tests E2E complejos? -> Alta

**Si complejidad es ALTA**:
- Notificar al desarrollador.
- Ofrecer opcion de abortar y crear nueva tarea en modo Long.
- Si decide abortar -> terminar fase con estado "aborted".

### 4. Crear artefactos (analisis.md y acceptance.md)
- Usar templates `templates.analisis` y `templates.acceptance`.
- En `acceptance.md` incluir:
  - Acceptance criteria derivados de las 5 preguntas.
- En `analisis.md` incluir:
  - Estado actual (As-Is) simplificado.
  - Riesgos basicos.
  - Evaluacion de complejidad.
  - `implementation_owner` explicito (agente responsable de implementacion).
  - **Evaluacion de Agentes**: Desempeno y propuestas de mejora.

### 5. Solicitar aprobacion del desarrollador (por consola)
```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```
- Si `decision != SI` -> **FAIL**.

### 6. PASS
- Actualizar task.md:
  - Marcar fase como completada.
  - Establecer `task.lifecycle.phases.short-phase-1-analisis.validated_at = <ISO-8601>`.
  - Actualizar `task.phase.updated_at = <ISO-8601>`.
  - Avanzar a `short-phase-2-plan`.

---

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existen `analisis.md` y `acceptance.md` con templates correctos.
2. El `analisis.md` inicia con el prefijo del `architect-agent`.
3. Las 5 preguntas estan respondidas.
4. La evaluacion de complejidad esta documentada.
5. Existe aprobacion explicita del desarrollador.
6. task.md refleja fase completada.
7. task.md refleja timestamp y estado:
   - `task.lifecycle.phases.short-phase-1-analisis.completed == true`
   - `task.lifecycle.phases.short-phase-1-analisis.validated_at` no nulo
   - `task.phase.updated_at` no nulo
8. **Gobernanza verificada**: El historial de logs muestra la secuencia de herramientas MCP definida en `skill.runtime-governance`.

Si Gate FAIL:
- Indicar que requisito falta.
- Bloquear hasta resolver.
