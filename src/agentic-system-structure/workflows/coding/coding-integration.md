---
id: workflow.coding.integration
description: On-demand coding workflow for integrating the 3 layers of a module (Backend, Background, View). Invoked by architect-agent during Phase 4 after layer-specific workflows.
owner: architect-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["coding-integration"]
blocking: true
---

# WORKFLOW: coding.integration

## Input (REQUIRED)
- Agent task file assigned by architect:
  - `.agent/artifacts/<taskId>-<taskTitle>/agent-tasks/<N>-architect-integration-<taskName>.md`
- All applicable layer coding workflows completed and approved:
  - `coding-backend` report (if applicable)
  - `coding-background` report (if applicable)
  - `coding-view` report (if applicable)
- Constitutions loaded (ALL):
  - `constitution.backend` (MANDATORY)
  - `constitution.background` (MANDATORY)
  - `constitution.view` (MANDATORY)
  - `constitution.clean_code` (MANDATORY)

> [!IMPORTANT]
> **This workflow runs AFTER all layer-specific coding workflows.** It validates that the 3 layers communicate correctly and comply with all constitutions. The architect is the owner.

## Output (REQUIRED)
- Integration report using `templates.coding.integration_report`:
  - Embedded in the agent task file under "Implementation Report"
- All layers passing compilation and integration validation

---

## Objective (ONLY)
- Validate and ensure **optimal communication** between the 3 layers of the module.
- Verify **constitution compliance** across all layers.
- Generate a detailed **integration report**.
- Present to developer for Gate approval.

> This workflow validates **inter-layer contracts**.
> This workflow ensures **no constitution violations** exist across boundaries.
> This workflow is the **final validation** before Phase 4 closure.

---

## Mandatory Steps

### 0. Activate role
- Activate `architect-agent` and use mandatory prefix in all messages.

### 1. Verify inputs
- All applicable layer coding workflows have Gate PASS.
- All layer reports exist and are complete.
- All 4 constitutions loaded.
- If missing → **FAIL**.

### 2. Review layer reports
- Read each layer's implementation report.
- Identify:
  - Communication touchpoints between layers.
  - Shared contracts (Message types, API interfaces).
  - Potential constitution violations at boundaries.

### 3. Validate communication paths
- **View → Background**: Via `core/messaging` Event Bus only.
  - [ ] No direct `vscode.postMessage` from View.
  - [ ] Typed `Message` payloads.
- **Background → Backend**: Via abstract transport or direct invocation.
  - [ ] No `vscode` leaking into Backend.
  - [ ] Structured error responses from Backend.
- **Background → View**: Via `core/messaging` response path.
  - [ ] Reactive UI updates on state change.
- **View → Backend**: FORBIDDEN.
  - [ ] No direct imports or calls between View and Backend.

### 4. Validate constitution compliance
For each constitution, verify cross-layer boundaries:

#### Backend (`constitution.backend`)
- [ ] Extends `AbstractServer` (if applicable)
- [ ] No `vscode` or `dom` imports
- [ ] Transport agnostic
- [ ] No direct View communication

#### Background (`constitution.background`)
- [ ] Modules registered via `App.register()`
- [ ] Uses `core/messaging` for View communication
- [ ] Manages lifecycle correctly
- [ ] Gateway role maintained (only layer with `vscode` side-effects)

#### View (`constitution.view`)
- [ ] Lit components with `@customElement`
- [ ] Triad structure (index/html/styles)
- [ ] No business logic
- [ ] Communication via Messaging wrapper only

### 5. Integration validation
- Run full compilation: `npm run compile`
- Verify no type errors at layer boundaries.
- If issues found → create corrective sub-task.

### 6. Generate integration report
- Complete the "Implementation Report" section using `templates.coding.integration_report`:
  - **Communication validation matrix**: Results of Step 3
  - **Constitution compliance**: Results of Step 4
  - **Cross-layer sequence diagrams**: Key interaction flows (mermaid)
  - **E2E Test Indications**: Integration test scenarios
  - **Issues found and resolutions**: If any

### 7. Present to developer (Gate)
- Present integration report with all evidence to developer.
- Request approval: **SI / NO**

### 8. Register Gate
```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <optional>
```

### 9. Evaluate Gate
- If `decision == SI`:
  - Mark integration task as `completed`.
  - Return control to architect for Phase 4 closure.
- If `decision == NO`:
  - Identify failing layer(s).
  - Create corrective sub-task for specific layer workflow.
  - Re-run integration after correction.

---

## FAIL (MANDATORY)

### 10. Declare workflow as NOT completed
Cases:
- Layer workflows not completed or not approved.
- Constitution violation at layer boundaries.
- Compilation failure.
- Direct View→Backend communication detected.
- Gate = NO without resolution.

Actions:
- Identify the exact layer and violation.
- Delegate corrective action to the appropriate layer workflow.
- Re-run integration validation after fix.
- Iterate until Gate PASS.

---

## Gate (REQUIRED)

Requirements (all mandatory):
1. All layer coding workflows have Gate PASS.
2. All communication paths validated (Step 3 checklist).
3. All constitutions satisfied at cross-layer boundaries (Step 4 checklist).
4. Full compilation passes without errors.
5. Integration report is complete (all sections).
6. Developer Gate PASS (`decision == SI`).
7. No direct View→Backend communication exists.
