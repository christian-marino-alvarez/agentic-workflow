---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 22-standardize-phase-0-artifact
---

# Research Report — 22-standardize-phase-0-artifact

> [!CAUTION]
> **REGLA PERMANENT**: Este documento es SOLO documentación.
> El researcher-agent documenta hallazgos SIN analizar, SIN recomendar, SIN proponer soluciones.
> El análisis corresponde a Phase 2.

## 1. Resumen ejecutivo
- **Problema investigado**: Cómo estandarizar el flujo de la Fase 0 para que genere un artefacto independiente (`acceptance.md`) en lugar de saturar el `task.md`.
- **Objetivo de la investigacion**: Identificar los templates, workflows e índices que deben ser modificados para implementar esta arquitectura de "1 fase = 1 artefacto".
- **Principales hallazgos**: El sistema actual guarda preguntas y criterios en `task.md`. Tanto el ciclo Long como el Short se beneficiarán de la separación para mejorar la validación de Gates y la legibilidad.

---

## 2. Necesidades detectadas
- **Template dedicado**: Necesidad de `templates.acceptance` para el nuevo archivo.
- **Limpieza de `task.md`**: Eliminar las secciones de preguntas y criterios del template base de tareas.
- **Estandarización de Workflows**: Actualizar `phase-0-acceptance-criteria.md` y `short-phase-1-brief.md` para que escriban en el nuevo archivo.
- **Gestión de Alias**: Asegurar que `task.acceptance` referencie correctamente al nuevo artefacto.

---

## 3. Hallazgos técnicos
- **Workflow Long**: Utiliza `templates.task` para crear el current task. Se debe modificar el paso de creación para que genere dos archivos o modifique el `task.md` inyectando solo el alias.
- **Workflow Short**: Ya genera un `brief.md`. Se debe alinear para que los criterios de aceptación sigan la misma estructura que en el ciclo Long.
- **Plantilla de Tareas**: Las líneas 72 a 104 de `templates/task.md` contienen lógica de Fase 0 que debe ser extraída.
- **Índice de Plantillas**: `templates/index.md` es el punto central para registrar el nuevo alias `acceptance`.

---

## 4. APIs Web / WebExtensions relevantes
- No aplica.

---

## 5. Compatibilidad multi-browser
- No aplica.

---

## 6. Oportunidades AI-first detectadas
- **Validación Automática**: El uso de un archivo independiente facilita que agentes de auditoría verifiquen el cumplimiento del contrato sin parsear el estado de la tarea.
- **Modularidad**: Permite que las herramientas de CLI operen sobre el "contrato de aceptación" de forma aislada.

---

## 7. Riesgos identificados
- **Riesgo: Retrocompatibilidad**: Las tareas en curso (1-21) no tendrán este archivo. (Mitigación: Aplicar solo a Tareas 23+).
- **Riesgo: Fragmentación**: Tener demasiados archivos pequeños podría abrumar al desarrollador si no se gestionan bien los alias. (Mitigación: Uso estricto de alias en el índice de artefactos).

---

## 8. Fuentes
- `.agent/templates/task.md`
- `.agent/workflows/tasklifecycle-long/phase-0-acceptance-criteria.md`
- `.agent/workflows/tasklifecycle-short/short-phase-1-brief.md`
- `.agent/templates/index.md`

---

## 9. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: null
    date: null
    comments: null
```
