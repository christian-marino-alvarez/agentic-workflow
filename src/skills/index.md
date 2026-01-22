---
domain: skills
type: index
version: 1.0.0
---

# INDEX — Skills

## Objetivo
Este fichero enumera todos los **skills operativos** disponibles en el proyecto Extensio.
Los skills son capacidades accionables que los agentes pueden usar para ejecutar tareas específicas.

---

## Aliases (YAML)

```yaml
skills:
  extensio_build:
    path: .agent/skills/extensio-build/SKILL.md
    tool: mcp_extensio-cli_extensio_build
    description: Compila proyectos Extensio para navegadores usando extensio-cli
    
  extensio_create_module:
    path: .agent/skills/extensio-create-module/SKILL.md
    tool: mcp_extensio-cli_extensio_create
    description: Crea módulos con Engine, Surface Pages y Shards
    
  extensio_create_driver:
    path: .agent/skills/extensio-create-driver/SKILL.md
    tool: mcp_extensio-cli_extensio_create
    description: Crea drivers con adaptadores multi-browser
    
  extensio_test:
    path: .agent/skills/extensio-test/SKILL.md
    tool: mcp_extensio-cli_extensio_test
    description: Ejecuta tests unitarios, integración y E2E con coverage
    
  extensio_demo:
    path: .agent/skills/extensio-demo/SKILL.md
    tool: mcp_extensio-cli_extensio_demo
    description: Genera scaffolding de demo para módulos y drivers
    
  extensio_validate_code:
    path: .agent/skills/extensio-validate-code/SKILL.md
    tool: run_command
    description: Valida código TypeScript y ESLint, detecta errores antes de commit
```

---

## Reglas de Uso

1. **Referenciar por alias**: Usar `skills.extensio_build` en workflows/reglas
2. **Leer antes de usar**: Cada skill tiene Input/Output/Tool documentados
3. **Agentes como capacidades**: Los roles listan skills disponibles
4. **Sin dueño**: Los skills son recursos compartidos sin owner

---

## Uso en Roles

Ejemplo en `.agent/rules/roles/architect.md`:
```yaml
capabilities:
  skills:
    - extensio_build
    - extensio_create_module
    - extensio_create_driver
```

---

## Convenciones

- Cada skill DEBE tener sección **Input** (qué necesita)
- Cada skill DEBE tener sección **Output** (qué produce)
- Cada skill DEBE tener sección **Tool** (qué MCP tool usar)
- Prefijo `extensio_` para todos los skills del framework
