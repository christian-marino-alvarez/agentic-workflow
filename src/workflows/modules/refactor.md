---
description: Workflow para refactorizar modulos siguiendo la constitucion y reglas de arquitectura del ecosistema Extensio.
---

---
id: workflow.modules.refactor
owner: module-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["module-refactor", "modules:refactor"]
blocking: true
---

# WORKFLOW: modules.refactor

## Input (REQUIRED)
- El arquitecto ha determinado en el plan el refactor de un modulo:
  - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`

## Output (REQUIRED)
- Informe de refactor de modulo (OBLIGATORIO):
  - `.agent/artifacts/<taskId>-<taskTitle>/module/refactor.md`

## Objetivo (ONLY)
Asegurar que el refactor de un modulo cumple:
- la constitucion de modulos
- la arquitectura de Extensio y reglas globales
- la integracion correcta en el ecosistema

> Esta fase **NO** omite auditoria del architect-agent.

## Template (OBLIGATORIO)
- El informe **DEBE** crearse usando el template:
  - `templates.module_refactor`
- Si el template no existe o no se puede cargar → **FAIL**.

---

## Pasos obligatorios

0. Activar `module-agent` y usar prefijo obligatorio en cada mensaje.

1. Verificar inputs
   - Existe `plan.md` que requiere refactor de modulo.
   - Si falla → ir a **Paso 9 (FAIL)**.

2. Ejecutar refactor
   - Aplicar cambios definidos en el plan.
   - Validar estructura post-refactor.
   - Validar scopes preservados.
   - Validar reactividad y ciclo de vida intactos.

3. Crear informe de refactor
   - Crear:
     - `.agent/artifacts/<taskId>-<taskTitle>/module/refactor.md`
   - Completar el informe segun el template.

4. Auditoria del architect-agent (OBLIGATORIA)
   - El `architect-agent` **DEBE** revisar el modulo y el informe.
   - Si detecta fallos → ir a **Paso 9 (FAIL)**.

5. Solicitar aprobacion del desarrollador (OBLIGATORIA, por consola)
   - El desarrollador **DEBE** aprobar el informe:
     - **SI** → aprobado
     - **NO** → rechazado
   - Registrar la decision en `module/refactor.md`:
     ```yaml
     approval:
       developer:
         decision: SI | NO
         date: <ISO-8601>
         comments: <opcional>
     ```
   - Si `decision != SI` → ir a **Paso 9 (FAIL)**.

6. PASS
   - Informar que el modulo cumple el contrato.
   - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md`:
     - Agregar una entrada en `task.lifecycle.subflows.modules.refactor[]`:
       - `name: <module-name>`
       - `completed: true`
       - `validated_by: "architect-agent"`
       - `validated_at: <ISO-8601>`
     - `task.phase.updated_at = <ISO-8601>`

---

## FAIL (OBLIGATORIO)

9. Declarar refactor de modulo como **NO completado**
   - Indicar exactamente que fallo:
     - plan inexistente o no requiere modulo
     - template inexistente
     - incumplimiento de `constitution.modules`
     - fallos de integracion en el ecosistema
     - auditoria del architect-agent rechazada
   - Accion minima:
     - corregir los puntos detectados por architect o desarrollador
   - Terminar bloqueado: no avanzar.

---

## Gate (REQUIRED)

Requisitos (todos obligatorios):
1. Existe `.agent/artifacts/<taskId>-<taskTitle>/module/refactor.md`.
2. El informe sigue la estructura del template `templates.module_refactor`.
3. El `module/refactor.md` inicia con el prefijo del `module-agent`.
4. El modulo cumple `constitution.modules`.
5. Auditoria del architect-agent aprobada.
6. Existe aprobacion explicita del desarrollador (por consola) registrada en `module/refactor.md`:
   - `approval.developer.decision == SI`
7. `task.md` refleja subflow y timestamp:
   - Existe una entrada en `task.lifecycle.subflows.modules.refactor[]` con:
     - `name: <module-name>`
     - `completed == true`
     - `validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **Paso 9 (FAIL)**.
