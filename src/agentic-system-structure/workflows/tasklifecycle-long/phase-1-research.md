---
id: workflow.tasklifecycle-long.phase-1-research
description: Fase 1 del ciclo de tarea. Investigacion tecnica exhaustiva de necesidades y alternativas. Requiere aprobacion explicita del desarrollador.
owner: researcher-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["phase1", "phase-1", "research"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-1-research

## Input (REQUIRED)
- Existe la current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- El `task.md` **DEBE** reflejar:
  - `task.phase.current == aliases.tasklifecycle-long.phases.phase_1.id`
- El `task.md` **DEBE** incluir:
  - descripcion
  - objetivo
  - acceptance criteria definidos

> [!IMPORTANT]
> **Constitución activa (OBLIGATORIO)**:
> - Cargar `constitution.clean_code` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)

## Output (REQUIRED)
- Research report (obligatorio, generado por researcher-agent):
  - `.agent/artifacts/<taskId>-<taskTitle>/researcher/research.md`
- Actualizacion del estado en la current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objetivo (ONLY)
- Investigar necesidades tecnicas detectadas para la tarea.
- Explorar alternativas y APIs relevantes.
- Documentar compatibilidad y riesgos.
- Entregar un informe riguroso y verificable para el architect-agent.

> Esta fase **NO implementa código**.
> Esta fase **REQUIERE aprobación explícita del desarrollador**.

> [!CAUTION]
> **REGLA PERMANENT**: Research DOCUMENTA, NO analiza.
> El researcher-agent recopila información de fuentes oficiales.
> **PROHIBIDO**: proponer soluciones, evaluar trade-offs, recomendar alternativas.
> El análisis corresponde a Phase 2.

## Template (OBLIGATORIO)
- El informe **DEBE** crearse usando el template:
  - `templates.research`
- Si el template no existe o no se puede cargar → **FAIL**.

---

## Pasos obligatorios
0. Activar `researcher-agent` y usar prefijo obligatorio en cada mensaje.

1. Verificar inputs (architect-agent)
   - Existe `task.md`
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_1.id`
   - `task.md` contiene acceptance criteria
   - Si falla → ir a **Paso 8 (FAIL)**.

2. Cargar template de research (architect-agent)
   - Cargar `templates.research`
   - Si no existe o no se puede leer → ir a **Paso 8 (FAIL)**.

3. **Delegar al researcher-agent (OBLIGATORIO)**
   > ⚠️ **REGLA PERMANENTE**: El `architect-agent` **NO PUEDE** crear el informe de research.
   > El `researcher-agent` es el **único agente autorizado** para crear `research.md`.
   
   El `architect-agent` **DEBE**:
   a) Activar al `researcher-agent` con el contexto de la tarea:
      - Descripción y objetivo de la tarea
      - Acceptance criteria
      - Template a utilizar (`templates.research`)
   b) Esperar a que el `researcher-agent` complete su informe
   c) Verificar que el informe existe y cumple el template
   
   **Prefijo obligatorio del researcher-agent**: `🔬 **researcher-agent**:`
   
   El `researcher-agent` **DEBE**:
   - Crear el directorio: `.agent/artifacts/<taskId>-<taskTitle>/researcher/`
   - Crear el informe: `.agent/artifacts/<taskId>-<taskTitle>/researcher/research.md`
   - Seguir estrictamente el template `templates.research`
   - Cubrir todos los puntos obligatorios:
     - alternativas tecnicas y APIs relevantes
     - compatibilidad multi-browser
     - riesgos y trade-offs
     - recomendaciones AI-first
     - fuentes oficiales o de prestigio
   - Devolver el control al `architect-agent` al finalizar


4. Solicitar aprobacion del desarrollador (OBLIGATORIA, por consola)
   - El desarrollador **DEBE** emitir una decision binaria:
     - **SI** → aprobado
     - **NO** → rechazado
   - Registrar la decision en `research.md` con el formato:
     ```yaml
     approval:
       developer:
         decision: SI | NO
         date: <ISO-8601>
         comments: <opcional>
     ```
   - Si `decision != SI` → ir a **Paso 8 (FAIL)**.

5. PASS
   - Informar que la Fase 1 está completada correctamente.
   - El `architect-agent` **DEBE realizar explícitamente** las siguientes acciones:
     - Marcar la Fase 1 como completada en el `task.md`.
     - Establecer `task.lifecycle.phases.phase-1-research.completed = true`.
     - Establecer `task.lifecycle.phases.phase-1-research.validated_at = <ISO-8601>`.
     - Actualizar `task.phase.updated_at = <ISO-8601>`.
     - Actualizar el estado:
       - `task.phase.current = aliases.tasklifecycle-long.phases.phase_2.id`
   - Esta actualización **NO es automática** y **NO puede ser inferida**.
   - Hasta que este cambio no se refleje en el `task.md`, **no se puede iniciar la Fase 2**.
   - Indicar rutas:
     - `research.md`
     - `task.md` actualizado

---

## FAIL (OBLIGATORIO)

8. Declarar Fase 1 como **NO completada**
   - Indicar exactamente que fallo:
     - task inexistente
     - fase incorrecta
     - template inexistente
     - fallo al crear `research.md`
     - aprobacion del desarrollador = NO o inexistente
   - Pedir la accion minima para solventar
   - Terminar bloqueado: no avanzar de fase.

---

## Gate (REQUIRED)

Requisitos (todos obligatorios):
1. Existe `.agent/artifacts/<taskId>-<taskTitle>/researcher/research.md`.
2. El informe sigue la estructura del template `templates.research`.
3. El `research.md` inicia con el prefijo del `researcher-agent`.
4. El informe **DEBE** haber sido creado por el `researcher-agent`, **NO** por el `architect-agent`.
   > ⚠️ Si el informe fue creado por otro agente → **Gate FAIL**.
5. Existe aprobacion explicita del desarrollador:
   - `approval.developer.decision == SI`
6. La investigación es profunda, detallada y basada en fuentes oficiales o de prestigio.
7. El informe **NO contiene** análisis, recomendaciones ni valoraciones.
8. `task.md` refleja:
   - Fase 1 completada
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_2.id`
   - `task.lifecycle.phases.phase-1-research.completed == true`
   - `task.lifecycle.phases.phase-1-research.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **Paso 8 (FAIL)**.
