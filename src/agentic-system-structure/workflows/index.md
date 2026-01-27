---
id: workflows.index
owner: architect-agent
version: 1.0.0
severity: PERMANENT
description: Índice raíz de workflows del sistema.
---

# INDEX — Workflows (Root)

## Objetivo
Este índice define los **workflows raíz** del sistema.
No lista fases ni workflows internos; solo puntos de entrada principales.

Los workflows que representen un dominio complejo (ej. `tasklifecycle`)
**DEBEN** tener su propio `index.md` local.

```yaml
workflows:
  init: .agent/workflows/init.md
  tasklifecycle-long: .agent/workflows/tasklifecycle-long/index.md
  tasklifecycle-short: .agent/workflows/tasklifecycle-short/index.md
```

## Reglas
- Este índice es **estable y minimalista**.
- Los workflows NO deben referenciar rutas largas directamente.
- Las fases **NO deben** declararse en este índice.
- Para fases o sub-workflows, cargar siempre el `index.md` local del dominio.
- Si un workflow listado aquí no existe → FAIL.
