---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 3-new-vscode-agentic-activitybar-chat
---

🏛️ **architect-agent**: Plan de implementacion para nuevo proyecto vscode-agentic.

# Implementation Plan — 3-new-vscode-agentic-activitybar-chat

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen del plan
- **Contexto**: Crear extension desde cero en nuevo proyecto hermano.
- **Resultado esperado**: Activity Bar con chat nativo y panel inferior webview.
- **Alcance**: Scaffold completo, sin integraciones reales.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/3-new-vscode-agentic-activitybar-chat/task.md`
- **Analysis**: `.agent/artifacts/3-new-vscode-agentic-activitybar-chat/analysis.md`
- **Acceptance Criteria**: `.agent/artifacts/3-new-vscode-agentic-activitybar-chat/acceptance.md`

**Dispatch de dominios (OBLIGATORIO si aplica)**
```yaml
plan:
  workflows:
    - domain: vscode-agentic
      action: create
      workflow: phase-4-implementation

  dispatch: []
```

---

## 3. Desglose de implementación (pasos)

### Paso 1
- **Descripción**: Crear carpeta `../vscode-agentic` y scaffold inicial de extension (package.json, tsconfig, src/extension.ts).
- **Dependencias**: Ninguna.
- **Entregables**: Proyecto base compilable.
- **Agente responsable**: dev-agent.

### Paso 2
- **Descripción**: Configurar contribution points para Activity Bar, view y comando.
- **Dependencias**: Paso 1.
- **Entregables**: `package.json` con viewsContainers, views, activationEvents y comandos.
- **Agente responsable**: dev-agent.

### Paso 3
- **Descripción**: Implementar WebviewViewProvider con UI mock de panel inferior.
- **Dependencias**: Paso 2.
- **Entregables**: `src/view-provider.ts` o similar.
- **Agente responsable**: dev-agent.

### Paso 4
- **Descripción**: Registrar Chat Participant con respuesta mock.
- **Dependencias**: Paso 2.
- **Entregables**: Registro en `src/extension.ts`.
- **Agente responsable**: dev-agent.

### Paso 5
- **Descripción**: Ajustar launch.json y scripts para ejecutar Extension Host.
- **Dependencias**: Paso 1.
- **Entregables**: `.vscode/launch.json` en el nuevo proyecto.
- **Agente responsable**: dev-agent.

---

## 4. Asignación de responsabilidades (Agentes)

- **Architect-Agent**: contrato y validacion.
- **Implementation-Agent (dev-agent)**: scaffold y configuracion del proyecto.
- **QA / Verification-Agent**: pruebas y verificacion manual.

**Handoffs**
- Architect -> Dev -> QA -> Architect.

**Componentes (si aplica)**
- Nuevos archivos y carpetas en `vscode-agentic`.

**Demo (si aplica)**
- Ejecutar Extension Host y mostrar vista.

---

## 5. Estrategia de testing y validación
- **Unit tests**
  - `npm test` en el nuevo proyecto.
- **Integration tests**
  - N/A.
- **E2E / Manual**
  - F5 y validacion visual de Activity Bar.

**Trazabilidad**
- AC-1: nuevo proyecto + icono.
- AC-2: chat y panel mock.
- AC-3/4/5: vista y foco.

---

## 6. Plan de demo (si aplica)
- **Objetivo de la demo**: Validar vista y chat.
- **Escenario(s)**: F5, icono Agentic visible.
- **Datos de ejemplo**: Mensajes mock.
- **Criterios de éxito**: chat responde y panel visible.

---

## 7. Estimaciones y pesos de implementación
- **Estimación por paso / subárea**
  - Paso 1-2: medio
  - Paso 3-4: medio
  - Paso 5: bajo
- **Timeline aproximado**: 0.5-1 dia.
- **Suposiciones**: no hay conflictos con otros proyectos.

---

## 8. Puntos críticos y resolución
- **Punto crítico 1**
  - Riesgo: manifest incorrecto.
  - Impacto: icono no aparece.
  - Estrategia: validar paths y launch.
- **Punto crítico 2**
  - Riesgo: confusion entre chat nativo y webview.
  - Impacto: expectativa de UI.
  - Estrategia: documentar separacion.

---

## 9. Dependencias y compatibilidad
- **Dependencias internas**
  - `package.json`, `src`, `out`, `.vscode` del nuevo proyecto.
- **Dependencias externas**
  - VS Code APIs.
- **Compatibilidad entre navegadores**
  - N/A.
- **Restricciones arquitectónicas**
  - Clean code.

---

## 10. Criterios de finalización
- Proyecto `vscode-agentic` creado.
- Icono en Activity Bar visible.
- Chat Participant mock responde.
- Panel inferior con datos mock visible.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
Este plan **requiere aprobación explícita y binaria**.

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```
