---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 18-model-registry-ui
---

# Implementation Plan — 18-model-registry-ui

## Agent Identification (MANDATORY)
🏛️ **architect-agent**: Detailed Implementation Plan for Model Registry UI.

## 1. Plan Summary
- **Context**: Transform the Settings module into a secure Model Registry.
- **Expected result**: A Settings UI that supports Hybrid Auth (Key/OAuth) and validates connections.
- **Scope**: `settings` module refactor. No new modules.

---

## 2. Contractual Inputs
- **Task**: `.agent/artifacts/18-model-registry-ui/task.md`
- **Analysis**: `.agent/artifacts/18-model-registry-ui/analysis.md`
- **Acceptance Criteria**: AC-1 (Scope), AC-2 (Inputs), AC-3 (Outputs).

**Domain dispatch**
```yaml
plan:
  workflows: [] # No new domains created
  dispatch:
    - domain: settings
      action: refactor
      workflow: coding-general
```

---

## 3. Implementation Breakdown

### Step 1: Backend Core Logic
- **Description**: Update data model and implement validation logic.
- **Dependencies**: None.
- **Deliverables**: Updated `types.ts`, `Settings.ts`.
- **Responsible agent**: `backend-agent`

### Step 2: Background Orchestration
- **Description**: Enable message routing for validation requests.
- **Dependencies**: Step 1.
- **Deliverables**: Updated `SettingsBackground.ts` with `TEST_CONNECTION_REQUEST` handler.
- **Responsible agent**: `background-agent`

### Step 3: View Implementation (Lit)
- **Description**: Update UI to support Hybrid Auth forms and Validation feedback.
- **Dependencies**: Step 2.
- **Deliverables**: `settings/view/index.ts` (Lit component update).
- **Responsible agent**: `view-agent`

### Step 4: Verification
- **Description**: Validate the end-to-end flow.
- **Dependencies**: Step 3.
- **Deliverables**: Verification report.
- **Responsible agent**: `qa-agent` (or developer via `architect-agent`)

---

## 4. Responsibility Assignment

- **backend-agent**
  - **Responsibilities**: 
    - Add `authType` to `LLMModelConfig`.
    - Implement `Settings.verifyConnection()`.
    - Securely handle `apiKey` transitions.

- **background-agent**
  - **Responsibilities**:
    - Listen for `TEST_CONNECTION`.
    - Call `Settings.verifyConnection`.
    - Return result to View.

- **view-agent**
  - **Responsibilities**:
    - Add Radio Group for Auth Type.
    - Conditionally render API Key Input vs "Connect" button.
    - Implement "Test Connection" button with loading state.

**Handoffs**: 
- Backend defines API -> Background exposes it -> View consumes it.

---

## 5. Testing and Validation Strategy

- **Unit tests**
  - `Settings.test.ts`: Mock `fetch` and `SecretStorage`. Verify `verifyConnection` returns true/false correctly.
  
- **Manual Verification**
  - **Scenario 1**: Add Codex Model -> Select API Key -> Enter Key -> Click Test -> Expect Success.
  - **Scenario 2**: Add Gemini Model -> Select OAuth -> Click Connect -> Click Test -> Expect Success.
  - **Scenario 3**: Ensure API Key is NOT in `settings.json`.

---

## 6. Demo Plan
- **Objective**: Demonstrate secure storage and validation.
- **Scenario**: 
  1. Open Settings.
  2. Add new model.
  3. Show Auth Type toggle.
  4. Enter invalid key -> Test -> Error.
  5. Enter valid key -> Test -> Success.

---

## 7. Estimations
- **Step 1 (Backend)**: Low (1h)
- **Step 2 (Background)**: Low (30m)
- **Step 3 (View)**: Medium (2h)
- **Step 4 (Verify)**: Low (30m)

---

## 8. Critical Points
- **Risk**: `SecretStorage` desync.
- **Resolution**: `Settings.ts` `loadModels` must always prioritize SecretStorage over config for keys.

---

## 9. Dependencies
- **Internal**: `Core.Background` (for messaging), `SecretStorageService`.
- **External**: API endpoints (Google, OpenAI, Anthropic).

---

## 10. Completion Criteria
- All ACs passed.
- Unit tests for validation logic passed.
- UI functional and responsive.

---

## 11. Developer Approval (MANDATORY)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-18T07:55:00+01:00
    comments: Approved via chat
```
