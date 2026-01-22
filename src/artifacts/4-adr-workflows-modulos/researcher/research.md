---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 4-adr-workflows-modulos
---

# Research Report — 4-adr-workflows-modulos

## 1. Resumen ejecutivo

### Problema investigado
Diseñar el sistema de workflows para gestionar el ciclo de vida de módulos en Extensio, siguiendo el modelo establecido para drivers.

### Objetivo de la investigación
Identificar los componentes necesarios (agentes, workflows, templates, reglas, MCP) y las diferencias arquitectónicas clave entre drivers y módulos para producir un ADR completo.

### Principales hallazgos

1. **El CLI ya soporta módulos**: `extensio-cli` tiene generadores para `module`, `driver` y `project`. Los comandos `create`, `build`, `test` y `demo` funcionan para módulos.

2. **Estructura de drivers como modelo**: El sistema de drivers es maduro y comprende:
   - 3 workflows: `create`, `refactor`, `delete`
   - 3 templates: `driver-create.md`, `driver-refactor.md`, `driver-delete.md`
   - 1 constitution: `drivers.md` (295 líneas)
   - 1 rol: `driver-agent`

3. **Diferencias arquitectónicas críticas**: Los módulos tienen mayor complejidad que los drivers:
   - Módulos pueden tener **Engine**, **Context** y **Surfaces** (Shards/Pages)
   - Módulos usan **@property** y **@onChanged** para reactividad
   - Módulos tienen ciclo de vida complejo: `run() → _setup() → _listen() → setup() → listen() → loadProps() → start()`
   - Los drivers son fachadas simples sin estado de negocio

4. **No existe directorio `packages/modules`**: Los módulos del proyecto actual parecen estar integrados en aplicaciones (`apps/`) o en `core`.

---

## 2. Necesidades detectadas

### Requisitos técnicos identificados

| Componente | Driver (existente) | Módulo (necesario) |
|------------|--------------------|--------------------|
| Agente especializado | `driver-agent` | `module-agent` |
| Workflows | create, refactor, delete | create, refactor, delete |
| Constitution | `drivers.md` | `modules.md` (nueva) |
| Templates | 3 (create/refactor/delete) | 3 (create/refactor/delete) |
| MCP tools | Ya soportados | Ya soportados |

### Suposiciones
- Los módulos se crearán en `packages/modules/` (directorio a crear).
- El ciclo de vida de módulos es más complejo pero sigue el mismo patrón de workflows.
- La validación de módulos requiere verificar: scopes, decoradores, integración con Core.

### Límites
- El ADR no implementa código, solo especifica la arquitectura.
- La constitución de módulos debe complementar `extensio-architecture.md`, no duplicarla.

---

## 3. Alternativas técnicas

### 3.1 Estructura de workflows

**Opción A: Paralelismo con drivers (RECOMENDADA)**
- Crear `.agent/workflows/modules/` con `index.md`, `create.md`, `refactor.md`, `delete.md`
- Idéntica estructura a drivers, adaptada para módulos

Pros:
- Consistencia con el modelo existente
- Curva de aprendizaje baja
- Reutilización de patrones probados

Contras:
- Ninguno significativo

**Opción B: Workflows unificados**
- Un único dominio `entities/` para drivers y módulos

Pros:
- Menos duplicación

Contras:
- Pierde especificidad
- Mezcla responsabilidades
- Dificulta evolución independiente

### 3.2 Constitution de módulos

**Opción A: Constitution dedicada (RECOMENDADA)**
- Crear `constitution.modules` en `.agent/rules/constitution/modules.md`
- Reglas específicas para scopes, decoradores, ciclo de vida

Pros:
- Claridad contractual
- Auditoría específica
- Consistencia con drivers

**Opción B: Extender extensio-architecture.md**
- Añadir secciones de módulos al documento existente

Contras:
- Documento demasiado largo
- Mezcla niveles de abstracción

### 3.3 Rol module-agent

**Opción A: Rol dedicado (RECOMENDADA)**
- Crear `role.module-agent` en `.agent/rules/roles/module.md`
- Owner del ciclo de vida de módulos
- Delegación desde architect-agent

Pros:
- Separación de responsabilidades
- Paralelismo con driver-agent
- Escalabilidad

---

## 4. APIs Web / WebExtensions relevantes

Los módulos en Extensio no interactúan directamente con APIs del navegador (eso es responsabilidad de los drivers). Sin embargo, los módulos dependen de:

| API/Componente | Estado de soporte | Uso en módulos |
|----------------|-------------------|----------------|
| Storage API | Chrome/Firefox/Safari ✓ | Persistencia de @property |
| Service Worker | Chrome/Firefox ✓ Safari parcial | Engine scope |
| Content Scripts | Todos ✓ | Context scope |
| Messaging | Todos ✓ | Comunicación Engine↔Context |

### Restricciones conocidas
- Safari: limitaciones en Service Worker lifecycle
- Firefox: diferencias en storage events

---

## 5. Compatibilidad multi-browser

| Aspecto | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Engine (SW) | ✓ | ✓ | Parcial | ✓ |
| Context | ✓ | ✓ | ✓ | ✓ |
| @property persistence | ✓ | ✓ | ✓ | ✓ |
| Surfaces/Shards | ✓ | ✓ | ✓ | ✓ |

### Estrategias de mitigación
- Safari SW: documentar limitaciones y fallbacks
- Usar drivers como capa de abstracción

---

## 6. Recomendaciones AI-first

### 6.1 Herramientas MCP
El CLI `extensio-cli` ya expone herramientas útiles para agentes:
- `extensio_create`: soporta `type: module`
- `extensio_build`: compila módulos
- `extensio_test`: ejecuta tests
- `extensio_demo`: genera demos

**Recomendación**: No se requieren nuevas herramientas MCP. Los comandos existentes cubren el ciclo de vida.

### 6.2 Recursos MCP
El recurso `extensio://modules` ya existe pero retorna array vacío (no hay módulos aún).

**Recomendación**: Cuando existan módulos, el recurso los listará automáticamente.

### 6.3 Automatización del module-agent
El `module-agent` debería:
- Validar automáticamente la estructura de módulos
- Verificar uso correcto de decoradores (@property, @onChanged)
- Auditar ciclo de vida (métodos obligatorios)
- Detectar dependencias cruzadas prohibidas

---

## 7. Riesgos y trade-offs

| Riesgo | Severidad | Probabilidad | Mitigación |
|--------|-----------|--------------|------------|
| Duplicación de documentación entre constitution de módulos y extensio-architecture | Media | Alta | La constitution de módulos DEBE referenciar extensio-architecture como source of truth, solo añadir reglas operativas |
| Confusión entre Engine/Context/Surface | Media | Media | Templates con ejemplos claros |
| Módulos con dependencias cruzadas | Alta | Media | Auditoría obligatoria del module-agent |
| Ciclo de vida incompleto | Alta | Baja | Checklist en template de creación |

---

## 8. Fuentes

### Documentación interna (Source of Truth)
- [extensio-architecture.md](file:///Users/milos/Documents/workspace/extensio/.agent/rules/constitution/extensio-architecture.md) — Arquitectura base del framework
- [drivers.md](file:///Users/milos/Documents/workspace/extensio/.agent/rules/constitution/drivers.md) — Constitution de drivers (modelo)
- [driver-agent](file:///Users/milos/Documents/workspace/extensio/.agent/rules/roles/driver.md) — Rol de agente (modelo)
- [drivers/create.md](file:///Users/milos/Documents/workspace/extensio/.agent/workflows/drivers/create.md) — Workflow de creación (modelo)

### Código del proyecto
- [CLI index.mts](file:///Users/milos/Documents/workspace/extensio/packages/cli/src/index.mts) — Comandos disponibles
- [Core types](file:///Users/milos/Documents/workspace/extensio/packages/core/src/types.d.mts) — Tipos del framework

### Documentación externa
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [MDN WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

---

## 9. Inventario de componentes propuestos

### Workflows (`.agent/workflows/modules/`)
| Archivo | Descripción |
|---------|-------------|
| `index.md` | Índice del dominio modules |
| `create.md` | Workflow de creación de módulos |
| `refactor.md` | Workflow de refactorización |
| `delete.md` | Workflow de eliminación |

### Templates (`.agent/templates/`)
| Archivo | Descripción |
|---------|-------------|
| `module-create.md` | Informe de creación de módulo |
| `module-refactor.md` | Informe de refactorización |
| `module-delete.md` | Informe de eliminación |

### Constitution (`.agent/rules/constitution/`)
| Archivo | Descripción |
|---------|-------------|
| `modules.md` | Reglas contractuales para módulos |

### Roles (`.agent/rules/roles/`)
| Archivo | Descripción |
|---------|-------------|
| `module.md` | Rol module-agent |

### MCP
| Componente | Estado |
|------------|--------|
| `extensio_create --type module` | Ya existe ✓ |
| `extensio_build` | Ya existe ✓ |
| `extensio_test` | Ya existe ✓ |
| `extensio_demo --type module` | Ya existe ✓ |
| `extensio://modules` | Ya existe ✓ |

---

## 10. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-07T07:30:07+01:00"
    comments: "Aprobado para avanzar a Phase 2"
```
