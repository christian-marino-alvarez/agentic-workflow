---
id: T012-acceptance
phase: phase-0-acceptance-criteria
status: pending-approval
created: 2026-02-23
---

# Acceptance Criteria — T012

## Respuestas del desarrollador

### Q1: Alcance del parseo
**SI** — El schema universal se aplica a TODOS los markdowns bajo `.agent/workflows/` (init, coding, lifecycle phases, custom).

### Q2: XState — scope
**SI** — XState gobierna tanto las transiciones entre fases (phase-0 → phase-1 → ...) como los pasos internos de cada fase (step 1 → step 2 → gate).

### Q3: Dependencia npm
**SI** — Se acepta `xstate` v5 como dependencia directa del runtime backend.

### Q4: Persistencia del estado
**globalState** de VS Code — Consistente con la persistencia de sesiones ya existente.

### Q5: Details panel
**Relevante a fase activa** — El panel muestra las secciones parseadas de la fase actual (header, owner, inputs, outputs, gates, pass), no todas las fases simultáneamente.

---

## Acceptance Criteria formales

| # | Criterio | Verificable |
|---|----------|-------------|
| AC-1 | Existe un `WorkflowMarkdownParser` que parsea cualquier `.md` de workflow en secciones tipadas: `header`, `owner`, `constitutions`, `inputs`, `outputs`, `instructions` (pasos), `gates`, `pass` | SI |
| AC-2 | Todos los markdowns bajo `.agent/workflows/` son parseados con el mismo schema | SI |
| AC-3 | Existe una máquina XState v5 que modela las transiciones entre fases del lifecycle (Long y Short) | SI |
| AC-4 | La máquina XState modela los pasos internos de cada fase, incluyendo gates como guards | SI |
| AC-5 | Es imposible avanzar a la siguiente fase sin que el gate de la actual pase (enforced por XState, no por prompt) | SI |
| AC-6 | El estado XState se persiste en `globalState` y se restaura al reiniciar la extensión | SI |
| AC-7 | El LLM recibe secciones parseadas (no rawContent) como contexto de la fase activa | SI |
| AC-8 | El `lifecycleStartPrompt` y otros prompts hardcodeados son eliminados | SI |
| AC-9 | El Details panel muestra las secciones parseadas de la fase activa: header, owner, inputs, outputs, gates, pass | SI |
| AC-10 | `xstate` v5 es dependencia directa del proyecto | SI |

---

## Gate — Phase 0
- [x] 5 preguntas formuladas y respondidas
- [x] Acceptance criteria documentados
- [ ] **Aprobación explícita del desarrollador: SI / NO**
