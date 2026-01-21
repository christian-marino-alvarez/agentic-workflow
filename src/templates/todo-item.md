---
artifact: todo_item
owner: architect-agent
status: open | in-progress | done | cancelled
priority: high | medium | low
---

# TODO: <brief title>

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## Source
- **Detected in task**: <taskId>-<taskTitle>
- **Phase**: <phase where it was detected>
- **Date**: <ISO-8601>
- **Agent**: <agent who detected it>

## Description
<Clear description of the proposed improvement>

## Justification
<Why it is important to make this change>

## Estimated Impact
- **Complexity**: low | medium | high
- **Affected Areas**: <components/workflows/templates>

## Acceptance Criteria
- [ ] <Verifiable condition 1>
- [ ] <Verifiable condition 2>

## Notes
<Additional relevant information>

---

## History
```yaml
history:
  - action: created
    date: <ISO-8601>
    by: <agent>
  # - action: started | completed | cancelled
  #   date: <ISO-8601>
  #   by: <agent>
  #   task: <taskId where it was implemented>
```
