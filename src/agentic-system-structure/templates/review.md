---
artifact: architect-review
phase: phase-4-implementation
owner: architect-agent
status: approved | rejected
related_task: <taskId>-<taskTitle>
related_plan: src/agentic-system-structure/artifacts/<taskId>-<taskTitle>/plan.md
---

# Architectural Implementation Review — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen de la revisión
- **Objetivo del review**  
  Verificar que la implementación ejecutada cumple el **plan de implementación aprobado** sin desviaciones no autorizadas.

- **Resultado global**  
  - Estado: ☐ APROBADO ☐ RECHAZADO
  - Fecha de revisión:
  - Arquitecto responsable:

---

## 2. Verificación contra el plan de implementación
Revisión directa y trazable **plan → implementación**.

### 2.1 Pasos del plan
Para **cada paso definido en `plan.md`**:

| Paso del plan | Estado | Evidencia | Observaciones |
|---------------|--------|-----------|---------------|
| Paso 1 | ☐ OK ☐ NO OK | refs / commits / artefactos | |
| Paso 2 | ☐ OK ☐ NO OK | | |

> Todos los pasos **DEBEN** estar en estado **OK** para aprobar la fase.

---

## 3. Subtareas por agente
Revisión de las implementaciones individuales.

### Agente: `<agent-name>`
- **Subtask document**:
  - `src/agentic-system-structure/artifacts/<taskId>-<taskTitle>/<agent>/subtask-implementation.md`
- **Evaluación**:
  - ☐ Cumple el plan
  - ☐ Desviaciones detectadas (detallar abajo)

**Notas del arquitecto**
- Cambios realizados:
- Decisiones técnicas:
- Coherencia con el resto del sistema:

(Repetir sección por cada agente participante)

---

## 4. Acceptance Criteria (impacto)
Verificación de que la implementación **no rompe** los acceptance criteria definidos.

- ☐ Todos los AC siguen siendo válidos
- ☐ Algún AC requiere revisión (detallar)

**Observaciones**
- AC afectados:
- Motivo:

---

## 5. Coherencia arquitectónica
Evaluación global del sistema tras la implementación.

- ☐ Respeta arquitectura del proyecto
- ☐ Respeta clean code
- ☐ No introduce deuda técnica significativa
- ☐ Mantiene compatibilidad esperada (multi-browser si aplica)

**Observaciones arquitectónicas**
- Impacto en estructura:
- Impacto en componentes:
- Riesgos introducidos:

---

## 6. Desviaciones del plan
Registro explícito de desviaciones (si existen).

- **Desviación**
  - Descripción:
  - Justificación:
  - ¿Estaba prevista en el plan? ☐ Sí ☐ No
  - ¿Requiere replanificación? ☐ Sí ☐ No

(Si no hay desviaciones, indicar explícitamente: “Sin desviaciones detectadas”).

---

## 7. Decisión final del arquitecto
Decisión **severa y binaria**.

```yaml
decision:
  architect:
    result: APROBADO | RECHAZADO
    date: <ISO-8601>
    comments: <opcional>
