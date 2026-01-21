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
- General status: ☐ SATISFACTORY ☐ UNSATISFACTORY
- Architect's Recommendation: ☐ Accept ☐ Iterate

---

## 2. Task Context
### 2.1 Original Objective
(Extracted from `task.md`)

- Objective:
- Defined scope:
- Out of scope:

### 2.2 Agreed Acceptance Criteria (AC)
List of ACs defined in Phase 0.

| ID | Description | Final Status |
|----|-------------|--------------|
| AC-1 | | ✅ Met / ❌ No |
| AC-2 | | ✅ Met / ❌ No |

---

## 3. Planning (What was agreed upon)
Summary of the **approved plan** from Phase 3.

- General strategy
- Main phases and steps
- Involved agents and responsibilities
- Agreed testing strategy
- Demo plan (if applicable)

> Reference: `plan.md`

---

## 4. Implementation (What was actually done)
Clear description of the executed implementation.

### 4.1 Subtasks per Agent
For each participating agent:

**Agent:** `<agent-name>`
- Assigned responsibility:
- Executed subtasks:
- Generated artifacts:
- Relevant changes:

(Repeat for each agent)

### 4.2 Relevant Technical Changes
- New modules / drivers
- Structural changes
- Affected APIs
- Multi-browser compatibility (if applicable)

---

## 5. Architectural Review
Summary of the architect's review report.

- Consistency with the plan: ☐ Yes ☐ No
- Architectural compliance: ☐ Yes ☐ No
- Clean code compliance: ☐ Yes ☐ No
- Detected deviations:
  - None / Detailed below

**Architect's Conclusions**
- Impact on the system
- Residual risks
- Technical debt (if any)

> Reference: `architect/review.md`

---

## 6. Verification and Validation
Functional verification results.

### 6.1 Executed Tests
- Unit:
- Integration:
- End-to-End / Manual:
- Global Result: ☐ OK ☐ NO OK

### 6.2 Demo (if applicable)
- What was demonstrated
- Demo result
- Developer's observations

> Reference: `verification.md`

---

## 7. Final Status of Acceptance Criteria
Definitive evaluation.

| Acceptance Criteria | Result | Evidence |
|---------------------|--------|----------|
| AC-1 | ✅ / ❌ | |
| AC-2 | ✅ / ❌ | |

> All ACs **MUST** be met to accept the task.

---

## 8. AHRP Discipline and Conformity (CRITICAL)
Evaluation of compliance with safety and orchestration protocol.

| Gate | Status | Observations |
| :--- | :--- | :--- |
| **Gate A (Activation)** | ☐ PASS ☐ FAIL | Did the agent wait for signature before using tools? |
| **Gate B (Reasoning)** | ☐ PASS ☐ FAIL | Was the technical plan approved before implementation? |
| **Global Conformity** | ☐ YES ☐ NO | |

> **NOTE**: If global conformity is **NO**, the final task score will be **0** automatically.

---

## 9. Issues and Deviations
Consolidated list of problems found during the cycle.

- Issue:
  - Phase where it was detected
  - Impact
  - Applied resolution

If no issues were found, explicitly state:
> "No relevant issues detected."

---

## 10. Global Evaluation
Final assessment of the result.

- Technical Quality: ☐ High ☐ Medium ☐ Low
- Alignment with Request: ☐ Full ☐ Partial ☐ Insufficient
- Solution Stability: ☐ High ☐ Medium ☐ Low
- Maintainability: ☐ High ☐ Medium ☐ Low

---

## 11. Developer's Final Decision (MANDATORY)
This decision **closes the phase**.

```yaml
approval:
  developer:
    decision: YES | NO
    date: <ISO-8601>
    comments: <optional>
```
