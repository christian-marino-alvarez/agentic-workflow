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
- **Review objective**  
  Verify that the executed implementation meets the **approved implementation plan** without unauthorized deviations.

- **Overall result**  
  - Status: ☐ APPROVED ☐ REJECTED
  - Review date:
  - Responsible architect:

---

## 2. Verification Against the Implementation Plan
Direct and traceable review **plan → implementation**.

### 2.1 Plan Steps
For **each step defined in `plan.md`**:

| Plan Step | Status | Evidence | Observations |
|-----------|--------|----------|-------------|
| Step 1 | ☐ OK ☐ NOT OK | refs / commits / artifacts | |
| Step 2 | ☐ OK ☐ NOT OK | | |

> All steps **MUST** be in **OK** status to approve the phase.

---

## 3. Subtasks by Agent
Review of individual implementations.

### Agent: `<agent-name>`
- **Subtask document**:
  - `.agent/artifacts/<taskId>-<taskTitle>/<agent>/subtask-implementation.md`
- **Evaluation**:
  - ☐ Meets the plan
  - ☐ Deviations detected (detail below)

**Architect's Notes**
- Changes made:
- Technical decisions:
- Coherence with the rest of the system:

(Repeat section for each participating agent)

---

## 4. Acceptance Criteria (impact)
Verification that the implementation **does not break** the defined acceptance criteria.

- ☐ All ACs remain valid
- ☐ Some AC requires review (detail)

**Observations**
- Affected ACs:
- Reason:

---

## 5. Architectural Coherence
Overall system evaluation after implementation.

- ☐ Respects project architecture
- ☐ Respects clean code
- ☐ Does not introduce significant technical debt
- ☐ Maintains expected compatibility (multi-browser if applicable)

**Architectural Observations**
- Structural impact:
- Component impact:
- Introduced risks:

---

## 6. Plan Deviations
Explicit record of deviations (if any).

- **Deviation**
  - Description:
  - Justification:
  - Was it planned? ☐ Yes ☐ No
  - Does it require replanning? ☐ Yes ☐ No

(If no deviations, indicate explicitly: "No deviations detected.")

---

## 7. Architect's Final Decision
**Strict and binary** decision.

```yaml
decision:
  architect:
    result: APPROVED | REJECTED
    date: <ISO-8601>
    comments: <optional>
