---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Analysis — <taskId>-<taskTitle>

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## 1. Executive Summary
**Problem**
- Briefly describe the problem the task solves.

**Objective**
- Main objective of the task (from `task.md`).

**Success Criteria**
- What conditions must be met for this analysis to be considered valid
  (direct reference to acceptance criteria).

---

## 2. Project State (As-Is)
Describe the actual state of the project **before implementing anything**.

- **Relevant Structure**
  - Affected folders, modules, drivers, or areas.
- **Existing Drivers**
  - Current state, responsibilities, and limitations.
- **Core / Engine / Surfaces**
  - Which parts of the core are involved (if applicable).
- **Artifacts / Previous Tasks**
  - Existing tasks that influence or condition this one.
- **Detected Limitations**
  - Technical, structural, or organizational limitations.

---

## 3. Acceptance Criteria Coverage
For **each acceptance criteria** defined in `task.md`:

### AC-X
- **Interpretation**
  - how this criterion is understood in the current context.
- **Verification**
  - how it will be verified that it is met.
- **Risks / Ambiguities**
  - what can fail or what might not be clear.

(Repeat for all ACs)

---

## 4. Technical Research
Analysis of possible alternatives and approaches.

- **Alternative A**
  - Description
  - Pros
  - Cons
- **Alternative B**
  - Description
  - Pros
  - Cons

**Recommended Decision (if applicable)**
- Preferred approach and justification.
- If not yet decided, explain why.

---

## 5. Participating Agents
Explicit list of agents required to execute the task.

- **Agent A**
  - Responsibilities
  - Assigned sub-areas
- **Agent B**
  - Responsibilities
  - Assigned sub-areas

**Handoffs**
- How information or results are transferred between agents.

**Required Components**
- Indicate if creating, modifying, or deleting components (drivers, modules, etc.) is required.
- Reference the impact and dependency with the implementation plan.

**Demo (if applicable)**
- Indicate if a demo needs to be created.
- Justify the need and alignment with `constitution.project_architecture`.

---

## 6. Task Impact
Evaluation of the expected impact if the task is implemented.

- **Architecture**
  - Expected structural changes.
- **APIs / Contracts**
  - Changes to public interfaces (if applicable).
- **Compatibility**
  - Risks of breaking changes.
- **Testing / Verification**
  - What kind of tests will be necessary.

---

## 7. Risks and Mitigations
- **Risk 1**
  - Impact
  - Mitigation
- **Risk 2**
  - Impact
  - Mitigation

---

## 8. Open Questions
(Only if any exist; ideally empty after Phase 0)

- Question 1
- Question 2

---

## 9. TODO Backlog (Mandatory Consultation)

> [!IMPORTANT]
> The architect-agent **MUST** consult `.agent/todo/` before completing the analysis.

**Reference**: `.agent/todo/`

**Current Status**: (empty | N pending items)

**Items Relevant to this Task**:
- (List backlog items that impact the current task)
- (If no relevant items, state "None")

**Impact on Analysis**:
- (Describe how backlog items affect the proposed alternatives)

---

## 10. Approval
This analysis **requires explicit developer approval**.

```yaml
approval:
  developer:
    decision: YES | NO
    date: <ISO-8601>
    comments: <optional>
```

> Without approval, this phase **CANNOT be considered complete** or move to Phase 3.
