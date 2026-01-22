---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 7-modules-globals-constants
---

# Analysis — 7-modules-globals-constants

## 1. Resumen ejecutivo

**Problema**
Los módulos de Extensio carecen de reglas contractuales para extender los archivos globales `global.d.mts` y `constants.mts`, a diferencia de los drivers. Además, el desarrollador ha decidido unificar el namespace a `Extensio` para ambos (drivers y módulos), requiriendo migración del namespace actual `Extension`.

**Objetivo**
1. Documentar reglas en `constitution.modules` para extensión de globals/constants
2. Migrar namespace de `Extension` a `Extensio` en todo el proyecto
3. Actualizar CLI para generar estructura correcta con namespace `Extensio`
4. Verificar con módulo de test

**Criterio de éxito**
- Acceptance criteria cumplidos según `task.md`
- Namespace `Extensio` unificado en `global.d.mts`
- Constitution y workflows actualizados
- Módulo de test creado y funcionando

---

## 2. Estado del proyecto (As-Is)

### Estructura relevante
- `global.d.mts` (root): Define namespace `Extension.<DriverName>` para drivers
- `constants.mts` (root): Exporta `Constants.<DriverName>` para drivers
- No existen módulos implementados actualmente

### Drivers existentes
Los drivers actuales usan namespace `Extension`:
- Windows, Tabs, Storage, Runtime, Offscreen, SidePanel, DocumentPip

### Core / Engine / Surfaces
- Core importa desde `__ROOT_PATH__/constants.mts`
- El generador de módulos (`cli/src/generators/module/index.mts`) ya tiene métodos:
  - `_extendGlobalTypes()`: Extiende `global.d.mts` (pero usa `Extension`)
  - `_extendRootConstants()`: Extiende `constants.mts`

### Limitaciones detectadas
1. El namespace actual es `Extension`, no `Extensio`
2. `constitution.modules` no tiene secciones equivalentes a drivers (2.3, 2.4)
3. Workflows de módulos no tienen pasos de verificación de globals/constants

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Alcance (solo módulos futuros)
- **Interpretación:** Las normas aplican a módulos nuevos, no hay migración de módulos existentes.
- **Verificación:** Confirmar que no existen módulos en `packages/modules`.
- **Riesgo:** Ninguno, confirmado que no hay módulos.

### AC-2: Namespace (PascalCase `Extensio.<ModuleName>`)
- **Interpretación:** Unificar a `Extensio` para drivers y módulos.
- **Verificación:** 
  - `global.d.mts` usa `namespace Extensio`
  - CLI genera con `Extensio`
- **Riesgo:** Breaking change para código que use `Extension.*`

### AC-3: Tipos públicos
- **Interpretación:** Solo tipos marcados como públicos se registran en globals.
- **Verificación:** El generador solo exporta tipos de `types.d.mts`.
- **Riesgo:** Bajo, el patrón actual ya funciona así.

### AC-4: Verificación automatizada
- **Interpretación:** Workflows incluyen validación de globals/constants.
- **Verificación:** Revisar `workflows/modules/create.md` actualizado.
- **Riesgo:** Requiere actualizar template y workflow.

### AC-5: Integración MCP CLI
- **Interpretación:** CLI genera estructura correcta + módulo de test.
- **Verificación:** Ejecutar `extensio_create module --name test-module --includeDemo`.
- **Riesgo:** CLI puede requerir actualización para namespace `Extensio`.

---

## 4. Research técnico

### Alternativa A: Mantener namespace separado por tipo
- Descripción: `Extension` para drivers, `Extensio` para módulos
- Ventajas: Sin breaking changes
- Inconvenientes: Inconsistencia, confusión

### Alternativa B: Unificar a `Extensio` ✅ (Decisión del desarrollador)
- Descripción: Migrar todo a namespace `Extensio`
- Ventajas: Consistencia, nombre correcto del framework
- Inconvenientes: Breaking change en imports existentes

**Decisión:** Alternativa B aprobada por el desarrollador.

---

## 5. Agentes participantes

### architect-agent
- Responsabilidades:
  - Actualizar `constitution.modules` con secciones de globals/constants
  - Actualizar `constitution.drivers` para reflejar namespace `Extensio`
  - Actualizar workflows de módulos
  - Validar coherencia arquitectónica
- Subáreas: Constitutions, workflows, templates

### driver-agent
- Responsabilidades:
  - Migrar `global.d.mts` de `Extension` a `Extensio`
- Subáreas: Tipos globales

### module-agent
- Responsabilidades:
  - Actualizar generador de módulos en CLI
  - Crear módulo de test para verificación
- Subáreas: CLI, verificación

**Handoffs**
1. architect-agent define constitutions y workflows
2. driver-agent migra globals existentes
3. module-agent actualiza CLI y crea módulo de test

**Componentes necesarios**

| Acción | Componente | Descripción |
|--------|------------|-------------|
| MODIFICAR | `global.d.mts` | Migrar namespace `Extension` → `Extensio` |
| MODIFICAR | `constitution.modules` | Añadir secciones de globals/constants (equivalentes a drivers 2.3, 2.4) |
| MODIFICAR | `constitution.drivers` | Actualizar namespace a `Extensio` en ejemplos |
| MODIFICAR | `workflows/modules/create.md` | Añadir pasos de verificación de globals/constants |
| MODIFICAR | `workflows/modules/refactor.md` | Añadir verificación de globals/constants |
| MODIFICAR | `workflows/modules/delete.md` | Añadir limpieza de globals/constants |
| MODIFICAR | `templates/module-create.md` | Añadir checklist de globals/constants |
| MODIFICAR | `cli/generators/module/index.mts` | Cambiar namespace → `Extensio` |
| MODIFICAR | `cli/generators/driver/index.mts` | Cambiar namespace → `Extensio` (si aplica) |
| CREAR | Módulo de test con demo | Verificar funcionamiento end-to-end |

**Documentación del patrón en `constitution.modules`:**
Se añadirán secciones equivalentes a `constitution.drivers`:
- Sección sobre `types.d.mts` y registro en globals
- Sección sobre `constants.mts` y extensión del root
- Ejemplos de código con namespace `Extensio`

**Verificación en workflows (igual que drivers):**
Los workflows de módulos incluirán:
- Paso de verificación de que `global.d.mts` está actualizado
- Paso de verificación de que `constants.mts` root está actualizado
- Checklist en template de creación

**Demo**
- Se requiere crear demo para el módulo de test
- Justificación: Validar que la estructura de demos funciona con namespace `Extensio`

---

## 6. Impacto de la tarea

### Arquitectura
- Cambio de namespace global: `Extension` → `Extensio`
- Constitutions actualizadas con nuevas reglas

### APIs / contratos
- **Breaking change:** Código que use `Extension.*` fallará
- Mitigación: No hay código de módulos que lo use actualmente

### Compatibilidad
- Drivers existentes: Actualizar `global.d.mts` es suficiente
- Core: Verificar si usa `Extension.*` directamente

### Testing / verificación
- Unit tests para generadores de CLI
- E2E test con módulo de test
- Build del proyecto completo

---

## 7. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Breaking change en código existente | Alto | Verificar que no hay uso de `Extension.*` en packages |
| CLI no genera correctamente | Medio | Tests unitarios antes de crear módulo de test |
| Demos no funcionan con nuevo namespace | Medio | Verificar alias `__PARENT_SRC__` sigue funcionando |

---

## 8. Preguntas abiertas
Ninguna. Todas las dudas resueltas en Phase 0 y Phase 1.

---

## 9. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-07T20:58:48+01:00
    comments: ""
```
