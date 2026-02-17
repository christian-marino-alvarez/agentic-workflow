---
artifact: results_acceptance
phase: phase-6-results-acceptance
owner: architect-agent
status: pending | approved | rejected
related_task: <taskId>-<taskTitle>
related_plan: .agent/artifacts/<taskId>-<taskTitle>/plan.md
related_review: .agent/artifacts/<taskId>-<taskTitle>/architect/review.md
related_verification: .agent/artifacts/<taskId>-<taskTitle>/verification.md
---

# Final Results Report — <taskId>-<taskTitle>

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## 1. Executive Summary (for decision)
This document presents **the complete final result of the task**, consolidating:
- what was planned
- what was implemented
- how it was reviewed
- how it was verified

**Quick Conclusion**
- Overall status: ☐ SATISFACTORY ☐ NOT SATISFACTORY
- Architect recommendation: ☐ Accept ☐ Iterate

---

## 2. Task Context
### 2.1 Original Objective
(Extracted from `task.md`)

- Objective:
- Defined scope:
- Out of scope:

### 2.2 Agreed Acceptance Criteria
List of ACs defined in Phase 0.

| ID | Description | Final Status |
|----|-------------|-------------|
| AC-1 | | ✅ Met / ❌ Not Met |
| AC-2 | | ✅ Met / ❌ Not Met |

---

## 3. Planning (what was agreed to do)
Summary of the **approved plan** from Phase 2.

- General strategy
- Main phases and steps
- Involved agents and responsibilities
- Agreed testing strategy
- Demo plan (if applicable)

> Reference: `plan.md`

---

## 4. Implementation (what was actually done)
Clear description of the executed implementation.

### 4.1 Subtasks by Agent
For each participating agent:

**Agent:** `<agent-name>`
- Assigned responsibility:
- Executed subtasks:
- Generated artifacts:
- Relevant changes:

(Repeat for each agent)

### 4.2 Relevant Technical Changes
- New components
- Structural changes
- Affected APIs
- Cross-browser compatibility (if applicable)

---

## 5. Architectural Review
Summary of the architect's review report.

- Coherence with plan: ☐ Yes ☐ No
- Architecture compliance: ☐ Yes ☐ No
- Clean code compliance: ☐ Yes ☐ No
- Detected deviations:
  - None / Detailed below

**Architect's Conclusions**
- System impact
- Residual risks
- Technical debt (if any)

> Reference: `architect/review.md`

---

## 6. Verification and Validation
Functional verification results.

### 6.1 Tests Executed
- Unit:
- Integration:
- End-to-End / Manual:
- Overall result: ☐ OK ☐ NOT OK

### 6.2 Demo (if applicable)
- What was demonstrated
- Demo result
- Developer observations

> Reference: `verification.md`

---

## 7. Final Acceptance Criteria Status
Definitive evaluation.

| Acceptance Criteria | Result | Evidence |
|---------------------|--------|----------|
| AC-1 | ✅ / ❌ | |
| AC-2 | ✅ / ❌ | |

> All ACs **MUST** be met to accept the task.

---

## 8. Incidents and Deviations
Consolidated list of problems found during the cycle.

- Incident:
  - Phase where detected
  - Impact
  - Applied resolution
- Incident:
  - (Repeat)

If there were no incidents, indicate explicitly:
> "No relevant incidents were detected."

---

## 9. Overall Assessment
Final result evaluation.

- Technical quality: ☐ High ☐ Medium ☐ Low
- Alignment with request: ☐ Total ☐ Partial ☐ Insufficient
- Solution stability: ☐ High ☐ Medium ☐ Low
- Maintainability: ☐ High ☐ Medium ☐ Low

---

## 10. Final Developer Decision (MANDATORY)
This decision **closes the phase**.

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <optional>
