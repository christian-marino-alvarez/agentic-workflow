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

**Success Criterion**
- What conditions must be met to consider this analysis valid
  (direct reference to acceptance criteria).

---

## 2. Project State (As-Is)
Describes the actual state of the project **before implementing anything**.

- **Relevant structure**
  - Folders, components, or affected areas.
- **Existing components**
  - Current state, responsibilities, and limitations.
- **Core / base layers**
  - Which parts of the core or infrastructure are involved (if applicable).
- **Artifacts / previous tasks**
  - Existing tasks that influence or condition this one.
- **Detected limitations**
  - Technical, structural, organizational.

---

## 3. Acceptance Criteria Coverage
For **each acceptance criterion** defined in `task.md`:

### AC-X
- **Interpretation**
  - How this criterion is understood in the current context.
- **Verification**
  - How it will be verified that it is met.
- **Risks / ambiguities**
  - What could fail or is unclear.

(Repeat for all ACs)

---

## 4. Technical Research
Analysis of possible alternatives and approaches.

- **Alternative A**
  - Description
  - Advantages
  - Disadvantages
- **Alternative B**
  - Description
  - Advantages
  - Disadvantages

**Recommended decision (if applicable)**
- Preferred approach and justification.
- If not decided yet, explain why.

---

## 5. Participating Agents
Explicit list of agents needed to execute the task.

- **Agent A**
  - Responsibilities
  - Assigned sub-areas
- **Agent B**
  - Responsibilities
  - Assigned sub-areas

**Handoffs**
- How information or results are transferred between agents.

**Required Components**
- Indicate if components need to be created, modified, or deleted.
- Reference the impact and dependency with the implementation plan.

**Demo (if applicable)**
- Indicate if a demo needs to be created.
- Justify the need and alignment with the project architecture.

---

## 6. Task Impact
Assessment of the expected impact if the task is implemented.

- **Architecture**
  - Planned structural changes.
- **APIs / contracts**
  - Changes to public interfaces (if applicable).
- **Compatibility**
  - Breaking change risks.
- **Testing / verification**
  - What types of tests will be needed.

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
(Only if they exist; ideally empty after Phase 0)

- Question 1
- Question 2

---

## 9. TODO Backlog (Mandatory Consultation)

> [!IMPORTANT]
> The architect-agent **MUST** consult `.agent/todo/` before completing the analysis.

**Reference**: `.agent/todo/`

**Current state**: (empty | N pending items)

**Items relevant to this task**:
- (List backlog items that impact the current task)
- (If no relevant items, indicate "None")

**Impact on analysis**:
- (Describe how backlog items affect the proposed alternatives)

---

## 10. Approval
This analysis **requires explicit developer approval**.

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <optional>
```

> Without approval, this phase **CANNOT be considered completed** nor advance to Phase 3.
