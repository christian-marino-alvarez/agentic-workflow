---
artifact: task
phase: phase-0-acceptance-criteria
owner: architect-agent
status: in-progress
---

# Task #20 — Añadir Sección Reasoning a Templates de Ejecución

## Identificación
- **ID**: 20
- **Título**: anadir-seccion-reasoning-templates-ejecucion
- **Origen**: TODO #001 (`.agent/todo/001-anadir-seccion-reasoning.md`)
- **Fecha creación**: 2026-01-18T21:52:01+01:00

## Descripción
Añadir una sección "Reasoning" obligatoria a todos los templates de ejecución de tareas/procesos para implementar el patrón Chain of Thought (CoT). Esta sección forzará a los agentes a documentar su proceso de razonamiento antes de implementar.

## Objetivo
Mejorar la calidad de las decisiones de los agentes mediante:
- Documentación obligatoria del razonamiento antes de actuar
- Trazabilidad de opciones consideradas y decisiones tomadas
- Detección temprana de errores de lógica

---

## Lifecycle Status

```yaml
task:
  id: 20
  title: "anadir-seccion-reasoning-templates-ejecucion"
  strategy: "long"
  phase:
    current: "phase-6-results-acceptance"
    validated_by: "architect-agent"
    updated_at: "2026-01-18T22:03:12+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-18T21:53:28+01:00"
      phase-1-research:
        completed: true
        validated_by: researcher-agent
        validated_at: "2026-01-18T21:57:02+01:00"
      phase-2-analysis:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-18T21:58:48+01:00"
      phase-3-planning:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-18T22:00:18+01:00"
      phase-4-implementation:
        completed: true
        validated_by: architect-agent
        validated_at: "2026-01-18T22:03:12+01:00"
      phase-5-verification:
        completed: true
        validated_by: qa-agent
        validated_at: "2026-01-18T22:03:12+01:00"
      phase-5-verification:
        completed: false
        validated_by: null
        validated_at: null
      phase-6-results-acceptance:
        completed: false
        validated_by: null
        validated_at: null
      phase-7-evaluation:
        completed: false
        validated_by: null
        validated_at: null
      phase-8-commit-push:
        completed: false
        validated_by: null
        validated_at: null
```

---

## 5 Preguntas Obligatorias (Phase 0)

### Q1: ¿Dónde colocar la sección Reasoning?
**Respuesta**: A) Entre Input y Output (antes de definir entregables)

### Q2: ¿Qué subsecciones debe tener Reasoning?
**Respuesta**: La propuesta: "Análisis del objetivo", "Opciones consideradas", "Decisión tomada"

### Q3: ¿Es obligatorio completar Reasoning antes de Implementation Report?
**Respuesta**: Sí, bloqueante

### Q4: ¿Formato estructurado (YAML) o libre (markdown)?
**Respuesta**: El más óptimo → Híbrido (headers markdown para legibilidad + estructura clara)

### Q5: ¿Aplicar solo a agent-task.md o también a otros templates?
**Respuesta**: A todos los templates de ejecución de tareas o procesos

---

## Acceptance Criteria (Derivados)

### AC-1: Posición de la sección
La sección "Reasoning" se ubica **entre Input y Output** en todos los templates afectados.

### AC-2: Subsecciones obligatorias
La sección incluye exactamente 3 subsecciones:
- "Análisis del objetivo"
- "Opciones consideradas" 
- "Decisión tomada"

### AC-3: Carácter bloqueante
La sección "Reasoning" es **OBLIGATORIA** y debe completarse antes del "Implementation Report".

### AC-4: Formato híbrido
Se usa formato markdown con headers claros, optimizado para legibilidad y estructura.

### AC-5: Alcance ampliado
Se aplica a **todos los templates de ejecución**:
- `templates/agent-task.md` (principal)
- Otros templates de procesos que requieran decisiones

---

## Templates afectados (a confirmar en Analysis)
- `templates/agent-task.md` ✅ Confirmado
- `templates/research.md` ❓ A evaluar
- `templates/analysis.md` ❓ A evaluar
- `templates/planning.md` ❓ A evaluar

---

## Aprobación Phase 0

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-18T21:53:28+01:00
    comments: Aprobado
```
