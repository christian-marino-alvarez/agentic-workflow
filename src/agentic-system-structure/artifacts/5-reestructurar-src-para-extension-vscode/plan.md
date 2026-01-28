---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: approved
related_task: 5-reestructurar-src-para-extension-vscode
---

# Implementation Plan — 5-reestructurar-src-para-extension-vscode

🏛️ **architect-agent**: Plan detallado para la migración y scaffolding de extensión VSCode.

## 1. Resumen del plan
- **Contexto**: Migración de la estructura del repositorio actual para convertirlo en una extensión de VSCode sin perder el sistema legacy. Adaptación de scripts y generación de scaffolding.
- **Resultado esperado**: `src/` híbrido donde conviven la extensión (raíz de `src`) y el sistema antiguo (en `src/agentic-system-structure`). Scripts de build actualizados. Setup de debugging VSCode funcional.
- **Alcance**: Reestructuración de carpetas, scaffolding con Yeoman, merge de configuración, refactor de scripts build. Tests de extensión básicos.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/5-reestructurar-src-para-extension-vscode/task.md`
- **Analysis**: `.agent/artifacts/5-reestructurar-src-para-extension-vscode/analysis.md`
- **Acceptance Criteria**: AC-1 (Estructura), AC-2 (Scripts), AC-3 (Yeoman), AC-4 (Hello World).

**Dispatch de dominios**
```yaml
plan:
  workflows:
    - domain: tasks
      action: refactor
      workflow: workflow.tasklifecycle-long.phase-4-implementation
  dispatch: []
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Reestructuración de Carpetas
- **Descripción**: Crear `src/agentic-system-structure` y mover directorios existentes (`cli`, `core`, `rules`, `templates`, `workflows`, `artifacts`, `index.md`).
- **Dependencias**: Ninguna.
- **Entregables**: Estructura de ficheros actualizada.
- **Agente responsable**: dev-agent

### Paso 2: Scaffolding con Yeoman (Temporal)
- **Descripción**: Generar una extensión nueva en `/tmp/vscode-ext-temp` usando `yo code` (TypeScript, npm).
- **Dependencias**: node_modules instalado en global o usar npx.
- **Entregables**: Código base de extension para merge.
- **Agente responsable**: dev-agent

### Paso 3: Merge de Ficheros de Extensión
- **Descripción**: Copiar selectivamente desde `/tmp` a la raíz del proyecto:
  - `src/extension.ts`, `src/test/*` -> a `src/`.
  - `.vscode/*` -> merge con existente (si hay) o copiar.
  - `.vscodeignore`, `vsc-extension-quickstart.md`.
- **Dependencias**: Paso 1, Paso 2.
- **Entregables**: Ficheros de extensión inyectados en `src`.
- **Agente responsable**: dev-agent

### Paso 4: Merge de Configuración (package.json & tsconfig.json)
- **Descripción**:
  - `package.json`: Fusionar `devDependencies` (@types/vscode, etc), `scripts` (vscode:prepublish, compile, watch), `engines`, `activationEvents`, `contributes`, `main`.
  - `tsconfig.json`: Asegurar compatibilidad para compilar tanto extensión como subsistema.
- **Dependencias**: Paso 3.
- **Entregables**: `package.json` y `tsconfig.json` unificados.
- **Agente responsable**: dev-agent

### Paso 5: Refactorización de Scripts Legacy
- **Descripción**: Actualizar `scripts/build-bootstrap-test.mjs`, `clean-dist.mjs` y referencias en `package.json` para apuntar a `src/agentic-system-structure`.
- **Dependencias**: Paso 1.
- **Entregables**: Scripts funcionando contra nueva ruta.
- **Agente responsable**: dev-agent

---

## 4. Asignación de responsabilidades (Agentes)

- **Architect-Agent**
  - Supervisión del plan y validación de hitos.
- **Dev-Agent**
  - Ejecución de comandos de filesystem, Yeoman y edición de código.
- **QA-Agent**
  - Verificación final de estructura y ejecución de tests.

**Componentes**:
- **Yeoman (yo code)**: Herramienta externa obligatoria por contrato. El dev-agent la invocará via `npx` o globalmente si está disponible, o mediante script temporal. Se usará `npx generator-code` o similar si `yo` no está en path, pero la instrucción es "usar yeoman".

---

## 5. Estrategia de testing y validación

- **Unit tests**
  - Ejecutar tests existentes del sistema legacy (asegurar que no rompen por cambio de ruta).
  - Ejecutar tests básicos generados por Yeoman (`src/test/runTest.ts`).
- **Integration tests**
  - Verificar que `npm run build` genera el `dist` correctamente.
- **E2E / Manual**
  - Lanzar Debug (F5) -> Extension Development Host.
  - Ejecutar comando "Hello World" desde palette.

**Trazabilidad**:
- AC-1 -> Paso 1 & Paso 3
- AC-2 -> Paso 5
- AC-3 -> Paso 2 & Paso 3 & Paso 4
- AC-4 -> Paso 4 (Merge correcto) & Validación Manual

---

## 6. Plan de demo
- **Objetivo**: Demostrar que la extensión carga y que el sistema legacy sigue construyéndose.
- **Escenario**:
  1. Abrir proyecto en VSCode.
  2. Ejecutar `npm run build` -> Éxito.
  3. F5 -> Lanzar extensión.
  4. Palette -> "Hello World" -> Notificación visible.

---

## 7. Estimaciones y pesos de implementación
- **Paso 1 (Move)**: Bajo.
- **Paso 2 (Yeoman)**: Medio (dependencia externa, interactive inputs).
- **Paso 3 (Merge)**: Medio.
- **Paso 4 (Config)**: Alto (riesgo de conflictos JSON, dependencias).
- **Paso 5 (Scripts)**: Medio.

---

## 8. Puntos críticos y resolución
- **Punto crítico 1**: `package.json` corrupto tras merge manual.
  - *Mitigación*: Backup previo de `package.json`. Validación JSON estricta tras edición.
- **Punto crítico 2**: `tsconfig.json` incompatible (legacy vs extension).
  - *Mitigación*: Intentar configuración única permisiva. Si falla, separar `tsconfig.json` (raíz) y `src/agentic-system-structure/tsconfig.json`.

---

## 9. Dependencias y compatibilidad
- **Dependencias externas**: `yo`, `generator-code`, VSCode API.
- **Compatibilidad**: Node.js >= 18.

---

## 10. Criterios de finalización
- Estructura de carpetas correcta.
- `package.json` válido y completo.
- Build legacy exitoso.
- Extension Host lanza sin errores.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-27T23:20:00+01:00
    comments: Aprobado.
```
