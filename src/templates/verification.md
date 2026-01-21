---
artifact: verification
phase: phase-5-verification
owner: qa-agent
status: pending | approved | rejected
related_task: <taskId>-<taskTitle>
related_plan: .agent/artifacts/<taskId>-<taskTitle>/plan.md
related_review: .agent/artifacts/<taskId>-<taskTitle>/architect/review.md
---

# Verification Report — <taskId>-<taskTitle>

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## 1. Verification Scope
- What was verified
- What was excluded

---

## 2. Executed Tests
- Unit tests (as per `constitution.project_architecture`)
  - Suites
  - Result (pass/fail)
- Integration tests (as per `constitution.project_architecture`, if applicable)
  - Suites
  - Result (pass/fail)
- E2E tests (as per `constitution.project_architecture`, if applicable)
  - Suites
  - Result (pass/fail)

---

## 3. Coverage and Thresholds
- Total Coverage (%)
- Coverage per area (if applicable)
- Thresholds defined in the plan (met / not met)

---

## 4. Performance (if applicable)
- Collected metrics
- Thresholds (met / not met)

---

## 5. Evidence
- Logs
- Test reports
- Screenshots (if applicable)

---

## 6. Issues
- Bugs found
- Severity
- Status

---

## 7. Checklist
- [ ] Verification completed
- [ ] Testing thresholds met
- [ ] Ready for Phase 6

---

## 8. Developer Approval (MANDATORY)
```yaml
approval:
  developer:
    decision: YES | NO
    date: <ISO-8601>
    comments: <optional>
```
