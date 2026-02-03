---
id: agent.index
owner: architect-agent
version: 1.0.0
severity: PERMANENT
description: Punto de entrada global del sistema .agent y sus dominios.
---

# INDEX — .agent (Root)

## Objetivo
Este fichero define los dominios principales del sistema `.agent`
y dónde está el `index.md` de cada dominio.

## Patron de indices y alias
- Cada dominio tiene un `index.md` que lista rutas de ficheros de ese dominio.
- Los `index.md` definen alias (YAML) que se usan en workflows, rules y templates.
- Los alias permiten referenciar ficheros sin rutas absolutas y ayudan a recordar
  que ya se cargo un fichero y su ruta exacta.
- Para acceder a un fichero, el LLM debe seguir la cadena:
  `.agent/index.md` -> `dominio/index.md` -> alias -> ruta real.

## Aliases (YAML)
```yaml
agent:
  version: 1.0.0

  domains:
    workflows:
      index: .agent/workflows/index.md

    artifacts:
      index: .agent/artifacts/index.md

    templates:
      index: .agent/templates/index.md

    rules:
      index: .agent/rules/index.md

    skills:
      index: .agent/skills/index.md

```

## Reglas
- Este fichero **solo** declara puntos de entrada por dominio.
- Cada dominio es responsable de sus aliases internos mediante su propio `index.md`.
- Si un dominio cambia de ruta, se actualiza aquí (y en su índice local si aplica).
