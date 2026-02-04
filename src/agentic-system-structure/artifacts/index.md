---
id: artifacts.index
owner: architect-agent
version: 1.0.0
severity: PERMANENT
---

# INDEX — Artifacts

## Objetivo
Este fichero es el índice del dominio artifacts.
Define rutas y alias contractuales para los artifacts generados dinámicamente.

## Aliases (YAML)
```yaml
artifacts:
  candidate:
    dir: .agent/artifacts/candidate
    index: .agent/artifacts/candidate/index.md
    task: .agent/artifacts/candidate/task.md
```

## Reglas
- Los artifacts dinámicos por tarea no se declaran aquí.
- Solo se declaran rutas canónicas de candidate.
