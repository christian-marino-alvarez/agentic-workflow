---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 2-scaffold-vscode-chat-ai-panel
---

🏛️ **architect-agent**: Plan para migrar la extension al root manteniendo scaffold.

# Implementation Plan — 2-scaffold-vscode-chat-ai-panel

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen del plan
- **Contexto**: Extension en subcarpeta causa warning de view container.
- **Resultado esperado**: Extension vive en root con manifest unico y scaffold funcionando.
- **Alcance**: Mover `src/extension` al root, ajustar `package.json`, `tsconfig`, scripts y paths.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/2-scaffold-vscode-chat-ai-panel/task.md`
- **Analysis**: `.agent/artifacts/2-scaffold-vscode-chat-ai-panel/analysis.md`
- **Acceptance Criteria**: `.agent/artifacts/2-scaffold-vscode-chat-ai-panel/acceptance.md`

**Dispatch de dominios (OBLIGATORIO si aplica)**
```yaml
plan:
  workflows:
    - domain: root
      action: refactor
      workflow: phase-4-implementation

  dispatch: []
```

---

## 3. Desglose de implementación (pasos)

### Paso 1
- **Descripción**: Copiar `src/extension/src` a `./src` y `src/extension/out` a `./out`.
- **Dependencias**: Ninguna.
- **Entregables**: `src/` y `out/` en root con codigo de extension.
- **Agente responsable**: dev-agent.

### Paso 2
- **Descripción**: Reemplazar `package.json` root por el de la extension, preservando metadatos necesarios del repo.
- **Dependencias**: Paso 1.
- **Entregables**: `package.json` unico en root con contribuciones y scripts de extension.
- **Agente responsable**: dev-agent.

### Paso 3
- **Descripción**: Mover `tsconfig.json`, `eslint` config y scripts necesarios desde `src/extension` al root.
- **Dependencias**: Paso 2.
- **Entregables**: `tsconfig.json`, `eslint.config.mjs`, `package-lock.json` en root coherentes.
- **Agente responsable**: dev-agent.

### Paso 4
- **Descripción**: Eliminar o archivar `src/extension` como entrypoint activo.
- **Dependencias**: Paso 3.
- **Entregables**: `src/extension` removido o con placeholder sin uso.
- **Agente responsable**: dev-agent.

### Paso 5
- **Descripción**: Ajustar `.vscode/launch.json` del root para usar `--extensionDevelopmentPath=${workspaceFolder}` y `outFiles` root.
- **Dependencias**: Paso 2.
- **Entregables**: Launch config actualizado.
- **Agente responsable**: dev-agent.

---

## 4. Asignación de responsabilidades (Agentes)

- **Architect-Agent**
  - Responsabilidades: Validacion de fases, coherencia con AC.
- **Implementation-Agent (dev-agent)**
  - Responsabilidades: Migracion de archivos, actualizacion de configs y scripts.
- **QA / Verification-Agent**
  - Responsabilidades: Verificar build y extension host desde root.

**Handoffs**
- Architect aprueba plan -> Dev migra -> QA verifica -> Architect valida.

**Componentes (si aplica)**
- Se mueven `src/`, `out/`, `package.json` y configs al root.

**Demo (si aplica)**
- Demo manual: abrir Extension Host desde root y ver icono Agentic en Activity Bar.

---

## 5. Estrategia de testing y validación
- **Unit tests**
  - `npm test` desde root.
- **Integration tests**
  - N/A.
- **E2E / Manual**
  - Abrir Extension Host y verificar view container.

**Trazabilidad**
- AC-1: Extension en root con icono.
- AC-2/3: UI mock en webview.
- AC-4: Comando de foco.
- AC-5: Chat Participant registrado.

---

## 6. Plan de demo (si aplica)
- **Objetivo de la demo**: Mostrar icono Agentic y vista funcional desde root.
- **Escenario(s)**: F5 desde root, abrir `Agentic: Open Chat`.
- **Datos de ejemplo**: Mensajes mock.
- **Criterios de éxito de la demo**: Vista aparece sin warnings.

---

## 7. Estimaciones y pesos de implementación
- **Estimación por paso / subárea**
  - Paso 1-2: alto
  - Paso 3-4: medio
  - Paso 5: bajo
- **Timeline aproximado**: 0.5-1 dia.
- **Suposiciones**: No hay dependencias externas del root que se deban preservar.

---

## 8. Puntos críticos y resolución
- **Punto crítico 1**
  - Riesgo: Perder scripts/root metadata.
  - Impacto: build del repo roto.
  - Estrategia de resolución: revisar cambios y conservar metadata necesaria.
- **Punto crítico 2**
  - Riesgo: Paths de build no actualizados.
  - Impacto: extension no carga.
  - Estrategia de resolución: revisar `tsconfig`, `main`, `outFiles`.

---

## 9. Dependencias y compatibilidad
- **Dependencias internas**
  - `package.json`, `tsconfig.json`, `src`, `out`.
- **Dependencias externas**
  - VS Code extension host.
- **Compatibilidad entre navegadores**
  - N/A.
- **Restricciones arquitectónicas**
  - Clean code y separacion de responsabilidades.

---

## 10. Criterios de finalización
- Extension se ejecuta desde root sin warning de view container.
- Icono Agentic visible en Activity Bar.
- Scaffold de chat y panel inferior visibles.
- Chat Participant responde con mock.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
Este plan **requiere aprobación explícita y binaria**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-25T11:18:56Z
    comments: null
```
