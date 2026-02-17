---
kind: artifact
name: acceptance
source: agentic-system-structure
---

🏛️ **architect-agent**: Acceptance criteria definidos para el scaffolding del chat AI en la extension de VS Code.

# Acceptance Criteria — 2-scaffold-vscode-chat-ai-panel

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Definición Consolidada
Se migrara la extension de VS Code desde `src/extension` al root del repo, dejando un unico `package.json` en el root, con `src/` y `out/` en root. Se mantiene el scaffold de chat AI con Chat Participant y panel inferior accesible desde Activity Bar. Al hacer clic en el icono, se abrira la vista si no existe y se enfocara si ya esta abierta.

## 2. Respuestas a Preguntas de Clarificación
> Esta sección documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿El “icono en la toolbar” se refiere a la Activity Bar (barra lateral izquierda) o a la Toolbar superior del editor? | Activity bar. |
| 2 | ¿El panel debe abrirse como “View” en la barra lateral, como Webview Panel independiente, o como panel inferior (Panel)? | Quiero que se abra el chat AI y debajo el panel. |
| 3 | ¿Qué elementos mínimos debe incluir el scaffold del chat (por ejemplo: header, lista de mensajes, input con botón enviar, estado vacío)? | SI. |
| 4 | ¿Debemos incluir datos mock/placeholder (mensajes simulados) o dejar todo vacío con estados base? | Datos mockeados. |
| 5 | ¿Qué comportamiento inicial esperas al hacer clic en el icono (abrir panel si no existe, enfocar si ya está abierto, recordar estado entre sesiones)? | Abirir el panel si no existe y si existe hacer foco. |

---

## 3. Criterios de Aceptación Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - La extension se ejecuta desde el root del repo con `package.json` unico y `src/`/`out/` en root.
   - Existe un icono en la Activity Bar que abre la vista del chat AI.

2. Entradas / Datos:
   - El UI base del chat muestra mensajes mockeados y un input de envio, usando la API de Chat Participant para el canal de chat.

3. Salidas / Resultado esperado:
   - Al activar el icono, el chat AI basado en Chat Participant se muestra y debajo se renderiza un panel adicional dentro de la misma vista.

4. Restricciones:
   - Si el panel ya esta abierto, la accion solo hace foco sin recrearlo.
   - No quedan restos de `src/extension` como entrypoint activo.

5. Criterio de aceptación (Done):
   - El scaffold permite abrir, enfocar y visualizar el chat AI con panel inferior y datos mockeados desde la Activity Bar en el root integrado.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI # SI | NO
    date: 2026-01-25T11:01:15Z
    comments: null
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-25T07:38:14Z"
    notes: "Acceptance criteria definidos"
```
