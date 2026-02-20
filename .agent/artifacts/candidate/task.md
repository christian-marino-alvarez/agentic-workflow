---
id: candidate
title: Agent Delegation (Inter-Agent Task Routing)
description: >
  Implementar delegación inter-agente donde el architect-agent (u otros coordinadores) 
  pueden asignar sub-tareas a agentes especializados (qa, backend, view, etc.) 
  sin intervención del desarrollador. El agente coordinador recibe el resultado 
  y lo sintetiza para el usuario.
goal: >
  Que el architect-agent pueda delegar tareas a otros agentes dentro de una misma 
  sesión de chat, usando un tool `delegateTask` que invoque internamente otro agente 
  con su personalidad y herramientas, devolviendo el resultado al coordinador.
backlog_ref: T039
domain: D3 - Backend & Agent Orchestration
---
