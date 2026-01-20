---
artifact: todo_item
owner: architect-agent
status: open | in-progress | done | cancelled
priority: alta | media | baja
---

# TODO: <título breve>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## Origen
- **Detectado en tarea**: <taskId>-<taskTitle>
- **Fase**: <phase donde se detectó>
- **Fecha**: <ISO-8601>
- **Agente**: <agente que lo detectó>

## Descripción
<Descripción clara de la mejora propuesta>

## Justificación
<Por qué es importante hacer este cambio>

## Impacto estimado
- **Complejidad**: baja | media | alta
- **Áreas afectadas**: <componentes/workflows/templates>

## Criterio de aceptación
- [ ] <Condición verificable 1>
- [ ] <Condición verificable 2>

## Notas
<Información adicional relevante>

---

## Historial
```yaml
history:
  - action: created
    date: <ISO-8601>
    by: <agente>
  # - action: started | completed | cancelled
  #   date: <ISO-8601>
  #   by: <agente>
  #   task: <taskId donde se implementó>
```
