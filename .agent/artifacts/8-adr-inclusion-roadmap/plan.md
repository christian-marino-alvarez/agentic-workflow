🏛️ **architect-agent**: Plan de implementación para la formalización del ADR y actualización del Roadmap.

# Implementation Plan — 8-ADR e Inclusión en el Roadmap: Unified Tabbed Chat View

## 1. Resumen del plan
- **Contexto**: Formalización técnica de la decisión de unificar las vistas de la extensión en un único componente host Lit y adoptar el protocolo A2UI.
- **Resultado esperado**: 
  1. Documento ADR (Architecture Decision Record) aprobado y almacenado.
  2. Roadmap del proyecto actualizado con las fases de ejecución (Tabs, Shell, A2UI).
  3. Scaffolding inicial del componente `agw-unified-shell`.
- **Alcance**: Este plan NO incluye la implementación lógica completa del chat, solo la formalización arquitectónica y el scaffolding estructural.

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/8-adr-inclusion-roadmap/task.md`
- **Analysis**: `.agent/artifacts/8-adr-inclusion-roadmap/analysis.md`
- **Acceptance Criteria**: AC-1 (Unificación), AC-2 (Performance/Accesibilidad), AC-3 (Roadmap/ADR).

**Dispatch de dominios**
```yaml
plan:
  workflows:
    - domain: architecture
      action: create
      workflow: workflow.adr-creation
    - domain: roadmap
      action: refactor
      workflow: workflow.roadmap-update

  dispatch:
    - domain: ui-core
      action: create
      workflow: workflow.scaffolding
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Creación del ADR-001
- **Descripción**: Redacción del ADR detallando el contexto (ChatKit vs A2UI), la decisión (Unified Shell) y las consecuencias.
- **Dependencias**: Ninguna (basado en el análisis aprobado).
- **Entregables**: `docs/adr/001-unified-tabbed-chat-view.md`.
- **Agente responsable**: architect-agent.

### Paso 2: Actualización del Roadmap
- **Descripción**: Integrar los hitos de la migración en el backlog global del proyecto.
- **Dependencias**: Paso 1.
- **Entregables**: `ROADMAP.md` actualizado.
- **Agente responsable**: architect-agent.

### Paso 3: Scaffolding del Unified Shell
- **Descripción**: Creación del archivo de componente Lit base con la estructura de pestañas (sin lógica de módulos aún).
- **Dependencias**: Paso 1.
- **Entregables**: `src/extension/modules/core/web/components/agw-unified-shell.ts`.
- **Agente responsable**: implementation-agent (Neo).

---

## 4. Asignación de responsabilidades (Agentes)

- **Architect-Agent**
  - Responsabilidad: Redactar ADR y actualizar Roadmap.
  - Herramienta: `write_to_file`.
- **Neo (Implementation-Agent)**
  - Responsabilidad: Crear el scaffolding de `agw-unified-shell`.
  - Herramienta: `write_to_file` con `skill.clean-code` aplicado.

## 5. Estrategia de testing y validación
- **Unit tests**: Verificación de que el ADR sigue el formato estándar.
- **Manual**: El desarrollador validará que el Roadmap refleja los nuevos hitos y que el scaffolding compila.

---

## 7. Estimaciones y pesos de implementación
- **ADR & Roadmap**: 2h (Bajo).
- **Scaffolding shell**: 1h (Bajo).
- **Total**: ~3h.

## 8. Puntos críticos y resolución
- **Punto crítico**: Consistencia de IDs de vista entre `package.json` y el nuevo Shell.
- **Estrategia**: Definir los nuevos IDs en el ADR antes de tocar código.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-11T07:24:00Z"
    comments: "Plan aprobado. Proceder con la implementación de la Fase 4."
```
