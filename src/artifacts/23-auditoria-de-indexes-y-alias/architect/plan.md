---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 23-auditoria-de-indexes-y-alias
---

# Implementation Plan — 23-auditoria-de-indexes-y-alias

## 1. Resumen del plan
- **Contexto**: Generar el informe final de auditoría de índices y realizar una limpieza menor de inconsistencias estéticas.
- **Resultado esperado**:
  - Informe de auditoría consolidado.
  - Índices de reglas y roles corregidos (sin duplicados).
  - Recomendación formal sobre `AGENTS.md`.
- **Alcance**: Solo documental y limpieza de metadatos/cabeceras de índices.

---

## 2. Inputs contractuales
- **Task**: [task.md](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/23-auditoria-de-indexes-y-alias/task.md)
- **Acceptance Criteria**: [acceptance.md](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/23-auditoria-de-indexes-y-alias/acceptance.md)

**Dispatch de dominios**
```yaml
plan:
  dispatch:
    - domain: core
      action: audit
      workflow: none
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Limpieza de `rules/roles/index.md`
- **Descripción**: Eliminar el encabezado duplicado `## Reglas Globales (PERMANENT)`.
- **Dependencias**: Ninguna.
- **Entregables**: `.agent/rules/roles/index.md` [MODIFY].
- **Agente responsable**: architect-agent

### Paso 2: Generación del Informe de Auditoría Final
- **Descripción**: Crear un documento exhaustivo que liste todos los alias validados, las rutas confirmadas y el estado de la infraestructura.
- **Dependencias**: Paso 1.
- **Entregables**: `.agent/artifacts/23-auditoria-de-indexes-y-alias/audit-report.md` [NEW].
- **Agente responsable**: architect-agent

### Paso 3: Actualización del Backlog TODO
- **Descripción**: Refinar el item `004-portable-agentic-system` para incluir explícitamente la creación de `AGENTS.md` como pre-requisito.
- **Dependencias**: Paso 2.
- **Entregables**: `.agent/todo/004-portable-agentic-system.md` [MODIFY].
- **Agente responsable**: architect-agent

---

## 4. Asignación de responsabilidades (Agentes)
- **Architect-Agent**
  - Ejecuta la limpieza de índices y la redacción del informe final.

---

## 5. Estrategia de testing y validación
- **Verificación Estática**:
  - Comprobar que los índices corregidos siguen siendo YAML válidos.
  - Comprobar que el informe final cubre todos los dominios prometidos en los AC.

---

## 6. Criterios de finalización
- [ ] Índices sin duplicados.
- [ ] Informe de auditoría emitido.
- [ ] Backlog actualizado con la recomendación de `AGENTS.md`.

---

## 7. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: null
    date: null
    comments: null
```
