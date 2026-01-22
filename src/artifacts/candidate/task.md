---
artifact: task_candidate
id: 29
title: "Agentic Framework: Core Reference Refactor"
scope: core
owner: architect-agent
strategy: long
status: candidate
---

# Task Candidate — 29-Agentic Framework Core Reference Refactor

## Descripción
Refactorizar el sistema `@cmarino/agentic-workflow` para que los componentes core (roles, workflows base, constituciones base) no se copien al proyecto del usuario, sino que se referencien directamente desde `node_modules`. Esto garantiza un núcleo sólido, inmutable y fácil de actualizar.

## Objetivo
Desacoplar la estructura del sistema agéntico mediante un modelo de "Referencia por Índice", permitiendo la coexistencia de componentes core inmutables con componentes custom locales.

## Acceptance Criteria Candidate
1. **Mapping por Referencia**: El archivo `.agent/index.md` local debe apuntar a las rutas del paquete en `node_modules`.
2. **Asistente de Creación**: Implementar comandos en el CLI para generar boilerplate de nuevos roles, workflows y herramientas en carpetas locales dedicadas (ej: `.agent/custom/`).
3. **Protección de Core**: Los comandos de creación deben lanzar excepciones si se intenta usar un nombre reservado del core.
4. **Visibilidad en IDE**: El archivo `AGENTS.md` debe guiar a los agentes externos a través del mapa de dependencias hacia `node_modules`.
5. **Persistencia Local**: Mantener `artifacts/` y `metrics/` como directorios de escritura locales exclusivos del proyecto.
