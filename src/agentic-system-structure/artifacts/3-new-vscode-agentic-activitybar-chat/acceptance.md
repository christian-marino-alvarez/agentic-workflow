---
kind: artifact
name: acceptance
source: agentic-system-structure
---

🏛️ **architect-agent**: Acceptance criteria definidos para nuevo proyecto vscode-agentic.

# Acceptance Criteria — 3-new-vscode-agentic-activitybar-chat

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Definición Consolidada
Se creara un nuevo proyecto `vscode-agentic` al mismo nivel que `agentic-workflow`. La extension tendra un icono en Activity Bar que abre una vista con chat nativo de VS Code usando Chat Participant API y, debajo, un panel webview con datos de sesion, tareas e historial/estadisticas. Al hacer clic en el icono, la vista se abre y enfoca. El chat respondera con un mensaje mock para validar integracion.

## 2. Respuestas a Preguntas de Clarificación
> Esta sección documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Dónde debe vivir el nuevo proyecto `vscode-agentic`? | Al mismo nivel que `agentic-workflow`. |
| 2 | ¿El “chat nativo de VS Code” se refiere a usar Chat Participant API? | Si, usando Chat Participant API. |
| 3 | ¿El sidebar debe mostrar chat y debajo un panel webview con datos? | Debe mostrar chat y debajo un panel webview con sesion, tareas, historico y estadisticas. |
| 4 | ¿Qué comportamiento esperas al hacer clic en el icono? | Abrir el chat y el panel debajo. |
| 5 | ¿Debe incluir un mensaje mock del chat participant? | Si. |

---

## 3. Criterios de Aceptación Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - Existe un nuevo proyecto `vscode-agentic` como hermano de `agentic-workflow`.
   - La extension expone un icono en la Activity Bar.

2. Entradas / Datos:
   - El chat responde con un mensaje mock via Chat Participant.
   - El panel inferior muestra datos mock de sesion, tareas e historico/estadisticas.

3. Salidas / Resultado esperado:
   - Al activar el icono, se muestra la vista con chat y panel inferior.

4. Restricciones:
   - El chat usa Chat Participant API (no webview propia para el chat).
   - La vista se enfoca si ya esta abierta.

5. Criterio de aceptación (Done):
   - El scaffold abre la vista desde Activity Bar, con chat nativo funcionando y panel inferior webview con datos mock.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI # SI | NO
    date: 2026-01-25T11:29:04Z
    comments: null
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-25T11:27:40Z"
    notes: "Acceptance criteria definidos"
```
