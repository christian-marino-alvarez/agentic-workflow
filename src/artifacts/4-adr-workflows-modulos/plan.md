---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 4-adr-workflows-modulos
---

# Implementation Plan — 4-adr-workflows-modulos

## 1. Resumen del plan

### Contexto
El framework Extensio necesita un sistema de workflows para módulos equivalente al existente para drivers. Se ha completado la investigación técnica y el análisis arquitectónico.

### Resultado esperado
Al finalizar, existirá un **ADR completo** con especificación técnica de:
- 4 workflows (index + create + refactor + delete)
- 3 templates (create, refactor, delete)
- 1 constitution (modules.md)
- 1 rol (module.md / module-agent)
- Actualización de 4 índices

### Alcance
**Incluye**:
- Creación de todos los documentos especificados
- Actualización de índices para registrar los nuevos componentes
- Especificación técnica detallada

**Excluye**:
- Implementación de código
- Tests automatizados (el entregable es documentación)
- Demo (no aplica)

---

## 2. Inputs contractuales

- **Task**: `.agent/artifacts/4-adr-workflows-modulos/task.md`
- **Analysis**: `.agent/artifacts/4-adr-workflows-modulos/analysis.md`
- **Research**: `.agent/artifacts/4-adr-workflows-modulos/researcher/research.md`
- **Acceptance Criteria**: AC-1 a AC-7 (definidos en task.md)

### Dispatch de dominios

```yaml
plan:
  workflows:
    drivers:
      action: none
    modules:
      action: none  # No se ejecuta workflow de módulos, se CREA el workflow

  dispatch:
    - domain: documentation
      action: create
      workflow: manual  # Creación directa de documentos
```

> **Nota**: Esta tarea crea la infraestructura documental para módulos. No hay dispatch a workflows existentes porque estamos creando los propios workflows.

---

## 3. Desglose de implementación (pasos)

### Paso 1: Crear constitution de módulos
- **Descripción**: Crear `modules.md` con reglas contractuales para módulos
- **Dependencias**: Ninguna
- **Entregables**: `.agent/rules/constitution/modules.md`
- **Agente responsable**: architect-agent
- **Estimación**: Media

### Paso 2: Crear rol module-agent
- **Descripción**: Crear `module.md` con definición del rol
- **Dependencias**: Paso 1 (para referenciar constitution)
- **Entregables**: `.agent/rules/roles/module.md`
- **Agente responsable**: architect-agent
- **Estimación**: Media

### Paso 3: Crear workflows de módulos
- **Descripción**: Crear los 4 archivos de workflows
- **Dependencias**: Paso 1 y 2
- **Entregables**:
  - `.agent/workflows/modules/index.md`
  - `.agent/workflows/modules/create.md`
  - `.agent/workflows/modules/refactor.md`
  - `.agent/workflows/modules/delete.md`
- **Agente responsable**: architect-agent
- **Estimación**: Alta

### Paso 4: Crear templates de módulos
- **Descripción**: Crear los 3 templates de informes
- **Dependencias**: Paso 3 (para alinear con workflows)
- **Entregables**:
  - `.agent/templates/module-create.md`
  - `.agent/templates/module-refactor.md`
  - `.agent/templates/module-delete.md`
- **Agente responsable**: architect-agent
- **Estimación**: Media

### Paso 5: Actualizar índices
- **Descripción**: Registrar nuevos componentes en los índices existentes
- **Dependencias**: Pasos 1-4
- **Entregables**:
  - `.agent/workflows/index.md` (añadir modules)
  - `.agent/templates/index.md` (añadir module-*)
  - `.agent/rules/constitution/index.md` (añadir modules)
  - `.agent/rules/roles/index.md` (añadir module)
- **Agente responsable**: architect-agent
- **Estimación**: Baja

### Paso 6: Crear ADR consolidado
- **Descripción**: Documento ADR final que referencia todos los componentes
- **Dependencias**: Pasos 1-5
- **Entregables**: `.agent/artifacts/4-adr-workflows-modulos/adr.md`
- **Agente responsable**: architect-agent
- **Estimación**: Media

---

## 4. Asignación de responsabilidades (Agentes)

### architect-agent
**Responsabilidades**:
- Crear todos los documentos (constitution, rol, workflows, templates)
- Actualizar índices
- Crear ADR consolidado
- Solicitar aprobación del desarrollador

**Subáreas**:
- Constitution de módulos
- Rol module-agent
- Workflows de módulos
- Templates de módulos
- ADR final

### module-agent
**Responsabilidades**:
- No participa en esta tarea (el agente se define, no se usa)

### qa-agent
**Responsabilidades**:
- No aplica (el entregable es documentación)

### Handoffs
```
architect-agent → desarrollador (aprobación final del ADR)
```

### Componentes

| Componente | Ejecutor | Cómo | Herramienta |
|------------|----------|------|-------------|
| Constitution | architect-agent | Creación manual de .md | Editor (write_to_file) |
| Rol | architect-agent | Creación manual de .md | Editor (write_to_file) |
| Workflows | architect-agent | Creación manual de .md | Editor (write_to_file) |
| Templates | architect-agent | Creación manual de .md | Editor (write_to_file) |

> **Justificación de herramienta**: No hay tool MCP para crear workflows/templates/constitutions. La creación es manual siguiendo los modelos existentes de drivers.

### Demo
**No aplica** — El entregable es un ADR (documentación).

---

## 5. Estrategia de testing y validación

### Unit tests
**No aplica** — El entregable es documentación.

### Integration tests
**No aplica** — El entregable es documentación.

### E2E / Manual
- **Validación de estructura**: Verificar que cada documento sigue el formato del modelo de drivers
- **Validación de consistencia**: Verificar referencias cruzadas entre documentos
- **Validación de completitud**: Verificar que todos los AC están cubiertos

### Trazabilidad

| AC | Verificación |
|----|--------------|
| AC-1 (Especificación técnica) | ADR contiene todos los componentes |
| AC-2 (Rol module-agent) | Existe `module.md` con estructura correcta |
| AC-3 (Workflows) | Existen los 4 workflows con gates |
| AC-4 (Templates) | Existen los 3 templates |
| AC-5 (Constitution) | Existe `modules.md` con reglas auditables |
| AC-6 (MCP) | ADR documenta herramientas existentes |
| AC-7 (Aprobación) | Desarrollador aprueba el ADR |

---

## 6. Plan de demo

**No aplica** — El entregable es un ADR (documentación).

---

## 7. Estimaciones y pesos de implementación

| Paso | Componente | Esfuerzo | Archivos |
|------|------------|----------|----------|
| 1 | Constitution | Medio | 1 |
| 2 | Rol | Medio | 1 |
| 3 | Workflows | Alto | 4 |
| 4 | Templates | Medio | 3 |
| 5 | Índices | Bajo | 4 |
| 6 | ADR | Medio | 1 |
| **Total** | | | **14 archivos** |

### Timeline aproximado
- Fase de implementación: 1 sesión
- Total estimado: ~2000 líneas de documentación

### Suposiciones
- Los modelos de drivers están disponibles y son correctos
- No hay cambios en la arquitectura base durante la implementación

---

## 8. Puntos críticos y resolución

### Punto crítico 1: Duplicación con extensio-architecture.md
- **Riesgo**: La constitution de módulos podría duplicar contenido de extensio-architecture.md
- **Impacto**: Medio — Desactualización futura
- **Estrategia de resolución**: 
  - La constitution REFERENCIA extensio-architecture.md como source of truth
  - Solo añade reglas operativas específicas de módulos
  - Usar notas explícitas: "Ver extensio-architecture.md, sección X"

### Punto crítico 2: Diferenciación de scopes
- **Riesgo**: Los workflows podrían no capturar la complejidad de scopes (Engine, Context, Surface)
- **Impacto**: Medio — Auditorías incompletas
- **Estrategia de resolución**:
  - Templates incluyen secciones específicas por scope
  - Constitution define reglas por scope
  - Workflows validan scopes en gates

### Punto crítico 3: Consistencia con modelo de drivers
- **Riesgo**: Desviación estructural respecto al modelo de drivers
- **Impacto**: Bajo — Confusión operativa
- **Estrategia de resolución**:
  - Usar drivers como modelo literal
  - Verificar paralelismo estructural al final

---

## 9. Dependencias y compatibilidad

### Dependencias internas
- `extensio-architecture.md` — Source of truth
- `drivers.md` — Modelo estructural
- `driver.md` (rol) — Modelo de rol

### Dependencias externas
- Ninguna

### Compatibilidad entre navegadores
- No aplica (el entregable es documentación)

### Restricciones arquitectónicas
- Todos los documentos DEBEN seguir el formato YAML frontmatter de Extensio
- Los workflows DEBEN tener Input, Output, Objetivo, Template, Pasos, FAIL, Gate

---

## 10. Criterios de finalización

### Checklist final

- [ ] Constitution `modules.md` creada y cumple formato
- [ ] Rol `module.md` creado y cumple formato
- [ ] Workflow `modules/index.md` creado
- [ ] Workflow `modules/create.md` creado con gates
- [ ] Workflow `modules/refactor.md` creado con gates
- [ ] Workflow `modules/delete.md` creado con gates
- [ ] Template `module-create.md` creado
- [ ] Template `module-refactor.md` creado
- [ ] Template `module-delete.md` creado
- [ ] Índice `workflows/index.md` actualizado
- [ ] Índice `templates/index.md` actualizado
- [ ] Índice `rules/constitution/index.md` actualizado
- [ ] Índice `rules/roles/index.md` actualizado
- [ ] ADR consolidado creado
- [ ] Desarrollador ha aprobado el ADR (SI)

---

## 11. Aprobación del desarrollador (OBLIGATORIA)

Este plan **requiere aprobación explícita y binaria**.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-07T07:37:29+01:00"
    comments: "Aprobado para iniciar implementación"
```

> Sin aprobación, esta fase **NO puede darse por completada** ni avanzar a Phase 4.
