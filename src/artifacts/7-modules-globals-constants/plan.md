---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 7-modules-globals-constants
---

# Implementation Plan — 7-modules-globals-constants

## 1. Resumen del plan

**Contexto:**  
Unificar namespace global a `Extensio` para drivers y módulos, documentar patrón de globals/constants en `constitution.modules`, y añadir verificación en workflows.

**Resultado esperado:**
- Namespace `Extensio` unificado en `global.d.mts`
- `constitution.modules` con secciones de globals/constants (equivalentes a drivers)
- Workflows de módulos con pasos de verificación
- CLI actualizado para generar con namespace `Extensio`
- Módulo de test con demo funcionando

**Alcance:**
- ✅ Incluye: Migración de namespace, documentación de patrón, verificación en workflows, CLI, módulo de test
- ❌ Excluye: Migración de código existente que use `Extension.*` (no existe actualmente)

---

## 2. Inputs contractuales

- **Task**: `.agent/artifacts/7-modules-globals-constants/task.md`
- **Analysis**: `.agent/artifacts/7-modules-globals-constants/analysis.md`
- **Acceptance Criteria**: AC-1 a AC-5 (ver task.md)

**Dispatch de dominios**
```yaml
plan:
  workflows:
    modules:
      action: verify
      workflow: workflow.modules.create

  dispatch:
    - domain: modules
      action: create
      workflow: workflow.modules.create
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Migrar namespace en `global.d.mts`
- **Descripción:** Cambiar `namespace Extension` → `namespace Extensio` en `global.d.mts`
- **Dependencias:** Ninguna
- **Entregables:** `global.d.mts` actualizado
- **Agente responsable:** architect-agent

### Paso 2: Actualizar `constitution.modules`
- **Descripción:** Añadir secciones equivalentes a drivers:
  - Sección sobre `types.d.mts` y registro en globals
  - Sección sobre `constants.mts` y extensión del root
  - Ejemplos con namespace `Extensio`
- **Dependencias:** Paso 1
- **Entregables:** `constitution.modules` actualizado
- **Agente responsable:** architect-agent

### Paso 3: Actualizar `constitution.drivers`
- **Descripción:** Actualizar ejemplos de namespace `Extension` → `Extensio`
- **Dependencias:** Paso 1
- **Entregables:** `constitution.drivers` actualizado
- **Agente responsable:** architect-agent

### Paso 4: Actualizar workflows de módulos
- **Descripción:** Añadir pasos de verificación en:
  - `workflows/modules/create.md`
  - `workflows/modules/refactor.md`
  - `workflows/modules/delete.md`
- **Dependencias:** Paso 2
- **Entregables:** Workflows actualizados
- **Agente responsable:** architect-agent

### Paso 5: Actualizar template `module-create.md`
- **Descripción:** Añadir checklist de verificación de globals/constants
- **Dependencias:** Paso 4
- **Entregables:** Template actualizado
- **Agente responsable:** architect-agent

### Paso 6: Actualizar generador de módulos en CLI
- **Descripción:** Cambiar namespace `Extension` → `Extensio` en `_extendGlobalTypes()`
- **Dependencias:** Paso 1
- **Entregables:** `cli/src/generators/module/index.mts` actualizado
- **Agente responsable:** module-agent
- **Tool:** Edición manual (no hay tool específico para esto)

### Paso 7: Verificar generador de drivers en CLI
- **Descripción:** Verificar si usa `Extension` y cambiar a `Extensio` si aplica
- **Dependencias:** Paso 1
- **Entregables:** `cli/src/generators/driver/index.mts` actualizado (si aplica)
- **Agente responsable:** driver-agent

### Paso 8: Crear módulo de test con demo
- **Descripción:** Crear módulo de test para verificar funcionamiento
- **Dependencias:** Pasos 1-7
- **Entregables:** Módulo `test-globals` en `packages/modules/`
- **Agente responsable:** module-agent
- **Tool:** `mcp_extensio-cli extensio_create` con `--type module --name test-globals --includeDemo`

### Paso 9: Verificar build del proyecto
- **Descripción:** Ejecutar build completo para validar cambios
- **Dependencias:** Paso 8
- **Entregables:** Build exitoso sin errores de tipos
- **Agente responsable:** qa-agent
- **Tool:** `mcp_extensio-cli extensio_build`

---

## 4. Asignación de responsabilidades (Agentes)

### architect-agent
- Responsabilidades:
  - Migrar namespace en `global.d.mts`
  - Actualizar constitutions (modules, drivers)
  - Actualizar workflows de módulos
  - Actualizar template de creación
  - Validar coherencia arquitectónica

### module-agent
- Responsabilidades:
  - Actualizar generador de módulos en CLI
  - Crear módulo de test con demo

### driver-agent
- Responsabilidades:
  - Verificar/actualizar generador de drivers en CLI

### qa-agent
- Responsabilidades:
  - Verificar build del proyecto
  - Ejecutar tests

**Handoffs:**
1. architect-agent → module-agent: Constitutions y workflows listos
2. module-agent → qa-agent: Módulo de test creado
3. qa-agent → architect-agent: Resultados de verificación

**Componentes:**

| Componente | Responsable | Cómo | Tool |
|------------|-------------|------|------|
| `global.d.mts` | architect-agent | Edición directa | N/A |
| `constitution.modules` | architect-agent | Edición directa | N/A |
| `constitution.drivers` | architect-agent | Edición directa | N/A |
| `workflows/modules/*.md` | architect-agent | Edición directa | N/A |
| `templates/module-create.md` | architect-agent | Edición directa | N/A |
| `cli/generators/module/index.mts` | module-agent | Edición directa | N/A |
| `cli/generators/driver/index.mts` | driver-agent | Edición directa | N/A |
| Módulo de test | module-agent | CLI | `mcp_extensio-cli extensio_create` |

**Demo:**
- Estructura: Módulo con demo siguiendo `constitution.extensio_architecture`
- Tool: `mcp_extensio-cli extensio_demo` si el módulo ya existe, o incluir con `--includeDemo`

---

## 5. Estrategia de testing y validación

### Build validation
- **Comando:** `npm run build` (desde root)
- **Criterio:** Sin errores de TypeScript

### Verificación de namespace
- **Manual:** Revisar que `global.d.mts` use `namespace Extensio`
- **Manual:** Revisar que CLI genere con `Extensio`

### Módulo de test
- **Comando:** `mcp_extensio-cli extensio_build --browsers chrome`
- **Criterio:** Build exitoso del módulo de test

### Trazabilidad

| AC | Verificación |
|----|--------------|
| AC-1 | Confirmar que no hay módulos existentes |
| AC-2 | Verificar namespace `Extensio` en `global.d.mts` y CLI |
| AC-3 | Verificar que solo tipos públicos se exportan |
| AC-4 | Revisar workflows actualizados |
| AC-5 | Crear módulo de test y verificar funcionamiento |

---

## 6. Plan de demo

**Objetivo:** Demostrar que el patrón de globals/constants funciona para módulos

**Escenario:**
1. Crear módulo `test-globals` con demo usando CLI
2. Verificar que `global.d.mts` se extiende con `Extensio.TestGlobals`
3. Verificar que `constants.mts` se extiende correctamente
4. Build exitoso del módulo y demo

**Criterios de éxito:**
- Módulo creado sin errores
- Namespace correcto en globals
- Build exitoso

---

## 7. Estimaciones y pesos de implementación

| Paso | Esfuerzo | Complejidad |
|------|----------|-------------|
| Paso 1: Migrar namespace | Bajo | Baja |
| Paso 2: Actualizar constitution.modules | Medio | Media |
| Paso 3: Actualizar constitution.drivers | Bajo | Baja |
| Paso 4: Actualizar workflows | Medio | Media |
| Paso 5: Actualizar template | Bajo | Baja |
| Paso 6: Actualizar CLI módulos | Bajo | Baja |
| Paso 7: Verificar CLI drivers | Bajo | Baja |
| Paso 8: Crear módulo de test | Bajo | Baja |
| Paso 9: Verificar build | Bajo | Baja |

**Estimación total:** ~30-45 minutos de implementación

---

## 8. Puntos críticos y resolución

### Punto crítico 1: Breaking change en código existente
- **Riesgo:** Código que use `Extension.*` fallará
- **Impacto:** Alto si existe código dependiente
- **Resolución:** Verificado que no existe código usando `Extension.*` en packages

### Punto crítico 2: CLI no genera correctamente
- **Riesgo:** Módulo de test no se crea con namespace correcto
- **Impacto:** Medio
- **Resolución:** Actualizar CLI antes de crear módulo de test

---

## 9. Dependencias y compatibilidad

**Dependencias internas:**
- `@extensio/cli` (generadores)
- `global.d.mts` y `constants.mts` (root)

**Dependencias externas:**
- Ninguna

**Compatibilidad entre navegadores:**
- No aplica (cambios en sistema de tipos, no runtime)

---

## 10. Criterios de finalización

- [ ] `global.d.mts` usa namespace `Extensio`
- [ ] `constitution.modules` incluye secciones de globals/constants
- [ ] `constitution.drivers` usa ejemplos con `Extensio`
- [ ] Workflows de módulos incluyen verificación de globals/constants
- [ ] Template `module-create.md` incluye checklist
- [ ] CLI genera módulos con namespace `Extensio`
- [ ] Módulo de test creado y funcionando
- [ ] Build del proyecto exitoso

---

## 11. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-07T21:02:25+01:00
    comments: ""
```
