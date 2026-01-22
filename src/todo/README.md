# TODO Backlog — Extensio

> [!IMPORTANT]
> Este directorio contiene el **backlog de mejora continua** del sistema agéntico.
> El architect-agent **DEBE** consultar este directorio en cada Phase 2 (Analysis).

## Propósito

El TODO backlog captura mejoras detectadas durante la ejecución de tareas que:
- No son bloqueantes para la tarea actual
- Requieren planificación futura
- Podrían mejorar el sistema agéntico o la arquitectura

## Reglas de Uso

### Cuándo crear un TODO
1. Durante **Phase 4 (Implementation)**: si el desarrollador detecta una mejora no bloqueante
2. Durante **Phase 5 (Verification)**: si QA identifica oportunidades de mejora
3. Durante cualquier fase: si el architect-agent detecta deuda técnica

### Cuándo consultar el TODO
- **OBLIGATORIO** en Phase 2 (Analysis) — ver paso 5.5 del workflow
- El architect-agent debe evaluar si algún item impacta en la tarea actual

### Estructura de ficheros
```
.agent/todo/
├── README.md              # Este fichero
├── 001-mejorar-xxx.md     # Item de backlog (usa templates/todo-item.md)
├── 002-refactor-yyy.md    # Otro item
└── ...
```

### Nomenclatura
- Formato: `<NNN>-<descripcion-corta>.md`
- NNN: número secuencial de 3 dígitos
- descripcion-corta: kebab-case, máximo 30 caracteres

### Prioridades
| Prioridad | Significado |
|-----------|-------------|
| **alta** | Debería implementarse en las próximas 2-3 tareas |
| **media** | Implementar cuando sea conveniente |
| **baja** | Nice-to-have, sin urgencia |

## Estado actual

**Items pendientes**: 3

| # | Prioridad | Item |
|---|-----------|------|
| 001 | Alta | Añadir sección Reasoning a agent-task |
| 002 | Media | Añadir ejemplos Few-Shot a templates |
| 003 | Baja | Explorar paralelización en Phase 4 |

---

> Template para nuevos items: `templates/todo-item.md`
