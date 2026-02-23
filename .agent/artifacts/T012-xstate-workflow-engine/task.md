---
id: T012
title: "Refactor: XState Workflow Engine + Structured Markdown Parser"
status: in-progress
phase: acceptance-criteria
strategy: long
owner: architect-agent
created: 2026-02-23
---

# T012 — XState Workflow Engine + Structured Markdown Parser

## Objetivo
Refactorizar el motor de workflows para que cada markdown de workflow sea parseado con una estructura uniforme y gestionar las transiciones entre fases con XState. Eliminar prompts hardcodeados. Mostrar secciones parseadas en el Details panel.

## Contexto
El sistema actual usa `rawContent` para inyectar el contenido completo del markdown al LLM, y prompts hardcodeados (`lifecycleStartPrompt`) para guiar las transiciones. Esto causa:
- Fases saltadas (el LLM interpreta libremente)
- Sin enforcement de gates
- Sin trazabilidad de estado entre reinicios
- Details panel sin información estructurada de la fase
