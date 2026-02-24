🔬 **researcher-agent**: Research report for T026 — Workflow Parser & XState Engine Alignment.

---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 26-workflow-parser-xstate-engine-alignment
---

# Research Report — 26-workflow-parser-xstate-engine-alignment

> [!CAUTION]
> **PERMANENT RULE**: This document is ONLY documentation.
> The researcher-agent documents findings WITHOUT analyzing, WITHOUT recommending, WITHOUT proposing solutions.

## 1. Executive Summary
- **Problem investigated**: The `WorkflowParser` (562 LOC) and `WorkflowEngine` (512 LOC) are misaligned with the normalized workflow structure from T025. Types reference removed fields, parser searches for obsolete section names, and the engine lacks auto-transition and subtask capabilities.
- **Research objective**: Document the current code state, XState v5 capabilities for the required features, and technical constraints.
- **Key findings**: XState v5.28.0 natively supports hierarchical machines, `invoke` for child machines (subtasks), and auto-transitions — all required patterns are supported without additional libraries.

---

## 2. Current Codebase State

### 2.1 WorkflowParser (`workflow-parser.ts` — 562 lines)

| Method | Current Behavior | Issue |
|---|---|---|
| `extractFrontmatter()` | Handles double-frontmatter (dual `---` blocks), looks for `severity`, `blocking` | Double-frontmatter no longer exists. `severity`/`blocking` removed. Missing `type` field. |
| `extractFrontmatterManual()` | Fallback for broken YAML, also handles double-frontmatter | Same as above — entire double-FM logic is dead code. |
| `extractBody()` | Removes TWO frontmatter blocks | Only one block exists now. |
| `extractSteps()` | Searches for `## Mandatory Steps`, `## Pasos obligatorios`, `## Pasos Obligatorios` | Section is now `## Instructions`. Spanish fallbacks no longer needed. |
| `extractPassTarget()` | Searches `## PASS` section for alias patterns | Section is now `## Pass` (not all-caps). |
| `extractFailBehavior()` | Searches `## FAIL` section for iterate/retry keywords | Section is now `## Fail` (not all-caps). Returns string enum, not structured data. |
| `extractSection()` | Uses `headingText.startsWith(sectionName)` matching | This works for new names but also matches old `## Input (REQUIRED)` — now clean `## Input`. |
| `castFrontmatter()` | Returns `{ id, description, owner, version, severity, trigger, blocking }` | `severity`/`blocking` must be removed. `type` must be added. `trigger` wrapped in `TriggerDef` object. |
| `parseContent()` | Extracts `inputs`, `outputs`, `templates`, `objective` | `templates` section no longer exists. Missing `instructions`, `pass`, `fail`. |

### 2.2 WorkflowEngine (`workflow-engine.ts` — 512 lines)

| Area | Current Behavior | Issue |
|---|---|---|
| `WorkflowDef` usage | References `def.blocking`, `def.severity` | Fields removed from schema. |
| `resolveWorkflow()` | Accesses `def.trigger?.commands` (nested object) | `trigger` is now `string[]` directly. |
| `buildLifecycleMachine()` | Builds flat phase states with manual `PHASE_GATE_APPROVE`/`PHASE_GATE_REJECT` events | Does not support auto-advance. Gate approve stays in same phase. No child machine for dynamic workflows. |
| `start()` | Detects lifecycle by ID pattern (`includes('tasklifecycle-long')`) | Works but fragile — should use `type: static/dynamic`. |
| `isLifecycleWorkflow()` | Checks if ID contains `tasklifecycle-long/short` | No structured classification. |
| `buildStates()` | Simple: idle → executing → waitingGate → completed/failed | No concept of subtask states. |
| `getState()` | Builds state from context including `steps`, `phases`, `parsedSections` | `parsedSections` lacks `instructions`, `pass`, `fail`. |

### 2.3 Types (`types.d.ts` — 183 lines)

| Type | Current | Required Change |
|---|---|---|
| `Frontmatter` | Has `severity`, `blocking`, `trigger: TriggerDef` | Remove `severity`/`blocking`, add `type`, change `trigger: string[]` |
| `TriggerDef` | `{ commands?: string[] }` | Remove entirely |
| `WorkflowDef` | Has `severity`, `blocking`, `passTarget: string`, `failBehavior: string` | Remove `severity`/`blocking`, replace `passTarget`/`failBehavior` with `pass: PassDef`, `fail: FailDef` |
| `ParsedSections` | `{ inputs, outputs, templates, objective }` | Remove `templates`, add `instructions`, `pass`, `fail` |
| `WorkflowEngineState` | Has `workflow.severity`, `workflow.blocking` | Remove deprecated fields, add `type` |

### 2.4 Constants (`constants.ts` — 130 lines)

| Constant | Status |
|---|---|
| `SEVERITY` | Can be removed (not used by normalized workflows) |
| `FAIL_BEHAVIOR` | Should evolve to support structured `FailDef` |
| `ENGINE_EVENTS` | Needs `SUBTASK_START`, `SUBTASK_COMPLETE` for dynamic workflows |
| `WORKFLOW_STATES` | Needs `SUBTASK_EXECUTING` state |

### 2.5 Tests (2 test files)

| File | Tests | Impact |
|---|---|---|
| `workflow-parser.test.ts` | 8 tests, all use old format (`blocking`, `Mandatory Steps`, double-FM, `PASS`, `FAIL`) | All need rewriting to use normalized format |
| `workflow-engine.test.ts` | 5 tests, mock uses `severity`, `blocking`, `passTarget`, `failBehavior`, `templates` | All mocks need updating |

---

## 3. XState v5.28.0 Capabilities

### 3.1 Hierarchical (Compound) States
XState v5 natively supports nested states. A lifecycle can be a parent machine with each phase as a child state.
```typescript
states: {
  phase0: { on: { GATE_APPROVE: 'phase1' } },
  phase1: { on: { GATE_APPROVE: 'phase2' } },
  // Auto-transitions happen via event routing
}
```

### 3.2 `invoke` for Child Machines (Subtasks)
XState v5 `invoke` allows a state to invoke a child machine. When the child reaches a final state, the parent receives `onDone`. This is the pattern for dynamic workflow subtasks.
```typescript
states: {
  phase4: {
    invoke: {
      src: 'codingBackendMachine',
      onDone: 'phase4CodingNextOrGate',
      onError: 'phase4Failed',
    }
  }
}
```

### 3.3 `spawn` for Dynamic Actors
XState v5 `spawn` (via `spawnChild` or `assign + spawn`) allows dynamically creating child actors. This is useful for spawning multiple coding workflows within a phase.

### 3.4 Auto-Transitions
XState v5 supports `always` transitions (eventless transitions) that fire automatically when conditions are met:
```typescript
states: {
  checkGate: {
    always: [
      { target: 'nextPhase', guard: 'gateApproved' },
      { target: 'waitingGate' }
    ]
  }
}
```

### 3.5 `setup()` with Typed Actors
XState v5 `setup()` supports declaring actor types:
```typescript
setup({
  types: { context: {}, events: {} },
  actors: { childMachine: childMachine },
  guards: {},
  actions: {},
})
```

---

## 4. Relevant APIs

### 4.1 gray-matter (existing dependency)
- Used for YAML frontmatter parsing.
- Works correctly with the new single-block format.
- Double-frontmatter handling code is no longer needed.

### 4.2 XState v5.28.0 API Surface
- `setup()` — typed machine setup
- `createActor()` — create actor from machine
- `invoke` — state-level child machine invocation
- `spawnChild` — action-level dynamic child spawning
- `stopChild` — action-level child stopping
- `assign` — context mutation
- `fromPromise` — promise-based actor logic
- `type: 'final'` — final states that trigger `onDone` in parent

---

## 5. Detected Risks

| Risk | Severity | Description |
|---|---|---|
| Parser backward compatibility break | Low | Intentional — old format no longer supported per AC-6 |
| Test suite breakage | Medium | All 13 existing tests use old format — must be rewritten |
| Persistence schema evolution | Medium | Saved `WorkflowEngineState` in `.agent/workflow-state.json` may contain old fields (`severity`, `blocking`) |
| XState `invoke` complexity | Medium | Child machine lifecycle management adds complexity to state machine design |
| `extractSection()` name matching | Low | Current `startsWith` matching works for new exact section names |

---

## 6. Sources
- XState v5 Documentation: https://stately.ai/docs (invoke, spawn, setup, actors)
- XState v5.28.0 source: `node_modules/xstate/package.json`
- Current codebase: `src/extension/modules/runtime/`
- T025 output: normalized workflow files in `.agent/workflows/`

---

## 7. Developer Approval
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-23T21:29:56+01:00"
    comments: null
```
