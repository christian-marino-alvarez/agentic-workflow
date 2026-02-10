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
> - **Activar `skill.runtime-governance`** (Para validación de gate y trazabilidad)

## Output (REQUIRED)
- Research report (obligatorio, generado por researcher-agent):
  - `.agent/artifacts/<taskId>-<taskTitle>/researcher/research.md`
- Actualizacion del estado en la current task:
  - `.agent/artifacts/<taskId>-<taskTitle>/task.md`

## Objetivo (STRICT)
- **Investigación Profunda**: Ejecutar una exploración técnica exhaustiva de bajo nivel sobre las necesidades detectadas.
- **Análisis de APIs y Docs**: Documentar y explicar detalladamente todas las APIs, librerías y documentos oficiales consultados.
- **Evidencia Técnica**: Proveer pruebas de concepto o comportamientos observados en el runtime.
- **Detección de Riesgos**: Identificar cuellos de botella de performance, fallas de seguridad y bugs conocidos en las dependencias.

> Esta fase **NO implementa código funcional**.
> Esta fase **REQUIERE aprobación explícita del desarrollador**.

> [!CAUTION]
> **REGLA PERMANENT**: Research DOCUMENTA, NO analiza.
> El researcher-agent recopila información de fuentes oficiales con máximo rigor.
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

3. **Delegar al researcher-agent (OBLIGATORIO - ALTO RIGOR)**
   > ⚠️ **REGLA PERMANENTE**: El `architect-agent` **NO PUEDE** crear el informe de research.
   > El `researcher-agent` es el **único agente autorizado** para crear `research.md`.
   
   El `architect-agent` **DEBE**:
   a) Activar al `researcher-agent` con el contexto de la tarea:
      - Descripción y objetivo de la tarea
      - Acceptance criteria
      - Template a utilizar (`templates.research`)
   b) Exigir explícitamente profundidad en la investigación de las APIs y documentación oficial involucrada.
   c) Esperar a que el `researcher-agent` complete su informe
   d) Verificar que el informe cumple con el **Criterio de Rigor Técnico** (descripciones atómicas, límites de performance, seguridad).
   
   **Prefijo obligatorio del researcher-agent**: `🔬 **researcher-agent**:`
   
   El `researcher-agent` **DEBE**:
   - Crear el directorio: `.agent/artifacts/<taskId>-<taskTitle>/researcher/`
   - Crear el informe: `.agent/artifacts/<taskId>-<taskTitle>/researcher/research.md`
   - Seguir estrictamente el template `templates.research`.
   - **Explicar detalladamente cada API o documento investigado**, citando fuentes y comportamientos técnicos reales.
   - Cubrir todos los puntos obligatorios:
     - Profundización técnica (atómica) de hallazgos.
     - Límites de performance y latencia.
     - Matriz de compatibilidad detallada.
     - Riesgos críticos basados en evidencia (docs/runtime).
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
   - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md`:
     - marcar Fase 1 como completada
     - establecer `task.lifecycle.phases.phase-1-research.validated_at = <ISO-8601>`
     - actualizar `task.phase.updated_at = <ISO-8601>`
     - avanzar `task.phase.current = aliases.tasklifecycle-long.phases.phase_2.id`

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
6. **Rigor Técnico**: La investigación es profunda, detalla APIs a nivel atómico y documenta límites de performance/seguridad.
7. El informe **NO contiene** análisis, recomendaciones ni valoraciones.
8. `task.md` refleja:
   - Fase 1 completada
   - `task.phase.current == aliases.tasklifecycle-long.phases.phase_2.id`
   - `task.lifecycle.phases.phase-1-research.completed == true`
   - `task.lifecycle.phases.phase-1-research.validated_at` no nulo
   - `task.phase.updated_at` no nulo
6. **Gobernanza verificada**: El historial de logs muestra la secuencia de herramientas MCP definida en `skill.runtime-governance`.

Si Gate FAIL:
- Ejecutar **Paso 8 (FAIL)**.
