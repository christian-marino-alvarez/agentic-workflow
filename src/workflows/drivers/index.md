---
id: workflows.drivers.index
owner: architect-agent
version: 1.0.0
severity: PERMANENT
description: Índice del dominio de workflows para drivers: creación, refactor y eliminación. Define los entrypoints oficiales y obliga a usar estos flujos para mantener la constitución y la integración correcta en Extensio.
---

# INDEX — Workflows / Drivers

## Objetivo
Este fichero define los workflows del dominio `drivers`.

## Aliases (YAML)
```yaml
workflows:
  drivers:
    create: .agent/workflows/drivers/create.md
    refactor: .agent/workflows/drivers/refactor.md
    delete: .agent/workflows/drivers/delete.md
```

## Reglas
- Este índice **solo** declara workflows del dominio `drivers`.
- Cualquier workflow nuevo **DEBE** añadirse aquí antes de ser referenciado.
