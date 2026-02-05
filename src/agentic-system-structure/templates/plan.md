---
artifact: plan
phase: short-phase-2-plan
owner: architect-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Plan — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen del plan
- Objetivo resumido
- Resultado esperado

---

## 2. Pasos de implementacion

### Paso 1
- Descripcion:
- Entregables:

### Paso 2
- Descripcion:
- Entregables:

---

## 3. Verificacion prevista
- Tests / validaciones:
- Criterios de exito:

---

## 4. Aprobacion del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```

> Sin aprobacion, esta fase NO puede avanzar a Implementacion.
