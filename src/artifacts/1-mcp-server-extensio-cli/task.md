# Task: MCP Server para Extensio CLI

## Identificación
- id: 1
- title: mcp-server-extensio-cli
- scope: current
- owner: architect-agent

## Origen
- created_from:
  - workflow: tasklifecycle
  - source: init / tasklifecycle
  - candidate_path: artifacts.candidate.task

## Descripción de la tarea
Crear un servidor MCP (Model Context Protocol) para Google Antigravity que exponga las capacidades del CLI de Extensio (`@extensio/cli`) a través del sistema de desarrollo. El servidor MCP debe permitir a agentes y herramientas AI crear drivers, módulos y proyectos utilizando el comando `ext` del CLI de Extensio de forma programática.

## Objetivo
Integrar el CLI de Extensio como un servidor MCP que Google Antigravity pueda utilizar para automatizar la creación, gestión y desarrollo de componentes del framework Extensio (drivers, módulos, aplicaciones) mediante interfaces de agentes AI, permitiendo una experiencia de desarrollo asistida por IA.

## Estado del ciclo de vida (FUENTE ÚNICA DE VERDAD)

```yaml
task:
  id: "1"
  title: "mcp-server-extensio-cli"
  phase:
    current: "phase-8-commit-push"
    validated_by: "architect-agent"
    updated_at: "2026-01-06T21:59:03+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T20:58:20+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T21:04:31+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T21:09:21+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T21:14:54+01:00"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T21:27:58+01:00"
      phase-5-verification:
        completed: true
        validated_by: "qa-agent"
        validated_at: "2026-01-06T21:56:14+01:00"
      phase-6-results-acceptance:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T21:59:03+01:00"
      phase-7-evaluation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T21:59:03+01:00"
      phase-8-commit-push:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-01-06T22:00:09+01:00"
```

## Acceptance Criteria (COMPLETADO EN FASE 0)

### 1. Alcance del servidor MCP
**Pregunta:** ¿El servidor MCP debe exponer TODAS las capacidades del CLI de Extensio, o solo un subconjunto?

**Respuesta:** Exponer TODAS las capacidades del CLI de Extensio. Comandos prioritarios: **build**, **create** y **test**.

**Criterio verificable:**
- El servidor MCP expone todos los comandos del CLI `ext` disponibles en `@extensio/cli`
- Los comandos `build`, `create` y `test` están completamente implementados y documentados
- Cada comando del CLI tiene su correspondiente tool/resource en el protocolo MCP

---

### 2. Integración con Google Antigravity
**Pregunta:** ¿Cómo debe integrarse con Google Antigravity?

**Respuesta:** Debe integrarse con el IDE Google Antigravity. Requiere documentación completa para que los agentes puedan descubrir y usar el servidor.

**Criterio verificable:**
- Existe documentación clara de cómo configurar el servidor MCP en Google Antigravity
- La documentación incluye ejemplos de uso desde agentes AI
- El servidor sigue el estándar MCP para ser auto-descubrible por Google Antigravity
- Existe configuración de setup (ej. archivo de configuración JSON para MCP)

---

### 3. Ubicación y estructura del proyecto
**Pregunta:** ¿Dónde debe ubicarse el servidor MCP?

**Respuesta:** Dentro del monorepo, en el path `tools/mcp-server` (o como package npm si es más apropiado).

**Criterio verificable:**
- El servidor MCP se ubica en `tools/mcp-server` dentro del monorepo de Extensio
- La estructura sigue las convenciones del monorepo (package.json, tsconfig, etc.)
- Opcionalmente publicable como `@extensio/mcp-server` en npm
- Integrado con el sistema de build del monorepo

---

### 4. Gestión de errores y validaciones
**Pregunta:** ¿Cómo debe manejar errores del CLI?

**Respuesta:** Validar inputs antes de ejecutar comandos y verificar resultados.

**Criterio verificable:**
- El servidor valida todos los inputs antes de ejecutar comandos del CLI
- Los errores del CLI se capturan y se exponen de forma estructurada vía MCP
- Se verifican los resultados de cada comando antes de retornar al agente
- Mensajes de error claros y accionables para los agentes AI

---

### 5. Demo y verificación
**Pregunta:** ¿Cómo verificamos que funciona correctamente?

**Respuesta:** Demo de uso real con un agente.

**Criterio verificable:**
- Existe un demo funcional que muestra un agente usando el servidor MCP
- El demo incluye al menos un caso de uso de cada comando prioritario (build, create, test)
- Tests automatizados que simulan llamadas MCP al servidor
- Documentación del demo con evidencia visual (screenshots/video)

---

## Resumen de Acceptance Criteria (Checklist)

- [x] Servidor MCP expone todos los comandos de `@extensio/cli`
- [x] Comandos `build`, `create`, `test` completamente implementados
- [x] Documentación completa de integración con Google Antigravity
- [x] Configuración MCP para auto-descubrimiento por agentes
- [x] Ubicación en `tools/mcp-server` dentro del monorepo
- [x] Estructura compatible con publicación como `@extensio/mcp-server`
- [x] Validación de inputs antes de ejecución
- [x] Manejo estructurado de errores del CLI
- [x] Demo funcional con agente real
- [x] Tests automatizados simulando llamadas MCP
- [x] Documentación con evidencia visual del demo

---

## Historial de validaciones (append-only)

```yaml
history:
  - phase: "candidate-creation"
    action: "created"
    validated_by: "architect-agent"
    timestamp: "2026-01-06T20:52:25+01:00"
    notes: "Task candidate creado desde solicitud del desarrollador"
  
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-06T20:58:20+01:00"
    notes: "Acceptance criteria definidos a partir de 5 preguntas obligatorias. Developer confirmó alcance completo del CLI, integración con Antigravity, ubicación en monorepo, validación de inputs y demo con agente."
```

## Reglas contractuales
- Este fichero es la **fuente única de verdad** del estado de la tarea.
- El campo `task.phase.current` **SOLO puede ser modificado por `architect-agent`**.
- El campo `task.lifecycle.phases.*` **SOLO puede ser marcado como completed por `architect-agent`**.
- Una fase **NO puede marcarse como completed** si no es la fase actual.
- El avance de fase requiere:
  1. Marcar la fase actual como `completed: true`
  2. Validación explícita del architect
  3. Actualización de `task.phase.current` a la siguiente fase
