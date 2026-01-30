---
id: rules.roles.index
owner: architect-agent
version: 1.0.1
severity: PERMANENT
trigger: always_on
---

# INDEX — Rules / Roles

## Objetivo
Este fichero enumera todas las rules del dominio `roles`.
Los workflows/agentes **DEBEN** referenciar estas reglas
por alias en lugar de rutas directas.

## Reglas Globales (PERMANENT)

### Comportamiento e Identificación de Agentes
**Severidad**: PERMANENT  
**Alcance**: Todos los roles

Todos los agentes DEBEN seguir estrictamente las normas de identificación e interacción definidas en:
`constitution.agents_behavior`

**Resumen**:
- Identificación obligatoria mediante `<icono> **<nombre-agente>**`, con la excepcion de compatibilidad definida en `constitution.agents_behavior`.
- Solo el Architect puede modificar reglas.
- QA no implementa código funcional.

---

## Aliases (YAML)
```yaml
roles:
  architect: .agent/rules/roles/architect.md
  qa: .agent/rules/roles/qa.md
  researcher: .agent/rules/roles/researcher.md
  neo: .agent/rules/roles/neo.md
  vscode-specialist: .agent/rules/roles/vscode-specialist.md
```

## Reglas
- Este índice **solo** declara reglas del dominio `roles`.
- Cada nuevo rol **DEBE** añadirse aquí antes de ser utilizado.
- Cada rol **DEBE** incluir la regla de prefijo obligatorio en su definición.
