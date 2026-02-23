🔬 **researcher-agent**: Research report for T025 — Normalize Workflow Markdown Structure.

---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 25-normalize-workflow-markdown-structure
---

# Research Report — 25-normalize-workflow-markdown-structure

> [!CAUTION]
> **PERMANENT RULE**: This document is ONLY documentation.
> The researcher-agent documents findings WITHOUT analyzing, WITHOUT recommending, WITHOUT proposing solutions.
> Analysis belongs to Phase 2.

## 1. Executive Summary
- **Problem investigated**: The 18 workflow files in `.agent/workflows/` have inconsistent YAML frontmatter schemas and body section structures.
- **Research objective**: Document the current state of each workflow, catalog all structural variations, and identify the target schema fields and body sections for normalization.
- **Key findings**: 5 distinct categories of inconsistency exist across frontmatter, body sections, and naming conventions.

---

## 2. Detected Needs
- A unified YAML frontmatter schema for all workflows.
- A standardized set of body sections in a fixed order.
- Removal of inline annotations from section headers.
- Introduction of two new fields: `type` (static|dynamic) classification.
- Removal of deprecated fields: `severity`, `blocking`.

---

## 3. Technical Findings

### 3.1 Current YAML Frontmatter Inventory

| # | Workflow File | `id` | `owner` | `description` | `version` | `trigger` | `severity` | `blocking` |
|---|---|---|---|---|---|---|---|---|
| 1 | `init.md` | ✅ (2nd block) | ✅ (2nd block) | ✅ (1st block) | ✅ (2nd block) | ✅ (2nd block) | ✅ | ✅ |
| 2 | `scaffold-module.md` | ❌ | ❌ | ✅ | ❌ | ✅ (string, not array) | ❌ | ❌ |
| 3 | `phase-0-acceptance-criteria.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 | `phase-1-research.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 5 | `phase-2-analysis.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 6 | `phase-3-planning.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 7 | `phase-4-implementation.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8 | `phase-5-verification.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 9 | `phase-6-results-acceptance.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 10 | `phase-7-evaluation.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 11 | `phase-8-commit-push.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 12 | `coding-backend.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 13 | `coding-background.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 14 | `coding-view.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 15 | `coding-integration.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 16 | `short-phase-1-brief.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 17 | `short-phase-2-implementation.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 18 | `short-phase-3-closure.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 3.2 Anomalies Detected in Frontmatter

| Anomaly | Files Affected | Description |
|---|---|---|
| **Double YAML block** | `init.md` | Has two separate `---` blocks. First contains only `description`. Second contains `id`, `owner`, `version`, `severity`, `trigger`, `blocking`. |
| **Missing fields** | `scaffold-module.md` | Missing `id`, `owner`, `version`, `severity`, `blocking`. Only has `description` and `trigger` (as string). |
| **`trigger` as string** | `scaffold-module.md` | `trigger: /scaffold-module <module-name>` — a string instead of the array format `commands: [...]`. |
| **`severity` present** | 16/18 files | Field to be removed per acceptance criteria. |
| **`blocking` present** | 16/18 files | Field to be removed per acceptance criteria. |
| **`type` absent** | 18/18 files | New field to be added: `static` or `dynamic`. |

### 3.3 Current Body Sections Inventory

| Section Name Variant | Count | Files Using It |
|---|---|---|
| `## Input (REQUIRED)` | 16 | All lifecycle + coding workflows |
| `## Input` | 1 | `scaffold-module.md` (as `## Input` inside `## Steps`) |
| `## Output (REQUIRED)` | 16 | All lifecycle + coding workflows |
| `## Objective (ONLY)` | 16 | All lifecycle + coding workflows |
| `## Template (MANDATORY)` / `## Templates (MANDATORY)` | 12 | Lifecycle phases 0-7, not in coding or scaffold |
| `## Mandatory Steps` | 13 | Lifecycle phases + short phases |
| `## Steps` | 1 | `scaffold-module.md` |
| `## Commit Rules` | 1 | `phase-8-commit-push.md` (unique section) |
| `## Gate (REQUIRED)` | 17 | All except `scaffold-module.md` |
| `## FAIL (MANDATORY)` / `## FAIL` | 16 | All lifecycle + coding workflows |
| `PASS` (as step, not section) | 16 | Embedded inside Mandatory Steps |

### 3.4 Section Order Variations

**Pattern A** (lifecycle-long phases 0-6):
```
Input (REQUIRED) → Output (REQUIRED) → Template (MANDATORY) → Objective (ONLY) → Mandatory Steps → FAIL (MANDATORY) → Gate (REQUIRED)
```

**Pattern B** (phase-7, phase-8):
```
Input (REQUIRED) → Output (REQUIRED) → Objective (ONLY) → Templates (MANDATORY) → Mandatory Steps → FAIL (MANDATORY) → Gate (REQUIRED)
```

**Pattern C** (coding workflows):
```
Input (REQUIRED) → Output (REQUIRED) → Objective (ONLY) → Mandatory Steps → FAIL (MANDATORY) → Gate (REQUIRED)
```

**Pattern D** (short lifecycle):
```
Input (REQUIRED) → Output (REQUIRED) → Objective (ONLY) → Mandatory Steps → Gate (REQUIRED)
```

**Pattern E** (scaffold-module):
```
Input → Steps → (no Gate, no Pass, no Fail)
```

**Pattern F** (init):
```
Input (REQUIRED) → Objective (ONLY) → Mandatory Steps → Output (REQUIRED) → Gate (REQUIRED)
```

### 3.5 Naming Convention Variations

| Convention | Current Usage | Target |
|---|---|---|
| `## Input (REQUIRED)` | 16 files | `## Input` |
| `## Output (REQUIRED)` | 16 files | `## Output` |
| `## Objective (ONLY)` | 16 files | `## Objective` |
| `## Template (MANDATORY)` | 12 files | Absorbed into `## Input` (or removed) |
| `## Templates (MANDATORY)` | 2 files | Same |
| `## Mandatory Steps` | 13 files | `## Instructions` |
| `## Steps` | 1 file | `## Instructions` |
| `## Gate (REQUIRED)` | 17 files | `## Gate` |
| `## FAIL (MANDATORY)` | 10 files | `## Fail` |
| `## FAIL` | 6 files | `## Fail` |
| PASS (inline step) | 16 files | `## Pass` (promoted to section) |

### 3.6 `type` Classification (static vs dynamic)

Based on the developer's definition: A `dynamic` workflow is one that is created as a subtask of another dynamically. A `static` workflow is a standalone, top-level workflow.

| Workflow | Observed Behavior | `type` Classification |
|---|---|---|
| `init.md` | Top-level, invoked directly by developer | `static` |
| `scaffold-module.md` | Top-level, invoked directly by developer | `static` |
| `phase-0` through `phase-8` | Invoked sequentially by the lifecycle, but each is a top-level entry point | `static` |
| `short-phase-1` through `short-phase-3` | Same as above | `static` |
| `coding-backend.md` | Invoked dynamically by `phase-4` as a subtask | `dynamic` |
| `coding-background.md` | Invoked dynamically by `phase-4` as a subtask | `dynamic` |
| `coding-view.md` | Invoked dynamically by `phase-4` as a subtask | `dynamic` |
| `coding-integration.md` | Invoked dynamically by `phase-4` as a subtask | `dynamic` |

---

## 4. Relevant APIs
Not applicable — this task involves markdown file restructuring, no external APIs.

---

## 5. Multi-browser Compatibility
Not applicable — this task is purely structural and does not involve runtime code.

---

## 6. Detected AI-first Opportunities
- Automated markdown linting could enforce the new schema via a pre-commit hook or CI check.
- A YAML schema validator could be added to verify frontmatter compliance across all workflows.

---

## 7. Identified Risks

| Risk | Severity | Source |
|---|---|---|
| **Semantic content loss during restructuring** | Medium | Manual inspection of each workflow reveals embedded context in section names (e.g., `## Template (MANDATORY)` carries semantic weight as a separate section) |
| **`scaffold-module.md` requires significant restructuring** | Medium | Currently follows a completely different pattern (Pattern E) with no Gate/Pass/Fail |
| **PASS is currently embedded as a step, not a section** | Low | Promoting to `## Pass` section may require restructuring step numbering |
| **`init.md` dual YAML block** | Low | Merging into one block is straightforward but must preserve all fields |
| **Section `## Template` / `## Commit Rules` are unique sections** | Medium | Need to decide where this content goes in the new structure (likely inside `## Input` or `## Instructions`) |

---

## 8. Sources
- Current workflow files in `.agent/workflows/` (18 files examined in full)
- YAML frontmatter specification: https://jekyllrb.com/docs/front-matter/
- Conventional naming conventions for YAML keys: lowercase, hyphenated

---

## 9. Developer Approval (MANDATORY)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-23T20:25:39+01:00"
    comments: null
```
