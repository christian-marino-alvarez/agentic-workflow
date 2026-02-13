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
  runtime_integration: .agent/rules/constitution/runtime-integration.md
  type_governance: .agent/rules/constitution/constant-driven-types.md
  domain_integrity: .agent/rules/constitution/domain-integrity.md
  core_module: .agent/rules/constitution/core-module.md
  view_layer: .agent/rules/constitution/view-layer.md
```

## Reglas
- Este índice **solo** declara reglas del dominio `constitution`.
- Cualquier nueva regla del dominio **DEBE** añadirse aquí.
