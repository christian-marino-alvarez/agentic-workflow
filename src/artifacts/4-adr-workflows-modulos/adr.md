---
adr: 004
title: Workflows para Módulos en Extensio
status: proposed
date: 2026-01-07
decision-makers:
  - architect-agent
  - developer
related-task: 4-adr-workflows-modulos
---

# ADR-004: Workflows para Módulos en Extensio

## Contexto y Problema

El framework Extensio cuenta con un sistema maduro para gestionar el ciclo de vida de **drivers** que incluye:
- 3 workflows: create, refactor, delete
- 3 templates de informes
- 1 constitution contractual
- 1 rol especializado (driver-agent)

Sin embargo, **no existe un sistema equivalente para módulos**, a pesar de que los módulos son componentes más complejos que los drivers:
- Los módulos tienen múltiples scopes (Engine, Context, Surfaces)
- Los módulos usan decoradores reactivos (@property, @onChanged)
- Los módulos tienen un ciclo de vida de 7 métodos

Este ADR define la arquitectura para implementar el sistema de workflows de módulos.

---

## Decisión

Implementar un sistema de workflows para módulos **paralelo al de drivers**, adaptando las diferencias arquitectónicas específicas de los módulos.

---

## Componentes Propuestos

### 1. Constitution de Módulos

**Archivo**: `.agent/rules/constitution/modules.md`

**Objetivo**: Definir reglas contractuales obligatorias para todos los módulos.

**Estructura propuesta**:

```yaml
id: constitution.modules
type: rule
owner: architect-agent
version: 1.0.0
severity: PERMANENT
scope: global
```

**Secciones obligatorias**:

| Sección | Contenido |
|---------|-----------|
| 1. Definición | Qué es un módulo, qué hace, qué no hace |
| 2. Scopes obligatorios | Engine (obligatorio), Context (opcional), Surfaces (opcional) |
| 3. Estructura obligatoria | Árbol de directorios, archivos mínimos |
| 4. Ciclo de vida | Los 7 métodos: run, _setup, _listen, setup, listen, loadProps, start |
| 5. Reactividad | @property, @onChanged, waitingLoadProps |
| 6. Aislamiento | Prohibición de dependencias cruzadas |
| 7. Clean Code | Referencia a clean-code.md |
| 8. Tooling | Uso de CLI/MCP |
| 9. Auditoría | Criterios mínimos |
| 10. Severidad | Violaciones HIGH |
| 11. Ejemplos | Código de referencia |

**Diferencias clave vs drivers.md**:
- Añade sección de Scopes (Engine, Context, Surfaces)
- Añade sección de Ciclo de vida (7 métodos)
- Añade sección de Reactividad (decoradores)
- No incluye sección de Events (los módulos no exponen eventos de browser)

---

### 2. Rol module-agent

**Archivo**: `.agent/rules/roles/module.md`

**Objetivo**: Definir el agente especializado en el dominio de módulos.

**Estructura propuesta**:

```yaml
id: role.module-agent
type: rule
owner: architect-agent
version: 1.0.0
severity: PERMANENT
scope: global

capabilities:
  modules:
    create: true
    modify: true
    delete: true
    audit: true
  governance:
    compliance: enforced
    manual_changes_detection: enforced
  tools:
    mcp_extensio-cli:
      tools: [extensio_create, extensio_build, extensio_test, extensio_demo]
      required: true
  learning:
    record_errors: required
```

**Secciones obligatorias**:

| Sección | Contenido |
|---------|-----------|
| Identidad | Misión: gobernar módulos del proyecto |
| Contrato | Sources of truth: constitution.modules, extensio-architecture, clean-code |
| Responsabilidades | 1) Crear, 2) Modificar, 3) Borrar, 4) Auditar, 5) Detectar cambios manuales |
| Comunicación | Formato de reporte al architect-agent |
| Aprendizaje | Registro de lecciones aprendidas |
| DoD | Definition of Done para módulos |

**Relación con architect-agent**:
- El architect-agent detecta la necesidad de crear/modificar/eliminar módulos
- El architect-agent delega la ejecución al module-agent
- El module-agent reporta resultados al architect-agent
- El architect-agent valida la coherencia arquitectónica

---

### 3. Workflows de Módulos

**Directorio**: `.agent/workflows/modules/`

#### 3.1 Index

**Archivo**: `modules/index.md`

```yaml
id: workflows.modules.index
owner: architect-agent
version: 1.0.0
severity: PERMANENT
description: Índice del dominio de workflows para módulos
```

**Aliases**:
```yaml
workflows:
  modules:
    create: .agent/workflows/modules/create.md
    refactor: .agent/workflows/modules/refactor.md
    delete: .agent/workflows/modules/delete.md
```

#### 3.2 Create

**Archivo**: `modules/create.md`

```yaml
id: workflow.modules.create
owner: module-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["module-create", "modules:create"]
blocking: true
```

**Input**: Plan del architect que requiere crear un módulo

**Output**: `.agent/artifacts/<taskId>-<taskTitle>/module/create.md`

**Template obligatorio**: `templates.module_create`

**Pasos obligatorios**:
1. Verificar inputs (plan.md requiere crear módulo)
2. Crear el módulo usando `mcp_extensio-cli extensio_create --type module`
3. Validar estructura según constitution.modules
4. Validar scopes (Engine obligatorio)
5. Validar ciclo de vida (métodos implementados)
6. Crear informe de creación
7. Auditoría del architect-agent
8. PASS / FAIL

**Gate**:
- Estructura correcta
- Scopes definidos
- Ciclo de vida completo
- Auditoría aprobada

#### 3.3 Refactor

**Archivo**: `modules/refactor.md`

```yaml
id: workflow.modules.refactor
owner: module-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["module-refactor", "modules:refactor"]
blocking: true
```

**Input**: Plan del architect que requiere refactorizar un módulo

**Output**: `.agent/artifacts/<taskId>-<taskTitle>/module/refactor.md`

**Template obligatorio**: `templates.module_refactor`

**Pasos obligatorios**:
1. Verificar inputs
2. Ejecutar refactor según plan y constitution
3. Validar estructura post-refactor
4. Validar scopes preservados
5. Validar reactividad intacta
6. Crear informe de refactor
7. Auditoría del architect-agent
8. PASS / FAIL

#### 3.4 Delete

**Archivo**: `modules/delete.md`

```yaml
id: workflow.modules.delete
owner: module-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["module-delete", "modules:delete"]
blocking: true
```

**Input**: Plan del architect que requiere eliminar un módulo

**Output**: `.agent/artifacts/<taskId>-<taskTitle>/module/delete.md`

**Template obligatorio**: `templates.module_delete`

**Pasos obligatorios**:
1. Verificar inputs
2. Eliminar módulo y referencias
3. Validar sin imports huérfanos
4. Crear informe de eliminación
5. Auditoría del architect-agent
6. PASS / FAIL

---

### 4. Templates de Módulos

**Directorio**: `.agent/templates/`

#### 4.1 module-create.md

**Secciones obligatorias**:

| Sección | Contenido |
|---------|-----------|
| 1. Resumen ejecutivo | Módulo creado, motivo, estado |
| 2. Alcance y requisitos | Funcionalidades, scopes, dependencias |
| 3. Estructura creada | Árbol de archivos |
| 4. Scopes implementados | Engine, Context (si aplica), Surfaces (si aplica) |
| 5. Ciclo de vida | Métodos implementados |
| 6. Reactividad | Propiedades y listeners |
| 7. Types y Constants | Aislamiento |
| 8. Integración | Referencias en globals/constants |
| 9. Auditoría | Checklist de constitution |
| 10. Evidencias | Archivos, cambios |

#### 4.2 module-refactor.md

**Secciones obligatorias**:

| Sección | Contenido |
|---------|-----------|
| 1. Resumen ejecutivo | Módulo, motivo del refactor |
| 2. Alcance del refactor | Cambios principales |
| 3. Cambios por área | Scopes, reactividad, estructura |
| 4. Ciclo de vida | Métodos afectados |
| 5. Compatibilidad | Riesgos, mitigaciones |
| 6. Evidencias | Archivos modificados, tests |
| 7. Auditoría | Checklist |

#### 4.3 module-delete.md

**Secciones obligatorias**:

| Sección | Contenido |
|---------|-----------|
| 1. Resumen ejecutivo | Módulo eliminado, motivo |
| 2. Alcance | Componentes removidos |
| 3. Limpieza | Imports, docs, tests actualizados |
| 4. Integridad | Verificación sin referencias huérfanas |
| 5. Evidencias | Archivos eliminados |
| 6. Auditoría | Checklist |

---

### 5. Actualizaciones de Índices

Los siguientes índices deben actualizarse para registrar los nuevos componentes:

| Índice | Cambio |
|--------|--------|
| `.agent/workflows/index.md` | Añadir `modules: .agent/workflows/modules/index.md` |
| `.agent/templates/index.md` | Añadir `module_create`, `module_refactor`, `module_delete` |
| `.agent/rules/constitution/index.md` | Añadir `modules: constitution/modules.md` |
| `.agent/rules/roles/index.md` | Añadir `module: roles/module.md` |

---

### 6. Herramientas MCP

**Estado**: Ya existen, no se requieren cambios.

| Herramienta | Soporte módulos |
|-------------|-----------------|
| `extensio_create --type module` | ✓ |
| `extensio_build` | ✓ |
| `extensio_test` | ✓ |
| `extensio_demo --type module` | ✓ |
| `extensio://modules` (recurso) | ✓ |

---

## Consecuencias

### Positivas
- Sistema coherente y paralelo al de drivers
- Curva de aprendizaje baja para agentes
- Auditoría específica para la complejidad de módulos
- Governance clara con module-agent dedicado

### Negativas
- Incremento de documentación a mantener
- Posible duplicación con extensio-architecture.md (mitigado con referencias)

### Riesgos
- Desactualización entre constitution y arquitectura base
- Mitigación: constitution REFERENCIA, no duplica

---

## Plan de Implementación

| Paso | Componente | Prioridad | Dependencias |
|------|------------|-----------|--------------|
| 1 | Constitution modules.md | Alta | Ninguna |
| 2 | Rol module.md | Alta | Paso 1 |
| 3 | Workflows (4 archivos) | Alta | Pasos 1-2 |
| 4 | Templates (3 archivos) | Media | Paso 3 |
| 5 | Índices (4 archivos) | Baja | Pasos 1-4 |

**Total**: 13 archivos nuevos + 4 actualizaciones

---

## Referencias

- [extensio-architecture.md](file:///Users/milos/Documents/workspace/extensio/.agent/rules/constitution/extensio-architecture.md)
- [drivers.md](file:///Users/milos/Documents/workspace/extensio/.agent/rules/constitution/drivers.md) (modelo)
- [driver.md](file:///Users/milos/Documents/workspace/extensio/.agent/rules/roles/driver.md) (modelo de rol)
- [Research](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/4-adr-workflows-modulos/researcher/research.md)
- [Analysis](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/4-adr-workflows-modulos/analysis.md)

---

## Aprobación

```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-07T07:43:59+01:00"
    comments: "ADR aprobado"
```
