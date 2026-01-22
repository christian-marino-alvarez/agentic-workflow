🏛️ **architect-agent**: He diseñado el plan de implementación detallado para el Wizard de migración y actualización.

---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 28-Agent System Update & Conversion System
---

# Implementation Plan — 28-Agent System Update & Conversion System

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Responsable del diseño, orquestación y validación del plan de migración.

## 1. Resumen del plan
- **Contexto**: Migración del sistema agéntico local (`.agent/`) al nuevo estándar portable de `@cmarino/agentic-workflow`.
- **Resultado esperado**: Un nuevo comando `update` en el CLI (o lógica mejorada en `init`) que detecte instalaciones previas, haga backup y migre el contenido garantizando compatibilidad con la nueva disciplina.
- **Alcance**: Modificación del paquete `agentic-workflow`. Incluye: detección de legacy, backup, scaffolding de nueva versión, migración de `artifacts` y actualización de frontmatter en archivos de usuario.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/28-agent-system-update-conversion/task.md`
- **Analysis**: `.agent/artifacts/28-agent-system-update-conversion/analysis.md`
- **Acceptance Criteria**: AC-1 al AC-5 definidos en `acceptance.md`.

**Dispatch de dominios (OBLIGATORIO si aplica)**
```yaml
plan:
  workflows:
    drivers:
      action: none
      workflow: null

  dispatch:
    - domain: core
      action: refactor
      workflow: workflow.modules.refactor
    - domain: qa
      action: verify
      workflow: phase-5-verification
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Infraestructura de Detección y Mocking
- **Descripción**: Crear utilidades en el core para identificar versiones legacy basándose en firmas de archivos (`index.md`, `rules/index.md`).
- **Dependencias**: Ninguna.
- **Entregables**: `src/core/migration/detector.ts`.
- **Agente responsable**: architect-agent (diseño) / tooling-agent (implementación).

### Paso 2: Lógica de Backup y Scaffolding
- **Descripción**: Implementar la rutina de seguridad que mueve `.agent/` a un backup con timestamp antes de invocar el nuevo scaffolding.
- **Dependencias**: Paso 1.
- **Entregables**: `src/core/migration/backup.ts`, actualización de `initCommand`.
- **Agente responsable**: tooling-agent.

### Paso 3: Motor de Transformación de Contenido (AST/MD)
- **Descripción**: Implementar la lógica que recorre los archivos del backup y restaura los `artifacts/` de tareas, inyectando los campos de frontmatter obligatorios (`id`, `version`, `severity`).
- **Dependencias**: Paso 2.
- **Entregables**: `src/core/migration/transformer.ts`.
- **Agente responsable**: tooling-agent.

### Paso 4: UX Interactiva (Wizard)
- **Descripción**: Integrar `@clack/prompts` en el comando `init` para detectar instalaciones previas y ofrecer la opción de "Actualizar/Migrar" con resumen de cambios.
- **Dependencias**: Paso 3.
- **Entregables**: Refactor en `src/cli/commands/init.ts`.
- **Agente responsable**: tooling-agent.

---

## 4. Asignación de responsabilidades (Agentes)

- **Architect-Agent**
  - Responsabilidades: Definir los esquemas de transformación de frontmatter y validar el cumplimiento de la constitución.
- **Tooling-Agent**
  - Responsabilidades: Implementar el código en `agentic-workflow/src/` y las dependencias de `gray-matter`.
- **QA / Verification-Agent**
  - Responsabilidades: Diseñar un test de integración que simule una carpeta `.agent/` antigua y verifique que tras la migración se puede iniciar una tarea.

**Handoffs**
- El Architect supervisa cada paso. Tooling entrega código. QA entrega reportes de tests.

**Componentes (si aplica)**
- **CLI**: `agentic-workflow`. Uso de `gray-matter` para manipulación de MD.
- **Core**: Nuevos módulos de migración.

---

## 5. Estrategia de testing y validación

- **Unit tests**
  - Testear el `detector.ts` con diferentes estructuras de carpetas.
  - Testear el `transformer.ts` con fragmentos de MD legacy.
- **Integration tests**
  - Escenario completo: Carpetas legacy -> Run `init` -> Check `.agent/` nuevo + inyección correcta.

**Trazabilidad**
- **AC-1, AC-2**: Validados en Integration Tests.
- **AC-3, AC-4**: Validados mediante Demo manual.
- **AC-5**: Validado mediante ejecución de `init` post-migración.

---

## 6. Plan de demo (si aplica)
- **Objetivo**: Demostrar la detección de un sistema Extensio antiguo y su conversión exitosa.
- **Escenario**: Un proyecto con una carpeta `.agent/` de la versión de Extensio (sin `index.md` global). Ejecutar el binario local del CLI.
- **Criterios de éxito**: El Wizard muestra la advertencia, el usuario acepta, se crea el backup y el nuevo `.agent/` contiene los archivos de la última versión con los artefactos previos preservados.

---

## 7. Estimaciones y pesos de implementación
- **Detección y Backup**: Bajo (2 pts)
- **Transformador de Contenido**: Medio (5 pts)
- **UX e Integración CLI**: Medio (3 pts)
- **TOTAL**: 10 pts (Esfuerzo moderado-alto por la criticidad del sistema de archivos).

---

## 8. Puntos críticos y resolución

- **Riesgo: Transformación destructiva**
  - Estrategia: El transformador solo escribirá en el nuevo directorio. El backup original NUNCA se modifica.
- **Riesgo: Versiones muy antiguas sin frontmatter**
  - Estrategia: Implementar heurísticas basadas en la ubicación de archivos (ej: si existe `rules/index.md` es un sistema compatible).

---

## 9. Dependencias y compatibilidad
- **Dependencias**: `gray-matter` (nueva dependencia a añadir a `package.json`).
- **Compatibilidad**: Node.js >= 18.

---

## 10. Criterios de finalización
- [ ] El comando `init` detecta sistemas previos.
- [ ] Se crea backup correctamente.
- [ ] Los artefactos antiguos se migran con frontmatter actualizado.
- [ ] El sistema migrado permite ejecutar el workflow `init`.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-20T00:17:00+01:00"
    comments: "Aprobado vía consola."
```
