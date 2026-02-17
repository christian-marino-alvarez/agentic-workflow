---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
---

🏛️ **architect-agent**: Plan de implementación para integrar ChatKit avanzado en webview con backend local.

# Implementation Plan — task-20260130-chatkit-mainview-Integrar ChatKit en mainView

## 1. Resumen del plan
- **Contexto**: Se requiere integrar ChatKit (advanced) en `mainView` con agente dinámico Neo, API key segura y backend local.
- **Resultado esperado**: Webview con ChatKit embebido + botón “Test”, servidor local en extension host que crea agente `gpt-5` por sesión y entrega `client_secret`.
- **Alcance**: Solo rol Neo, sesión por vista; no se persiste `agent_id`. Excluye multi‑agentes y UI avanzada.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/task-20260130-chatkit-mainview/task.md`
- **Analysis**: `.agent/artifacts/task-20260130-chatkit-mainview/analysis.md`
- **Acceptance Criteria**: AC-1..AC-5 en `acceptance.md`.

**Dispatch de dominios (OBLIGATORIO si aplica)**
```yaml
plan:
  workflows:
    - domain: vscode-extension
      action: refactor
      workflow: extension.chatkit.advanced

  dispatch:
    - domain: core
      action: create
      workflow: extension.local-server
```

---

## 3. Desglose de implementación (pasos)

### Paso 1 — Dependencias y configuración
- **Descripción**: Añadir dependencias necesarias de ChatKit/SDK y wiring básico.
- **Dependencias**: npm deps oficiales de OpenAI/ChatKit.
- **Entregables**: package.json actualizado y build OK.
- **Agente responsable**: vscode-specialist.

### Paso 2 — Servidor local ChatKit (extension host)
- **Descripción**: Crear servidor HTTP local con endpoints ChatKit para crear sesión y agente Neo dinámico.
- **Dependencias**: OpenAI SDK/Agents SDK; SecretStorage para API key.
- **Entregables**: módulo servidor, comando “Agentic: Set OpenAI Key”.
- **Agente responsable**: vscode-specialist.

### Paso 3 — Webview embed + botón Test
- **Descripción**: Renderizar ChatKit en `mainView`, configurar CSP/`asExternalUri`, botón Test que envía el mensaje.
- **Dependencias**: servidor local disponible; `apiURL` resuelto.
- **Entregables**: UI funcional en F5.
- **Agente responsable**: vscode-specialist.

### Paso 4 — Verificación y demo
- **Descripción**: Validación manual end‑to‑end, con API key real.
- **Dependencias**: API key configurada en SecretStorage.
- **Entregables**: evidencia de “Hello I am the first agent called Neo”.
- **Agente responsable**: QA (si aplica) + developer.

---

## 4. Asignación de responsabilidades (Agentes)
- **Architect-Agent**
  - Arquitectura, seguridad y gates.
- **vscode-specialist**
  - Implementación webview + backend local.
- **QA / Verification-Agent**
  - Verificación manual (si se asigna).

**Handoffs**
- Architect → vscode-specialist: diseño técnico + CSP/`asExternalUri` + SecretStorage.
- vscode-specialist → Architect: implementación y comandos registrados.

**Componentes (si aplica)**
- Servidor local ChatKit (nuevo) en extension host.

**Demo (si aplica)**
- Botón “Test” dispara mensaje y respuesta en UI.

---

## 5. Estrategia de testing y validación
- **Unit tests**: No previstos (integración UI + red).
- **Integration tests**: `npm run compile`.
- **E2E / Manual**: F5 + set API key + abrir view + botón Test.

**Trazabilidad**
- AC-1/3/5: validación manual de UI.
- AC-2/4: verificación de SecretStorage y sin key en webview.

---

## 6. Plan de demo (si aplica)
- **Objetivo de la demo**: Probar conversación real con el agente Neo.
- **Escenario(s)**: Abrir `mainView`, click “Test”.
- **Datos de ejemplo**: “Hello I am the first agent called Neo”.
- **Criterios de éxito de la demo**: respuesta visible en el chat.

---

## 7. Estimaciones y pesos de implementación
- Paso 1: bajo
- Paso 2: alto
- Paso 3: medio
- Paso 4: medio

---

## 8. Puntos críticos y resolución
- **Punto crítico 1**: `asExternalUri` para acceso al servidor local.
  - Riesgo: sin acceso en Remote.
  - Resolución: uso obligatorio de `asExternalUri`.
- **Punto crítico 2**: ChatKit advanced requiere endpoints específicos.
  - Riesgo: incompatibilidad si falta endpoint.
  - Resolución: seguir contrato oficial de ChatKit advanced.

---

## 9. Dependencias y compatibilidad
- **Dependencias internas**: `mainView`, activación, SecretStorage.
- **Dependencias externas**: OpenAI ChatKit/Agents SDK.
- **Compatibilidad entre navegadores**: N/A (Electron Webview).
- **Restricciones arquitectónicas**: API key nunca en webview.

---

## 10. Criterios de finalización
- UI ChatKit embebida con botón Test.
- Agente Neo dinámico (gpt-5) por sesión.
- API key en SecretStorage.
- Demo validada en F5.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
Este plan **requiere aprobación explícita y binaria**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-30T00:00:00Z
    comments: null
```
