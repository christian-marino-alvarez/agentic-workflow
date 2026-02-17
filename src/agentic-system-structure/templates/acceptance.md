# Acceptance Criteria — {{task.id}}-{{task.title}}

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## 1. Consolidated Definition
{{consolidated_definition}}

## 2. Answers to Clarification Questions
> This section documents the developer's answers to the 5 questions formulated by the architect-agent.

| # | Question (formulated by architect) | Answer (from developer) |
|---|-----------------------------------|------------------------|
| 1 | {{question.1}} | {{answer.1}} |
| 2 | {{question.2}} | {{answer.2}} |
| 3 | {{question.3}} | {{answer.3}} |
| 4 | {{question.4}} | {{answer.4}} |
| 5 | {{question.5}} | {{answer.5}} |

---

## 3. Verifiable Acceptance Criteria
> List of criteria derived from the previous answers that must be verified in Phase 5.

1. Scope:
   - {{acceptance.scope}}

2. Inputs / Data:
   - {{acceptance.inputs}}

3. Outputs / Expected Result:
   - {{acceptance.outputs}}

4. Constraints:
   - {{acceptance.constraints}}

5. Acceptance Criterion (Done):
   - {{acceptance.done}}

---

## Approval (Gate 0)
This document constitutes the task contract. Its approval is blocking to proceed to Phase 1.

```yaml
approval:
  developer:
    decision: null # SI | NO
    date: null
    comments: null
```

---

## Validation History (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "{{timestamp}}"
    notes: "Acceptance criteria defined"
```
