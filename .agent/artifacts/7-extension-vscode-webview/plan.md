---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 7-extension-vscode-webview
---

# Implementation Plan — 7-extension-vscode-webview

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

🏛️ **architect-agent**: Plan de implementacion para extension VS Code con webview.

## 1. Resumen del plan
- **Contexto**: Crear extension VS Code con Activity Bar, webview en sidebar y estructura ESM de views.
- **Resultado esperado**: Extension registrada con contenedor + view unica, webview “Hello world”, `views/index.ts` exportando `MainChatView`, icono minimalista en Activity Bar, y `engines.vscode` fijado.
- **Alcance**: Estructura base de extension y view unica; se excluyen funcionalidades de chat real.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/7-extension-vscode-webview/task.md`
- **Analysis**: `.agent/artifacts/7-extension-vscode-webview/analysis.md`
- **Acceptance Criteria**: AC-1..AC-6.

**Dispatch de dominios (OBLIGATORIO si aplica)**
```yaml
plan:
  workflows:
    - domain: vscode-extension
      action: create
      workflow: role.vscode-specialist

  dispatch:
    - domain: qa
      action: verify
      workflow: role.qa
```

---

## 3. Desglose de implementación (pasos)

### Paso 1
- **Descripción**: Reintroducir carpeta `src/extension` con estructura mínima (`extension.ts`, `views/`).
- **Dependencias**: Ninguna.
- **Entregables**: `src/extension/extension.ts`, `src/extension/views/index.ts`, `src/extension/views/main-view.ts`.
- **Agente responsable**: vscode-specialist.

### Paso 2
- **Descripción**: Configurar `package.json` para contribution points (viewsContainers, views), `activationEvents` con `onView`, y `engines.vscode` = `^1.108.2`.
- **Dependencias**: Paso 1.
- **Entregables**: `package.json` actualizado.
- **Agente responsable**: vscode-specialist.

### Paso 3
- **Descripción**: Implementar `WebviewViewProvider` con script y estado “Hello world”.
- **Dependencias**: Paso 1.
- **Entregables**: Provider en `extension.ts` y view `MainChatView`.
- **Agente responsable**: vscode-specialist.

### Paso 4
- **Descripción**: Crear icono SVG minimalista para Activity Bar y referenciarlo en el manifest.
- **Dependencias**: Paso 2.
- **Entregables**: `media/agent-chat.svg` y manifest apuntando a `media/agent-chat.svg`.
- **Agente responsable**: vscode-specialist.

### Paso 5
- **Descripción**: Validacion manual: abrir VS Code, ver Activity Bar, abrir view y confirmar “Hello world”.
- **Dependencias**: Pasos 1–4.
- **Entregables**: Evidencia manual (captura o nota en verificacion).
- **Agente responsable**: qa-agent.

---

## 4. Asignación de responsabilidades (Agentes)
- **Architect-Agent**
  - Responsable de gates y coherencia con AC.
- **vscode-specialist**
  - Implementacion de extension, views, manifest, icono.
- **QA-Agent**
  - Validacion manual basica y reporte.

**Handoffs**
- architect -> vscode-specialist (plan + AC)
- vscode-specialist -> qa-agent (build/extension lista)

**Componentes (si aplica)**
- **Componentes a crear**: `src/extension/**`, `media/agent-chat.svg`.
- **Como se implementa**: con estructura ESM y APIs oficiales de VS Code.
- **Herramienta**: N/A (implementación manual).

**Demo (si aplica)**
- No aplica demo aparte; la vista en Activity Bar actua como demo minima.

---

## 5. Estrategia de testing y validación
- **Unit tests**
  - No se definen en esta fase (no hay lógica compleja).
- **Integration tests**
  - No aplica.
- **E2E / Manual**
  - Abrir VS Code, verificar Activity Bar, abrir view y ver “Hello world”.

**Trazabilidad**
- AC-1/AC-6: se valida con Activity Bar + icono visible.
- AC-2: validación de exports en `views/index.ts`.
- AC-3: webview muestra “Hello world”.
- AC-4: `engines.vscode` en `package.json`.
- AC-5: activación `onView` funciona.

---

## 6. Plan de demo (si aplica)
- **Objetivo de la demo**: mostrar contenedor en Activity Bar con icono y vista “Hello world”.
- **Escenario(s)**: abrir VS Code, hacer click en icono y ver la view.
- **Datos de ejemplo**: texto “Hello world”.
- **Criterios de éxito de la demo**: view cargada sin errores.

---

## 7. Estimaciones y pesos de implementación
- **Paso 1**: bajo
- **Paso 2**: bajo
- **Paso 3**: medio
- **Paso 4**: bajo
- **Paso 5**: bajo
- **Timeline aproximado**: 1 dia.
- **Suposiciones**: sin bloqueos en manifest ni build.

---

## 8. Puntos críticos y resolución
- **Punto crítico 1**
  - Riesgo: IDs inconsistentes entre `views`, `viewsContainers` y `activationEvents`.
  - Impacto: la extension no activa o la view no aparece.
  - Estrategia de resolución: validar IDs y probar activación.
- **Punto crítico 2**
  - Riesgo: icono no cumple guidelines o no carga.
  - Impacto: Activity Bar sin icono o inconsistencia visual.
  - Estrategia de resolución: SVG minimalista y ruta valida.

---

## 9. Dependencias y compatibilidad
- **Dependencias internas**
  - `src/extension/**`, `package.json`, `media/`.
- **Dependencias externas**
  - VS Code stable 1.108.2.
- **Compatibilidad entre navegadores**
  - N/A (VS Code desktop).
- **Restricciones arquitectónicas**
  - Seguir `constitution.vscode_extensions` y clean code.

---

## 10. Criterios de finalización
- Checklist final alineado con AC:
  - Activity Bar con icono propio.
  - View única en sidebar.
  - WebviewViewProvider con “Hello world”.
  - `views/index.ts` exporta `MainChatView`.
  - `activationEvents` con `onView:<viewId>`.
  - `engines.vscode` = `^1.108.2`.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
Este plan **requiere aprobación explícita y binaria**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-30T16:31:46Z
    comments: null
```
