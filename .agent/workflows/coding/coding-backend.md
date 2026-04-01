---
id: workflow.coding.backend
description: On-demand coding workflow for the Backend layer. Invoked by architect-agent during Phase 4 implementation.
owner: backend
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["coding-backend"]
blocking: true
---

# WORKFLOW: coding.backend

## Input (REQUIRED)
- Agent task file assigned by architect:
  - `.agent/artifacts/<taskId>-<taskTitle>/agent-tasks/<N>-backend-<taskName>.md`
- Constitution loaded:
  - `constitution.backend` (MANDATORY)
  - `.agent/rules/constitution/architecture/index.md` (MANDATORY)
  - `constitution.agents_behavior` (MANDATORY)
- Role activated:
  - `roles.backend`

> [!IMPORTANT]
> **This is an on-demand workflow.** It is invoked by `architect-agent` during Phase 4 as part of the implementation plan. The architect defines the execution order of coding workflows.

## Output (REQUIRED)
- Implementation report using `templates.coding.layer_report`:
  - Embedded in the agent task file under "Implementation Report"
- All code changes passing compilation

---

## Objective (ONLY)
- Implement the **backend layer** of the assigned task following `constitution.backend`.
- Generate a detailed implementation report.
- Present to developer for Gate approval.

> This workflow **ONLY** implements backend logic.
> This workflow **NEVER** imports `vscode` or DOM APIs.
> This workflow **NEVER** communicates directly with View.

---

## Mandatory Steps

### 0. Activate role
- Activate `roles.backend` and use mandatory agent prefix in all messages.

### 1. Verify inputs
- Agent task file exists and has Input section completed by architect.
- Constitution `constitution.backend` loaded.
- Constitution `constitution.clean_code` loaded.
- If missing → **FAIL**.

### 2. Analyze the task
- Read the agent task Input (objective, scope, dependencies).
- Complete the "Reasoning" section of the agent task:
  - Analyze objective
  - Consider options
  - Document decision and justification

### 3. Implement
- Write code following `constitution.backend`:
  - **Extend AbstractServer** from `core/backend`.
  - **No vscode imports** — logic must be IDE-decoupled.
  - **Transport agnostic** — use abstract adapters.
  - **Error handling** — return `{ error, code }`, no raw exceptions.
  - **Response format** — strictly typed JSON.
- Write code following `constitution.clean_code`.

### 4. Self-validate
- Verify all constitution rules are satisfied:
  - [ ] Extends `AbstractServer` (if applicable)
  - [ ] No `vscode` or `dom` imports
  - [ ] Error handling via structured responses
  - [ ] No direct View communication
  - [ ] Clean code principles applied
- Run compilation: `npm run compile`
- If compilation fails → fix before proceeding.

### 5. Generate implementation report
- Complete the "Implementation Report" section using `templates.coding.layer_report`:
  - **Who**: Agent identity and role
  - **How**: Technical details, specifications, diagrams if needed
  - **Why**: Justification and reasoning
  - **Results**: What was achieved, compilation status
  - **E2E Test Indications**: Scenarios for e2e testing

### 6. Present to developer (Gate)
- Present completed task with report to developer.
- Request approval: **SI / NO**

### 7. Register Gate
```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <optional>
```

### 8. Evaluate Gate
- If `decision == SI` → go to **Step 9 (PASS)**.
- If `decision == NO`:
  - Mark task as `failed`.
  - Define corrective actions.
  - **Do NOT advance** until resolved.
  - Go to **Step 10 (FAIL)**.

### 9. PASS (only if Gate approved)
- Mark agent task as `completed`.
- Update agent task file:
  ```yaml
  execution:
    status: completed
    completed_at: <ISO-8601>
  ```
- Update the coding layer report with final status.
- Return control to `architect-agent` for next workflow in the sequence.

---

## FAIL (MANDATORY)

### 10. Declare workflow as NOT completed
Cases:
- Missing inputs or constitution.
- Compilation failure not resolved.
- Constitution violation detected.
- Gate = NO without resolution.

Actions:
- Identify the failure point.
- Define corrective actions.
- Iterate until Gate PASS.

---

## Gate (REQUIRED)

Requirements (all mandatory):
1. Code compiles without errors.
2. All `constitution.backend` rules are satisfied.
3. All `constitution.clean_code` rules are satisfied.
4. Implementation report is complete (all 5 sections).
5. Developer Gate PASS (`decision == SI`).
6. Agent task file starts with backend agent prefix.
