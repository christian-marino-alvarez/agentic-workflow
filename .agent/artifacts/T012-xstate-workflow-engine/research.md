---
id: T012-research
phase: phase-1-research
status: pending-approval
created: 2026-02-23
---

# Phase 1: Research — T012

## 1. Estado actual del sistema

### 1.1 WorkflowParser (existente)
- **Ubicación**: `src/extension/modules/runtime/backend/workflow-parser.ts` (498 líneas)
- **Funcionalidad**: Parsea `.md` files con `gray-matter` para frontmatter YAML
- **Secciones que ya extrae**:
  - `frontmatter` (id, owner, version, severity, trigger, blocking)
  - `steps` (## Mandatory Steps / ## Pasos obligatorios)
  - `gate` (## Gate)
  - `constitutions` (> [!IMPORTANT] blocks)
  - `passTarget` (following patterns like `workflow.X`)
  - `failBehavior` (from FAIL section)
- **Secciones que NO extrae** (gap):
  - `inputs` (## Input)
  - `outputs` (## Output)
  - `templates` (## Template)
  - `objective` (## Objective)
  - `rawContent` se pasa completo al LLM (no tipado)

### 1.2 WorkflowEngine (existente — YA USA XSTATE v5)
- **Ubicación**: `src/extension/modules/runtime/backend/workflow-engine.ts` (351 líneas)
- **Ya importa**: `import { setup, createActor, type AnyActorRef } from 'xstate'`
- **Máquina actual**: Solo modela el workflow raíz (init), NO las fases individuales
- **Estados actuales**: idle → executing → waiting_gate → completed/failed
- **Limitación crítica**: Un solo actor XState para todo el lifecycle. No modela transiciones inter-fase (phase-0 → phase-1 → ...)
- **Persistencia**: Usa `WorkflowPersistence` que guarda en globalState

### 1.3 Inyección al LLM (chat background)
- **Línea 251**: Inyecta `workflowState.workflow.rawContent` como contexto
- **Problema**: Es el raw markdown completo, no secciones tipadas
- **Hardcoded**: `lifecycleStartPrompt()` en `prompts/index.ts` — prompt manual que intenta dirigir al LLM

### 1.4 Estructura de un markdown de fase (ejemplo phase-0)
```
---
id: workflow.tasklifecycle-long.phase-0-acceptance-criteria
description: ...
owner: architect-agent
version: 1.2.1
severity: PERMANENT
trigger: { commands: [...] }
blocking: true
---

# WORKFLOW: tasklifecycle.phase-0-acceptance-criteria

## Input (REQUIRED)        ← NO pareseado
## Output (REQUIRED)       ← NO parseado
## Template (MANDATORY)    ← NO parseado
## Objective (ONLY)        ← NO parseado
## Mandatory Steps         ← YA parseado
## Gate (REQUIRED)         ← YA parseado (parcialmente)
```

---

## 2. Gap Analysis

| Necesidad (AC) | Estado actual | Trabajo requerido |
|---|---|---|
| AC-1: Parser universal | Parcial — falta inputs, outputs, templates, objective | Extender `extractSection` para nuevas secciones |
| AC-2: Todos los workflows | Solo se parsean los del root workflow dir | Parsear recursivamente incluyendo subdirs de lifecycle |
| AC-3: XState inter-fase | NO existe — solo estados del workflow raíz | Crear máquina jerárquica: lifecycle → phases |
| AC-4: XState pasos internos | NO existe — steps son solo datos estáticos | Modelar sub-estados por paso dentro de cada fase |
| AC-5: Gate enforcement | Parcial — guard `hasGate` existe pero no bloquea inter-fase | Guards en transiciones phase-N → phase-N+1 |
| AC-6: Persistencia XState | `WorkflowPersistence` existe, guarda en globalState | Extender para snapshot de máquina jerárquica |
| AC-7: Secciones tipadas al LLM | Se inyecta rawContent | Inyectar secciones parseadas con formato estructurado |
| AC-8: Eliminar hardcoded | `lifecycleStartPrompt` existe | Eliminar, reemplazar por secciones del markdown |
| AC-9: Details panel | Muestra datos genéricos | Renderizar secciones parseadas de la fase activa |
| AC-10: xstate v5 dependency | ✅ Ya instalado en package.json | No requiere trabajo |

---

## 3. Arquitectura propuesta

### 3.1 Workflow Markdown Schema (universal)
Todas las secciones en orden (opcionales marcadas con ?):

```typescript
interface ParsedWorkflow {
  // From frontmatter
  header: {
    id: string;
    description: string;
    owner: string;
    version: string;
    severity: string;
    trigger?: { commands: string[] };
    blocking: boolean;
  };
  
  // From body sections
  inputs: string[];          // ## Input
  outputs: string[];         // ## Output
  templates: string[];       // ## Template
  objective: string;         // ## Objective
  constitutions: string[];   // > [!IMPORTANT] blocks
  steps: WorkflowStep[];     // ## Mandatory Steps
  gate: GateDef | null;      // ## Gate
  passTarget: string | null; // Next workflow/phase on PASS
  failBehavior: string;      // FAIL behavior
}
```

### 3.2 XState Machine — Jerárquica

```
lifecycle (parent machine)
├── phase-0-acceptance-criteria (child machine)
│   ├── step-1 → step-2 → ... → gate → PASS/FAIL
│   └── on PASS → phase-1
├── phase-1-research (child machine)
│   ├── step-1 → step-2 → ... → gate → PASS/FAIL
│   └── on PASS → phase-2
├── ...
└── phase-8-commit-push (child machine)
    └── on PASS → lifecycle.completed
```

Cada child machine se genera dinámicamente desde el `ParsedWorkflow` de su `.md`.

### 3.3 Inyección al LLM (por secciones)

En vez de `rawContent`, se inyecta:

```
## ACTIVE PHASE: Phase 0 — Acceptance Criteria
**Owner**: architect-agent
**Objective**: Move from task candidate to current task...

### Required Inputs
- artifacts.candidate.task (must include description + objective)

### Expected Outputs
- .agent/artifacts/<taskId>-<taskTitle>/task.md
- .agent/artifacts/<taskId>-<taskTitle>/acceptance.md

### Instructions (Steps)
1. Activate architect-agent ✅
2. Load task candidate [ACTIVE]
3. Calculate taskId [PENDING]
...

### Gate Requirements
1. Directory and state file exist
2. Acceptance artifact exists
...

### On PASS → Phase 1: Research
```

### 3.4 Details Panel

```
┌─────────────────────────────┐
│ Phase 0: Acceptance Criteria│
│ Owner: architect-agent      │
├─────────────────────────────┤
│ INPUTS                      │
│ • artifacts.candidate.task  │
├─────────────────────────────┤
│ OUTPUTS                     │
│ • task.md                   │
│ • acceptance.md             │
├─────────────────────────────┤
│ GATE (5/10 requirements)    │
│ ☐ Directory exists          │
│ ☐ Acceptance artifact       │
│ ☑ Template loaded           │
│ ...                         │
├─────────────────────────────┤
│ PASS → Phase 1: Research    │
└─────────────────────────────┘
```

---

## 4. Riesgos identificados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Markdowns con estructura inconsistente | Parser falla | Secciones opcionales + validación lenient |
| XState jerárquica compleja | Debug difícil | Inspector visual XState + logging |
| Migración del engine existente | Romper workflows activos | Feature flag para transición gradual |
| Performance con muchos workflows | Parseo lento al iniciar | Cache de ParsedWorkflow |

---

## 5. Dependencias

| Dependencia | Versión | Estado |
|---|---|---|
| xstate | v5.x | ✅ Ya instalada |
| gray-matter | ^4.0.3 | ✅ Ya instalada |

No se requieren dependencias nuevas.

---

## 6. Alternativas descartadas

1. **YAML puro en vez de markdown**: Descartado porque los markdowns son legibles por humanos y fáciles de editar.
2. **Motor custom sin XState**: Descartado porque XState ya está en el proyecto y ofrece guards, persistence, y visualización nativas.
3. **Parseo lazy (on demand)**: Descartado porque necesitamos el schema completo al iniciar el lifecycle para construir la máquina XState.

---

## Gate — Phase 1
- [x] Estado actual documentado
- [x] Gap analysis completado
- [x] Arquitectura propuesta definida
- [x] Riesgos identificados
- [x] Dependencias verificadas
- [ ] **Aprobación explícita del desarrollador: SI / NO**
