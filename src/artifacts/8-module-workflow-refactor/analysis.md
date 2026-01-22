---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 8-module-workflow-refactor
---

# Analysis — 8-module-workflow-refactor

## 1. Resumen ejecutivo
**Problema**
El workflow actual de creación de módulos es inconsistente con el patrón de drivers y carece de automatización en naming y estructura de surfaces, lo que genera deuda técnica y fricción.

**Objetivo**
Consolidar el sistema de creación de módulos (generator, MCP tool y constitution) para garantizar consistencia arquitectónica, naming automatizado y demos funcionales por defecto.

**Criterio de éxito**
Un generator que produce módulos compliant con la arquitectura Extensio, integrados automáticamente en globals/constants, con demo funcional y soporte de shards/pages separados.

---

## 2. Estado del proyecto (As-Is)

- **Generator (`ModuleGenerator`)**: Ya implementa la transformación de naming (`_camelize`, `_getKebaName`) y la integración de globals/constants. Sin embargo, no incluye demo por defecto y el template de shards está incompleto (falta registro).
- **MCP Tool (`extensio-create.ts`)**: Usa el flag legacy `--withSurface` y no expone `--withShards` / `--withPages` de forma granular.
- **Constitution (`modules.md`)**: No define explícitamente las reglas de naming para clases ni el mecanismo de registro de Shards.
- **Workflow (`modules/create.md`)**: No refleja la separación de surfaces.

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Refactorizar `constitution.modules`
- **Interpretación**: Añadir reglas de naming (CamelCase clases) y registro de Shards.
- **Verificación**: Revisión del md actualizado.
- **Riesgos**: Ninguno.

### AC-2: Refactorizar workflow `modules/create.md`
- **Interpretación**: Actualizar inputs/outputs y pasos para incluir flags separados.
- **Verificación**: Revisión del md actualizado.

### AC-3: Generator transforma naming automáticamente
- **Interpretación**: Input "session-manager" debe generar clase `SessionManagerEngine`.
- **Verificación**: Test unitario del generator y visual en demo.
- **Estado**: Ya implementado en lógica interna, requiere validación E2E.

### AC-4: Flags `--withShards` y `--withPages` separados
- **Interpretación**: El MCP debe exponer estos flags y el generator debe honrarlos.
- **Verificación**: Ejecutar `ext create module --name test --withShards` y verificar que NO se crea estructura de pages.

### AC-5: Estructura y Registro de Shards
- **Interpretación**: `src/surfaces/shards/index.mts` debe existir e incluir `Shard.register()`. Además, debe generarse un shard de ejemplo (`example.mts`) y registrarse para ilustrar el patrón. Debe incluir comentarios sobre cómo registrar shards externos (NPM).
- **Verificación**: Inspección del código generado y ejecución en navegador.

### AC-6: Integración Globals/Constants
- **Interpretación**: Mismo patrón que drivers (`Extensio.<Modulo>`).
- **Verificación**: Comprobar `global.d.mts` y `constants.mts` tras generación.
- **Estado**: Ya implementado, requiere validación E2E.

### AC-7: Demo funcional incluido
- **Interpretación**: `--includeDemo` debe ser true por defecto.
- **Verificación**: Ejecutar creación por defecto y verificar carpeta `demo/`.

---

## 4. Research técnico

**Registro de Shards**
Se opta por **Registro Estático en index** (Investigación Phase 1, Refactor Phase 2).
- **Ventajas**: Explícito, sigue patrón WebComponents estandard, no requiere magia en runtime.
- **Implementación**: Modificar template `surface/shards/index.mts.ejs` para incluir llamadas a `Shard.register()`.

**Naming**
La lógica actual `_camelize` es correcta y se mantendrá. Se debe documentar en Constitution como regla estricta.

---

## 5. Agentes participantes

- **Module Agent**
  - Implementación de cambios en generator y templates.
  - Actualización de `constitution.modules`.
  - Actualización de workflow `modules/create.md`.

- **Architect Agent**
  - Validación de cambios en constitution y workflows.
  - Revisión de PRs.

- **Developer**
  - Aprobación de demo funcional.

**Componentes necesarios**
- Modificar: `packages/cli/src/generators/module` (index.mts + templates)
- Modificar: `tools/mcp-server/src/tools/extensio-create.ts`
- Modificar: `.agent/rules/constitution/modules.md`
- Modificar: `.agent/workflows/modules/create.md`

**Demo**
La tarea implica que **cada módulo generado incluya un demo**. Esto es un cambio estructural en el output del generator, alineado con la arquitectura de drivers.

---

## 6. Impacto de la tarea

- **Arquitectura**: Estandarización de módulos al nivel de drivers. Mayor robustez en componentes UI (Shards).
- **APIs**: Cambio en argumentos de CLI (`ext create module`). Backwards compatibility para `--withSurface` (mapeado a both).
- **Compatibilidad**: Módulos existentes no se ven afectados (solo afecta a nueva creación).

---

## 7. Riesgos y mitigaciones

- **Riesgo**: `Shard.register` podría fallar si el tag name ya existe.
  - **Mitigación**: El generator usa naming basado en el nombre del módulo para garantizar unicidad (`<module-name>-shard`).

- **Riesgo**: El demo aumenta el tamaño del paquete.
  - **Mitigación**: El demo está en carpeta separada y se excluye del build de producción del módulo (se gestiona vía exports condicionales o patterns de exclusión).

---

## 8. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-07T21:48:46+01:00
    comments: Aprobado con refactor de Shard.register()
```
