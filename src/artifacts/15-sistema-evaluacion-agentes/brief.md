---
artifact: brief
phase: short-phase-1-brief
owner: architect-agent
status: draft
related_task: 15-sistema-evaluacion-agentes
---

# Brief — 15-sistema-evaluacion-agentes

## 1. Identificación de la tarea

**Título**: Sistema de Evaluación y Feedback de Agentes
**Objetivo**: Implementar un sistema de métricas persistentes para agentes que retroalimente el análisis de tareas y obligue a la mejora continua mediante valoraciones en el Gate de cierre.
**Estrategia**: Short

---

## 2. Las 5 Preguntas Obligatorias

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Dónde se almacenarán las puntuaciones? | `.agent/metrics/` (Asumido por el "Si" a la propuesta). |
| 2 | ¿Qué métricas exactas registrar? | Nota global sencilla de cada agente. |
| 3 | ¿Cómo presentar la info al LLM? | Análisis de tendencia: si las medias bajan, proponer mejoras específicas para el agente involucrado. |
| 4 | ¿Obligatoriedad? | Sí, debe ser un Gate obligatorio. |
| 5 | ¿Ponderación temporal? | Sí, las puntuaciones antiguas deben pesar más (esto implica que las nuevas cambian la media más lentamente, o viceversa según interpretación, pero se implementará una lógica de media acumulativa/móvil). |

---

## 3. Acceptance Criteria

1. **Alcance**: 
   - Creación del dominio `.agent/metrics/`.
   - Modificación del workflow de cierre (Short y Long) para incluir el Gate de evaluación.
   - Modificación del workflow de Análisis/Brief para inyectar métricas de agentes.
2. **Entradas/Datos**: 
   - Puntuación numérica (1-10) del desarrollador al finalizar una tarea.
3. **Salidas esperadas**: 
   - Archivos de métricas actualizados.
   - Resumen de rendimiento en futuros Análisis/Brief.
   - Alerta y propuesta de mejora si la media de un agente decrece.
4. **Restricciones**: 
   - No avanzar al cierre sin las puntuaciones.
   - Mantener la higiene de artefactos establecida en `artifacts.index`.
5. **Criterio de Done**: 
   - Se puede completar una tarea Short/Long puntuando a los agentes y ver esas notas reflejadas en el análisis de la siguiente tarea.

---

## 4. Análisis simplificado

### Estado actual (As-Is)
- Los agentes se evalúan en la Fase 7 (Long) pero no hay persistencia global ni retroalimentación automatizada en el análisis.
- Las evaluaciones son manuales y no bloquean el cierre de forma contractual con datos estructurados.

### Evaluación de complejidad

| Indicador | Estado | Comentario |
|-----------|--------|------------|
| Afecta más de 3 paquetes | ☐ Sí ☑ No | Solo afecta a la lógica de la carpeta `.agent`. |
| Requiere investigación APIs | ☐ Sí ☑ No | Es lógica interna de gestión de archivos. |
| Cambios breaking | ☐ Sí ☑ No | Añade pasos obligatorios en workflows existentes. |
| Tests E2E complejos | ☐ Sí ☑ No | La verificación será mediante traza de ejecución. |

**Resultado de complejidad**: ☑ BAJA (continuar Short) ☐ ALTA

---

## 5. Plan de implementación

### Pasos ordenados

1. **Estructura de Métricas**
   - Crear el directorio `.agent/metrics/`.
   - Crear un archivo `roles.json` o similar para inicializar el historial de los agentes conocidos.
2. **Actualización de Workflows de Fase Final**
   - Modificar `phase-7-evaluation` (Long) y `short-phase-3-closure` (Short).
   - Añadir el Gate obligatorio que pida las notas.
   - Implementar un script/comando (o lógica agéntica) para actualizar los JSON de métricas.
3. **Retroalimentación en Análisis**
   - Actualizar `phase-2-analysis` (Long) y `short-phase-1-brief` (Short).
   - Instruir al `architect-agent` para que lea `.agent/metrics/` antes de proponer agentes.
   - Si la tendencia de un agente es negativa, generar el bloque de "Propuesta de Mejora".
4. **Documentación del índice**
   - Registrar el nuevo dominio en `.agent/index.md` si procede.

### Verificación prevista
- Ejecutar una tarea "dummy" en modo Short, puntuar a un agente con nota baja, y verificar si en la siguiente tarea el brief menciona la necesidad de mejora.

---

## 6. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-17T08:23:00Z
    comments: "Aprobado para implementación"```
