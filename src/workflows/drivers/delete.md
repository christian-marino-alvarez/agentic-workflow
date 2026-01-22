---
description: Workflow para eliminar drivers siguiendo la constitucion y reglas de arquitectura del ecosistema Extensio.
---

---
id: workflow.drivers.delete
owner: driver-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["driver-delete", "drivers:delete"]
blocking: true
---

# WORKFLOW: drivers.delete

## Input (REQUIRED)
- El arquitecto ha determinado en el plan la eliminacion del driver:
  - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`

## Output (REQUIRED)
- Informe de eliminacion de driver (OBLIGATORIO):
  - `.agent/artifacts/<taskId>-<taskTitle>/driver/delete.md`

## Objetivo (ONLY)
Asegurar que la eliminacion de un driver:
- elimina referencias sin dejar imports huerfanos
- actualiza globals/constants del proyecto
- mantiene integridad del ecosistema

> Esta fase **NO** omite auditoria del architect-agent.

## Template (OBLIGATORIO)
- El informe **DEBE** crearse usando el template:
  - `templates.driver_delete`
- Si el template no existe o no se puede cargar → **FAIL**.

---

## Pasos obligatorios

0. Activar `driver-agent` y usar prefijo obligatorio en cada mensaje.

1. Verificar inputs
   - Existe `plan.md` que requiere eliminar un driver.
   - Si falla → ir a **Paso 9 (FAIL)**.

2. Eliminar el driver
   - Eliminar el driver segun el plan y `constitution.drivers`.
   - Remover referencias en el ecosistema (imports, docs, tests).
   - Remover tipos del namespace en `globals.d.mts`.
   - Remover exports de constantes en `constants.mts` (root).
   - Actualizar `globals.d.mts` y `constants.mts` (sin duplicados/errores).

3. Crear informe de eliminacion
   - Crear:
     - `.agent/artifacts/<taskId>-<taskTitle>/driver/delete.md`
   - Completar el informe segun el template.

4. Auditoria del architect-agent (OBLIGATORIA)
   - El `architect-agent` **DEBE** revisar el cambio y el informe.
   - Si detecta fallos → ir a **Paso 9 (FAIL)**.

5. Solicitar aprobacion del desarrollador (OBLIGATORIA, por consola)
   - El desarrollador **DEBE** aprobar el informe:
     - **SI** → aprobado
     - **NO** → rechazado
   - Registrar la decision en `driver/delete.md`:
     ```yaml
     approval:
       developer:
         decision: SI | NO
         date: <ISO-8601>
         comments: <opcional>
     ```
   - Si `decision != SI` → ir a **Paso 9 (FAIL)**.

6. PASS
   - Informar que el driver fue eliminado correctamente.
   - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md`:
     - Agregar una entrada en `task.lifecycle.subflows.drivers.delete[]`:
       - `name: <driver-name>`
       - `completed: true`
       - `validated_by: "architect-agent"`
       - `validated_at: <ISO-8601>`
     - `task.phase.updated_at = <ISO-8601>`

---

## FAIL (OBLIGATORIO)

9. Declarar eliminacion de driver como **NO completada**
   - Indicar exactamente que fallo:
     - plan inexistente o no requiere eliminacion
     - template inexistente
     - referencias huerfanas
     - integracion corrupta en el ecosistema
     - auditoria del architect-agent rechazada
   - Accion minima:
     - corregir los puntos detectados por architect o desarrollador
   - Terminar bloqueado: no avanzar.

---

## Gate (REQUIRED)

Requisitos (todos obligatorios):
1. Existe `.agent/artifacts/<taskId>-<taskTitle>/driver/delete.md`.
2. El informe sigue la estructura del template `templates.driver_delete`.
3. El `driver/delete.md` inicia con el prefijo del `driver-agent`.
4. No hay referencias huerfanas al driver eliminado.
5. Auditoria del architect-agent aprobada.
6. Existe aprobacion explicita del desarrollador (por consola) registrada en `driver/delete.md`:
   - `approval.developer.decision == SI`
7. `globals.d.mts` y `constants.mts` actualizados sin duplicados ni errores.
8. `task.md` refleja subflow y timestamp:
   - Existe una entrada en `task.lifecycle.subflows.drivers.delete[]` con:
     - `name: <driver-name>`
     - `completed == true`
     - `validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **Paso 9 (FAIL)**.
