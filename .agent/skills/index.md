---
id: skills.index
owner: architect-agent
version: 1.0.0
severity: PERMANENT
---

# INDEX — Skills

## Objetivo
Este fichero enumera los **skills (habilidades)** disponibles en el sistema.
Los agentes **DEBEN** referenciar estas habilidades por alias.

## Aliases (YAML)
```yaml
skills:
  runtime-governance: .agent/skills/runtime-governance/SKILL.md
  module-scaffolding: .agent/skills/module-scaffolding/SKILL.md
```

## Reglas
- Este índice solo declara skills del sistema.
- Cada skill debe estar en su propia carpeta en `.agent/skills/`.
- Cualquier nuevo skill **DEBE** añadirse aquí antes de ser referenciado.
