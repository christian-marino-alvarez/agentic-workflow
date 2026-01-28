---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Implementation Plan — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen del plan
- **Contexto**: breve recordatorio del objetivo de la tarea.
- **Resultado esperado**: qué quedará implementado al finalizar.
- **Alcance**: qué incluye y qué excluye explícitamente este plan.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- **Analysis**: `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`
- **Acceptance Criteria**: referencia explícita a los AC relevantes.

**Dispatch de dominios (OBLIGATORIO si aplica)**
```yaml
plan:
  workflows:
    - domain: <domain-name>
      action: create | refactor | delete | audit | verify | none
      workflow: <workflow.id>

  dispatch:
    - domain: <domain-name>
      action: create | refactor | delete | audit | verify | none
      workflow: <workflow.id>
```

---

## 3. Desglose de implementación (pasos)
Descomposición ordenada y ejecutable.

### Paso 1
- **Descripción**
- **Dependencias**
- **Entregables**
- **Agente responsable**

### Paso 2
- (Repetir estructura)

> Nota: indicar orden, dependencias y paralelización si aplica.

---

## 4. Asignación de responsabilidades (Agentes)
Mapa claro de agentes ↔ subáreas.

- **Architect-Agent**
  - Responsabilidades
- **Implementation-Agent**
  - Responsabilidades
- **QA / Verification-Agent** (si aplica)
  - Responsabilidades
- **Otros agentes** (si aplica)

**Handoffs**
- Qué se entrega, a quién y cuándo.

**Componentes (si aplica)**
- Definir quién lo ejecuta.
- Definir cómo se implementa (pasos y criterios).
- Definir la mejor herramienta disponible (preferir tools declarados; si no existe, justificar alternativa).
- Referenciar el tool elegido por alias y el motivo.

**Demo (si aplica)**
- Definir estructura esperada alineada con la arquitectura del proyecto.
- Definir tool obligatorio para generar scaffolding (si existe).

---

## 5. Estrategia de testing y validación
Cómo se comprobará que la implementación cumple los AC.

- **Unit tests**
  - Alcance y herramientas
- **Integration tests**
  - Flujos cubiertos
- **E2E / Manual**
  - Escenarios clave

**Trazabilidad**
- Mapeo de tests ↔ acceptance criteria.

---

## 6. Plan de demo (si aplica)
- **Objetivo de la demo**
- **Escenario(s)**
- **Datos de ejemplo**
- **Criterios de éxito de la demo**

---

## 7. Estimaciones y pesos de implementación
- **Estimación por paso / subárea**
  - esfuerzo relativo (bajo / medio / alto o puntos)
- **Timeline aproximado** (si aplica)
- **Suposiciones** usadas para estimar

---

## 8. Puntos críticos y resolución
Identificación de riesgos técnicos clave.

- **Punto crítico 1**
  - Riesgo
  - Impacto
  - Estrategia de resolución
- **Punto crítico 2**
  - (Repetir)

---

## 9. Dependencias y compatibilidad
- **Dependencias internas**
- **Dependencias externas**
- **Compatibilidad entre navegadores** (si aplica)
  - Chrome / Chromium
  - Firefox
  - Safari
- **Restricciones arquitectónicas** relevantes

---

## 10. Criterios de finalización
Condiciones objetivas para considerar la implementación “Done”.

- Checklist final alineado con acceptance criteria.
- Verificaciones obligatorias completadas.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
Este plan **requiere aprobación explícita y binaria**.

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
