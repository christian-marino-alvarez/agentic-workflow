---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 4-adr-workflows-modulos
---

# Analysis — 4-adr-workflows-modulos

## 1. Resumen ejecutivo

### Problema
El framework Extensio tiene un sistema maduro para gestionar el ciclo de vida de **drivers** (create, refactor, delete), pero carece de un sistema equivalente para **módulos**. Los módulos tienen mayor complejidad arquitectónica que los drivers y requieren un sistema de governance específico.

### Objetivo
Diseñar y documentar la arquitectura completa para gestionar el ciclo de vida de módulos mediante un ADR que especifique: agentes, workflows, templates, constitution y extensiones MCP.

### Criterio de éxito
El análisis es válido si:
1. Cubre todos los acceptance criteria definidos en `task.md`
2. Define claramente los componentes necesarios
3. Establece las diferencias arquitectónicas con drivers
4. Proporciona especificación técnica suficiente para la fase de planning

---

## 2. Estado del proyecto (As-Is)

### Estructura relevante

```
.agent/
├── workflows/
│   ├── drivers/          # ✓ Existe y es maduro
│   │   ├── index.md
│   │   ├── create.md
│   │   ├── refactor.md
│   │   └── delete.md
│   └── modules/          # ✗ NO EXISTE
├── templates/
│   ├── driver-create.md  # ✓ Existe
│   ├── driver-refactor.md
│   ├── driver-delete.md
│   └── module-*.md       # ✗ NO EXISTE
├── rules/
│   ├── constitution/
│   │   ├── drivers.md    # ✓ Existe (295 líneas)
│   │   └── modules.md    # ✗ NO EXISTE
│   └── roles/
│       ├── driver.md     # ✓ Existe
│       └── module.md     # ✗ NO EXISTE
```

### Drivers existentes
| Driver | Estado | Responsabilidad |
|--------|--------|-----------------|
| `driver-tabs` | Activo | Gestión de pestañas |
| `driver-windows` | Activo | Gestión de ventanas |
| `driver-storage` | Activo | Persistencia |
| `driver-runtime` | Activo | Mensajería |
| `driver-offscreen` | Activo | Offscreen documents |
| `driver-prompt-ai` | Activo | Chrome AI API |

### Core / Engine / Surfaces
- **Engine**: Clase base en `packages/core/src/engine/engine.mts`
- **Context**: Clase base en `packages/core/src/engine/context.mts`
- **Surfaces**: Sistema de Shards/Pages en `packages/core/src/surface/`
- **Decorators**: `@property`, `@onChanged` en `packages/core/src/decorator/`

### Artifacts / tareas previas
| Task ID | Título | Relevancia |
|---------|--------|------------|
| 1 | MCP Server Extensio CLI | Herramientas MCP ya implementadas |
| 2 | Review MCP Agent System | Validación del sistema MCP |
| 3 | Developer Feedback Gate | Mejora de gates de aprobación |

### Limitaciones detectadas
1. **No existe directorio `packages/modules/`** — Los módulos se integran en apps
2. **El recurso MCP `extensio://modules` retorna array vacío** — No hay módulos registrados
3. **La constitución de módulos está fragmentada** — Parte en `extensio-architecture.md`, sin documento dedicado

---

## 3. Cobertura de Acceptance Criteria

### AC-1: ADR completo con especificación técnica de todos los componentes

**Interpretación**
El ADR debe incluir especificación técnica detallada de:
- 4 workflows (index + create + refactor + delete)
- 3 templates (create, refactor, delete)
- 1 constitution (modules.md)
- 1 rol (module-agent)

**Verificación**
- Cada componente tiene sección dedicada con estructura completa
- Los workflows incluyen pasos obligatorios, inputs, outputs y gates
- Los templates definen todas las secciones requeridas
- La constitution cubre reglas verificables y auditables

**Riesgos / ambigüedades**
- Riesgo: Duplicar contenido de `extensio-architecture.md`
- Mitigación: La constitution de módulos DEBE referenciar la arquitectura base, solo añadir reglas operativas

---

### AC-2: Documentación del rol `module-agent` y su relación con `architect-agent`

**Interpretación**
Definir el rol `module-agent` como owner del dominio de módulos, con:
- Identidad y misión
- Contrato obligatorio (sources of truth)
- Responsabilidades principales
- Relación de delegación con `architect-agent`
- Capacidades y herramientas

**Verificación**
- El rol sigue el formato de `driver.md` (rol modelo)
- Define capabilities.modules con permisos explícitos
- Incluye sección de comunicación con architect-agent
- Define DoD (Definition of Done)

**Riesgos / ambigüedades**
- Riesgo: Solapamiento de responsabilidades con architect-agent
- Mitigación: El architect-agent detecta la necesidad y delega; module-agent ejecuta

---

### AC-3: Especificación de workflows (create, refactor, delete)

**Interpretación**
Tres workflows con estructura paralela a drivers:
- `modules/index.md`: Índice del dominio
- `modules/create.md`: Creación de módulos
- `modules/refactor.md`: Refactorización
- `modules/delete.md`: Eliminación

**Verificación**
- Cada workflow tiene: Input, Output, Objetivo, Template, Pasos obligatorios, FAIL, Gate
- Los workflows referencian `constitution.modules`
- Los gates son verificables

**Riesgos / ambigüedades**
- Los módulos tienen scopes adicionales (Engine, Context, Surface)
- El workflow de create debe validar scopes correctamente

---

### AC-4: Especificación de templates necesarios

**Interpretación**
Tres templates de informe:
- `module-create.md`: Informe de creación
- `module-refactor.md`: Informe de refactorización
- `module-delete.md`: Informe de eliminación

**Verificación**
- Cada template cubre las secciones específicas de módulos
- Incluyen validación de scopes (Engine, Context, Surface)
- Incluyen checklist de ciclo de vida

**Riesgos / ambigüedades**
- Los templates deben reflejar la mayor complejidad de módulos vs drivers

---

### AC-5: Especificación de reglas de constitución

**Interpretación**
Documento `constitution.modules` que defina:
- Qué es un módulo
- Estructura obligatoria
- Ciclo de vida (7 métodos)
- Scopes permitidos
- Reglas de reactividad
- Prohibiciones
- Criterios de auditoría

**Verificación**
- El documento sigue el formato de `drivers.md`
- Incluye sección de severidad
- Incluye ejemplos de código
- No duplica `extensio-architecture.md`

**Riesgos / ambigüedades**
- Riesgo: La constitution se desactualiza respecto a `extensio-architecture.md`
- Mitigación: Referenciar como source of truth, no copiar

---

### AC-6: Especificación de extensiones MCP en `extensio-cli`

**Interpretación**
Documentar que las herramientas MCP existentes ya soportan módulos:
- `extensio_create --type module` ✓
- `extensio_build` ✓
- `extensio_test` ✓
- `extensio_demo --type module` ✓
- `extensio://modules` (recurso) ✓

**Verificación**
- El ADR confirma que no se requieren nuevas herramientas
- Documenta el uso de las herramientas existentes para módulos

**Riesgos / ambigüedades**
- Ninguno — Las herramientas ya existen

---

### AC-7: ADR aprobado explícitamente por el desarrollador

**Interpretación**
El ADR final debe tener aprobación binaria (SI/NO) del desarrollador.

**Verificación**
- Sección de aprobación en el documento
- Registro de fecha y comentarios

**Riesgos / ambigüedades**
- Ninguno — Es un gate estándar

---

## 4. Research técnico

### Basado en `researcher/research.md` (aprobado)

**Decisión recomendada: Paralelismo con drivers**

Los módulos deben seguir exactamente el mismo modelo estructural que los drivers:
- Workflows en `.agent/workflows/modules/`
- Templates en `.agent/templates/module-*.md`
- Constitution en `.agent/rules/constitution/modules.md`
- Rol en `.agent/rules/roles/module.md`

**Justificación**:
1. Consistencia con el modelo existente
2. Curva de aprendizaje baja para agentes
3. Reutilización de patrones probados
4. Evolución independiente de cada dominio

---

## 5. Agentes participantes

### architect-agent
**Responsabilidades**:
- Detectar cuándo una tarea requiere crear/modificar/eliminar módulos
- Delegar al `module-agent` durante la implementación
- Validar la coherencia arquitectónica del resultado

**Subáreas asignadas**:
- Aprobación del ADR
- Review arquitectónico post-implementación

### module-agent (NUEVO)
**Responsabilidades**:
- Owner del ciclo de vida de módulos
- Ejecutar workflows de create/refactor/delete
- Auditar cumplimiento de `constitution.modules`
- Validar scopes (Engine, Context, Surface)
- Verificar uso correcto de decoradores
- Detectar dependencias cruzadas prohibidas
- Registrar lecciones aprendidas

**Subáreas asignadas**:
- Estructura de módulos
- Ciclo de vida
- Reactividad
- Integración con Core

### researcher-agent
**Responsabilidades**:
- Investigación técnica en Phase 1 (ya completada)

### qa-agent
**Responsabilidades**:
- Validar tests unitarios y E2E (cuando aplique)
- No aplica para este ADR (entregable es documentación)

### Handoffs
```
architect-agent → module-agent (delegación de implementación)
module-agent → architect-agent (review y aprobación)
```

### Componentes necesarios

| Componente | Acción | Ubicación |
|------------|--------|-----------|
| Workflows | CREAR | `.agent/workflows/modules/` |
| Templates | CREAR | `.agent/templates/module-*.md` |
| Constitution | CREAR | `.agent/rules/constitution/modules.md` |
| Rol | CREAR | `.agent/rules/roles/module.md` |
| Índices | ACTUALIZAR | `.agent/workflows/index.md`, `.agent/templates/index.md`, `.agent/rules/roles/index.md`, `.agent/rules/constitution/index.md` |

### Demo
**No aplica** — El entregable es un ADR (documentación).

---

## 6. Impacto de la tarea

### Arquitectura
- **Cambios estructurales**: Creación de nuevo dominio `workflows/modules/`
- **Paralelismo**: Estructura idéntica a `workflows/drivers/`
- **Extensibilidad**: Permite futuras operaciones sobre módulos

### APIs / contratos
- **Nuevos contratos**: `constitution.modules`, `role.module-agent`
- **Sin cambios en código**: El ADR no modifica código fuente

### Compatibilidad
- **Sin breaking changes**: Es adición pura
- **Retrocompatibilidad**: Los módulos existentes no se ven afectados

### Testing / verificación
- **Validación documental**: Revisión del ADR
- **Sin tests automatizados**: El entregable es documentación

---

## 7. Riesgos y mitigaciones

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Duplicar contenido de extensio-architecture.md | Medio | Alto | Constitution referencia sin copiar |
| Rol module-agent se solapa con architect | Bajo | Medio | Definir boundaries claros |
| Workflows demasiado rígidos | Bajo | Bajo | Gates verificables pero flexibles |
| Desactualización futura | Medio | Medio | Versionado en frontmatter |

---

## 8. Preguntas abiertas

*Ninguna — Los acceptance criteria están claros tras Phase 0.*

---

## 9. Aprobación

Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-07T07:35:17+01:00"
    comments: "Aprobado para avanzar a Phase 3"
```

> Sin aprobación, esta fase **NO puede darse por completada** ni avanzar a Phase 3.
