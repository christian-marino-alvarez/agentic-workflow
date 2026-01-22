---
description: Workflow para eliminar modulos siguiendo la constitucion y reglas de arquitectura del ecosistema Extensio.
---

---
id: workflow.modules.delete
owner: module-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["module-delete", "modules:delete"]
blocking: true
---

# WORKFLOW: modules.delete

## Input (REQUIRED)
- El arquitecto ha determinado en el plan la eliminacion de un modulo:
  - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`

## Output (REQUIRED)
- Informe de eliminacion de modulo (OBLIGATORIO):
  - `.agent/artifacts/<taskId>-<taskTitle>/module/delete.md`

## Objetivo (ONLY)
Asegurar que la eliminacion de un modulo cumple:
- la constitucion de modulos
- la arquitectura de Extensio y reglas globales
- la integridad del ecosistema

> Esta fase **NO** omite auditoria del architect-agent.

## Template (OBLIGATORIO)
- El informe **DEBE** crearse usando el template:
  - `templates.module_delete`
- Si el template no existe o no se puede cargar → **FAIL**.

---

## Pasos obligatorios

0. Activar `module-agent` y usar prefijo obligatorio en cada mensaje.

1. Verificar inputs
   - Existe `plan.md` que requiere eliminar un modulo.
   - Si falla → ir a **Paso 9 (FAIL)**.

2. Eliminar el modulo
   - Eliminar modulo y referencias.
   - Validar sin imports huerfanos.
   - Confirmar que no quedan referencias en globals/constants.

3. Crear informe de eliminacion
   - Crear:
     - `.agent/artifacts/<taskId>-<taskTitle>/module/delete.md`
   - Completar el informe segun el template.

4. Auditoria del architect-agent (OBLIGATORIA)
   - El `architect-agent` **DEBE** revisar el informe.
   - Si detecta fallos → ir a **Paso 9 (FAIL)**.

5. Solicitar aprobacion del desarrollador (OBLIGATORIA, por consola)
   - El desarrollador **DEBE** aprobar el informe:
     - **SI** → aprobado
     - **NO** → rechazado
   - Registrar la decision en `module/delete.md`:
     ```yaml
     approval:
       developer:
         decision: SI | NO
         date: <ISO-8601>
         comments: <opcional>
     ```
   - Si `decision != SI` → ir a **Paso 9 (FAIL)**.

6. PASS
   - Informar que la eliminacion cumple el contrato.
   - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md`:
     - Agregar una entrada en `task.lifecycle.subflows.modules.delete[]`:
       - `name: <module-name>`
       - `completed: true`
       - `validated_by: "architect-agent"`
       - `validated_at: <ISO-8601>`
     - `task.phase.updated_at = <ISO-8601>`

---

## FAIL (OBLIGATORIO)

9. Declarar eliminacion de modulo como **NO completada**
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
1. Existe `.agent/artifacts/<taskId>-<taskTitle>/module/delete.md`.
2. El informe sigue la estructura del template `templates.module_delete`.
3. El `module/delete.md` inicia con el prefijo del `module-agent`.
4. La eliminacion cumple `constitution.modules`.
5. Auditoria del architect-agent aprobada.
6. Existe aprobacion explicita del desarrollador (por consola) registrada en `module/delete.md`:
   - `approval.developer.decision == SI`
7. `task.md` refleja subflow y timestamp:
   - Existe una entrada en `task.lifecycle.subflows.modules.delete[]` con:
     - `name: <module-name>`
     - `completed == true`
     - `validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **Paso 9 (FAIL)**.
