---
artifact: qa-results
phase: short-phase-4-qa-results
owner: architect-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# QA Results — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen de la tarea

**Titulo**: <titulo>
**Estrategia**: Short
**Estado final**: ☐ Completada ☐ Abortada

---

## 2. Verificacion

### Tests ejecutados

| Tipo | Comando/Metodo | Resultado |
|------|----------------|-----------|
| Unit | | ☐ Pass ☐ Fail ☐ N/A |
| Integration | | ☐ Pass ☐ Fail ☐ N/A |
| E2E | | ☐ Pass ☐ Fail ☐ N/A |

### Justificacion (si no hay tests)
<Explicar por que no aplican tests>

---

## 3. Estado de Acceptance Criteria

| AC | Descripcion | Estado |
|----|-------------|--------|
| 1 | | ☐ ✅ ☐ ❌ |
| 2 | | ☐ ✅ ☐ ❌ |
| 3 | | ☐ ✅ ☐ ❌ |
| 4 | | ☐ ✅ ☐ ❌ |
| 5 | | ☐ ✅ ☐ ❌ |

---

## 4. Cambios realizados

### Ficheros modificados/creados

| Fichero | Accion | Descripcion |
|---------|--------|-------------|
| | Created/Modified/Deleted | |

---

## 5. Aceptacion final del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```

> Sin aceptacion, la tarea NO puede marcarse como completada.
