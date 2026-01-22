---
id: workflows.modules.index
owner: architect-agent
version: 2.0.0
severity: PERMANENT
description: Indice del dominio de workflows para modulos.
---

# INDEX — Workflows / Modules

## Objetivo
Este fichero define los workflows del dominio `modules`.

## Aliases (YAML)
```yaml
workflows:
  modules:
    create: .agent/workflows/modules/create.md
    refactor: .agent/workflows/modules/refactor.md
    delete: .agent/workflows/modules/delete.md
    shards_create: .agent/workflows/modules/shards.create.md
    pages_create: .agent/workflows/modules/pages.create.md
```

## Reglas
- Este indice **solo** declara workflows del dominio `modules`.
- Cualquier workflow nuevo **DEBE** añadirse aqui antes de ser referenciado.
