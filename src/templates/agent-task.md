---
artifact: agent_task
phase: phase-4-implementation
owner: {{agent}}
assigned_to: {{agent}}
status: blocked | pending_reasoning_approval | in-progress | completed | failed
related_task: {{taskId}}-{{taskTitle}}
task_id: "{{taskId}}-{{N}}"
---

################################################################################
# 🛑 BLOQUEO DE SEGURIDAD: TAREA NO ACTIVADA                                   #
################################################################################
# El agente {{agent}} ha sido asignado para esta tarea.                       #
#                                                                              #
# PROHIBIDO USAR HERRAMIENTAS DE ESCRITURA O EJECUCIÓN (run, write, create).   #
# Acción requerida: Desarrollador debe responder con "SI" para activar.        #
################################################################################

# Agent Task — {{taskId}}-{{N}} ({{taskName}})

## 1. Input (REQUIRED)
- **Objetivo**: {{objective}}
- **Alcance**: {{scope}}
- **Dependencias**: {{dependencies}}

---

## 2. Reasoning (ESPERANDO ACTIVACIÓN)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección DESPUÉS de ser activado (Gate A) y ANTES de ejecutar (Gate B).

### Análisis del objetivo
- (¿Qué se pide exactamente?)

### Opciones consideradas
- **Opción A**: (descripción)
- **Opción B**: (descripción)

### Decisión tomada
- **Opción elegida**: (A/B)
- **Justificación**: (por qué)

---

## 3. Output (REQUIRED)
- **Entregables**:
  - {{deliverables}}
- **Evidencia requerida**:
  - {{evidence}}

---

## 4. Implementation Report

> Esta sección la completa el agente asignado durante la ejecución.

### Cambios realizados
- (Archivos modificados, funciones añadidas, etc.)

### Decisiones técnicas
- (Decisiones clave y justificación)

### Evidencia
- (Logs, capturas, tests ejecutados)

---

## Gate A: Activación de Agente (Handover)

El desarrollador **DEBE** activar al agente antes de que este pueda presentar su razonamiento o usar herramientas.

```yaml
activation:
  agent: {{agent}}
  assigned_by: architect-agent
  decision: null # SI | NO
```

## Gate B: Aprobación de Reasoning (Plan de Acción)

El desarrollador **DEBE** aprobar el razonamiento antes de que el agente proceda con la implementación.

```yaml
reasoning_approval:
  agent: {{agent}}
  decision: null # SI | NO
```

## Gate C: Aprobación de Resultados (Cierre)

```yaml
completion:
  agent: {{agent}}
  decision: null # SI | NO
```

---

## Reglas contractuales (AHRP)

1. **Gate A síncrono**: Prohibido usar herramientas sin activación `SI`.
2. **Gate B síncrono**: Prohibido modificar código sin aprobación de Reasoning `SI`.
3. **Métricas**: El incumplimiento de cualquier Gate resulta en una **Puntuación de 0** inmediata.
4. El agente asignado **NO puede modificar** el Input ni el Output definidos por el arquitecto.
