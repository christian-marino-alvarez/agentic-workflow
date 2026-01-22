---
id: todo.index
owner: architect-agent
version: 1.0.0
severity: PERMANENT
---

# INDEX — TODO Backlog

## Objetivo
Este fichero enumera los items pendientes del backlog de mejoras del sistema de agentes.

## Aliases (YAML)
```yaml
todo:
  readme: .agent/todo/README.md
  items:
    - .agent/todo/001-anadir-seccion-reasoning.md
    - .agent/todo/002-anadir-ejemplos-few-shot.md
    - .agent/todo/003-explorar-paralelizacion-phase4.md
    - .agent/todo/004-portable-agentic-system.md
```

## Reglas
- Los items **DEBEN** seguir el formato `NNN-descripcion-corta.md`.
- Cada item **DEBE** usar el template `templates.todo_item`.
- El architect-agent revisa el backlog en Phase 2 (Analysis).
