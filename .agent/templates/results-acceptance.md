---
artifact: results_acceptance
phase: phase-6-results-acceptance
owner: architect-agent
status: pending | approved | rejected
related_task: <taskId>-<taskTitle>
related_plan: .agent/artifacts/<taskId>-<taskTitle>/plan.md
related_review: .agent/artifacts/<taskId>-<taskTitle>/architect/review.md
related_verification: .agent/artifacts/<taskId>-<taskTitle>/verification.md
---

# Final Results Report — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen ejecutivo (para decisión)
Este documento presenta **el resultado final completo de la tarea**, consolidando:
- lo que se planificó
- lo que se implementó
- cómo se revisó
- cómo se verificó

**Conclusión rápida**
- Estado general: ☐ SATISFACTORIO ☐ NO SATISFACTORIO
- Recomendación del arquitecto: ☐ Aceptar ☐ Iterar

---

## 2. Contexto de la tarea
### 2.1 Objetivo original
(Extraído de `task.md`)

- Objetivo:
- Alcance definido:
- Fuera de alcance:

### 2.2 Acceptance Criteria acordados
Listado de los AC definidos en Fase 0.

| ID | Descripción | Estado final |
|----|-------------|--------------|
| AC-1 | | ✅ Cumplido / ❌ No |
| AC-2 | | ✅ Cumplido / ❌ No |

---

## 3. Planificación (qué se acordó hacer)
Resumen del **plan aprobado** en Fase 2.

- Estrategia general
- Fases y pasos principales
- Agentes involucrados y responsabilidades
- Estrategia de testing acordada
- Plan de demo (si aplica)

> Referencia: `plan.md`

---

## 4. Implementación (qué se hizo realmente)
Descripción clara de la implementación ejecutada.

### 4.1 Subtareas por agente
Para cada agente participante:

**Agente:** `<agent-name>`
- Responsabilidad asignada:
- Subtareas ejecutadas:
- Artefactos generados:
- Cambios relevantes:

(Repetir por cada agente)

### 4.2 Cambios técnicos relevantes
- Nuevos componentes
- Cambios estructurales
- APIs afectadas
- Compatibilidad entre navegadores (si aplica)

---

## 5. Revisión arquitectónica
Resumen del informe de revisión del arquitecto.

- Coherencia con el plan: ☐ Sí ☐ No
- Cumplimiento de arquitectura: ☐ Sí ☐ No
- Cumplimiento de clean code: ☐ Sí ☐ No
- Desviaciones detectadas:
  - Ninguna / Detalladas abajo

**Conclusiones del arquitecto**
- Impacto en el sistema
- Riesgos residuales
- Deuda técnica (si existe)

> Referencia: `architect/review.md`

---

## 6. Verificación y validación
Resultados de la verificación funcional.

### 6.1 Tests ejecutados
- Unitarios:
- Integración:
- End-to-End / Manual:
- Resultado global: ☐ OK ☐ NO OK

### 6.2 Demo (si aplica)
- Qué se demostró
- Resultado de la demo
- Observaciones del desarrollador

> Referencia: `verification.md`

---

## 7. Estado final de Acceptance Criteria
Evaluación definitiva.

| Acceptance Criteria | Resultado | Evidencia |
|---------------------|-----------|-----------|
| AC-1 | ✅ / ❌ | |
| AC-2 | ✅ / ❌ | |

> Todos los AC **DEBEN** estar cumplidos para aceptar la tarea.

---

## 8. Incidencias y desviaciones
Listado consolidado de problemas encontrados durante el ciclo.

- Incidencia:
  - Fase donde se detectó
  - Impacto
  - Resolución aplicada
- Incidencia:
  - (Repetir)

Si no hubo incidencias, indicar explícitamente:
> “No se detectaron incidencias relevantes”.

---

## 9. Valoración global
Evaluación final del resultado.

- Calidad técnica: ☐ Alta ☐ Media ☐ Baja
- Alineación con lo solicitado: ☐ Total ☐ Parcial ☐ Insuficiente
- Estabilidad de la solución: ☐ Alta ☐ Media ☐ Baja
- Mantenibilidad: ☐ Alta ☐ Media ☐ Baja

---

## 10. Decisión final del desarrollador (OBLIGATORIA)
Esta decisión **cierra la fase**.

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
