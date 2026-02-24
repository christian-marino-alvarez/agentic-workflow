🏛️ **architect-agent**: Implementation Plan for T026.

---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 26-workflow-parser-xstate-engine-alignment
---

# Plan — 26-workflow-parser-xstate-engine-alignment

## 1. Plan Summary

**Approach**: Incremental refactor in 7 ordered implementation tasks.
**Execution order**: Types → Constants → Parser → Engine → Consumers → CLI → Tests.
**Rationale**: Types-first ensures all downstream changes are guided by TypeScript compilation errors.

---

## 2. Contractual Inputs

- `acceptance.md`: 7 ACs (parser, types, auto-transitions, subtasks, Pass/Fail, legacy removal, tests)
- `analysis.md`: Incremental refactor approach selected. Impact scan confirmed 9 files outside runtime.
- `research.md`: XState v5.28.0 supports `invoke`, `always`, `type: 'final'` + `onDone` natively.

---

## 3. Implementation Breakdown

### Task 1: Update Type System (`types.d.ts`)
**Agent**: backend-agent
**AC**: AC-2, AC-6
**Files**: `src/extension/modules/runtime/types.d.ts`

**Changes**:
1. Remove `TriggerDef` interface entirely.
2. Update `Frontmatter`:
   - Remove `severity`, `blocking`.
   - Add `type: 'static' | 'dynamic'`.
   - Change `trigger?: TriggerDef` → `trigger: string[]`.
3. Add new types:
   ```typescript
   interface PassDef {
     nextTarget: string | null;    // Extracted from alias pattern
     actions: string[];            // List of required actions
     rawContent: string;           // Full Pass section text
   }
   
   interface FailDef {
     behavior: 'block' | 'retry';  // Determined from content
     cases: string[];              // List of failure cases
     rawContent: string;           // Full Fail section text
   }
   ```
4. Update `WorkflowDef`:
   - Remove `severity`, `blocking`, `passTarget: string`, `failBehavior: string`.
   - Add `type: 'static' | 'dynamic'`.
   - Add `pass: PassDef | null`, `fail: FailDef | null`.
5. Update `ParsedSections`:
   - Remove `templates`.
   - Add `instructions: string`, `pass: string`, `fail: string`.
6. Update `WorkflowEngineState`:
   - Remove `workflow.severity`, `workflow.blocking`.
   - Add `workflow.type`.

**Deliverable**: Compilation will fail at this point — expected. This creates the "error map" for downstream tasks.

---

### Task 2: Update Constants (`constants.ts`)
**Agent**: backend-agent
**AC**: AC-4, AC-6
**Files**: `src/extension/modules/runtime/constants.ts`

**Changes**:
1. Remove `SEVERITY` constant (no longer used by normalized workflows).
2. Add to `ENGINE_EVENTS`:
   ```typescript
   SUBTASK_START: 'SUBTASK_START',
   SUBTASK_COMPLETE: 'SUBTASK_COMPLETE',
   ```
3. Add to `WORKFLOW_STATES`:
   ```typescript
   SUBTASK_EXECUTING: 'subtaskExecuting',
   ```
4. Add to `LISTENER_EVENTS`:
   ```typescript
   SUBTASK_START: 'subtaskStart',
   SUBTASK_COMPLETE: 'subtaskComplete',
   ```

---

### Task 3: Refactor WorkflowParser (`workflow-parser.ts`)
**Agent**: backend-agent
**AC**: AC-1, AC-5, AC-6
**Files**: `src/extension/modules/runtime/backend/workflow-parser.ts`

**Changes**:
1. **Simplify `extractFrontmatter()`**:
   - Remove double-frontmatter handling (lines 225-237).
   - Remove `extractFrontmatterManual()` method entirely.
   - Use `gray-matter` directly — single block only.
   
2. **Update `castFrontmatter()`**:
   - Remove `severity`, `blocking`.
   - Add `type: data.type || 'static'`.
   - `trigger`: parse directly as `string[]` (YAML array).
   
3. **Update `extractBody()`**:
   - Remove second frontmatter block removal (line 302).
   
4. **Rename `extractSteps()` → `extractInstructions()`**:
   - Search for `## Instructions` only (remove `Mandatory Steps`, `Pasos obligatorios`).
   - Return `WorkflowStep[]` from the Instructions section.
   
5. **Add `extractPassDef()`**:
   ```typescript
   private extractPassDef(body: string): PassDef | null {
     const section = this.extractSection(body, 'Pass');
     if (!section) return null;
     
     const nextTarget = this.extractNextTarget(section); // alias pattern
     const actions = this.extractListItems_inline(section);
     
     return { nextTarget, actions, rawContent: section };
   }
   ```
   
6. **Add `extractFailDef()`**:
   ```typescript
   private extractFailDef(body: string): FailDef | null {
     const section = this.extractSection(body, 'Fail');
     if (!section) return null;
     
     const behavior = /iterate|retry|resubmit/i.test(section) ? 'retry' : 'block';
     const cases = this.extractListItems_inline(section);
     
     return { behavior, cases, rawContent: section };
   }
   ```

7. **Update `parseContent()`**:
   - Replace `passTarget` with `pass: this.extractPassDef(bodyContent)`.
   - Replace `failBehavior` with `fail: this.extractFailDef(bodyContent)`.
   - Extract `instructions` section: `this.extractSection(bodyContent, 'Instructions')`.
   - Remove `templates` from sections.
   - Add `pass` and `fail` to sections.

8. **Delete dead code**:
   - `extractFrontmatterManual()` (~40 lines)
   - `extractPassTarget()` (replaced by `extractPassDef()`)
   - `extractFailBehavior()` (replaced by `extractFailDef()`)
   - Spanish section name fallbacks

**Estimated LOC change**: -100 (net reduction due to dead code removal).

---

### Task 4: Refactor WorkflowEngine (`workflow-engine.ts`)
**Agent**: backend-agent
**AC**: AC-3, AC-4, AC-5
**Files**: `src/extension/modules/runtime/backend/workflow-engine.ts`

**Changes**:
1. **Update `resolveWorkflow()`**:
   - Change `def.trigger?.commands` → `def.trigger` (direct array).
   
2. **Update `buildLifecycleMachine()`** for auto-transitions:
   - Gate approve already does `target: nextPhaseKey` — verify this works.
   - Add `assign` action to update `currentPhaseIndex` on phase transitions.
   - Ensure `context.currentPhaseIndex` increments on each transition.

3. **Add subtask support** via XState `invoke`:
   - Add method `buildSubtaskMachine(def: WorkflowDef)` that creates a child machine for dynamic workflows.
   - In `buildLifecycleMachine()`, phases that spawn subtasks use `invoke`:
     ```typescript
     phaseStates[phaseKey] = {
       invoke: {
         src: 'subtaskMachine',
         input: ({ context }) => ({ ... }),
         onDone: { target: phaseGateKey },
         onError: { actions: ['notifyError'] },
       }
     }
     ```
   - Add `startSubtask(workflowId: string)` public method.

4. **Update `getState()`**:
   - Remove `workflow.severity`, `workflow.blocking`.
   - Add `workflow.type`.
   - Use `pass`/`fail` defs instead of `passTarget`/`failBehavior`.

5. **Update `validateWorkflowOwner()`**:
   - No changes needed (uses `def.owner` which is unchanged).

6. **Remove deprecated references**:
   - All refs to `def.blocking`, `def.severity`.

---

### Task 5: Update Consumer Modules (Chat Background + View)
**Agent**: backend-agent (background), view-agent (view)
**AC**: AC-2, AC-6
**Files**:
- `src/extension/modules/chat/background/index.ts` (13 refs)
- `src/extension/modules/chat/view/index.ts` (9 refs)
- `src/extension/modules/chat/view/types.d.ts` (4 refs)
- `src/extension/modules/chat/view/templates/details/html.ts` (6 refs)
- `src/extension/modules/chat/view/templates/details/css.ts` (3 refs)
- `src/extension/modules/chat/prompts/index.ts` (1 ref)

**Changes**:
1. **chat/background/index.ts**:
   - Replace `workflowState.workflow.passTarget` → `workflowState.workflow.pass?.nextTarget`.
   - Replace `workflowState.workflow.failBehavior` → `workflowState.workflow.fail?.behavior`.
   - Auto-transition logic: use `pass.nextTarget` instead of `passTarget`.

2. **chat/view/types.d.ts**:
   - Remove `severity`, `blocking`, `passTarget`, `failBehavior`.
   - Add `type?: 'static' | 'dynamic'`, `pass?: { nextTarget: string | null }`, `fail?: { behavior: string }`.

3. **chat/view/index.ts**:
   - Update property mapping: remove `severity`, `blocking`, `passTarget`, `failBehavior`.
   - Add `type`, `pass`, `fail`.

4. **chat/view/templates/details/html.ts**:
   - Remove severity/blocking tag rendering.
   - Update "next step" to use `pass?.nextTarget`.
   - Update "on fail" to use `fail?.behavior`.

5. **chat/view/templates/details/css.ts**:
   - Remove `.severity`, `.blocking`, `.nonblocking` classes.

6. **chat/prompts/index.ts**:
   - Replace `passTarget` reference with `pass.nextTarget`.

---

### Task 6: Update CLI & Runtime Loader
**Agent**: backend-agent
**AC**: AC-6
**Files**:
- `src/cli/commands/create.ts` (2 refs)
- `src/runtime/engine/workflow-loader.ts` (2 refs)

**Changes**:
1. **cli/commands/create.ts**: Remove `severity:` from generated workflow templates. Add `type: static`.
2. **runtime/engine/workflow-loader.ts**: Update trigger parsing from `{ commands: [...] }` to direct `string[]`.

---

### Task 7: Rewrite Tests
**Agent**: qa-agent
**AC**: AC-7
**Files**:
- `src/extension/modules/runtime/backend/test/workflow-parser.test.ts` (8 tests)
- `src/extension/modules/runtime/backend/test/workflow-engine.test.ts` (5 tests)

**Changes**:
1. **Parser tests — rewrite all 8**:
   - Remove: double-frontmatter test, `Mandatory Steps` tests, `blocking` default test, `PASS`/`FAIL` uppercase tests.
   - Add: `## Instructions` parsing, `## Pass` → `PassDef` parsing, `## Fail` → `FailDef` parsing, `type` extraction, `trigger: string[]` parsing, all 18 live workflows parse without error.

2. **Engine tests — rewrite all 5 + add new**:
   - Update mock `WorkflowDef` to new schema (no `blocking`, `severity`, `passTarget`, `failBehavior`).
   - Add: auto-transition test (gate approve → next phase), subtask invocation test.

**Test mapping (old → new)**:
| Old Test | New Test |
|---|---|
| `debería parsear frontmatter simple con id` | `should parse normalized frontmatter with type` |
| `debería manejar doble frontmatter` | REMOVED (no double-FM) |
| `debería extraer constitutions` | `should extract constitutions from IMPORTANT blocks` |
| `debería extraer gate con requirements` | `should extract gate requirements` |
| `debería detectar passTarget desde aliases` | `should extract PassDef with nextTarget` |
| `debería detectar failBehavior como retry` | `should extract FailDef with retry behavior` |
| `debería lanzar error si no hay FM con id` | `should throw if no id in frontmatter` |
| `debería fallar validación sin owner` | `should throw if no owner` |
| `debería usar blocking: true por defecto` | REMOVED (no blocking) |
| `debería conservar rawContent original` | `should preserve rawContent` |
| NEW | `should parse all 18 live workflows` |
| NEW | `should extract Instructions section` |
| NEW | `should extract type field` |

---

## 4. Responsibility Assignment

| Task | Agent | Depends On | Estimated Weight |
|---|---|---|---|
| 1. Types | backend-agent | — | 2/10 |
| 2. Constants | backend-agent | Task 1 | 1/10 |
| 3. Parser | backend-agent | Task 1, 2 | 4/10 |
| 4. Engine | backend-agent | Task 1, 2, 3 | 4/10 |
| 5. Consumers | backend-agent + view-agent | Task 1, 4 | 3/10 |
| 6. CLI & Loader | backend-agent | Task 1 | 1/10 |
| 7. Tests | qa-agent | All above | 3/10 |

**Execution order**: 1 → 2 → 3 → 4 → 5+6 (parallel) → 7
**Total estimated weight**: 18/10 = Medium-High complexity

---

## 5. Testing Strategy

| Type | Scope | Tool |
|---|---|---|
| Unit | Parser: parse all 18 workflows, extract 7 sections, PassDef/FailDef | Vitest |
| Unit | Engine: auto-transitions, subtask invoke/complete | Vitest |
| Integration | Load workflows → start engine → approve gates → verify transitions | Vitest |
| Compilation | `npm run compile` — zero errors | TypeScript |

---

## 6. Demo Plan

Not applicable — this is an internal engine refactor with no user-visible UI changes (beyond removing severity/blocking tags from details panel).

---

## 7. Critical Points

1. **Task 4 (Engine subtasks)** — Most complex. XState `invoke` pattern is new to the codebase.
   - Resolution: Start with simplest invoke (single child, `onDone` → advance). Iterate from there.

2. **Task 5 (Consumer updates)** — Widest blast radius (6 files across chat module).
   - Resolution: TypeScript compiler will guide all changes. No runtime surprises.

3. **Persistence migration** — Old states in `workflow-state.json` will have deprecated fields.
   - Resolution: Bump `WorkflowStateDB.version` to `2`. On load, if version < 2, clear states.

---

## 8. Completion Criteria

All of the following must be true:
- [ ] TypeScript compilation passes (`npm run compile`).
- [ ] All Vitest tests pass (`npm test`).
- [ ] `grep -rn "severity\|blocking\|Mandatory Steps\|TriggerDef\|passTarget\|failBehavior" src/extension/modules/runtime/` returns zero matches (excluding comments).
- [ ] All 18 live workflows parse successfully.
- [ ] Engine auto-transitions verified via test.

---

## 9. Approval
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-23T21:42:26+01:00"
    comments: null
```
