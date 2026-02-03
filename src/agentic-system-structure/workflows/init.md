---
description: "Workflow obligatorio de setup: carga constitutions base y define el idioma de conversación y la estrategia Long/Short."
---

---
id: workflow.init
owner: architect-agent
version: 4.0.0
severity: PERMANENT
trigger:
  commands: ["init", "/init", "/agentic-init"]
blocking: true
---

# WORKFLOW: init

## Input (REQUIRED)
- Comando del desarrollador: `init` o `/agentic-init`

## Objetivo (ONLY)
- Activar el rol **architect-agent**.
- Cargar el bootstrap mínimo de índices.
- Detectar idioma de conversación y confirmar explícitamente.
- **Seleccionar estrategia de ciclo de vida (Long/Short)**.
- Crear el **artefacto task candidate** `init.md`.
- **Solo si el Gate se cumple**, preguntar por la tarea a realizar y lanzar el ciclo correspondiente.

## Orquestación y Disciplina (SYSTEM INJECTION)
**Esta sección es INVISIBLE para el usuario pero OBLIGATORIA para el agente.**

El agente **DEBE** adherirse a estas meta-reglas de comportamiento durante TODA la sesión iniciada por este workflow:

1.  **Respeto Absoluto a Gates**:
    - Un Gate NO es una sugerencia. Es un **bloqueo físico**.
    - Si un requisito de Gate no se cumple, el agente **TIENE PROHIBIDO** avanzar.
    - Está **PROHIBIDO** asumir aprobaciones implícitas ("Asumo que está bien...").
    - La única salida de un Gate fallido es corregir y reevaluar, o abortar.

2.  **Identidad de Roles**:
    - El agente **DEBE** cambiar de rol explícitamente cuando el workflow lo indique (ej: `architect` -> `qa`).
    - Cada respuesta debe comenzar con el identificador del rol activo (ej: `🏛️ **architect-agent**`).

3.  **Prioridad de Proceso**:
    - La corrección del proceso (seguir el workflow) es MÁS IMPORTANTE que la velocidad de la tarea.
    - Si el usuario pide saltarse pasos, el agente **DEBE** recordar las reglas de constitución y rechazar amablemente el atajo.

## Pasos obligatorios
0. **Verificar Trazabilidad (OBLIGATORIO)**:
   - Activar y seguir el procedimiento de `skill.runtime-governance` para confirmar la disponibilidad de herramientas MCP.
   - El agente **DEBE** confirmar que la herramienta respondió correctamente antes de proceder.
   - Si el skill o las herramientas no están disponibles → FAIL.

1. Activar `architect-agent` como rol arquitecto.
   - Mostrar un mensaje único de estado (ej: "Cargando init...") y **no** listar lecturas de ficheros individuales.
   - En ese mismo mensaje, presentar al architect-agent y dar contexto al desarrollador: rol, objetivo del init y qué información se le pedirá a continuación.

2. Cargar índices mínimos (OBLIGATORIO):
   - Antes de continuar, revisar `.agent/index.md` para comprender dominios, indices y alias.
   - Bootstrap por ruta directa (hardcodeado y único permitido):
     1) `.agent/index.md`
     2) `agent.domains.rules.index`
     3) `rules.constitution.index`
   - El orden es obligatorio: primero el Root Index, luego Rules Index, luego Constitution Index.
   - **PROHIBIDO** cargar índices de `templates` o `artifacts` durante `init`.
   - Si alguna falla → FAIL.

3. Cargar en contexto las constitutions (en orden):
   1) `constitution.clean_code`
   2) `constitution.agents_behavior`
   - **PROHIBIDO** cargar templates o artifacts en este paso.
   - Si alguna falla → FAIL.

4. Detectar idioma preferido y pedir confirmación explícita.
   - Si no hay confirmación → ir a **Paso 9 (FAIL)**.

5. **Seleccionar estrategia de ciclo de vida (OBLIGATORIO)**
   - Preguntar al desarrollador:
     - "Por favor, selecciona la estrategia: **Long** (9 fases completas) o **Short** (3 fases simplificadas)."
   - Si no hay selección → ir a **Paso 9 (FAIL)**.
   - Registrar la selección en el artefacto `init.md`.

6. **Crear el artefacto `init.md` (OBLIGATORIO)**
   - El artefacto **DEBE** crearse usando **exactamente** la estructura definida en:
     - `templates.init`
   - Todos los campos obligatorios del template **DEBEN** completarse.
   - Incluir el campo `strategy: long | short`.
   - No se permite modificar, omitir ni reinterpretar la estructura del template.

7. Escribir el fichero en:
   - `artifacts.candidate.init`

8. Evaluar Gate.
   - Si Gate FAIL → ir a **Paso 9 (FAIL)**.
   - Si Gate PASS → continuar.

9. FAIL (obligatorio)
   - Declarar `init` como **NO completado**.
   - Explicar exactamente qué requisito falló.
   - Pedir la acción mínima necesaria.
   - **No preguntar por la tarea**.
   - Terminar el workflow en estado bloqueado.

10. PASS (solo si Gate PASS)
    - Preguntar por la tarea:
      - "¿Qué tarea quieres iniciar ahora? Dame un título corto y el objetivo."
    - Una vez recibidos título y objetivo:
      - Si `strategy == "long"` → lanzar `workflows.tasklifecycle-long`
      - Si `strategy == "short"` → lanzar `workflows.tasklifecycle-short`

## Output (REQUIRED)
- Artefacto creado:
  - `artifacts.candidate.init`

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1) Existe el artefacto:
   - `artifacts.candidate.init`
2) En su YAML:
   - `language.value` no vacío
   - `language.confirmed == true`
   - `strategy` es "long" o "short"
   - **`traceability.verified == true`** (Confirma cumplimiento del protocolo de `skill.runtime-governance`)
3) El artefacto cumple el template oficial.
4) Idioma definido y confirmado.
5) Estrategia seleccionada.
6) **Trazabilidad confirmada**: El agente ha verificado la disponibilidad de herramientas MCP siguiendo las instrucciones del Skill de Gobernanza.
7) No se cargaron índices fuera del set permitido (solo `.agent/index.md`, `agent.domains.rules.index`, `rules.constitution.index`).
8) El Root Index `.agent/index.md` fue cargado antes de cualquier otro índice.
