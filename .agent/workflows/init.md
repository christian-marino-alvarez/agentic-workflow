---
id: workflow.init
owner: architect-agent
version: 4.0.0
severity: PERMANENT
description: "Workflow obligatorio de setup: carga constitutions base y define el idioma de conversación y la estrategia Long/Short."
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
- Crear el **init candidate** con timestamp `<timestamp>-init.md` en `.agent/artifacts/candidate/`.
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
0. **Verificar Trazabilidad e Iniciar Runtime (OBLIGATORIO)**:
   - Antes de cualquier acción, verificar conectividad MCP mediante `runtime_chat`.
   - **Inmediatamente después**, llamar a `runtime.run` con:
     - `taskPath`: Ruta al directorio candidate (`.agent/artifacts/candidate/`) para crear `<timestamp>-init.md`
     - `agent`: `architect-agent`
   - El agente **DEBE** confirmar que ambas herramientas respondieron correctamente (`status: ok`).
   - **PROHIBICIÓN ESTRICTA**: No se permite consolidar este paso con la creación de artefactos en una misma respuesta. El agente debe esperar la confirmación del sistema antes de proceder al paso 1.
   - Si las herramientas MCP no están disponibles → ir a **Paso 9 (FAIL)**, a menos que el desarrollador autorice explícitamente el fallback.

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
- Registrar la selección en el init candidate `<timestamp>-init.md`.

6. **Crear el init candidate `<timestamp>-init.md` (OBLIGATORIO)**
   - El artefacto **DEBE** crearse usando **exactamente** la estructura definida en:
     - `templates.init`
   - Todos los campos obligatorios del template **DEBEN** completarse.
- Incluir el campo `strategy: long | short` y `task.path` alias `<taskId>: <path>`.
   - **REQUISITO DE TRAZABILIDAD**: Incluir una confirmación explícita de que el Paso 0 (MCP) fue ejecutado correctamente.
   - No se permite modificar, omitir ni reinterpretar la estructura del template.

7. Escribir el fichero en:
   - `.agent/artifacts/candidate/<timestamp>-init.md`

8. Indexar el init candidate en:
   - `artifacts.candidate.index`
   - Registrar la ruta del nuevo init (`.agent/artifacts/candidate/<timestamp>-init.md`).

9. **Validar Gate con Runtime (OBLIGATORIO)**:
   - **ANTES** de evaluar el Gate, el agente **DEBE** llamar a `runtime.validate_gate` con:
     - `taskPath`: `.agent/artifacts/candidate/<timestamp>-init.md`
     - `agent`: `architect-agent`
     - `expectedPhase`: `init`
   - **Opcionalmente**, usar `debug_read_logs` para auditar que los pasos previos fueron registrados.
   - Evaluar Gate según los requisitos definidos.
   - Si Gate FAIL → ir a **Paso 9 (FAIL)**.
   - Si Gate PASS → continuar.

10. FAIL (obligatorio)
   - Declarar `init` como **NO completado**.
   - Explicar exactamente qué requisito falló.
   - Pedir la acción mínima necesaria.
   - **No preguntar por la tarea**.
   - Terminar el workflow en estado bloqueado.

11. PASS (solo si Gate PASS)
    - Preguntar por la tarea:
      - "¿Qué tarea quieres iniciar ahora? Dame un título corto y el objetivo."
    - Una vez recibidos título y objetivo:
      - Si `strategy == "long"` → lanzar `workflows.tasklifecycle-long`
      - Si `strategy == "short"` → lanzar `workflows.tasklifecycle-short`

## Output (REQUIRED)
- Artefacto creado:
  - `.agent/artifacts/candidate/<timestamp>-init.md`
- Index actualizado:
  - `artifacts.candidate.index`

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1) Existe el init candidate:
   - `.agent/artifacts/candidate/<timestamp>-init.md`
2) En su YAML:
   - `language.value` no vacío
   - `language.confirmed == true`
   - `strategy` es "long" o "short"
   - **`traceability.verified == true`** (Confirma cumplimiento del Paso 0)
   - **`runtime.started == true`** (Confirma que `runtime.run` fue llamado)
3) El artefacto cumple el template oficial.
4) Idioma definido y confirmado.
5) Estrategia seleccionada.
6) **Trazabilidad completa**: 
   - El agente ha verificado conectividad MCP (`runtime_chat`).
   - El agente ha llamado `runtime.run` para iniciar el workflow.
   - El agente ha llamado `runtime.validate_gate` antes de evaluar el Gate.
7) El init candidate está indexado en `artifacts.candidate.index`.
8) No se cargaron índices fuera del set permitido (solo `.agent/index.md`, `agent.domains.rules.index`, `rules.constitution.index`).
9) El Root Index `.agent/index.md` fue cargado antes de cualquier otro índice.
10) **Auditoría de logs**: Los pasos del workflow deben estar registrados en el buffer de logs del runtime.
