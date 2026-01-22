---
artifact: agent_task
phase: phase-4-implementation
owner: architect-agent
status: completed
related_task: 19-refinar-sistema-agentes-ciclo-vida
task_number: 4
---

# Agent Task — 4-architect-update-phase2-workflow

## Input (REQUIRED)
- **Objetivo**: Hacer obligatoria la consulta a TODO backlog en fase de análisis
- **Alcance**: Modificar `.agent/workflows/tasklifecycle-long/phase-2-analysis.md`
- **Dependencias**: Tarea 2 y Tarea 5 (template y estructura TODO)

## Output (REQUIRED)
- **Entregables**:
  - `workflows/tasklifecycle-long/phase-2-analysis.md` modificado
- **Evidencia requerida**:
  - Diff del fichero mostrando nuevo paso de consulta TODO

---

## Execution

```yaml
execution:
  agent: "architect-agent"
  status: completed
  started_at: "2026-01-18T18:36:38+01:00"
  completed_at: "2026-01-18T18:37:00+01:00"
```

---

## Implementation Report

🏛️ **architect-agent**:

### Cambios realizados
1. Añadido paso 4.5: "Consultar TODO backlog (OBLIGATORIO)"
2. Añadido requisito en Gate: "Incluye consulta a .agent/todo/"

### Decisiones técnicas
- Se inserta entre paso 4 (análisis proyecto) y paso 5 (integrar research)
- Se añade al Gate como requisito verificable

### Evidencia
- Ver diff aplicado en workflow

### Desviaciones del objetivo
- Ninguna

---

## Gate (REQUIRED)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-18T18:37:56+01:00
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
