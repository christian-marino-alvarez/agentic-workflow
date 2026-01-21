---
artifact: brief
phase: short-phase-1-brief
owner: architect-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Brief — <taskId>-<taskTitle>

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## 1. Task Identification

**Title**: <task title>
**Objective**: <main objective>
**Strategy**: Short

---

## 2. The 5 Mandatory Questions

| # | Question (formulated by architect) | Answer (from developer) |
|---|-----------------------------------|-------------------------|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |

---

## 3. Acceptance Criteria

Derived from the previous answers:

1. **Scope**: 
2. **Inputs/Data**: 
3. **Expected Outputs**: 
4. **Constraints**: 
5. **Done Criteria**: 

---

## 4. Simplified Analysis

### Current State (As-Is)
- Affected structure:
- Known limitations:

### Complexity Evaluation

| Indicator | Status | Comment |
|-----------|--------|---------|
| Affects more than 3 packages | ☐ Yes ☐ No | |
| Requires API research | ☐ Yes ☐ No | |
| Breaking changes | ☐ Yes ☐ No | |
| Complex E2E tests | ☐ Yes ☐ No | |

**Complexity Result**: ☐ LOW (continue Short) ☐ HIGH (recommend aborting to Long)

---

## 5. Implementation Plan

### Ordered Steps

1. **Step 1**
   - Description:
   - Deliverables:

2. **Step 2**
   - Description:
   - Deliverables:

(Add more steps as needed)

### Planned Verification
- Test types:
- Success criteria:

---

## 6. Developer Approval (MANDATORY)

```yaml
approval:
  developer:
    decision: YES | NO
    date: <ISO-8601>
    comments: <optional>
```

> Without approval, this phase CANNOT move to Implementation.
