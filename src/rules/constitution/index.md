---
id: rules.constitution.index
owner: architect-agent
version: 2.0.0
severity: PERMANENT
trigger: always_on
---

# INDEX — Rules / Constitution

## Objetivo
Este fichero enumera todas las rules del dominio `constitution`.
Los workflows y agentes **DEBEN** referenciar estas reglas
por alias en lugar de rutas directas.

## Aliases (YAML)
```yaml
rules:
  constitution:
    GEMINI_location: .agent/rules/constitution/GEMINI.location.md
    extensio_architecture: .agent/rules/constitution/extensio-architecture.md
    clean_code: .agent/rules/constitution/clean-code.md
    drivers: .agent/rules/constitution/drivers.md
    modules: .agent/rules/constitution/modules.md
    shards: .agent/rules/constitution/shards.md
    pages: .agent/rules/constitution/pages.md
    agents_behavior: .agent/rules/constitution/agents-behavior.md
```

## Reglas
- Este índice **solo** declara reglas del dominio `constitution`.
- Cualquier nueva regla del dominio **DEBE** añadirse aquí.
