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
constitution:
  clean_code: .agent/rules/constitution/clean-code.md
  agents_behavior: .agent/rules/constitution/agents-behavior.md
```

## Reglas
- Este índice **solo** declara reglas del dominio `constitution`.
- Cualquier nueva regla del dominio **DEBE** añadirse aquí.
