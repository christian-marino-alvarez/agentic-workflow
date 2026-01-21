---
artifact: closure
phase: short-phase-3-closure
owner: architect-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Closure — <taskId>-<taskTitle>

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## 1. Task Summary

**Title**: <title>
**Strategy**: Short
**Final Status**: ☐ Completed ☐ Aborted

---

## 2. Verification

### Executed Tests

| Type | Command/Method | Result |
|------|----------------|--------|
| Unit | | ☐ Pass ☐ Fail ☐ N/A |
| Integration | | ☐ Pass ☐ Fail ☐ N/A |
| E2E | | ☐ Pass ☐ Fail ☐ N/A |

### Justification (if no tests)
<Explain why tests do not apply>

---

## 3. Acceptance Criteria Status

| AC | Description | Status |
|----|-------------|--------|
| 1 | | ☐ ✅ ☐ ❌ |
| 2 | | ☐ ✅ ☐ ❌ |
| 3 | | ☐ ✅ ☐ ❌ |
| 4 | | ☐ ✅ ☐ ❌ |
| 5 | | ☐ ✅ ☐ ❌ |

---

## 4. Changes Made

### Modified/Created Files

| File | Action | Description |
|------|--------|-------------|
| | Created/Modified/Deleted | |

### Commits (if applicable)

```
<type>(<scope>): <description>
```

---

## 5. Developer's Final Acceptance (MANDATORY)

```yaml
approval:
  developer:
    decision: YES | NO
    date: <ISO-8601>
    comments: <optional>
```

> Without acceptance, the task CANNOT be marked as completed.

---

## 6. Final Push (if applicable)

```yaml
push:
  approved: YES | NO
  branch: <target branch>
  date: <ISO-8601>
```
