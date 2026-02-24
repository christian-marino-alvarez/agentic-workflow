🏛️ **architect-agent**: Analysis for T026 — Workflow Parser & XState Engine Alignment.

---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 26-workflow-parser-xstate-engine-alignment
---

# Analysis — 26-workflow-parser-xstate-engine-alignment

## 1. Executive Summary

**Problem**
The `WorkflowParser`, `WorkflowEngine`, types, and tests are misaligned with the normalized workflow structure (T025). The parser searches for obsolete section names, the engine lacks auto-transitions and subtask support, and the type system references removed fields.

**Objective**
Full alignment: parser reads normalized sections, types reflect the new schema, engine supports auto-advance and dynamic subtask invocation, and all tests validate the new structure.

**Success Criterion**
All 7 ACs pass: parser reads 7 sections, types updated, auto-transitions work, dynamic subtasks via `invoke`, Pass/Fail as structured defs, legacy removed, tests pass.

---

## 2. Project State (As-Is)

- **Relevant structure**
  ```
  src/extension/modules/runtime/
  ├── backend/
  │   ├── workflow-parser.ts     (562 LOC — parser)
  │   ├── workflow-engine.ts     (512 LOC — XState engine)
  │   ├── persistence.ts         (161 LOC — state store)
  │   └── test/
  │       ├── workflow-parser.test.ts  (197 LOC — 8 tests)
  │       ├── workflow-engine.test.ts  (101 LOC — 5 tests)
  │       └── persistence.test.ts
  ├── constants.ts               (130 LOC)
  └── types.d.ts                 (183 LOC)
  ```

- **Existing components**
  - `WorkflowParser`: Functional but searches for old section names, handles deprecated double-frontmatter, extracts deprecated fields.
  - `WorkflowEngine`: Functional for simple workflows and lifecycle machines. Lacks auto-transitions (must manually send events), no subtask concept.
  - `WorkflowPersistence`: Independent of schema changes — only stores `WorkflowEngineState`. Will need minor updates when `WorkflowEngineState` changes.
  - Tests: All 13 tests use old-format fixtures.

- **Detected limitations**
  - Parser `extractSection()` uses `startsWith` match — works for new names but needs explicit section list.
  - Engine `buildLifecycleMachine()` creates flat states — no `invoke` for subtasks.
  - `trigger` is wrapped in `TriggerDef { commands: string[] }` — must become `string[]`.
  - No `PassDef`/`FailDef` structured types exist.

---

## 3. Acceptance Criteria Coverage

### AC-1: Parser reads normalized structure
- **Interpretation**: `parseContent()` must extract all 7 sections (`Input`, `Output`, `Objective`, `Instructions`, `Gate`, `Pass`, `Fail`) from the body. Remove all fallbacks to old names.
- **Verification**: Parse all 18 live workflows, verify `sections` object contains all 7 fields with non-empty content.
- **Risks**: `extractSteps()` currently searches for `Mandatory Steps` — must change to `Instructions`.

### AC-2: Updated type system
- **Interpretation**: 
  - `Frontmatter`: remove `severity`, `blocking`; add `type: 'static' | 'dynamic'`; change `trigger` to `string[]`.
  - `WorkflowDef`: remove `severity`, `blocking`, `passTarget`, `failBehavior`; add `type`, `pass: PassDef`, `fail: FailDef`.
  - `ParsedSections`: remove `templates`; add `instructions: string`, `pass: string`, `fail: string`.
  - Remove `TriggerDef` interface entirely.
- **Verification**: TypeScript compilation passes with no errors.
- **Risks**: Breaking change to all consumers of these types — engine, persistence state, test mocks.

### AC-3: Auto-transitions in lifecycle
- **Interpretation**: When the engine receives `PHASE_GATE_APPROVE` for the current phase, it must automatically transition to the next phase state without any external call. This uses XState's built-in state transition mechanism — when gate approve fires, the `target` is already the next phase.
- **Verification**: Start a lifecycle, approve the gate for phase-0, and assert the current state is phase-1 without any additional call.
- **Risks**: Current `buildLifecycleMachine()` already does `target: nextPhaseKey` on `PHASE_GATE_APPROVE` — this may already work. Need to verify the `currentPhaseIndex` is updated.

### AC-4: Dynamic workflow subtask support
- **Interpretation**: Use XState `invoke` pattern: when phase-4 is active, it can invoke a child machine (e.g., `coding-backend`). The child machine reaches `type: 'final'`, triggering `onDone` in the parent, which can then invoke the next child or advance the phase gate.
- **Verification**: Start phase-4, invoke a coding workflow, complete it, verify parent returns to phase-4.
- **Risks**: This is a new capability. The engine currently has no concept of child machines invoked from within a phase.

### AC-5: Structured Pass/Fail parsing
- **Interpretation**: 
  - `PassDef`: Extract from `## Pass` content — identify next phase target (from alias pattern), list of actions.
  - `FailDef`: Extract from `## Fail` content — determine behavior (`block` vs `retry`), identify failure cases, corrective actions.
- **Verification**: Parse a workflow, verify `pass` and `fail` fields contain structured data.
- **Risks**: Parsing structured intent from markdown requires pattern matching — manageable since we control the markdown format.

### AC-6: Legacy code removal
- **Interpretation**: Delete all code paths for double-frontmatter, Spanish section names, `severity`/`blocking` extraction, `TriggerDef` wrapper.
- **Verification**: `grep -r "severity\|blocking\|Mandatory Steps\|Pasos obligatorios\|TriggerDef"` in runtime dir returns zero matches.
- **Risks**: None — intentional breaking change.

### AC-7: Tests pass
- **Interpretation**: Rewrite all 13 tests to use normalized-format fixtures. Add new tests for auto-transitions and subtask invocation.
- **Verification**: `npm test` passes with zero failures.
- **Risks**: Medium effort — all test fixtures need updating.

---

## 4. Technical Research

### Alternative A: Incremental refactor (modify existing code)
- **Description**: Modify `workflow-parser.ts`, `workflow-engine.ts`, `types.d.ts`, and `constants.ts` in-place.
- **Advantages**: Preserves git history, smaller diff, easy to review.
- **Disadvantages**: Risk of dead code remaining.

### Alternative B: Clean rewrite of parser and engine
- **Description**: Rewrite parser and engine from scratch to the new schema.
- **Advantages**: Cleanest result, no legacy artifacts.
- **Disadvantages**: Loses git history, higher risk of regression.

**Recommended decision**: **Alternative A** — Incremental refactor, with dead code explicitly deleted. Best balance of clean result and traceability.

---

## 5. Participating Agents

- **architect-agent**
  - Owner of the task.
  - Designs the new type system and engine architecture.
  - Reviews all implementations.
  - Executes integration testing.

- **backend-agent**
  - Implements changes to `workflow-parser.ts`, `workflow-engine.ts`, `types.d.ts`, `constants.ts`.
  - Follows `constitution.backend`.

- **qa-agent**
  - Rewrites and extends test suite.
  - Validates all ACs through tests.

**Handoffs**:
1. architect → backend: Type definitions and engine architecture spec.
2. backend → architect: Implementation for review.
3. architect → qa: Test requirements based on ACs.

**Required Components**:
- New types: `PassDef`, `FailDef`.
- Modified types: `Frontmatter`, `WorkflowDef`, `ParsedSections`.
- Removed types: `TriggerDef`.
- New engine events: `SUBTASK_START`, `SUBTASK_COMPLETE`.
- New engine state: `SUBTASK_EXECUTING`.

---

## 6. Task Impact

- **Architecture**: Moderate — engine gains hierarchical state management with child machine invocation. Parser simplifies.
- **APIs / contracts**: `WorkflowDef` interface changes are breaking for all consumers. `WorkflowEngineState` changes affect persistence and view layers.
- **Compatibility**: Internal breaking change (types). No external API impact.
- **Testing**: All 13 existing tests need rewriting. New tests for auto-transitions and subtasks.

---

## 7. Risks and Mitigations

- **Risk 1: WorkflowEngineState persistence migration**
  - Impact: Medium — saved states in `.agent/workflow-state.json` may have old fields.
  - Mitigation: Add a version check in `WorkflowPersistence.load()` that clears incompatible state.

- **Risk 2: Consumer breakage**
  - Impact: Medium — Background layer and View layer consume `WorkflowDef` and `WorkflowEngineState`.
  - Mitigation: Update Background/View consumers in the same PR. Compilation will catch mismatches.

- **Risk 3: XState invoke complexity**
  - Impact: Medium — child machine lifecycle management adds complexity.
  - Mitigation: Start with the simpler `invoke` pattern, not `spawn`. Test thoroughly.

---

## 8. Open Questions
None.

---

## 9. TODO Backlog

**Reference**: `.agent/todo/`
**Current state**: No pending items relevant to this task.
**Impact on analysis**: None.

---

## 10. Approval
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-23T21:39:24+01:00"
    comments: "Impact scan confirmed chat module as heavy consumer. Scope extended to include consumer updates."
```
