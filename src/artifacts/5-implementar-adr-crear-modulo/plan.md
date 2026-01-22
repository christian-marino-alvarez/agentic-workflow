---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: approved
related_task: 5-implementar-adr-crear-modulo
---

# Implementation Plan — 5-implementar-adr-crear-modulo

## 1. Resumen del plan
- **Contexto**: implementar el ADR-004 para introducir el dominio de workflows de modulos en el sistema .agent.
- **Resultado esperado**: reglas, roles, workflows, templates e indices definidos segun el ADR.
- **Alcance**: solo cambios en `.agent` y artefactos documentales descritos por el ADR; sin cambios MCP.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/5-implementar-adr-crear-modulo/task.md`
- **Analysis**: `.agent/artifacts/5-implementar-adr-crear-modulo/analysis.md`
- **Acceptance Criteria**: AC-1..AC-5 del task (implementacion completa del ADR).

**Dispatch de dominios (OBLIGATORIO si aplica)**
```yaml
plan:
  workflows:
    drivers:
      action: none
      workflow: workflow.drivers.create

  dispatch:
    - domain: modules
      action: create
      workflow: workflow.modules.create
    - domain: modules
      action: refactor
      workflow: workflow.modules.refactor
    - domain: modules
      action: delete
      workflow: workflow.modules.delete
    - domain: qa
      action: verify
      workflow: workflow.tasklifecycle.phase-5-verification
```

---

## 3. Desglose de implementación (pasos)

### Paso 1
- **Descripción**: Crear constitution de modulos `.agent/rules/constitution/modules.md` siguiendo estructura del ADR.
- **Dependencias**: ninguna.
- **Entregables**: archivo de constitution creado.
- **Agente responsable**: architect-agent.

### Paso 2
- **Descripción**: Crear rol module-agent `.agent/rules/roles/module.md` alineado al ADR.
- **Dependencias**: Paso 1.
- **Entregables**: archivo de rol creado.
- **Agente responsable**: architect-agent.

### Paso 3
- **Descripción**: Crear workflows de modulos en `.agent/workflows/modules/` (index/create/refactor/delete) segun ADR.
- **Dependencias**: Pasos 1-2.
- **Entregables**: 4 archivos de workflows.
- **Agente responsable**: architect-agent.

### Paso 4
- **Descripción**: Crear templates `module-create.md`, `module-refactor.md`, `module-delete.md` en `.agent/templates/`.
- **Dependencias**: Paso 3.
- **Entregables**: 3 templates nuevos.
- **Agente responsable**: architect-agent.

### Paso 5
- **Descripción**: Actualizar indices `.agent/workflows/index.md`, `.agent/templates/index.md`, `.agent/rules/constitution/index.md`, `.agent/rules/roles/index.md`.
- **Dependencias**: Pasos 1-4.
- **Entregables**: 4 archivos actualizados.
- **Agente responsable**: architect-agent.

> Nota: No se requieren cambios MCP; validar contra ADR.

---

## 4. Asignación de responsabilidades (Agentes)

- **Architect-Agent**
  - Responsabilidades: crear rules, workflows, templates e indices segun ADR.
- **QA / Verification-Agent**
  - Responsabilidades: verificar existencia, estructura y consistencia contra ADR.

**Handoffs**
- Architect entrega archivos creados; QA verifica checklist vs ADR.

**Componentes (si aplica)**
- Ejecuta architect-agent, implementacion manual con edicion de archivos .agent.
- Herramienta: edicion directa en repo (no aplica MCP).

**Demo (si aplica)**
- No aplica.

---

## 5. Estrategia de testing y validación
- **Unit tests**: no aplica (cambios documentales).
- **Integration tests**: no aplica.
- **E2E / Manual**: verificacion manual del checklist y rutas.

**Trazabilidad**
- AC-1..AC-5 se validan con checklist de archivos y contenido del ADR.

---

## 6. Plan de demo (si aplica)
- No aplica.

---

## 7. Estimaciones y pesos de implementación
- **Paso 1**: medio
- **Paso 2**: medio
- **Paso 3**: alto
- **Paso 4**: medio
- **Paso 5**: bajo
- **Suposiciones**: ADR no cambia durante la implementacion.

---

## 8. Puntos críticos y resolución
- **Punto crítico 1**
  - Riesgo: inconsistencia entre ADR e indices.
  - Impacto: alto (rompe discovery de workflows/templates).
  - Estrategia de resolución: checklist y verificacion cruzada.
- **Punto crítico 2**
  - Riesgo: roles/rules incompletos.
  - Impacto: medio.
  - Estrategia de resolución: comparar con `drivers.md` y `driver.md`.

---

## 9. Dependencias y compatibilidad
- **Dependencias internas**: indices .agent.
- **Dependencias externas**: ninguna.
- **Compatibilidad entre navegadores**: no aplica.
- **Restricciones arquitectónicas**: respetar `constitution.extensio_architecture` y ADR.

---

## 10. Criterios de finalización
- Checklist final alineado con acceptance criteria.
- Verificacion manual completada.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
Este plan **requiere aprobación explícita y binaria**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-07T08:00:26+01:00
    comments: null
```
