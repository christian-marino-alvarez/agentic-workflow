---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Implementation Plan — <taskId>-<taskTitle>

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## 1. Plan Summary
- **Context**: brief reminder of the task objective.
- **Expected result**: what will be implemented upon completion.
- **Scope**: what this plan explicitly includes and excludes.

---

## 2. Contractual Inputs
- **Task**: `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- **Analysis**: `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`
- **Acceptance Criteria**: explicit reference to the relevant ACs.

**Domain dispatch (MANDATORY if applicable)**
```yaml
plan:
  workflows:
    - domain: <domain-name>
      action: create | refactor | delete | audit | verify | none
      workflow: <workflow.id>

  dispatch:
    - domain: <domain-name>
      action: create | refactor | delete | audit | verify | none
      workflow: <workflow.id>
```

---

## 3. Implementation Breakdown (steps)
Ordered and executable decomposition.

### Step 1
- **Description**
- **Dependencies**
- **Deliverables**
- **Responsible agent**

### Step 2
- (Repeat structure)

> Note: indicate order, dependencies, and parallelization if applicable.

---

## 4. Responsibility Assignment (Agents)
Clear mapping of agents ↔ sub-areas.

- **Architect-Agent**
  - Responsibilities
- **Implementation-Agent**
  - Responsibilities
- **QA / Verification-Agent** (if applicable)
  - Responsibilities
- **Other agents** (if applicable)

**Handoffs**
- What is delivered, to whom, and when.

**Components (if applicable)**
- Define who executes it.
- Define how it is implemented (steps and criteria).
- Define the best available tool (prefer declared tools; if none exists, justify alternative).
- Reference the chosen tool by alias and the reason.

**Demo (if applicable)**
- Define expected structure aligned with the project architecture.
- Define mandatory tool for scaffolding generation (if it exists).

---

## 5. Testing and Validation Strategy
How it will be verified that the implementation meets the ACs.

- **Unit tests**
  - Scope and tools
- **Integration tests**
  - Flows covered
- **E2E / Manual**
  - Key scenarios

**Traceability**
- Mapping of tests ↔ acceptance criteria.

---

## 6. Demo Plan (if applicable)
- **Demo objective**
- **Scenario(s)**
- **Example data**
- **Demo success criteria**

---

## 7. Estimations and Implementation Weights
- **Estimation per step / sub-area**
  - relative effort (low / medium / high or points)
- **Approximate timeline** (if applicable)
- **Assumptions** used for estimation

---

## 8. Critical Points and Resolution
Identification of key technical risks.

- **Critical point 1**
  - Risk
  - Impact
  - Resolution strategy
- **Critical point 2**
  - (Repeat)

---

## 9. Dependencies and Compatibility
- **Internal dependencies**
- **External dependencies**
- **Cross-browser compatibility** (if applicable)
  - Chrome / Chromium
  - Firefox
  - Safari
- **Relevant architectural constraints**

---

## 10. Completion Criteria
Objective conditions to consider the implementation "Done".

- Final checklist aligned with acceptance criteria.
- Mandatory verifications completed.

---

## 11. Developer Approval (MANDATORY)
This plan **requires explicit and binary approval**.

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <optional>
