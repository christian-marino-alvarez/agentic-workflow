---
artifact: brief
phase: short-phase-1-brief
owner: architect-agent
implementation_owner: architect-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Brief — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Identificación de la tarea

**Título**: <título de la tarea>
**Objetivo**: <objetivo principal>
**Estrategia**: Short
**Owner de implementación**: <agent-id> (por defecto: architect-agent)

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

## 4. Análisis simplificado

### Estado actual (As-Is)
- Estructura afectada:
- Limitaciones conocidas:

### Evaluación de complejidad

| Indicador | Estado | Comentario |
|-----------|--------|------------|
| Afecta más de 3 paquetes | ☐ Sí ☐ No | |
| Requiere investigación APIs | ☐ Sí ☐ No | |
| Cambios breaking | ☐ Sí ☐ No | |
| Tests E2E complejos | ☐ Sí ☐ No | |

**Resultado de complejidad**: ☐ BAJA (continuar Short) ☐ ALTA (recomendar abortar a Long)

---

## 5. Plan de implementación

### Pasos ordenados

1. **Paso 1**
   - Descripción:
   - Entregables:

2. **Paso 2**
   - Descripción:
   - Entregables:

(Añadir más pasos según necesidad)

### Verificación prevista
- Tipo de tests:
- Criterios de éxito:

---

## 6. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```

> Sin aprobación, esta fase NO puede avanzar a Implementation.
