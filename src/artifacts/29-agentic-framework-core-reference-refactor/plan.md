---
artifact: implementation_plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 29-Agentic Framework Core Reference Refactor
---

# Implementation Plan — 28-Agentic Framework Core Reference Refactor

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Plan de implementación detallado para la migración al modelo de arquitectura por referencia absoluta y estructura espejo.

## 1. Resumen del plan
Refactorizar el comando `init` y el sistema de mapeo de rutas para que el core del framework se mantenga en `node_modules`. El proyecto local del usuario solo contendrá el índice maestro (`index.md`) y las carpetas espejo vacías (o con contenido personalizado).

## 2. Pasos de ejecucion (OBLIGATORIOS)

### Paso 1: Módulo de Resolución de Core (Tooling)
- **Agente**: `tooling-agent`
- **Acción**: Implementar `src/core/mapping/resolver.ts`.
- **Objetivo**: Función que detecte la ruta absoluta de instalación del paquete `@cmarino/agentic-workflow`.
- **Entrega**: Módulo de utilidad testeado.

### Paso 2: Refactor del Comando Init (Tooling)
- **Agente**: `tooling-agent`
- **Acción**: Modificar `src/cli/commands/init.ts`.
- **Objetivo**: 
  - Dejar de copiar archivos de `/rules`, `/workflows`, `/templates`.
  - Crear la estructura espejo local (`.agent/roles`, `.agent/workflows`, etc.) pero vacía por defecto.
  - Inyectar las rutas absolutas resueltas en el `index.md` del usuario.
- **Entrega**: Binario actualizado.

### Paso 3: Sistema de Scaffolding y Protección (Tooling)
- **Agente**: `tooling-agent`
- **Acción**: Implementar comandos en `agentic-workflow` CLI:
  - `agentic-workflow create role <name>`
  - `agentic-workflow create workflow <name>`
  - `agentic-workflow create tool <name>`
- **Objetivo**: 
  - Generar plantillas locales en la carpeta espejo correspondiente (`.agent/roles/`, etc.).
  - Implementar el "Reserved Check": si el nombre coincide con un archivo en node_modules, lanzar error y sugerir cambio.
  - Estos comandos permitirán que tanto el usuario (vía terminal) como el agente (vía `run_command`) puedan generar nuevos componentes siguiendo el estándar.
- **Entrega**: CLI extendido con nuevos comandos de creación.

- **Entrega**: Plantilla de documentación actualizada.

### Paso 5: Servidor MCP e Integración de Tools (Tooling)
- **Agente**: `tooling-agent`
- **Acción**: Implementar un servidor MCP que exponga las capacidades del CLI como herramientas estructuradas (ej: `create_role`).
- **Objetivo**: Habilitar a los agentes para usar las herramientas de forma nativa y robusta.

### Paso 6: Primer Rol Local - neo-agent (Architect)
- **Agente**: `architect-agent`
- **Acción**: Utilizar el nuevo sistema (vía MCP o CLI) para crear el primer rol de tipo `developer`.
- **Nombre**: **neo-agent** (como primer compañero developer local).
- **Objetivo**: Validar el sistema de extensión local. Este rol residirá físicamente en el proyecto del usuario (`.agent/roles/neo-agent.md`), permitiendo personalizar sus reglas e instrucciones de desarrollo sin afectar al core.
- **Entrega**: Fichero de rol `neo-agent.md` operativo y registrado en el índice.

## 3. Estrategia de Testing (QA)
- **Agente**: `qa-agent`
- **Unit**: Validar que el `resolver.ts` funciona tanto en desarrollo como tras un `npm link`.
- **E2E**: Ejecutar `init` en una carpeta limpia y verificar que los archivos de node_modules NO están presentes físicamente pero SÍ están referenciados en el `index.md`.
- **Security**: Intentar crear un rol `architect` y validar que el CLI lo bloquea.

## 4. Estimación y Cronograma
- Complejidad: Media-Alta (Cambio de paradigma).
- Esfuerzo estimado: 1 sesión de implementación granular.

---

## 5. Decisiones Técnicas (OBLIGATORIA)
- Usaremos `path.resolve()` dinámico en el momento del `init` para clavar los paths absolutos en el `index.md`.
- El formato del índice local usará bloques YAML claros diferenciando `core` y `custom`.

---

## 6. Demo Plan
1. Crear carpeta `test-refactor`.
2. Ejecutar `agentic-workflow init`.
3. Mostrar que `.agent/roles/` está vacía en el disco.
4. Mostrar que `index.md` tiene la ruta a `node_modules`.
5. Mostrar cómo un agente (yo mismo) puede leer el rol `architect` saltando al link.

---

## 7. Gate de Aprobación

```yaml
approval:
  developer:
    decision: null # SI | NO
    date: null
    comments: null
```
