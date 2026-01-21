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
- **Expected Result**: what will be implemented upon completion.
- **Scope**: what this plan explicitly includes and excludes.

---

## 2. Contractual Inputs
- **Task**: `.agent/artifacts/<taskId>-<taskTitle>/task.md`
- **Analysis**: `.agent/artifacts/<taskId>-<taskTitle>/analysis.md`
- **Acceptance Criteria**: explicit reference to relevant ACs.

**Domain Dispatch (MANDATORY if applicable)**
```yaml
plan:
  workflows:
    drivers:
      action: create | refactor | delete | none
      workflow: workflow.drivers.create | workflow.drivers.refactor | workflow.drivers.delete

  dispatch:
    - domain: drivers | modules | core | qa
      action: create | refactor | delete | audit | verify | none
      workflow: <workflow.id>
```

---

## 3. Implementation Breakdown (Steps)
Ordered and executable decomposition.

### Step 1
- **Description**
- **Dependencies**
- **Deliverables**
- **Responsible Agent**

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
- **Other Agents** (if applicable)

**Handoffs**
- What is delivered, to whom, and when.

**Components (if applicable)**
- Define who executes it.
- Define how it is implemented (steps and criteria).
- Define the best available tool (prefer declared tools; if none exist, justify the alternative).
- Reference the chosen tool by alias (e.g., `mcp_extensio-cli tools`) and the reason.

**Demo (if applicable)**
- Define the expected structure aligned with `constitution.project_architecture`.
- Define the mandatory tool for generating scaffolding (use `mcp_extensio-cli tools`).

---

## 5. Testing and Validation Strategy
How it will be verified that the implementation meets the ACs.

- **Unit Tests**
  - Scope and tools (see `constitution.project_architecture`)
- **Integration Tests**
  - Covered flows (see `constitution.project_architecture`)
- **E2E / Manual**
  - Key scenarios (see `constitution.project_architecture`)

**Traceability**
- Mapping of tests ↔ acceptance criteria.

---

## 6. Demo Plan (if applicable)
- **Demo Objective**
- **Scenario(s)**
- **Example Data**
- **Demo Success Criteria**

---

## 7. Estimations and Implementation Weights
- **Estimation per Step / Sub-area**
  - relative effort (low / medium / high or points)
- **Approximate Timeline** (if applicable)
- **Assumptions** used for estimating

---

## 8. Critical Points and Resolution
Identification of key technical risks.

### Critical Point 1
- **Risk**
- **Impact**
- **Resolution Strategy**

### Critical Point 2
- (Repeat)

---

## 9. Dependencies and Compatibility
- **Internal Dependencies**
- **External Dependencies**
- **Multi-Browser Compatibility** (if applicable)
  - Chrome / Chromium
  - Firefox
  - Safari
- **Relevant Architectural Constraints**

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
    decision: YES | NO
    date: <ISO-8601>
    comments: <optional>
```
