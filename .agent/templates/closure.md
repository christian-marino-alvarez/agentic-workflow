---
artifact: closure
phase: short-phase-3-closure
owner: architect-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Closure — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen de la tarea

**Título**: <título>
**Estrategia**: Short
**Estado final**: ☐ Completada ☐ Abortada

---

## 2. Verificación

### Tests ejecutados

| Tipo | Comando/Método | Resultado |
|------|----------------|-----------|
| Unit | | ☐ Pass ☐ Fail ☐ N/A |
| Integration | | ☐ Pass ☐ Fail ☐ N/A |
| E2E | | ☐ Pass ☐ Fail ☐ N/A |

### Justificación (si no hay tests)
<Explicar por qué no aplican tests>

---

## 3. Estado de Acceptance Criteria

| AC | Descripción | Estado |
|----|-------------|--------|
| 1 | | ☐ ✅ ☐ ❌ |
| 2 | | ☐ ✅ ☐ ❌ |
| 3 | | ☐ ✅ ☐ ❌ |
| 4 | | ☐ ✅ ☐ ❌ |
| 5 | | ☐ ✅ ☐ ❌ |

---

## 4. Cambios realizados

### Ficheros modificados/creados

| Fichero | Acción | Descripción |
|---------|--------|-------------|
| | Created/Modified/Deleted | |

### Commits (si aplica)

```
<tipo>(<scope>): <descripción>
```

---

## 5. Aceptación final del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```

> Sin aceptación, la tarea NO puede marcarse como completada.

---

## 6. Puntuaciones de agentes (OBLIGATORIO)

| Agente | Puntuacion (1-10) | Notas |
|--------|-------------------|-------|
| | | |

---

## 7. Push final (si aplica)

```yaml
push:
  approved: SI | NO
  branch: <rama destino>
  date: <ISO-8601>
```
