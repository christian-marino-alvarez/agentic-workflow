---
id: workflow.tasklifecycle-long.phase-5-verification
description: Fase 5 del ciclo de tarea. Verifica la implementación con tests (unitarios y E2E si aplica) y reporta métricas y cobertura. NO corrige código; si hay errores, delega una nueva tarea de corrección al agente responsable.
owner: architect-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["phase5", "phase-5", "verification", "verify"]
blocking: true
---

# WORKFLOW: tasklifecycle.phase-5-verification

## Input (REQUIRED)
- Existe el informe de revisión del arquitecto creado en Fase 4:
  - `src/agentic-system-structure/artifacts/<taskId>-<taskTitle>/architect/review.md`
- Existe la current task:
  - `src/agentic-system-structure/artifacts/<taskId>-<taskTitle>/task.md`
- El `task.md` **DEBE** reflejar:
  - `task.phase.current == aliases.taskcycle-long.phases.phase_5.id`

> [!IMPORTANT]
> **Constitución activa (OBLIGATORIO)**:
> - Cargar `constitution.clean_code` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)

## Output (REQUIRED)
- Informe detallado de verificación y testing:
  - `src/agentic-system-structure/artifacts/<taskId>-<taskTitle>/verification.md`
- Actualización del estado en:
  - `src/agentic-system-structure/artifacts/<taskId>-<taskTitle>/task.md`

---

## Objetivo (ONLY)
- Verificar la implementación mediante tests (unitarios y E2E si aplica).
- Si la tarea **no requiere tests**, revisar únicamente los informes disponibles.
- Reportar resultados de testing, cobertura y métricas de performance (si aplica).
- Confirmar cumplimiento de los porcentajes de testing definidos en el plan cuando existan.
- Obtener aprobación explícita del desarrollador (SI/NO) para avanzar.

> Esta fase **NO implementa código**.  
> Esta fase **NO corrige errores**; delega correcciones como nuevas tareas.  
> Esta fase **NO redefine alcance**.

---

## Template (OBLIGATORIO)
- El informe de resultados **DEBE** crearse usando el template:
  - `templates.verification`
- Si el template no existe o no se puede cargar → **FAIL**.

---

## Pasos obligatorios

0. Activar `qa-agent` y usar prefijo obligatorio en cada mensaje.

1. Asignar rol de verificacion
   - El `qa-agent` **DEBE** ejecutar esta fase de verificacion.
   - El `architect-agent` **DEBE** supervisar y validar el resultado.

2. Verificar inputs
   - Existe `architect/review.md`
   - Existe `task.md`
   - `task.phase.current == aliases.taskcycle-long.phases.phase_5.id`
   - Si falla → ir a **Paso 11 (FAIL)**.

3. Cargar template de verificación
   - Cargar `templates.verification`
   - Si no existe o no se puede leer → ir a **Paso 11 (FAIL)**.

4. Ejecutar testing
   - Ejecutar tests segun la estrategia obligatoria definida en:
     - `constitution.clean_code`
   - Recopilar métricas de coverage y performance si aplica.

5. Crear informe de verificación
   - Crear:
     - `src/agentic-system-structure/artifacts/<taskId>-<taskTitle>/verification.md`
   - El informe **DEBE** incluir:
     - resultados de tests (pass/fail)
     - cobertura (porcentaje y scope)
     - métricas de performance (si aplica)
     - evidencia de cumplimiento de thresholds definidos en el plan
   - Si no hay tests en la tarea, el informe **DEBE** reflejar:
     - informes revisados
     - evidencias disponibles
     - justificación de ausencia de tests

6. Validar thresholds del plan (si aplica)
   - Confirmar que se cumplen los porcentajes de test definidos en `plan.md` cuando existan.
   - Si no se cumplen → ir a **Paso 11 (FAIL)**.

7. Solicitar aprobación del desarrollador (OBLIGATORIA, por consola)
   - El desarrollador **DEBE** emitir una decisión binaria:
     - **SI** → aprobado
     - **NO** → rechazado
   - Registrar la decisión en `verification.md` con el formato:
     ```yaml
     approval:
       developer:
         decision: SI | NO
         date: <ISO-8601>
         comments: <opcional>
     ```
   - Si `decision != SI` → ir a **Paso 11 (FAIL)**.

8. PASS
   - Actualizar `src/agentic-system-structure/artifacts/<taskId>-<taskTitle>/task.md`:
     - marcar Fase 5 como completada
     - establecer `task.lifecycle.phases.phase-5-verification.validated_at = <ISO-8601>`
     - actualizar `task.phase.updated_at = <ISO-8601>`
     - avanzar:
       - `task.phase.current = aliases.taskcycle-long.phases.phase_6.id`
   - Indicar rutas:
     - `verification.md`
     - `task.md` actualizado

---

## FAIL (OBLIGATORIO)

### 11. Declarar Fase 5 como **NO completada**

Casos de FAIL:
- Informe de review inexistente.
- Fase incorrecta.
- Fallo al crear `verification.md`.
- Thresholds de testing no cumplidos (si aplica).
- Tests fallidos.
- Aprobación del desarrollador = NO o inexistente.

### 12. Delegar corrección (NO corregir código)

> [!CAUTION]
> La Fase 5 **NUNCA corrige código**. Solo notifica y delega.

Si se detectan errores en tests:
1. Identificar la tarea de Fase 4 responsable del código fallido.
2. Identificar el agente que ejecutó esa tarea.
3. Crear una **nueva tarea de corrección** en:
   - `src/agentic-system-structure/artifacts/<taskId>-<taskTitle>/agent-tasks/fix-<N>-<agent>-<issue>.md`
4. La tarea de corrección **DEBE** usar `templates.agent_task`.
5. El flujo vuelve a Fase 4 para ejecutar la tarea de corrección.
6. Solo cuando la corrección pase Gate, se re-ejecuta Fase 5.

Terminar bloqueado: no avanzar de fase.

---

## Gate (REQUIRED)

Requisitos (todos obligatorios):
1. Existe `src/agentic-system-structure/artifacts/<taskId>-<taskTitle>/verification.md`.
2. El informe refleja resultados completos y trazables de testing.
3. El `verification.md` inicia con el prefijo del `qa-agent`.
4. El informe contiene **evidencia de ejecución de tests**:
   - Logs de salida de comandos de test (`npm test`, `pnpm test`, etc.)
   - O screenshots/grabaciones de E2E
   - O justificación documentada si la tarea no requiere tests
5. Se cumplen los porcentajes de test definidos en el plan (si aplica).
6. Existe aprobación explícita del desarrollador:
   - `approval.developer.decision == SI`
7. `task.md` refleja:
   - Fase 5 completada
   - `task.phase.current == aliases.taskcycle-long.phases.phase_6.id`
   - `task.lifecycle.phases.phase-5-verification.completed == true`
   - `task.lifecycle.phases.phase-5-verification.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **Paso 11 (FAIL)**.
