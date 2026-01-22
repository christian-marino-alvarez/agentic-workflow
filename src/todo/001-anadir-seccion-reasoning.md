---
artifact: todo_item
owner: architect-agent
status: done
priority: alta
---

# TODO: Añadir sección Reasoning a agent-task

## Origen
- **Detectado en tarea**: 19-refinar-sistema-agentes-ciclo-vida
- **Fase**: Auditoría post-tarea
- **Fecha**: 2026-01-18T18:51:27+01:00
- **Agente**: architect-agent

## Descripción
Añadir una sección "Reasoning" obligatoria al template `agent-task.md` para forzar a los agentes a documentar su proceso de razonamiento (Chain of Thought) antes de implementar.

## Justificación
Según las best practices de OpenAI y LearnPrompting, documentar el razonamiento mejora la precisión del modelo y permite detectar errores de lógica antes de la implementación.

## Impacto estimado
- **Complejidad**: baja
- **Áreas afectadas**: `templates/agent-task.md`

## Criterio de aceptación
- [ ] `agent-task.md` tiene sección "Reasoning (OBLIGATORIO)"
- [ ] La sección incluye: Análisis del objetivo, Opciones consideradas, Decisión tomada
- [ ] Al menos 1 tarea ejecutada usando el nuevo formato

## Notas
Referencia: Research Task #19, sección 3.5 Chain of Thought

---

## Historial
```yaml
history:
  - action: created
    date: 2026-01-18T18:51:27+01:00
    by: architect-agent
```
