---
description: Workflow para refactorizar drivers siguiendo la constitucion y reglas de arquitectura del ecosistema Extensio.
---

---
id: workflow.drivers.refactor
owner: driver-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["driver-refactor", "drivers:refactor"]
blocking: true
---

# WORKFLOW: drivers.refactor

## Input (REQUIRED)
- El arquitecto ha determinado en el plan la refactorizacion del driver:
  - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`

## Output (REQUIRED)
- Informe de refactorizacion de driver (OBLIGATORIO):
  - `.agent/artifacts/<taskId>-<taskTitle>/driver/refactor.md`

## Objetivo (ONLY)
Asegurar que el refactor de un driver:
- mantiene cumplimiento de `constitution.drivers`
- preserva compatibilidad multi-browser
- actualiza integraciones en globals/constants si aplica

> Esta fase **NO** omite auditoria del architect-agent.

## Template (OBLIGATORIO)
- El informe **DEBE** crearse usando el template:
  - `templates.driver_refactor`
- Si el template no existe o no se puede cargar → **FAIL**.

---

## Pasos obligatorios

0. Activar `driver-agent` y usar prefijo obligatorio en cada mensaje.

1. Verificar inputs
   - Existe `plan.md` que requiere refactorizar un driver.
   - Si falla → ir a **Paso 9 (FAIL)**.

2. Refactorizar el driver
   - Ejecutar cambios segun el plan y `constitution.drivers`.
   - Validar estructura, types, constants y compatibilidad.
   - Si hay cambios en tipos/constantes:
     - registrar tipos en `globals.d.mts` bajo `Extensio.<NamespaceDelDriver>`
     - exportar constantes en el `constants.mts` del root
   - Verificar `globals.d.mts` y `constants.mts` si hubo cambios.

3. Crear informe de refactorizacion
   - Crear:
     - `.agent/artifacts/<taskId>-<taskTitle>/driver/refactor.md`
   - Completar el informe segun el template.

4. Auditoria del architect-agent (OBLIGATORIA)
   - El `architect-agent` **DEBE** revisar el driver y el informe.
   - Si detecta fallos → ir a **Paso 9 (FAIL)**.

5. Solicitar aprobacion del desarrollador (OBLIGATORIA, por consola)
   - El desarrollador **DEBE** aprobar el informe:
     - **SI** → aprobado
     - **NO** → rechazado
   - Registrar la decision en `driver/refactor.md`:
     ```yaml
     approval:
       developer:
         decision: SI | NO
         date: <ISO-8601>
         comments: <opcional>
     ```
   - Si `decision != SI` → ir a **Paso 9 (FAIL)**.

6. PASS
   - Informar que el driver cumple el contrato tras el refactor.
   - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md`:
     - Agregar una entrada en `task.lifecycle.subflows.drivers.refactor[]`:
       - `name: <driver-name>`
       - `completed: true`
       - `validated_by: "architect-agent"`
       - `validated_at: <ISO-8601>`
     - `task.phase.updated_at = <ISO-8601>`

---

## FAIL (OBLIGATORIO)

9. Declarar refactorizacion de driver como **NO completada**
   - Indicar exactamente que fallo:
     - plan inexistente o no requiere refactor
     - template inexistente
     - incumplimiento de `constitution.drivers`
     - fallos de integracion en el ecosistema
     - auditoria del architect-agent rechazada
   - Accion minima:
     - corregir los puntos detectados por architect o desarrollador
   - Terminar bloqueado: no avanzar.

---

## Gate (REQUIRED)

Requisitos (todos obligatorios):
1. Existe `.agent/artifacts/<taskId>-<taskTitle>/driver/refactor.md`.
2. El informe sigue la estructura del template `templates.driver_refactor`.
3. El `driver/refactor.md` inicia con el prefijo del `driver-agent`.
4. El driver cumple `constitution.drivers`.
5. Auditoria del architect-agent aprobada.
6. Existe aprobacion explicita del desarrollador (por consola) registrada en `driver/refactor.md`:
   - `approval.developer.decision == SI`
7. `globals.d.mts` y `constants.mts` integran cambios sin duplicados ni errores.
8. `task.md` refleja subflow y timestamp:
   - Existe una entrada en `task.lifecycle.subflows.drivers.refactor[]` con:
     - `name: <driver-name>`
     - `completed == true`
     - `validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **Paso 9 (FAIL)**.
