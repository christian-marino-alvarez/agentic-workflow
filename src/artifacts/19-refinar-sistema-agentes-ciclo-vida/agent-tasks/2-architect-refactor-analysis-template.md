---
artifact: agent_task
phase: phase-4-implementation
owner: architect-agent
status: completed
related_task: 19-refinar-sistema-agentes-ciclo-vida
task_number: 2
---

# Agent Task — 2-architect-refactor-analysis-template

## Input (REQUIRED)
- **Objetivo**: Añadir consulta obligatoria a TODO backlog en template de analysis
- **Alcance**: Modificar `.agent/templates/analysis.md`
- **Dependencias**: Ninguna

## Output (REQUIRED)
- **Entregables**:
  - `templates/analysis.md` modificado
- **Evidencia requerida**:
  - Diff del fichero mostrando nueva sección TODO

---

## Execution

```yaml
execution:
  agent: "architect-agent"
  status: completed
  started_at: "2026-01-18T18:33:47+01:00"
  completed_at: "2026-01-18T18:34:00+01:00"
```

---

## Implementation Report

🏛️ **architect-agent**:

### Cambios realizados
1. Añadida sección "9. TODO Backlog (Consulta obligatoria)" antes de Aprobación
2. Documentado el formato esperado para la consulta al backlog

### Decisiones técnicas
- La sección es obligatoria pero el resultado puede indicar "directorio vacío"
- Se mantiene coherencia con el formato del resto del template

### Evidencia
- Ver diff aplicado en `templates/analysis.md`

### Desviaciones del objetivo
- Ninguna

---

## Gate (REQUIRED)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-18T18:35:23+01:00
    comments: Aprobado
```

---

## Reglas contractuales

1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
2. Si Gate FAIL (`decision: NO`):
   - El arquitecto define acciones correctivas.
   - Se genera una nueva tarea de corrección si procede.
3. El agente asignado **NO puede modificar** el Input ni el Output definidos por el arquitecto.
4. El Gate es **síncrono y bloqueante**: el flujo se detiene hasta obtener respuesta del desarrollador.
