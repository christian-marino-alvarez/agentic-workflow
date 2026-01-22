---
artifact: acceptance
phase: phase-0-acceptance-criteria
owner: architect-agent
status: approved
related_task: 29-Agentic Framework Core Reference Refactor
---

# Acceptance Criteria — 29-Agentic Framework Core Reference Refactor

## 1. Definición de la tarea
**Problema**: El sistema actual duplica el core en cada instalación, lo que dificulta las actualizaciones y expone reglas inmutables a modificaciones erróneas.
**Objetivo**: Implementar un modelo de "Núcleo Protegido" donde el sistema agéntico referencia sus reglas base desde `node_modules` y solo permite extensiones locales controladas.

## 2. Respuestas del Desarrollador (HITL)

1. **Resolución de Rutas**: Se implementará **Absolute Path Mapping**. El CLI `init` resolverá las rutas completas al paquete instalado para asegurar que los agentes encuentren los ficheros sin ambigüedad.
2. **Visibilidad en IDE**: Se utilizará `AGENTS.md` como mapa maestro, forzando la navegación hacia las referencias en `node_modules`.
3. **Mecanismo de Extensión**: Se implementará un sistema de **Excepciones por Reserva**. Los nombres de ficheros core están protegidos; el sistema sugerirá alternativas si hay conflicto.
4. **Ficheros de Estado**: Los directorios `artifacts/` y `metrics/` permanecen locales. Las constituciones core son privadas (no editables localmente).
5. **Comandos de Creación**: Se implementará funcionalidad dual: comandos CLI para scaffolding y soporte para que el agente (Arquitecto) los ejecute mediante triggers de workflows específicos.

## 3. Criterios de Aceptación Verificables

- [ ] **AC-1 (Zero Copy Core)**: Tras ejecutar `init`, la carpeta `.agent/` local NO debe contener copias de roles, workflows o templates que ya existan en el paquete npm.
- [ ] **AC-2 (Reference Mapping)**: El archivo `.agent/index.md` debe contener alias cuyas rutas apunten a la ubicación absoluta de `node_modules/@cmarino/agentic-workflow`.
- [ ] **AC-3 (Reserved Namespace)**: Intentar crear un rol llamado `architect` localmente mediante el CLI debe lanzar un error indicando que es un nombre reservado.
- [ ] **AC-4 (Local Extensibility)**: El sistema debe permitir cargar un workflow local (ej: `.agent/workflows/custom-task.md`) e incorporarlo al índice global de forma automática.
- [ ] **AC-5 (IDE Discovery)**: Un agente externo (Cursor/Windsurf) debe ser capaz de saltar desde el `AGENTS.md` local hasta una regla core en `node_modules` siguiendo la cadena de links del índice.

## 4. Validación de la tarea
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-20T08:05:00+01:00
    comments: "Confirmado el cambio de arquitectura hacia referencia pura."
```
