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
  GEMINI_location: src/agentic-system-structure/rules/constitution/GEMINI.location.md
  clean_code: src/agentic-system-structure/rules/constitution/clean-code.md
  agents_behavior: src/agentic-system-structure/rules/constitution/agents-behavior.md
```

## Reglas
- Este índice **solo** declara reglas del dominio `constitution`.
- Cualquier nueva regla del dominio **DEBE** añadirse aquí.
