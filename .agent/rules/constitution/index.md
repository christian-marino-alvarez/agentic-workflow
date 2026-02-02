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
  GEMINI_location: .agent/rules/constitution/GEMINI.location.md
  clean_code: .agent/rules/constitution/clean-code.md
  agents_behavior: .agent/rules/constitution/agents-behavior.md
  vscode_extensions: .agent/rules/constitution/vscode-extensions.md
  class_oriented: .agent/rules/constitution/class-oriented.md
  external_html: .agent/rules/constitution/external-html.md
  lit_decorators: .agent/rules/constitution/lit-decorators.md
```

## Reglas
- Este índice **solo** declara reglas del dominio `constitution`.
- Cualquier nueva regla del dominio **DEBE** añadirse aquí.
