🏛️ **architect-agent**: Implementation plan for T025 — Normalize Workflow Markdown Structure.

---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 25-normalize-workflow-markdown-structure
---

# Implementation Plan — 25-normalize-workflow-markdown-structure

## 1. Plan Summary
- **Context**: Normalize the 18 workflow markdown files in `.agent/workflows/` to follow a unified schema.
- **Expected result**: All 18 workflows share identical YAML frontmatter (6 fields) and body section structure (7 sections in fixed order, clean naming).
- **Scope**:
  - **Includes**: All 18 `.md` files in `.agent/workflows/` (live).
  - **Excludes**: Templates, rules, artifacts, and `src/agentic-system-structure/`.

---

## 2. Contractual Inputs
- **Task**: `.agent/artifacts/25-normalize-workflow-markdown-structure/task.md`
- **Analysis**: `.agent/artifacts/25-normalize-workflow-markdown-structure/analysis.md`
- **Acceptance Criteria**: `.agent/artifacts/25-normalize-workflow-markdown-structure/acceptance.md`

**Domain dispatch**: Not applicable — no domain-specific coding workflows invoked.

---

## 3. Implementation Breakdown (steps)

### Step 1: Normalize `init.md` (critical outlier)
- **Description**: Merge the dual YAML blocks into one. Add `type: static`. Remove `severity`, `blocking`. Restructure body sections to target order. Promote PASS/FAIL to `## Pass` / `## Fail` sections.
- **Dependencies**: None.
- **Deliverables**: `init.md` conforming to target schema.
- **Responsible agent**: architect-agent.

### Step 2: Normalize `scaffold-module.md` (critical outlier)
- **Description**: Add all missing YAML fields (`id`, `owner`, `version`, `type: static`). Convert `trigger` from string to array. Restructure body: rename `## Steps` → content goes into `## Instructions`. Create `## Input`, `## Output`, `## Objective`, `## Gate`, `## Pass`, `## Fail` sections from existing validation steps.
- **Dependencies**: None.
- **Deliverables**: `scaffold-module.md` conforming to target schema.
- **Responsible agent**: architect-agent.

### Step 3: Normalize `tasklifecycle-long/` workflows (9 files, batch)
- **Description**: For each of the 9 phase files:
  1. Remove `severity`, `blocking` from YAML.
  2. Add `type: static`.
  3. Rename `## Input (REQUIRED)` → `## Input`.
  4. Rename `## Output (REQUIRED)` → `## Output`.
  5. Rename `## Objective (ONLY)` → `## Objective`.
  6. Merge `## Template (MANDATORY)` content into `## Input` (as prerequisite).
  7. Merge `## Commit Rules` (phase-8 only) into `## Instructions`.
  8. Rename `## Mandatory Steps` → `## Instructions`.
  9. Rename `## Gate (REQUIRED)` → `## Gate`.
  10. Promote PASS step → `## Pass` section.
  11. Promote `## FAIL (MANDATORY)` / `## FAIL` → `## Fail` section.
  12. Reorder sections to: Input → Output → Objective → Instructions → Gate → Pass → Fail.
- **Dependencies**: None.
- **Deliverables**: 9 files conforming to target schema.
- **Responsible agent**: architect-agent.
- **Files**:
  1. `phase-0-acceptance-criteria.md`
  2. `phase-1-research.md`
  3. `phase-2-analysis.md`
  4. `phase-3-planning.md`
  5. `phase-4-implementation.md`
  6. `phase-5-verification.md`
  7. `phase-6-results-acceptance.md`
  8. `phase-7-evaluation.md`
  9. `phase-8-commit-push.md`

### Step 4: Normalize `coding/` workflows (4 files, batch)
- **Description**: Same transformation as Step 3, but with `type: dynamic`.
- **Dependencies**: None.
- **Deliverables**: 4 files conforming to target schema.
- **Responsible agent**: architect-agent.
- **Files**:
  1. `coding-backend.md`
  2. `coding-background.md`
  3. `coding-view.md`
  4. `coding-integration.md`

### Step 5: Normalize `tasklifecycle-short/` workflows (3 files, batch)
- **Description**: Same transformation as Step 3, with `type: static`. Note: short workflows currently embed FAIL within steps and have no explicit FAIL section — create `## Fail` section from existing failure logic.
- **Dependencies**: None.
- **Deliverables**: 3 files conforming to target schema.
- **Responsible agent**: architect-agent.
- **Files**:
  1. `short-phase-1-brief.md`
  2. `short-phase-2-implementation.md`
  3. `short-phase-3-closure.md`

### Step 6: Validation pass
- **Description**: Run a manual or scripted validation of all 18 files:
  - YAML frontmatter has exactly 6 fields (id, owner, description, version, trigger, type).
  - No `severity`, `blocking`, `model` fields present.
  - Body sections appear in order: Input → Output → Objective → Instructions → Gate → Pass → Fail.
  - No inline annotations `(REQUIRED)`, `(MANDATORY)`, `(ONLY)` in section headers.
- **Dependencies**: Steps 1-5 completed.
- **Deliverables**: Validation report confirming compliance.
- **Responsible agent**: architect-agent.

---

## 4. Responsibility Assignment (Agents)

- **architect-agent** (sole agent)
  - Performs all 18 file modifications.
  - Validates structural compliance.
  - Presents results for developer approval.

> Per `constitution.agents_behavior` §2.1, only `architect-agent` has authority to modify `.agent/workflows/` files.

**Handoffs**: None — single-agent execution.

**Components**: Not applicable.

**Demo**: Not applicable.

---

## 5. Testing and Validation Strategy

- **Unit tests**: Not applicable (markdown files, not code).
- **Integration tests**: Not applicable.
- **E2E / Manual**:
  - Validate each file's YAML frontmatter with manual inspection.
  - Validate section order by grepping for `## ` headers.
  - Verify no inline annotations remain.

**Traceability**:
| AC | Validation |
|---|---|
| AC-1 (Scope) | Count files: `find .agent/workflows/ -name "*.md" | wc -l` = 18 |
| AC-2 (YAML) | Check presence of 6 fields, absence of deprecated fields |
| AC-3 (Sections) | Verify ordered sequence of 7 `##` headers |
| AC-4 (No annotations) | `grep -rn "(REQUIRED)\|(MANDATORY)\|(ONLY)" .agent/workflows/` = 0 |
| AC-5 (Done) | All above pass |

---

## 6. Demo Plan
Not applicable.

---

## 7. Estimations and Implementation Weights

| Step | Effort | Files |
|---|---|---|
| Step 1: `init.md` | Medium (dual block merge) | 1 |
| Step 2: `scaffold-module.md` | Medium (full restructure) | 1 |
| Step 3: Long lifecycle | Low per file (batch pattern) | 9 |
| Step 4: Coding workflows | Low per file (batch pattern) | 4 |
| Step 5: Short lifecycle | Low per file (batch pattern) | 3 |
| Step 6: Validation | Low | 0 (verification) |
| **Total** | **~1 hour** | **18** |

---

## 8. Critical Points and Resolution

- **Critical point 1: `scaffold-module.md` missing sections**
  - Risk: Gate/Pass/Fail content must be created, not just renamed.
  - Impact: Low — content is derived from existing validation steps.
  - Resolution: Create sections from the existing TypeScript compilation and ESLint validation steps.

- **Critical point 2: PASS promotion from step to section**
  - Risk: Step numbering in `## Instructions` changes when PASS content moves out.
  - Impact: Low — step numbers are informational, not referenced externally.
  - Resolution: Renumber remaining steps in `## Instructions` after extraction.

---

## 9. Dependencies and Compatibility
- **Internal dependencies**: None.
- **External dependencies**: None.
- **Cross-browser compatibility**: Not applicable.
- **Relevant architectural constraints**: Only `architect-agent` can modify these files.

---

## 10. Completion Criteria

- [ ] All 18 workflows have a single YAML frontmatter block with exactly: `id`, `owner`, `description`, `version`, `trigger`, `type`.
- [ ] No workflow contains `severity`, `blocking`, or `model` fields.
- [ ] All workflows have sections in order: `## Input` → `## Output` → `## Objective` → `## Instructions` → `## Gate` → `## Pass` → `## Fail`.
- [ ] No section header contains `(REQUIRED)`, `(MANDATORY)`, or `(ONLY)`.
- [ ] All `trigger` values are arrays.
- [ ] `type` is `static` for 14 workflows, `dynamic` for 4 coding workflows.
- [ ] Semantic content of each workflow is preserved (no lost instructions or gate requirements).

---

## 11. Developer Approval (MANDATORY)
This plan **requires explicit and binary approval**.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-23T20:46:27+01:00"
    comments: null
```
