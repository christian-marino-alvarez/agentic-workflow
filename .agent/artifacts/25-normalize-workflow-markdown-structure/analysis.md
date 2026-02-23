🏛️ **architect-agent**: Analysis for T025 — Normalize Workflow Markdown Structure.

---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 25-normalize-workflow-markdown-structure
---

# Analysis — 25-normalize-workflow-markdown-structure

## 1. Executive Summary

**Problem**
- The 18 workflow files in `.agent/workflows/` have inconsistent structures: varying YAML frontmatter schemas (missing fields, double blocks, deprecated fields), irregular body section names and order, and mixed naming conventions with inline annotations.

**Objective**
- Normalize all 18 workflows to follow a single, unified schema: consistent YAML frontmatter (6 fields), 7 mandatory body sections in fixed order, and clean naming conventions.

**Success Criterion**
- All 18 workflows pass structural validation: correct frontmatter fields, correct section order, no inline annotations, `type` field correctly classified.

---

## 2. Project State (As-Is)

- **Relevant structure**
  - `.agent/workflows/init.md` (1 file)
  - `.agent/workflows/scaffold-module.md` (1 file)
  - `.agent/workflows/coding/` (4 files)
  - `.agent/workflows/tasklifecycle-long/` (9 files)
  - `.agent/workflows/tasklifecycle-short/` (3 files)

- **Existing components**
  - 16/18 workflows follow a consistent pattern with `id`, `owner`, `description`, `version`, `trigger`, `severity`, `blocking`.
  - 2 outliers: `init.md` (double YAML block), `scaffold-module.md` (minimal frontmatter, no Gate/Pass/Fail).

- **Detected limitations**
  - No automated schema validation exists for workflow markdown files.
  - `severity` and `blocking` fields carry no runtime semantic value — they are informational only.
  - `## Template (MANDATORY)` sections exist as standalone sections in 12 workflows but are effectively part of input requirements.
  - PASS is embedded as a numbered step inside Mandatory Steps, not a top-level section.

---

## 3. Acceptance Criteria Coverage

### AC-1: Scope (18 files in `.agent/workflows/`)
- **Interpretation**: All 18 `.md` files across all subdirectories must be modified.
- **Verification**: `find .agent/workflows/ -name "*.md" -type f | wc -l` must equal 18 and all pass schema validation.
- **Risks**: None — file list is deterministic.

### AC-2: YAML Frontmatter (6 mandatory fields)
- **Interpretation**: Every workflow must have exactly one `---` block with: `id`, `owner`, `description`, `version`, `trigger` (array), `type` (static|dynamic). Fields `severity`, `blocking`, `model` must NOT be present.
- **Verification**: Parse YAML of each file, validate field presence/absence.
- **Risks**: `init.md` dual block merge must preserve all field values. `scaffold-module.md` needs all fields created from scratch.

### AC-3: Body Sections (7 mandatory, fixed order)
- **Interpretation**: Every workflow body must contain exactly: `## Input` → `## Output` → `## Objective` → `## Instructions` → `## Gate` → `## Pass` → `## Fail`, in that order.
- **Verification**: Grep for `## ` headers and verify sequence matches target.
- **Risks**:
  - `scaffold-module.md` currently has no Gate/Pass/Fail — these must be created with appropriate content.
  - Content from `## Template (MANDATORY)` sections must be absorbed into either `## Input` or `## Instructions`.
  - Content from `## Commit Rules` in phase-8 must move to `## Instructions`.
  - PASS steps must be promoted to `## Pass` sections.
  - FAIL steps must be promoted to `## Fail` sections.

### AC-4: No inline annotations
- **Interpretation**: Section headers must be clean: `## Input`, not `## Input (REQUIRED)`.
- **Verification**: `grep -rn "(REQUIRED)\|(MANDATORY)\|(ONLY)" .agent/workflows/` must return zero matches in `##` headers.
- **Risks**: None — straightforward text replacement.

### AC-5: Done criterion
- **Interpretation**: All 18 files conform, verified by manual or scripted check.
- **Verification**: A validation script or manual pass confirms all 5 ACs.
- **Risks**: None.

---

## 4. Technical Research

### Alternative A: Batch file transformation
- **Description**: Process all 18 files as a batch. For each file, restructure YAML and reorder/rename sections.
- **Advantages**: Fast, consistent.
- **Disadvantages**: Requires careful attention to unique content in each file.

### Alternative B: Template-driven regeneration
- **Description**: Create a "workflow template" and regenerate each file from scratch, transplanting content.
- **Advantages**: Guarantees structural consistency.
- **Disadvantages**: Risk of content loss, high effort.

**Recommended decision**: **Alternative A** — Batch transformation. Each file is modified in-place, preserving semantic content while restructuring. This minimizes risk of content loss and is more traceable (diff-friendly).

---

## 5. Participating Agents

- **architect-agent**
  - Owner of the task and all workflow files.
  - Responsible for performing all file modifications (this is a system/governance task, not functional code).
  - Validates structural compliance post-modification.

> **Note**: Since this task modifies `.agent/workflows/` (system governance files), the `architect-agent` is the sole authorized agent per `constitution.agents_behavior` §2.1: "Only the architect-agent has authority to modify system files."

**Handoffs**: None — single-agent task.

**Required Components**: No components to create, modify, or delete. Only markdown files are restructured.

**Demo**: Not applicable.

---

## 6. Task Impact

- **Architecture**: No code architecture impact. Only governance file structure changes.
- **APIs / contracts**: No API changes. The workflow content (instructions, gates) remains semantically identical.
- **Compatibility**: No breaking changes to runtime. Agents reading workflows may need to adapt to new section names (`## Instructions` instead of `## Mandatory Steps`), but this is handled by the agents' natural language parsing.
- **Testing / verification**: Manual or scripted validation of all 18 files against the target schema.

---

## 7. Risks and Mitigations

- **Risk 1: Content loss during restructuring**
  - Impact: Medium — lost instructions could break workflow execution.
  - Mitigation: Use in-place editing with diff tracking. Review each file's diff before closing.

- **Risk 2: `scaffold-module.md` Gate/Pass/Fail creation**
  - Impact: Medium — this file currently has no gate structure.
  - Mitigation: Create lightweight Gate/Pass/Fail sections consistent with the workflow's validation steps (TypeScript compilation, ESLint).

- **Risk 3: Unique sections losing their semantics**
  - Impact: Low — `## Template (MANDATORY)` and `## Commit Rules` content needs careful placement.
  - Mitigation: Template requirements merge into `## Input` (as prerequisites). Commit rules merge into `## Instructions`.

---

## 8. Open Questions
None — all acceptance criteria are clear and verifiable.

---

## 9. TODO Backlog (Mandatory Consultation)

**Reference**: `.agent/todo/`

**Current state**: Not applicable to this task — no pending backlog items affect markdown structural normalization.

**Items relevant to this task**: None.

**Impact on analysis**: None.

---

## 10. Approval
This analysis **requires explicit developer approval**.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-23T20:44:50+01:00"
    comments: null
```

> Without approval, this phase **CANNOT be considered completed** nor advance to Phase 3.
