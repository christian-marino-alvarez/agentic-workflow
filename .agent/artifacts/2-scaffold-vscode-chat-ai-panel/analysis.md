---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 2-scaffold-vscode-chat-ai-panel
---

🏛️ **architect-agent**: Analisis para migracion de extension al root con scaffold de chat AI.

# Analysis — 2-scaffold-vscode-chat-ai-panel

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen ejecutivo
**Problema**
- La extension vive en `src/extension` y el host no carga el manifest correcto desde el root.

**Objetivo**
- Migrar la extension al root con `package.json` unico y `src/`/`out/` en root sin romper el scaffold.

**Criterio de éxito**
- Activity Bar muestra el icono Agentic desde el root y el scaffold se carga sin warnings.

---

## 2. Estado del proyecto (As-Is)
- **Estructura relevante**
  - Extension actual en `src/extension` con `package.json`, `src/`, `out/`.
  - Root tiene su propio `package.json` y `.vscode`.
- **Componentes existentes**
  - WebviewViewProvider, Chat Participant y recursos en `src/extension`.
- **Nucleo / capas base**
  - Build via `tsc` en la extension.
- **Artifacts / tareas previas**
  - Correcciones de IDs del view container realizadas en subcarpeta.
- **Limitaciones detectadas**
  - Extension host del root no encuentra viewsContainers en el manifest correcto.

---

## 3. Cobertura de Acceptance Criteria

### AC-1 (Extension en root con package unico)
- **Interpretación**
  - `package.json` del root define la extension y no existe entrypoint activo en `src/extension`.
- **Verificación**
  - `code --extensionDevelopmentPath=.` carga la extension y el view container aparece.
- **Riesgos / ambigüedades**
  - Conflicto entre scripts y dependencias del root.

### AC-2 (Chat mock + input)
- **Interpretación**
  - UI mock permanece funcional tras mover `src/`.
- **Verificación**
  - Webview renderiza mensajes mock e input.
- **Riesgos / ambigüedades**
  - Rutas a recursos cambian al mover.

### AC-3 (Chat + panel inferior)
- **Interpretación**
  - Layout del webview mantiene panel inferior.
- **Verificación**
  - HTML/CSS intacto tras migracion.
- **Riesgos / ambigüedades**
  - Ninguno relevante.

### AC-4 (Foco sin recrear)
- **Interpretación**
  - Comando `openChat` sigue enfocando la vista existente.
- **Verificación**
  - `Agentic: Open Chat` no crea duplicados.
- **Riesgos / ambigüedades**
  - IDs cambiados deben ser consistentes en root.

### AC-5 (Scaffold completo)
- **Interpretación**
  - Chat Participant sigue registrado y visible en Chat UI.
- **Verificación**
  - `@agentic` responde en panel de chat.
- **Riesgos / ambigüedades**
  - API de chat requiere version especifica de VS Code.

---

## 4. Research técnico

- **Alternativa A**
  - Migrar archivos de extension al root y eliminar `src/extension` como entrypoint.
  - Ventajas: Extension root unica, simplifica launch.
  - Inconvenientes: Ajuste de scripts y paths en root.

- **Alternativa B**
  - Mantener subcarpeta y ajustar launch para apuntar a `src/extension`.
  - Ventajas: Menos cambios.
  - Inconvenientes: No cumple el requerimiento de integracion total.

**Decisión recomendada (si aplica)**
- Alternativa A para cumplir el alcance aprobado.

---

## 5. Agentes participantes
- **Architect-Agent**
  - Responsabilidades: Analisis, validacion de fases, actualizacion de artifacts.
- **Dev-agent**
  - Responsabilidades: Mover archivos, actualizar paths y scripts, limpiar duplicados.
- **QA-agent**
  - Responsabilidades: Verificacion de build y extension host.

**Handoffs**
- Architect define plan -> Dev ejecuta migracion -> QA verifica.

**Componentes necesarios**
- Crear/modificar: root `package.json`, `tsconfig.json`, `src/`, `out/`, `.vscode/launch.json`.

**Demo (si aplica)**
- No requiere demo; validacion con Extension Host.

---

## 6. Impacto de la tarea
- **Arquitectura**
  - Extension pasa a vivir en root.
- **APIs / contratos**
  - `package.json` root como manifesto.
- **Compatibilidad**
  - Ajuste de scripts y build.
- **Testing / verificación**
  - `npm test` desde root y ejecución de Extension Host.

---

## 7. Riesgos y mitigaciones
- **Riesgo 1**
  - Conflicto entre dependencias root y extension.
  - Impacto: build roto.
  - Mitigación: fusion controlado y limpieza de duplicados.
- **Riesgo 2**
  - Rutas de build/launch incorrectas.
  - Impacto: extension no carga.
  - Mitigación: actualizar `tsconfig` y `.vscode/launch.json`.

---

## 8. Preguntas abiertas
- Ninguna.

---

## 9. TODO Backlog (Consulta obligatoria)

> [!IMPORTANT]
> El architect-agent **DEBE** consultar `.agent/todo/` antes de completar el análisis.

**Referencia**: `.agent/todo/`

**Estado actual**: vacio (directorio inexistente)

**Items relevantes para esta tarea**:
- Ninguno

**Impacto en el análisis**:
- Sin impacto.

---

## 10. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-25T11:16:44Z
    comments: null
```
