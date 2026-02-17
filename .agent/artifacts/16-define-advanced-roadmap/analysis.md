---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 16-define-advanced-roadmap
---

# Analysis — 16-define-advanced-roadmap

## Agent Identification (MANDATORY)
`🏛️ **architect-agent**: Analysis for Advanced Roadmap Definition.`

## 1. Executive Summary
**Problem**: The current backlog does not reflect the new strategic direction (OAuth, Agent Mapping, Visual Workflows).
**Objective**: Design a comprehensive "Advanced Agentic" roadmap to guide the next development phase.
**Success Criterion**: `ROADMAP-BACKLOG.md` is replaced with a structured plan covering D1, D3, and D2 enhancements (AC-1 to AC-5).

---

## 2. Project State (As-Is)
- **Structure**: Modular architecture is in place (`src/extension/modules`).
- **Backlog**: Current `ROADMAP-BACKLOG.md` is outdated regarding new requirements.
- **Components**:
  - D1 (Settings): Basic JSON storage exists.
  - D3 (Backend): Basic ChatKit exists.
  - D2 (UI): Basic Chat view exists.
- **Limitations**: No OAuth, no granular agent-model binding, basic UI.

---

## 3. Acceptance Criteria Coverage

### AC-1: New Roadmap Artifact
- **Interpretation**: Complete overwrite of `ROADMAP-BACKLOG.md`.
- **Verification**: Check file content after task completion.
- **Risks**: Loss of pending minor tasks from old backlog (mitigated by "Gap Analysis" in Task 15).

### AC-2: Domain D1 (Settings) Definition
- **Interpretation**: Define tasks for OAuth (`vscode.authentication`) and Model Registry.
- **Verification**: Roadmap contains specific D1 tasks for these features.

### AC-3: Domain D3 (Backend) Definition
- **Interpretation**: Define tasks for `Role -> Model` mapping logic in Backend.
- **Verification**: Roadmap contains D3 tasks for "Agent Factory" with model binding.

### AC-4: Domain D2 (UI) Definition
- **Interpretation**: Define tasks for Litegraph/Rete integration and Timeline.
- **Verification**: Roadmap contains D2 tasks for "Workflow Editor" and "Timeline View".

### AC-5: Prioritization
- **Interpretation**: OAuth and Mapping must be marked as "High Priority".
- **Verification**: These items appear in the top section of the new roadmap.

---

## 4. Technical Research Integration
- **Workflow UI**: **Litegraph.js** selected (Phase 1). Roadmap will include tasks to wrap it in a Lit component.
- **OAuth**: **vscode.authentication** selected. Roadmap will include tasks for `AuthenticationProvider` implementation.
- **Timeline**: **vis-timeline** selected.

---

## 5. Participating Agents
- **architect-agent**: Will create the `ROADMAP-BACKLOG.md` file.
- **No other agents required**: This is a definition task.

---

## 6. Task Impact
- **Architecture**: Defines the path for major architectural additions (Auth layer, Workflow Engine).
- **APIs**: New roadmap will mandate internal APIs for Model Registry and Agent Instantiation.
- **Compatibility**: No code changes in this task, so no immediate compatibility risk.

---

## 7. Risks and Mitigations
- **Risk 1**: Over-complex roadmap.
  - **Mitigation**: Break down "Visual Workflows" into MVP (viewer) vs Full (editor).
- **Risk 2**: OAuth complexity.
  - **Mitigation**: Prioritize "Manual Token" fallback in D1 before full OAuth.

---

## 8. Open Questions
None. Phase 0 clarified all scope.

---

## 9. TODO Backlog
**Current state**: Empty.

---

## 10. Approval
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-17T18:26:00+01:00
    comments: "Approved by user"
```
