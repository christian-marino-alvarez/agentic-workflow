---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 19-refinar-sistema-agentes-ciclo-vida
---

# Implementation Plan — 19-refinar-sistema-agentes-ciclo-vida

## 1. Resumen del plan

🏛️ **architect-agent**: Plan de implementación basado en [analysis.md](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/19-refinar-sistema-agentes-ciclo-vida/analysis.md) (Alternativa B aprobada).

- **Contexto**: Refactorizar el sistema de agentes para separar Research de Análisis, integrar TODO backlog, y reforzar la estructura de subtareas.
- **Resultado esperado**: Workflows y templates actualizados siguiendo best practices de LLM prompting.
- **Alcance**: 
  - ✅ Incluye: 2 workflows, 2 templates modificados, 2 artefactos nuevos
  - ❌ Excluye: Código funcional, cambios en constitution, nuevos agentes

---

## 2. Inputs contractuales

- **Task**: [task.md](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/19-refinar-sistema-agentes-ciclo-vida/task.md)
- **Analysis**: [analysis.md](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/19-refinar-sistema-agentes-ciclo-vida/analysis.md)
- **Research**: [research.md](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/19-refinar-sistema-agentes-ciclo-vida/researcher/research.md)

**Dispatch de dominios**
```yaml
plan:
  workflows:
    drivers:
      action: none
  dispatch:
    - domain: core
      action: none
```

> No se requiere dispatch a dominios específicos; todos los cambios son en `.agent/`.

---

## 3. Desglose de implementación

### Tarea 1: Refactorizar template research.md
| Campo | Valor |
|-------|-------|
| **Objetivo** | Eliminar secciones de análisis del template de research |
| **Agente** | architect-agent |
| **Dependencias** | Ninguna |
| **Entregables** | `templates/research.md` modificado |
| **Cambios** | Renombrar "Alternativas técnicas" → "Hallazgos técnicos", eliminar "Decisión recomendada" |

---

### Tarea 2: Refactorizar template analysis.md
| Campo | Valor |
|-------|-------|
| **Objetivo** | Añadir consulta obligatoria a TODO backlog |
| **Agente** | architect-agent |
| **Dependencias** | Ninguna |
| **Entregables** | `templates/analysis.md` modificado |
| **Cambios** | Añadir sección "TODO Backlog (Consulta obligatoria)" antes de Aprobación |

---

### Tarea 3: Actualizar workflow phase-1-research.md
| Campo | Valor |
|-------|-------|
| **Objetivo** | Reforzar que Research es solo documentación sin análisis |
| **Agente** | architect-agent |
| **Dependencias** | Tarea 1 completada |
| **Entregables** | `workflows/tasklifecycle-long/phase-1-research.md` modificado |
| **Cambios** | Añadir regla PERMANENT: "Research documenta, NO analiza" |

---

### Tarea 4: Actualizar workflow phase-2-analysis.md
| Campo | Valor |
|-------|-------|
| **Objetivo** | Hacer obligatoria la consulta a TODO backlog |
| **Agente** | architect-agent |
| **Dependencias** | Tarea 2 y Tarea 5 completadas |
| **Entregables** | `workflows/tasklifecycle-long/phase-2-analysis.md` modificado |
| **Cambios** | Añadir paso 4.5: "Consultar .agent/todo/" |

---

### Tarea 5: Crear estructura TODO backlog
| Campo | Valor |
|-------|-------|
| **Objetivo** | Crear template y README para backlog de mejora continua |
| **Agente** | architect-agent |
| **Dependencias** | Ninguna |
| **Entregables** | `templates/todo-item.md`, `.agent/todo/README.md` |
| **Cambios** | Nuevos ficheros |

---

### Tarea 6: Validación final (QA)
| Campo | Valor |
|-------|-------|
| **Objetivo** | Verificar que todos los cambios cumplen AC |
| **Agente** | qa-agent |
| **Dependencias** | Tareas 1-5 completadas |
| **Entregables** | Informe de validación manual |
| **Verificaciones** | Revisar templates, workflows, estructura TODO |

---

## 4. Asignación de responsabilidades

| Agente | Tareas | Responsabilidad |
|--------|--------|-----------------|
| **architect-agent** | 1, 2, 3, 4, 5 | Implementar cambios en templates y workflows |
| **qa-agent** | 6 | Validar cumplimiento de acceptance criteria |

**Handoffs**:
- Tareas 1-5: architect-agent → qa-agent (cuando todas estén completadas)
- Tarea 6: qa-agent → architect-agent (informe de validación)

**Componentes**: No aplica (no hay drivers/módulos).

**Demo**: No aplica (cambios internos al sistema agéntico).

---

## 5. Estrategia de testing y validación

| Tipo | Estrategia |
|------|------------|
| **Unit tests** | N/A (no hay código) |
| **Integration tests** | N/A |
| **Manual** | qa-agent revisa estructura de templates y workflows |

**Trazabilidad**:
| AC | Tarea | Verificación |
|----|-------|--------------|
| AC1 | 1, 3 | Template research sin análisis |
| AC2 | 2, 4 | Workflow analysis consulta TODO |
| AC3-5 | - | Ya implementado |
| AC6 | 5 | Estructura TODO creada |

---

## 6. Plan de demo

No aplica — los cambios son internos al sistema agéntico y no tienen componente visual.

---

## 7. Estimaciones

| Tarea | Esfuerzo | Estimación |
|-------|----------|------------|
| 1 | Bajo | 5 min |
| 2 | Bajo | 5 min |
| 3 | Medio | 10 min |
| 4 | Medio | 10 min |
| 5 | Bajo | 10 min |
| 6 | Bajo | 15 min |
| **Total** | - | ~55 min |

---

## 8. Puntos críticos y resolución

| Punto crítico | Riesgo | Mitigación |
|---------------|--------|------------|
| Templates modificados rompen tareas en curso | Bajo | No hay tareas en curso usando estos templates |
| Workflows modificados invalidan fases futuras | Bajo | Los cambios son aditivos, no eliminan funcionalidad |

---

## 9. Dependencias

- **Internas**: Ninguna (todos los ficheros existen)
- **Externas**: Ninguna
- **Compatibilidad navegadores**: N/A

---

## 10. Criterios de finalización

- [ ] `templates/research.md` no contiene secciones de análisis
- [ ] `templates/analysis.md` incluye consulta TODO
- [ ] `phase-1-research.md` refuerza "solo documentación"
- [ ] `phase-2-analysis.md` incluye paso de consulta TODO
- [ ] `.agent/todo/README.md` y `templates/todo-item.md` existen
- [ ] qa-agent valida todos los cambios

---

## 11. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-18T18:30:04+01:00
    comments: Aprobado
```
