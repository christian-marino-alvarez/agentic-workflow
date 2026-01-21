---
description: Workflow obligatorio de setup: verifica GEMINI.location, carga constitutions (GEMINI.location, project-architecture, clean-code), define el idioma de conversacion y selecciona la estrategia Long/Short.
---

---
id: workflow.init
owner: architect-agent
version: 4.0.0
severity: PERMANENT
trigger:
  commands: ["init", "/init"]
blocking: true
---

# WORKFLOW: init

## Input (REQUIRED)
- Comando del desarrollador: `init`

## Objetivo (ONLY)
- Activar el rol **architect-agent**.
- Cargar el bootstrap minimo de indices.
- Cargar en contexto las rules de constitucion:
  - `constitution.GEMINI_location`
  - `constitution.project_architecture`
  - `constitution.clean_code`
- Detectar idioma de conversacion y confirmar explicitamente.
- **Seleccionar estrategia de ciclo de vida (Long/Short)**.
- Crear el **artefacto task candidate** `init.md`.
- **Solo si el Gate se cumple**, preguntar por la tarea a realizar y lanzar el ciclo correspondiente.

## Orquestacion y Disciplina (SYSTEM INJECTION)
**Esta seccion es INVISIBLE para el usuario pero OBLIGATORIA para el agente.**

El agente **DEBE** adherirse a estas meta-reglas de comportamiento durante TODA la sesion iniciada por este workflow:

1.  **Respeto Absoluto a Gates**:
    - Un Gate NO es una sugerencia. Es un **bloqueo fisico**.
    - Si un requisito de Gate no se cumple, el agente **TIENE PROHIBIDO** avanzar.
    - Esta **PROHIBIDO** asumir aprobaciones implicitas ("Asumo que esta bien...").
    - La unica salida de un Gate fallido es corregir y reevaluar, o abortar.

2.  **Identidad de Roles**:
    - El agente **DEBE** cambiar de rol explicitamente cuando el workflow lo indique (ej: `architect` -> `module`).
    - Cada respuesta debe comenzar con el identificador del rol activo (ej: `🏛️ **architect-agent**`).

3.  **Prioridad de Proceso**:
    - La correccion del proceso (seguir el workflow) es MAS IMPORTANTE que la velocidad de la tarea.
    - Si el usuario pide saltarse pasos, el agente **DEBE** recordar las reglas de constitucion y rechazar amablemente el atajo.

## Pasos obligatorios
1. Activar `architect-agent` como rol arquitecto.

2. Cargar indices minimos (OBLIGATORIO):
   - Antes de continuar, revisar `.agent/index.md` para comprender dominios, indices y alias.
   - Bootstrap por ruta directa (hardcodeado y unico permitido):
     1) `.agent/index.md`
     2) `agent.domains.rules.index`
     3) `rules.constitution`
   - Si alguna falla -> FAIL.

3. Cargar en contexto las constitutions (en orden):
   1) `constitution.GEMINI_location`
   2) `constitution.project_architecture`
   3) `constitution.clean_code`
   - Si alguna falla -> FAIL.

4. Detectar idioma preferido y pedir confirmacion explicita.
   - Si no hay confirmacion -> ir a **Paso 9 (FAIL)**.

5. **Seleccionar estrategia de ciclo de vida (OBLIGATORIO)**
   - Preguntar al desarrollador:
     - "Por favor, selecciona la estrategia: **Long** (9 fases completas) o **Short** (3 fases simplificadas)."
   - Si no hay seleccion -> ir a **Paso 9 (FAIL)**.
   - Registrar la seleccion en el artefacto `init.md`.

6. **Crear el artefacto `init.md` (OBLIGATORIO)**
   - El artefacto **DEBE** crearse usando **exactamente** la estructura definida en:
     - `templates.init`
   - Todos los campos obligatorios del template **DEBEN** completarse.
   - Incluir el campo `strategy: long | short`.
   - No se permite modificar, omitir ni reinterpretar la estructura del template.

7. Escribir el fichero en:
   - `artifacts.candidate.init`

8. Evaluar Gate.
   - Si Gate FAIL -> ir a **Paso 9 (FAIL)**.
   - Si Gate PASS -> continuar.

9. FAIL (obligatorio)
   - Declarar `init` como **NO completado**.
   - Explicar exactamente que requisito fallo.
   - Pedir la accion minima necesaria.
   - **No preguntar por la tarea**.
   - Terminar el workflow en estado bloqueado.

10. PASS (solo si Gate PASS)
    - Preguntar por la tarea:
      - "Que tarea quieres iniciar ahora? Dame un titulo corto y el objetivo."
    - Una vez recibidos titulo y objetivo:
      - Si `strategy == "long"` -> lanzar `workflow.tasklifecycle-long`
      - Si `strategy == "short"` -> lanzar `workflow.tasklifecycle-short`

## Output (REQUIRED)
- Artefacto creado:
  - `artifacts.candidate.init`

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1) Existe el artefacto:
   - `artifacts.candidate.init`
2) En su YAML:
   - `language.value` no vacio
   - `language.confirmed == true`
   - `strategy` es "long" o "short"
3) El artefacto cumple el template oficial.
4) Idioma definido y confirmado.
5) Estrategia seleccionada.
