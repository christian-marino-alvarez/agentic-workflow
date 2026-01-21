---
artifact: architect-review
phase: phase-4-implementation
owner: architect-agent
status: approved | rejected
related_task: <taskId>-<taskTitle>
related_plan: .agent/artifacts/<taskId>-<taskTitle>/plan.md
---

# Architectural Implementation Review — <taskId>-<taskTitle>

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## 1. Review Summary
- **Review Objective**  
  Verify that the executed implementation complies with the **approved implementation plan** without unauthorized deviations.

- **Global Result**  
  - Status: ☐ APPROVED ☐ REJECTED
  - Review Date:
  - Responsible Architect:

---

## 2. Verification against the Implementation Plan
Direct and traceable review **plan → implementation**.

### 2.1 Plan Steps
For **each step defined in `plan.md`**:

| Plan Step | Status | Evidence | Observations |
|-----------|--------|----------|--------------|
| Step 1 | ☐ OK ☐ NO OK | refs / commits / artifacts | |
| Step 2 | ☐ OK ☐ NO OK | | |

> All steps **MUST** be in **OK** status to approve the phase.

---

## 3. Subtasks per Agent
Review of individual implementations.

### Agent: `<agent-name>`
- **Task document**:
  - `.agent/artifacts/<taskId>-<taskTitle>/agent-tasks/<N>-<agent>-<taskName>.md`
- **Evaluation**:
  - ☐ Complies with the plan
  - ☐ Deviations detected (detail below)

**Architect's Notes**
- Changes made:
- Technical decisions:
- Consistency with the rest of the system:

(Repeat section for each participating agent)

---

## 4. Acceptance Criteria (Impact)
Verification that the implementation **does not break** the defined acceptance criteria.

- ☐ All ACs remain valid
- ☐ Any AC requires review (detail below)

**Observations**
- Affected ACs:
- Reason:

---

## 5. Architectural Consistency
Global evaluation of the system after implementation.

- ☐ Respects project architecture
- ☐ Respects clean code
- ☐ Does not introduce significant technical debt
- ☐ Maintains expected compatibility (multi-browser if applicable)

**Architectural Observations**
- Impact on structure:
- Impact on modules/drivers:
- Risks introduced:

---

## 6. Plan Deviations
Explicit record of deviations (if any).

- **Deviation**
  - Description:
  - Justification:
  - Was it anticipated in the plan? ☐ Yes ☐ No
  - Does it require re-planning? ☐ Yes ☐ No

(If there are no deviations, explicitly state: "No deviations detected").

---

## 7. Architect's Final Decision
Severe and binary decision.

```yaml
decision:
  architect:
    result: APPROVED | REJECTED
    date: <ISO-8601>
    comments: <optional>
```
