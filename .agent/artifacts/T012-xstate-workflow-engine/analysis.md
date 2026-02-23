---
id: T012-analysis
phase: phase-2-analysis
status: pending-approval
created: 2026-02-23
---

# Phase 2: Analysis — T012

## 1. Impacto por módulo

### 1.1 Runtime Backend (`src/extension/modules/runtime/backend/`)

| Archivo | Impacto | Tipo |
|---|---|---|
| `workflow-parser.ts` | **ALTO** — Extender con secciones: inputs, outputs, templates, objective | Evolución |
| `workflow-engine.ts` | **CRÍTICO** — Máquina jerárquica: lifecycle → phases → steps | Refactor mayor |
| `persistence.ts` | **MEDIO** — Snapshot de máquina jerárquica | Evolución |

### 1.2 Runtime Types (`src/extension/modules/runtime/types.d.ts`)

| Tipo | Cambio |
|---|---|
| `WorkflowDef` | Añadir: `inputs`, `outputs`, `templates`, `objective` |
| `WorkflowEngineState` | Añadir: `currentPhaseId`, `phaseDefs`, secciones parseadas |
| `WorkflowContext` | Añadir: `phases`, `currentPhaseIndex`, `phaseContexts` |
| Nuevo: `ParsedWorkflowSections` | Interface con todas las secciones tipadas |

### 1.3 Runtime Constants (`src/extension/modules/runtime/constants.ts`)

| Constante | Cambio |
|---|---|
| `WORKFLOW_STATES` | Añadir: estados de fase (`phase_N_executing`, `phase_N_gate`) |
| `ENGINE_EVENTS` | Añadir: `PHASE_ADVANCE`, `PHASE_GATE_APPROVE` |

### 1.4 Chat Background (`src/extension/modules/chat/background/index.ts`)

| Sección | Cambio |
|---|---|
| Línea ~251 (inyección LLM) | Reemplazar `rawContent` por secciones tipadas del phase activo |
| `lifecycleStartPrompt` (prompts/index.ts) | **Eliminar completamente** |
| `handleLifecyclePhasesRequest` | Obtener phases desde WorkflowEngine (ya parseadas) |

### 1.5 Chat View (`src/extension/modules/chat/view/`)

| Template | Cambio |
|---|---|
| `details/html.ts` | Renderizar secciones parseadas: inputs, outputs, gates, pass |
| `timeline/html.ts` | Sin cambio — ya funciona con phases |

---

## 2. Responsabilidad por agente

| Agente | Responsabilidad |
|---|---|
| **architect-agent** | Diseño de la máquina XState jerárquica, schema de parseo, supervisión |
| **engine-agent** (implementa) | Refactor de `WorkflowEngine`, `WorkflowParser`, tipos, constants |
| **view-agent** (implementa) | Details panel con secciones parseadas |
| **background-agent** (implementa) | Inyección estructurada al LLM, eliminación de hardcoded prompts |

---

## 3. Análisis de los acceptance criteria

### AC-1: Parser universal con secciones tipadas

**Análisis**: El `WorkflowParser` actual ya tiene `extractSection(body, sectionName)` genérico. Solo falta llamarlo para las secciones nuevas.

**Implementación**:
```typescript
// Nuevo tipo
interface ParsedSections {
  inputs: string[];      // extractSection('Input') → split lines
  outputs: string[];     // extractSection('Output') → split lines  
  templates: string[];   // extractSection('Template') → extract refs
  objective: string;     // extractSection('Objective') → text
}

// Añadir a parseContent():
const inputs = this.extractListItems(body, 'Input');
const outputs = this.extractListItems(body, 'Output');
const templates = this.extractListItems(body, 'Template');
const objective = this.extractSection(body, 'Objective') || '';
```

**Esfuerzo estimado**: 2h

### AC-2: Todos los workflows parseados

**Análisis**: `parseDirectory()` ya es recursivo. Los lifecycle phases están bajo subdirectorios (`tasklifecycle-long/`, `tasklifecycle-short/`). El parser ya los encuentra.

**Verificación**: Solo asegurar que la key del Map incluya el path relativo para evitar colisiones de ID.

**Esfuerzo estimado**: 30min

### AC-3 + AC-4: XState inter-fase + pasos internos

**Análisis**: Este es el cambio más grande. La máquina actual es plana:
```
idle → executing → waitingGate → completed
```

Necesitamos una máquina jerárquica generada por un factory:

```typescript
function buildLifecycleMachine(phases: ParsedWorkflow[]) {
  const states: Record<string, any> = {};
  
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const nextPhaseId = i < phases.length - 1 ? phases[i + 1].header.id : 'completed';
    
    states[phase.header.id] = {
      initial: 'executing',
      states: {
        executing: {
          on: {
            STEP_COMPLETE: [
              { target: 'gate', guard: 'hasGate' },
              { target: 'done' },
            ],
          },
        },
        gate: {
          on: {
            GATE_APPROVE: { target: 'done' },
            GATE_REJECT: { target: 'failed' },
          },
        },
        done: { type: 'final' },
        failed: { /* ... */ },
      },
      onDone: { target: nextPhaseId },  // ← transición inter-fase
    };
  }
  
  states['completed'] = { type: 'final' };
  return states;
}
```

**Esfuerzo estimado**: 8h

### AC-5: Gate enforcement por XState

**Análisis**: Los guards ya existen (`hasGate`). Solo falta que la transición `onDone` del sub-estado de la fase NO se active sin `GATE_APPROVE`. Esto lo garantiza XState nativamente: la fase solo llega a `done` (final) cuando el gate aprueba.

**Esfuerzo estimado**: Incluido en AC-3/4

### AC-6: Persistencia XState

**Análisis**: `WorkflowPersistence` ya guarda `WorkflowEngineState` en globalState. Para la máquina jerárquica, necesitamos guardar el `actor.getPersistedSnapshot()` de XState v5.

```typescript
// Save
const snapshot = actor.getPersistedSnapshot();
await persistence.saveSnapshot(snapshot);

// Restore
const restoredActor = createActor(machine, { snapshot: savedSnapshot });
```

**Esfuerzo estimado**: 2h

### AC-7: Secciones tipadas al LLM

**Análisis**: Reemplazar la inyección actual (línea ~252 del chat background) por:

```typescript
const phase = workflowState.currentPhase;
const sections = phase.parsedSections;
const context = [
  `## ACTIVE PHASE: ${phase.header.description}`,
  `**Owner**: ${phase.header.owner}`,
  `**Objective**: ${sections.objective}`,
  `### Required Inputs\n${sections.inputs.map(i => `- ${i}`).join('\n')}`,
  `### Expected Outputs\n${sections.outputs.map(o => `- ${o}`).join('\n')}`,
  `### Instructions\n${phase.steps.map(s => `${s.number}. ${s.title} [${s.status}]`).join('\n')}`,
  `### Gate Requirements\n${phase.gate.requirements.map(r => `- ${r}`).join('\n')}`,
  `### On PASS → ${phase.passTarget}`,
].join('\n\n');
```

**Esfuerzo estimado**: 3h

### AC-8: Eliminar hardcoded prompts

**Análisis**: `lifecycleStartPrompt` en `prompts/index.ts` (línea 60-67) se elimina. El contexto viene de AC-7.

**Esfuerzo estimado**: 30min

### AC-9: Details panel

**Análisis**: El `details/html.ts` actualmente es genérico. Se refactoriza para mostrar secciones:

```
┌─────────────────────────────────┐
│ 📋 Phase 0: Acceptance Criteria │
│ 👤 Owner: architect-agent       │
├─────────────────────────────────┤
│ INPUTS    │ OUTPUTS             │
│ • task.md │ • task.md (current) │
│           │ • acceptance.md     │
├─────────────────────────────────┤
│ GATE (0/10 passed)              │
│ ○ Directory exists              │
│ ○ Template loaded               │
├─────────────────────────────────┤
│ PASS → Phase 1: Research        │
└─────────────────────────────────┘
```

**Esfuerzo estimado**: 4h

### AC-10: xstate v5 dependency
**Ya cumplido** — xstate está en package.json.

---

## 4. Orden de implementación (dependencias)

```
1. Types + Constants       ← base para todo
2. WorkflowParser          ← depende de types
3. WorkflowEngine (XState) ← depende de parser + types
4. Persistence             ← depende de engine
5. Chat Background (LLM)   ← depende de engine state
6. Details Panel (View)     ← depende de engine state
7. Cleanup (hardcoded)      ← final
```

---

## 5. Estimación total

| Fase | Esfuerzo |
|---|---|
| Types + Constants | 1h |
| Parser extensión | 2h |
| XState jerárquica | 8h |
| Persistencia | 2h |
| Inyección LLM | 3h |
| Details panel | 4h |
| Cleanup | 1h |
| **Total** | **~21h** |

---

## Gate — Phase 2
- [x] Impacto por módulo documentado
- [x] Responsabilidad por agente definida
- [x] Cada AC analizado con implementación concreta
- [x] Orden de dependencias establecido
- [x] Estimación total calculada
- [ ] **Aprobación explícita del desarrollador: SI / NO**
