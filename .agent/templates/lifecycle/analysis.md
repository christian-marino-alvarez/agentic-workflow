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
- Main objective of the task (from `init.md`).

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
For **each acceptance criterion** defined in `init.md`:

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

## 6. Subtask Identification (MANDATORY)

> [!IMPORTANT]
> The architect-agent **MUST** identify and list all subtasks required for implementation.
> Each subtask will receive its own individual plan in Phase 3 and its own execution gate in Phase 4.

Formal decomposition of the task into executable subtasks:

```yaml
subtasks:
  - id: ST-1
    name: "<descriptive name>"
    type: backend | background | view | integration | generic
    agent: <assigned-agent>
    scope: "<what this subtask covers>"
    dependencies: []
    optional_workflows: []  # research | qa | performance

  - id: ST-2
    name: "<descriptive name>"
    type: backend | background | view | integration | generic
    agent: <assigned-agent>
    scope: "<what this subtask covers>"
    dependencies: [ST-1]
    optional_workflows: []
```

**Subtask type reference** (all dispatched to `workflow.subtask-execution`):
- `backend` → business logic, data persistence (loads `constitution.backend`)
- `background` → orchestration, messaging (loads `constitution.background`)
- `view` → UI components, Lit (loads `constitution.view`)
- `integration` → cross-layer validation, communication paths
- `generic` → configuration, documentation, refactoring, or other non-layer tasks

**Execution order**: (describe the sequence and parallelization, if any)

---

## 7. Task Impact
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

## 8. Risks and Mitigations
- **Risk 1**
  - Impact
  - Mitigation
- **Risk 2**
  - Impact
  - Mitigation

---

## 9. Open Questions
(Only if they exist; ideally empty after Phase 0)

- Question 1
- Question 2

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
