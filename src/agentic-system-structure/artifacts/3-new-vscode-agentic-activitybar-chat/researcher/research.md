---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 3-new-vscode-agentic-activitybar-chat
---

🔍 **researcher-agent**: Informe de investigacion tecnica para nuevo proyecto vscode-agentic.

# Research Report — 3-new-vscode-agentic-activitybar-chat

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

> [!CAUTION]
> **REGLA PERMANENT**: Este documento es SOLO documentación.
> El researcher-agent documenta hallazgos SIN analizar, SIN recomendar, SIN proponer soluciones.
> El análisis corresponde a Phase 2.

## 1. Resumen ejecutivo
- Problema investigado: Crear nueva extension VS Code con Activity Bar + Chat Participant + panel webview inferior.
- Objetivo de la investigacion: Identificar APIs para viewsContainers, WebviewView, Chat Participant y registro de comandos.
- Principales hallazgos: Contribution points `viewsContainers`/`views`, `WebviewViewProvider`, Chat Participant API.

---

## 2. Necesidades detectadas
- Requisitos tecnicos identificados por el architect-agent:
  - Crear proyecto nuevo con manifest de extension.
  - Definir view container en Activity Bar.
  - Registrar WebviewView para panel inferior.
  - Registrar Chat Participant para chat nativo.
- Suposiciones y limites:
  - El panel inferior puede ser webview dentro de la vista.

---

## 3. Hallazgos técnicos
- Contribution points: viewsContainers / views
  - Descripcion: Declaran contenedores y vistas en Activity Bar.
  - Estado actual: Estable.
  - Documentación oficial: https://code.visualstudio.com/api/references/contribution-points#contributes.viewsContainers
  - Limitaciones conocidas: IDs deben ser consistentes y estar en el manifest de la extension.

- WebviewViewProvider
  - Descripcion: Provee webviews embebidos en Activity Bar.
  - Estado actual: Estable.
  - Documentación oficial: https://code.visualstudio.com/api/references/vscode-api#WebviewView
  - Limitaciones conocidas: Se registra con `registerWebviewViewProvider`.

- Chat Participant API
  - Descripcion: Permite chat nativo via `vscode.chat.createChatParticipant`.
  - Estado actual: Documentada.
  - Documentación oficial: https://code.visualstudio.com/api/extension-guides/chat
  - Limitaciones conocidas: Respuestas via `ChatResponseStream`.

---

## 4. APIs relevantes
- `contributes.viewsContainers`
  - Estado de soporte: VS Code estable.
  - Restricciones conocidas: manifest en root del proyecto.

- `contributes.views`
  - Estado de soporte: VS Code estable.
  - Restricciones conocidas: `type: webview` si aplica.

- `registerWebviewViewProvider`
  - Estado de soporte: VS Code API estable.
  - Restricciones conocidas: requiere viewType coincidente.

- `vscode.chat.createChatParticipant`
  - Estado de soporte: VS Code API documentada.
  - Restricciones conocidas: requiere handler compatible con `ChatResponseStream`.

---

## 5. Compatibilidad multi-browser
- N/A (VS Code Electron).

---

## 6. Oportunidades AI-first detectadas
- N/A en esta fase (scaffold inicial).

---

## 7. Riesgos identificados
- Riesgo: View container no registrado si manifest no es el correcto.
  - Severidad: media
  - Fuente: https://code.visualstudio.com/api/references/contribution-points
- Riesgo: Chat Participant requiere version compatible de VS Code.
  - Severidad: baja
  - Fuente: https://code.visualstudio.com/api/extension-guides/chat

---

## 8. Fuentes
- https://code.visualstudio.com/api/references/contribution-points
- https://code.visualstudio.com/api/references/contribution-points#contributes.viewsContainers
- https://code.visualstudio.com/api/references/vscode-api#WebviewView
- https://code.visualstudio.com/api/extension-guides/chat

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-25T11:32:00Z
    comments: null
```
