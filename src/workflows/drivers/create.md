---
description: Workflow para crear drivers siguiendo la constitucion y reglas de arquitectura del ecosistema Extensio.
---

---
id: workflow.drivers.create
owner: driver-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["driver-create", "drivers:create"]
blocking: true
---

# WORKFLOW: drivers.create

## Input (REQUIRED)
- El arquitecto ha determinado en el plan la creacion de un nuevo driver:
  - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`

## Output (REQUIRED)
- Informe de creacion de driver (OBLIGATORIO):
  - `.agent/artifacts/<taskId>-<taskTitle>/driver/create.md`

## Objetivo (ONLY)
Asegurar que la creacion de un nuevo driver cumple:
- la constitucion de drivers
- la arquitectura de Extensio y reglas globales
- la integracion correcta en el ecosistema

> Esta fase **NO** omite auditoria del architect-agent.

## Template (OBLIGATORIO)
- El informe **DEBE** crearse usando el template:
  - `templates.driver_create`
- Si el template no existe o no se puede cargar → **FAIL**.

---

## Pasos obligatorios

0. Activar `driver-agent` y usar prefijo obligatorio en cada mensaje.

1. Verificar inputs
   - Existe `plan.md` que requiere crear un driver.
   - Si falla → ir a **Paso 9 (FAIL)**.

2. Crear el driver (driver-agent)
   - El **driver-agent** usa su skill `extensio_create_driver`:
     - Leer `.agent/skills/extensio-create-driver/SKILL.md`
     - Ejecutar MCP tool `mcp_extensio-cli_extensio_create` con:
       - `type: "driver"`
       - `name`: nombre del driver
       - `platforms`: "chrome,firefox,safari,common"
       - `includeDemo`: según plan
       - `testType`: "vitest" (por defecto)
   - La creación manual **solo** es válida si el CLI no soporta la operación.
   - Garantizar estructura, types, constants, globals y compatibilidad.
   - Registrar tipos en `globals.d.mts` bajo `Extensio.<NamespaceDelDriver>`.
   - Exportar constantes del driver en el `constants.mts` del root.
   - Verificar `globals.d.mts`:
     - imports/exports correctos de tipos del driver
     - sin duplicados o nombres corruptos
     - integración no rompe el fichero
   - Verificar `constants.mts` (root):
     - exports correctos de constantes del driver
     - sin duplicados o nombres corruptos
     - integración no rompe el fichero

3. Crear informe de creacion
   - Crear:
     - `.agent/artifacts/<taskId>-<taskTitle>/driver/create.md`
   - Completar el informe segun el template.

4. Auditoria del architect-agent (OBLIGATORIA)
   - El `architect-agent` **DEBE** revisar el driver y el informe.
   - Si detecta fallos → ir a **Paso 9 (FAIL)**.

5. Solicitar aprobacion del desarrollador (OBLIGATORIA, por consola)
   - El desarrollador **DEBE** aprobar el informe:
     - **SI** → aprobado
     - **NO** → rechazado
   - Registrar la decision en `driver/create.md`:
     ```yaml
     approval:
       developer:
         decision: SI | NO
         date: <ISO-8601>
         comments: <opcional>
     ```
   - Si `decision != SI` → ir a **Paso 9 (FAIL)**.

6. PASS
   - Informar que el driver cumple el contrato.
   - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md`:
     - Agregar una entrada en `task.lifecycle.subflows.drivers.create[]`:
       - `name: <driver-name>`
       - `completed: true`
       - `validated_by: "architect-agent"`
       - `validated_at: <ISO-8601>`
     - `task.phase.updated_at = <ISO-8601>`

---

## FAIL (OBLIGATORIO)

9. Declarar creacion de driver como **NO completada**
   - Indicar exactamente que fallo:
     - plan inexistente o no requiere driver
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
1. Existe `.agent/artifacts/<taskId>-<taskTitle>/driver/create.md`.
2. El informe sigue la estructura del template `templates.driver_create`.
3. El `driver/create.md` inicia con el prefijo del `driver-agent`.
4. El driver cumple `constitution.drivers`.
5. Auditoria del architect-agent aprobada.
6. Existe aprobacion explicita del desarrollador (por consola) registrada en `driver/create.md`:
   - `approval.developer.decision == SI`
7. `globals.d.mts` y `constants.mts` integran el driver sin duplicados ni errores.
8. `task.md` refleja subflow y timestamp:
   - Existe una entrada en `task.lifecycle.subflows.drivers.create[]` con:
     - `name: <driver-name>`
     - `completed == true`
     - `validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **Paso 9 (FAIL)**.
