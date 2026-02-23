🏛️ **architect-agent**: Acceptance criteria for T025 — Normalize Workflow Markdown Structure.

# Acceptance Criteria — 25-normalize-workflow-markdown-structure

## 1. Consolidated Definition

Estandarizar los 18 workflows existentes en `.agent/workflows/` (live) para que todos sigan un formato unificado con:
- **YAML frontmatter** con campos obligatorios: `id`, `owner`, `description`, `version`, `trigger` (array), `type` (`static` | `dynamic`).
- **Secciones de cuerpo** obligatorias en orden fijo: `Input` → `Output` → `Objective` → `Instructions` → `Gate` → `Pass` → `Fail`.
- **Naming conventions** limpios, sin anotaciones inline como `(REQUIRED)` o `(MANDATORY)`.
- **Sin campo `model`** en el frontmatter (el agente lo resuelve en runtime).
- **Solo `.agent/workflows/`** (no `src/agentic-system-structure/`).

## 2. Answers to Clarification Questions

| # | Question (formulated by architect) | Answer (from developer) |
|---|-----------------------------------|------------------------|
| 1 | ¿La normalización aplica solo a workflows, o también a templates y rules? | Solo workflows (18 archivos). |
| 2 | ¿Qué representa `model`? ¿Qué valores tiene `type`? ¿`trigger` es array o string? | `model` no aplica (lo resuelve el agente). `type` es `static` o `dynamic` (un workflow dinámico se crea como subtarea de otro). `trigger` es siempre un array. |
| 3 | ¿Todas las secciones del cuerpo son obligatorias? | Sí, todas obligatorias: Input, Output, Objective, Instructions, Gate, Pass, Fail. |
| 4 | ¿Estilo de naming de secciones con o sin anotaciones inline? | Estilo limpio sin anotaciones inline (e.g., `## Input` en vez de `## Input (REQUIRED)`). |
| 5 | ¿Normalizar ambas ubicaciones (.agent/ y src/agentic-system-structure/) o solo live? | Solo `.agent/workflows/` (live). La sincronización al scaffold se hará en otra tarea. |

---

## 3. Verifiable Acceptance Criteria

1. **Scope**:
   - Los 18 archivos `.md` en `.agent/workflows/` (incluidos subdirectorios `coding/`, `tasklifecycle-long/`, `tasklifecycle-short/`).

2. **YAML Frontmatter**:
   - Todos los workflows tienen un **único bloque YAML** frontmatter con exactamente estos campos:
     - `id` (string, formato: `workflow.<path>`)
     - `owner` (string, agente responsable)
     - `description` (string, descripción breve)
     - `version` (string, semver)
     - `trigger` (array de strings)
     - `type` (`static` | `dynamic`)
   - **Sin campo `model`**, `severity`, ni `blocking`.

3. **Secciones del Cuerpo**:
   - Todas las secciones presentes y en este orden fijo:
     1. `## Input`
     2. `## Output`
     3. `## Objective`
     4. `## Instructions`
     5. `## Gate`
     6. `## Pass`
     7. `## Fail`
   - Sin anotaciones inline como `(REQUIRED)`, `(MANDATORY)`, `(ONLY)`.

4. **Constraints**:
   - No se modifican templates, rules, ni artifacts.
   - No se modifica `src/agentic-system-structure/`.
   - El contenido semántico de cada workflow se preserva (no se pierde lógica ni pasos).
   - El `index.md` no requiere cambios (los aliases ya apuntan a los paths correctos).

5. **Acceptance Criterion (Done)**:
   - Los 18 workflows compilan con la nueva estructura.
   - Ningún workflow tiene secciones fuera de orden, campos YAML ausentes, o anotaciones inline.
   - Una validación manual (o script) confirma la conformidad de todos los archivos.

---

## Approval (Gate 0)
This document constitutes the task contract. Its approval is blocking to proceed to Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-23T20:18:53+01:00"
    comments: null
```

---

## Validation History (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "created"
    validated_by: "architect-agent"
    timestamp: "2026-02-23T20:17:04+01:00"
    notes: "Acceptance criteria defined from 5 mandatory questions"
```
