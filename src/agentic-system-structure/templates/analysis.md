---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Analysis — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen ejecutivo
**Problema**
- Describe brevemente el problema que resuelve la tarea.

**Objetivo**
- Objetivo principal de la tarea (desde `task.md`).

**Criterio de éxito**
- Qué condiciones deben cumplirse para considerar este análisis válido
  (referencia directa a acceptance criteria).

---

## 2. Estado del proyecto (As-Is)
Describe el estado real del proyecto **antes de implementar nada**.

- **Estructura relevante**
  - Carpetas, componentes o áreas afectadas.
- **Componentes existentes**
  - Estado actual, responsabilidades y limitaciones.
- **Nucleo / capas base**
  - Qué partes del core o infraestructura estan implicadas (si aplica).
- **Artifacts / tareas previas**
  - Tareas existentes que influyen o condicionan esta.
- **Limitaciones detectadas**
  - Técnicas, estructurales, organizativas.

---

## 3. Cobertura de Acceptance Criteria
Para **cada acceptance criteria** definido en `task.md`:

### AC-X
- **Interpretación**
  - Cómo se entiende este criterio en el contexto actual.
- **Verificación**
  - Cómo se comprobará que se cumple.
- **Riesgos / ambigüedades**
  - Qué puede fallar o no estar claro.

(Repetir para todos los AC)

---

## 4. Research técnico
Análisis de alternativas y enfoques posibles.

- **Alternativa A**
  - Descripción
  - Ventajas
  - Inconvenientes
- **Alternativa B**
  - Descripción
  - Ventajas
  - Inconvenientes

**Decisión recomendada (si aplica)**
- Enfoque preferido y justificación.
- Si no se decide aún, explicar por qué.

---

## 5. Agentes participantes
Lista explícita de agentes necesarios para ejecutar la tarea.

- **Agent A**
  - Responsabilidades
  - Subáreas asignadas
- **Agent B**
  - Responsabilidades
  - Subáreas asignadas

**Handoffs**
- Cómo se transfiere información o resultados entre agentes.

**Componentes necesarios**
- Indicar si se requiere crear, modificar o eliminar componentes.
- Referenciar el impacto y la dependencia con el plan de implementacion.

**Demo (si aplica)**
- Indicar si se requiere crear demo.
- Justificar necesidad y alineacion con la arquitectura del proyecto.

---

## 6. Impacto de la tarea
Evaluación del impacto esperado si se implementa la tarea.

- **Arquitectura**
  - Cambios estructurales previstos.
- **APIs / contratos**
  - Cambios en interfaces públicas (si aplica).
- **Compatibilidad**
  - Riesgos de breaking changes.
- **Testing / verificación**
  - Qué tipo de pruebas serán necesarias.

---

## 7. Riesgos y mitigaciones
- **Riesgo 1**
  - Impacto
  - Mitigación
- **Riesgo 2**
  - Impacto
  - Mitigación

---

## 8. Preguntas abiertas
(Solo si existen; idealmente vacío tras Fase 0)

- Pregunta 1
- Pregunta 2

---

## 9. TODO Backlog (Consulta obligatoria)

> [!IMPORTANT]
> El architect-agent **DEBE** consultar `.agent/todo/` antes de completar el análisis.

**Referencia**: `.agent/todo/`

**Estado actual**: (vacío | N items pendientes)

**Items relevantes para esta tarea**:
- (Listar items del backlog que impactan en la tarea actual)
- (Si no hay items relevantes, indicar "Ninguno")

**Impacto en el análisis**:
- (Describir cómo los items del backlog afectan las alternativas propuestas)

---

## 10. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```

> Sin aprobación, esta fase **NO puede darse por completada** ni avanzar a Phase 3.
