---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 20-anadir-seccion-reasoning-templates-ejecucion
---

# Implementation Plan — 20-anadir-seccion-reasoning-templates-ejecucion

## 1. Resumen del plan

🏛️ **architect-agent**: Plan basado en Alternativa B aprobada.

- **Contexto**: Añadir sección "Reasoning" (Chain of Thought) a templates de ejecución
- **Resultado esperado**: 7 templates modificados con sección Reasoning entre Input y Output
- **Alcance**: Solo templates, sin cambios en workflows ni código

---

## 2. Inputs contractuales

- **Task**: [task.md](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/20-anadir-seccion-reasoning-agent-task/task.md)
- **Analysis**: [analysis.md](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/20-anadir-seccion-reasoning-agent-task/analysis.md)
- **Research**: [research.md](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/20-anadir-seccion-reasoning-agent-task/researcher/research.md)

---

## 3. Sección Reasoning a insertar

```markdown
---

## Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.
> Documentar el razonamiento mejora la calidad y permite detectar errores temprano.

### Análisis del objetivo
- ¿Qué se pide exactamente?
- ¿Hay ambigüedades o dependencias?

### Opciones consideradas
- **Opción A**: (descripción)
- **Opción B**: (descripción)
- *(añadir más si aplica)*

### Decisión tomada
- Opción elegida: (A/B/...)
- Justificación: (por qué esta opción)

---
```

---

## 4. Desglose de implementación

### Tarea 1: Modificar agent-task.md
| Campo | Valor |
|-------|-------|
| **Agente** | architect-agent |
| **Objetivo** | Insertar sección Reasoning entre Input y Output |
| **Template** | `templates/agent-task.md` |

### Tarea 2: Modificar driver-create.md
| Campo | Valor |
|-------|-------|
| **Agente** | architect-agent |
| **Objetivo** | Insertar sección Reasoning, mover "Decisiones técnicas" dentro de ella |
| **Template** | `templates/driver-create.md` |

### Tarea 3: Modificar driver-refactor.md
| Campo | Valor |
|-------|-------|
| **Agente** | architect-agent |
| **Objetivo** | Insertar sección Reasoning |
| **Template** | `templates/driver-refactor.md` |

### Tarea 4: Modificar driver-delete.md
| Campo | Valor |
|-------|-------|
| **Agente** | architect-agent |
| **Objetivo** | Insertar sección Reasoning |
| **Template** | `templates/driver-delete.md` |

### Tarea 5: Modificar module-create.md
| Campo | Valor |
|-------|-------|
| **Agente** | architect-agent |
| **Objetivo** | Insertar sección Reasoning |
| **Template** | `templates/module-create.md` |

### Tarea 6: Modificar module-refactor.md
| Campo | Valor |
|-------|-------|
| **Agente** | architect-agent |
| **Objetivo** | Insertar sección Reasoning |
| **Template** | `templates/module-refactor.md` |

### Tarea 7: Modificar module-delete.md
| Campo | Valor |
|-------|-------|
| **Agente** | architect-agent |
| **Objetivo** | Insertar sección Reasoning |
| **Template** | `templates/module-delete.md` |

### Tarea 8: Validación QA
| Campo | Valor |
|-------|-------|
| **Agente** | qa-agent |
| **Objetivo** | Verificar que todos los templates tienen la sección correctamente |
| **Verificaciones** | Posición, subsecciones, regla OBLIGATORIO |

---

## 5. Estimaciones

| Tarea | Esfuerzo | Tiempo |
|-------|----------|--------|
| 1-7 | Bajo | 2 min c/u |
| 8 | Bajo | 5 min |
| **Total** | - | ~20 min |

---

## 6. Criterios de finalización

- [ ] 7 templates tienen sección "Reasoning (OBLIGATORIO)"
- [ ] Sección está entre Input y Output (o posición equivalente)
- [ ] 3 subsecciones: Análisis, Opciones, Decisión
- [ ] Regla IMPORTANT añadida
- [ ] TODO #001 cerrado

---

## 7. Aprobación

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-18T22:00:18+01:00
    comments: Aprobado
```
