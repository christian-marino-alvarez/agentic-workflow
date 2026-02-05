---
artifact: analisis
phase: short-phase-1-analisis
owner: architect-agent
implementation_owner: architect-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Analisis — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Identificacion de la tarea

**Titulo**: <titulo de la tarea>
**Objetivo**: <objetivo principal>
**Estrategia**: Short
**Owner de implementacion**: <agent-id> (por defecto: architect-agent)

---

## 2. Las 5 Preguntas Obligatorias

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |

---

## 3. Acceptance Criteria

Derivados de las respuestas anteriores:

1. **Alcance**:
2. **Entradas/Datos**:
3. **Salidas esperadas**:
4. **Restricciones**:
5. **Criterio de Done**:

---

## 4. Analisis simplificado

### Estado actual (As-Is)
- Estructura afectada:
- Limitaciones conocidas:

### Evaluacion de complejidad

| Indicador | Estado | Comentario |
|-----------|--------|------------|
| Afecta mas de 3 paquetes | ☐ Si ☐ No | |
| Requiere investigacion APIs | ☐ Si ☐ No | |
| Cambios breaking | ☐ Si ☐ No | |
| Tests E2E complejos | ☐ Si ☐ No | |

**Resultado de complejidad**: ☐ BAJA (continuar Short) ☐ ALTA (recomendar abortar a Long)

---

## 5. Evaluacion de agentes

| Agente | Desempeno (1-10) | Propuestas de mejora |
|--------|------------------|----------------------|
| | | |

---

## 6. Aprobacion del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```

> Sin aprobacion, esta fase NO puede avanzar a Plan.
