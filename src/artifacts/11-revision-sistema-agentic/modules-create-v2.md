---
description: Workflow para crear módulos siguiendo la constitución y reglas de arquitectura del ecosistema Extensio.
---

---
id: workflow.modules.create
owner: module-agent
version: 2.0.0
severity: PERMANENT
trigger:
  commands: ["module-create", "modules:create"]
blocking: true
---

# WORKFLOW: modules.create

## Input (REQUIRED)
- El arquitecto ha determinado en el plan la creación de un nuevo módulo:
  - `.agent/artifacts/<taskId>-<taskTitle>/plan.md`

## Output (REQUIRED)
- Informe de creación de módulo (OBLIGATORIO):
  - `.agent/artifacts/<taskId>-<taskTitle>/module/create.md`

## Objetivo (ONLY)
Asegurar que la creación de un nuevo módulo cumple:
- la constitución de módulos (`constitution.modules`)
- la constitución de pages (`constitution.pages`) si aplica
- la constitución de shards (`constitution.shards`) si aplica
- la arquitectura de Extensio y reglas globales
- la integración correcta en el ecosistema

> Esta fase **NO** omite auditoría del architect-agent.

## Template (OBLIGATORIO)
- El informe **DEBE** crearse usando el template:
  - `templates.module_create`
- Si el template no existe o no se puede cargar → **FAIL**.

---

## Pasos obligatorios

1. Verificar inputs
   - Existe `plan.md` que requiere crear un módulo.
   - Si falla → ir a **Paso 8 (FAIL)**.

2. Crear el módulo
   - Crear el módulo usando el tool:
     - `mcp_extensio-cli tools`
   - Configurar flags según necesidades:
     - `withShards` para componentes UI
     - `withPages` para páginas completas
     - `includeDemo` (default true)
   - La creación manual **solo** es válida si el CLI no soporta la operación.
   - Garantizar estructura, types, constants, globals y ciclo de vida.

3. Verificar estructura base (OBLIGATORIO)
   - Verificar que `global.d.mts` contiene el namespace `Extensio.<NombreModulo>`.
   - Verificar que `constants.mts` root exporta las constantes del módulo.
   - Verificar que `demo/` existe y es funcional.
   - Validar scopes (Engine obligatorio).
   - Verificar reactividad y `waitingLoadProps` donde aplique.
   - Si falta algo → corregir antes de continuar.

4. Verificar Surfaces (si aplica)
   
   **Si el módulo tiene Pages:**
   - Verificar que existe `src/surface/pages/index.mts` con imports de HTML.
   - Verificar estructura: `<page-name>/index.html` + `<page-name>/index.mts`
   - Verificar ciclo de vida: `run()` → `listen()` → `start()`
   - Verificar responsabilidades (§11-12 de `constitution.pages`):
     - Solo lógica de presentación
     - Solo lógica de interacción
     - Solo orquestación de Shards
     - NO estado persistente de negocio
   
   **Si el módulo tiene Shards:**
   - Verificar que existe `src/surface/shards/index.mts` con `Shard.register()`.
   - Verificar que cada Shard tiene `getTagName()` único.
   - Verificar cumplimiento de `constitution.shards`.

5. Crear informe de creación
   - Crear:
     - `.agent/artifacts/<taskId>-<taskTitle>/module/create.md`
   - Completar el informe según el template.

6. Auditoría del architect-agent (OBLIGATORIA)
   - El `architect-agent` **DEBE** revisar el módulo y el informe.
   - Si detecta fallos → ir a **Paso 8 (FAIL)**.

7. PASS
   - Informar que el módulo cumple el contrato.

---

## FAIL (OBLIGATORIO)

8. Declarar creación de módulo como **NO completada**
   - Indicar exactamente qué falló:
     - plan inexistente o no requiere módulo
     - template inexistente
     - incumplimiento de `constitution.modules`
     - incumplimiento de `constitution.pages` (si aplica)
     - incumplimiento de `constitution.shards` (si aplica)
     - Pages con lógica de negocio persistente (violación §11-12)
     - fallos de integración en el ecosistema
     - auditoría del architect-agent rechazada
   - Acción mínima:
     - corregir los puntos detectados por architect o desarrollador
   - Terminar bloqueado: no avanzar.

---

## Gate (REQUIRED)

Requisitos (todos obligatorios):
1. Existe `.agent/artifacts/<taskId>-<taskTitle>/module/create.md`.
2. El informe sigue la estructura del template `templates.module_create`.
3. El módulo cumple `constitution.modules`.
4. Si hay Pages, cumplen `constitution.pages` (especialmente §11-12).
5. Si hay Shards, cumplen `constitution.shards`.
6. Auditoría del architect-agent aprobada.

Si Gate FAIL:
- Ejecutar **Paso 8 (FAIL)**.
