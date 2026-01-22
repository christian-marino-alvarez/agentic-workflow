---
artifact: todo_item
owner: architect-agent
status: open
priority: media
---

# TODO: Añadir ejemplos Few-Shot a templates

## Origen
- **Detectado en tarea**: 19-refinar-sistema-agentes-ciclo-vida
- **Fase**: Auditoría post-tarea
- **Fecha**: 2026-01-18T18:51:27+01:00
- **Agente**: architect-agent

## Descripción
Añadir ejemplos concretos (Few-Shot) a los templates críticos para demostrar el formato esperado y mejorar la adherencia del LLM.

## Justificación
Según las best practices de AWS y Microsoft, incluir ejemplos de alta calidad mejora significativamente el rendimiento del modelo respecto a zero-shot.

## Impacto estimado
- **Complejidad**: media
- **Áreas afectadas**: 
  - `templates/agent-task.md`
  - `templates/research.md`
  - `templates/analysis.md`
  - `templates/todo-item.md`

## Criterio de aceptación
- [ ] Cada template tiene una sección "Ejemplo (Few-Shot)" o similar
- [ ] Los ejemplos están completos y son realistas
- [ ] Los ejemplos no aumentan excesivamente el tamaño del template

## Notas
Referencia: Research Task #19, sección 3.4 Few-Shot Prompting

---

## Historial
```yaml
history:
  - action: created
    date: 2026-01-18T18:51:27+01:00
    by: architect-agent
```
