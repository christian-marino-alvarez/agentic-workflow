---
id: rules.roles.index
owner: architect-agent
version: 1.0.1
severity: PERMANENT
trigger: always_on
---

# INDEX — Rules / Roles

## Objective
This file lists all the rules for the `roles` domain.
Workflows/agents **MUST** reference these rules
via aliases instead of direct paths.

## Global Rules (PERMANENT)

### Behavior and Agent Identification
**Severity**: PERMANENT  
**Scope**: All roles

All agents MUST strictly follow the identification and interaction rules defined in:
`constitution.agents_behavior`

**Summary**:
- Mandatory identification using `<icon> **<agent-name>**`, with the compatibility exception defined in `constitution.agents_behavior`.
- Only the Architect can modify rules.
- QA does not implement functional code.

---

## Aliases (YAML)
```yaml
roles:
  architect: .agent/rules/roles/architect.md
  qa: .agent/rules/roles/qa.md
  researcher: .agent/rules/roles/researcher.md
  tooling: .agent/rules/roles/tooling.md
  neo: .agent/rules/roles/neo.md
```

## Rules
- This index **only** declares rules for the `roles` domain.
- Each new role **MUST** be added here before being used.
- Each role **MUST** include the mandatory prefix rule in its definition.
