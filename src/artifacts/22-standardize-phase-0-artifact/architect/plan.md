---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 22-standardize-phase-0-artifact
---

# Implementation Plan — 22-standardize-phase-0-artifact

## 1. Resumen del plan
- **Contexto**: Estandarizar la Fase 0 para que genere un artefacto independiente `acceptance.md`, mejorando la modularidad y el parsing de Gates.
- **Resultado esperado**: 
  - Nuevo template `templates/acceptance.md`.
  - Workflows actualizados para generar `acceptance.md`.
  - `task.md` simplificado.
- **Alcance**: Ciclos Long y Short a partir de la Tarea 23.

---

## 2. Inputs contractuales
- **Task**: [task.md](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/22-standardize-phase-0-artifact/task.md)
- **Analysis**: [analysis.md](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/22-standardize-phase-0-artifact/architect/analysis.md)
- **Acceptance Criteria**: AC-1 a AC-5 definidos en la Fase 0.

**Dispatch de dominios**
```yaml
plan:
  dispatch:
    - domain: core
      action: refactor
      workflow: workflow.tasklifecycle.phase-0-acceptance-criteria
    - domain: core
      action: refactor
      workflow: workflow.tasklifecycle-short.short-phase-1-brief
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Registro de nuevo template
- **Descripción**: Añadir el alias `acceptance` a `templates/index.md`.
- **Dependencias**: Ninguna.
- **Entregables**: `templates/index.md` actualizado.
- **Agente responsable**: architect-agent

### Paso 2: Creación del template `acceptance.md`
- **Descripción**: Crear el archivo `.agent/templates/acceptance.md` con la estructura definida en el research.
- **Dependencias**: Paso 1.
- **Entregables**: `templates/acceptance.md` [NEW].
- **Agente responsable**: architect-agent

### Paso 3: Refactor de `templates/task.md`
- **Descripción**: Eliminar las secciones de preguntas y criterios de aceptación, dejando solo una referencia.
- **Dependencias**: Paso 2.
- **Entregables**: `templates/task.md` [MODIFY].
- **Agente responsable**: architect-agent

### Paso 4: Actualización del Workflow Long (Fase 0)
- **Descripción**: Modificar `workflows/tasklifecycle-long/phase-0-acceptance-criteria.md` para:
  1. Generar `acceptance.md`.
  2. Verificar su existencia en el Gate.
  3. No inyectar los AC en `task.md`.
- **Dependencias**: Paso 3.
- **Entregables**: `workflows/tasklifecycle-long/phase-0-acceptance-criteria.md` [MODIFY].
- **Agente responsable**: architect-agent

### Paso 5: Actualización del Workflow Short (Fase 1)
- **Descripción**: Modificar `workflows/tasklifecycle-short/short-phase-1-brief.md` para generar también `acceptance.md` de forma independiente al `brief.md`.
- **Dependencias**: Paso 4.
- **Entregables**: `workflows/tasklifecycle-short/short-phase-1-brief.md` [MODIFY].
- **Agente responsable**: architect-agent

---

## 4. Asignación de responsabilidades (Agentes)
- **Architect-Agent**
  - Ejecuta todos los pasos de implementación ya que son cambios estructurales en el sistema de orquestación.
- **QA / Verification-Agent**
  - Validará el flujo creando una tarea de prueba (ID 23) y verificando que el Gate 0 pase correctamente con los nuevos archivos.

---

## 5. Estrategia de testing y validación
- **Manual / Simulación**:
  1. Iniciar una nueva tarea candidate (`/init` o similar).
  2. Ejecutar el flujo de Fase 0 (Long).
  3. Verificar que se crean `task.md` y `acceptance.md` en el directorio de la tarea.
  4. Verificar que el Gate de Fase 0 se cumple.
  5. Repetir para el ciclo Short.

---

## 6. Estimaciones y pesos de implementación
- **Paso 1-2**: Bajo (1 pt)
- **Paso 3**: Bajo (1 pt)
- **Paso 4-5**: Medio (3 pts) - Requiere cuidado en el orden de escritura y validación.

---

## 7. Puntos críticos y resolución
- **Punto crítico 1**: El parser de Gates de Antigravity debe ser robusto ante el cambio de ubicación de los datos.
  - **Resolución**: Asegurar que el Gate 0 del workflow usa `view_file` sobre el nuevo artefacto y no sobre `task.md`.

---

## 8. Criterios de finalización
- [ ] `templates/index.md` tiene el alias `acceptance`.
- [ ] Existe `templates/acceptance.md`.
- [ ] `templates/task.md` no tiene secciones de AC.
- [ ] Los workflows Long/Short generan `acceptance.md`.
- [ ] Una tarea nueva pasa el Gate 0 con éxito.

---

## 9. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: null
    date: null
    comments: null
```
