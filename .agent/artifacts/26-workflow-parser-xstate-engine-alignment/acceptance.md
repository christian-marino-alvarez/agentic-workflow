🏛️ **architect-agent**: Acceptance criteria for T026.

---
artifact: acceptance
phase: phase-0-acceptance-criteria
owner: architect-agent
status: draft
related_task: 26-workflow-parser-xstate-engine-alignment
---

# Acceptance Criteria — 26-workflow-parser-xstate-engine-alignment

## Consolidated Definition
Adapt the existing `WorkflowParser` and `WorkflowEngine` to fully align with the normalized workflow markdown structure (T025 output). Remove legacy support, update the type system, implement auto-transitions between lifecycle phases, handle dynamic workflows as subtasks, and parse Pass/Fail sections as structured engine directives.

## Developer Responses to 5 Mandatory Questions

### Q1: Backward compatibility with old format?
**Answer**: NO — only the new normalized format is supported. Remove all legacy parsing logic (double-frontmatter, Spanish section names, `Mandatory Steps`, `PASS`/`FAIL` uppercase sections).

### Q2: `trigger` format?
**Answer**: `string[]` directly. Remove the `TriggerDef { commands: string[] }` wrapper. The YAML `trigger: ["cmd1", "cmd2"]` maps directly to `trigger: string[]`.

### Q3: Auto-transitions between phases?
**Answer**: YES — the engine must handle automatic transitions. When a gate is approved, the engine must automatically advance to the next phase in the lifecycle sequence without external intervention.

### Q4: Dynamic workflows (coding-*) as subtasks?
**Answer**: YES — dynamic workflows (`type: dynamic`) must be treated as subtasks launched from within a parent lifecycle phase (e.g., phase-4). The engine must support a parent-child workflow relationship.

### Q5: Pass/Fail as structured content?
**Answer**: YES — `## Pass` and `## Fail` must be parsed as structured sections that the engine uses to decide behavior (auto-advance target, retry strategy, etc.), not just informational text for agents.

---

## Acceptance Criteria (AC)

### AC-1: Parser reads new normalized structure
- The `WorkflowParser` **MUST** correctly parse all 7 mandatory sections: `Input`, `Output`, `Objective`, `Instructions`, `Gate`, `Pass`, `Fail`.
- Section names are matched **exactly** (no fallbacks to old names).
- All 18 workflows parse successfully without errors.

### AC-2: Updated type system
- `Frontmatter` type removes `severity`, `blocking` and adds `type: 'static' | 'dynamic'`.
- `trigger` becomes `string[]` (not `TriggerDef`).
- `WorkflowDef` removes `severity`, `blocking`, `passTarget`, `failBehavior` (replaced by structured `Pass`/`Fail` sections).
- `ParsedSections` adds `instructions`, `pass`, `fail` and removes `templates`.

### AC-3: Auto-transitions in lifecycle
- When a phase gate is approved (`GATE_APPROVE`), the engine **MUST** automatically transition to the next phase.
- When the last phase gate is approved, the engine transitions to `lifecycle_completed`.
- No external call is needed to advance between phases.

### AC-4: Dynamic workflow subtask support
- Workflows with `type: dynamic` can be started as children of a running lifecycle phase.
- The parent lifecycle remains in its current phase until the dynamic subtask completes.
- When a dynamic subtask completes, control returns to the parent lifecycle.

### AC-5: Structured Pass/Fail parsing
- The parser extracts `## Pass` content as a `PassDef` (next target, actions).
- The parser extracts `## Fail` content as a `FailDef` (behavior: block/retry, actions).
- The engine uses `PassDef` to determine auto-advance targets.
- The engine uses `FailDef` to determine retry vs block behavior.

### AC-6: Legacy code removal
- All double-frontmatter parsing logic is removed.
- All Spanish section name fallbacks are removed.
- `severity` and `blocking` references are removed from parser, engine, and types.
- `TriggerDef` wrapper type is removed.

### AC-7: Tests pass
- All existing tests are updated to reflect the new structure.
- Parser tests validate against normalized workflow files.
- Engine tests validate auto-transitions and subtask handling.

---

## Approval
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-23T21:27:18+01:00"
    comments: null
```
