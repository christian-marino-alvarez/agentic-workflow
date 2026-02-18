---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 18-model-registry-ui
---

# Analysis — 18-model-registry-ui

## Agent Identification (MANDATORY)
🏛️ **architect-agent**: Analysis of Model Registry UI Implementation.

## 1. Executive Summary
**Problem**
The current Settings UI only supports basic field entry without secure storage for API keys or validation for connections, making it unsafe and prone to user error.

**Objective**
Transform Settings into a Model Registry with `SecretStorage` support, hybrid authentication (OAuth/Key), and immediate connection validation.

**Success Criterion**
- API Keys are stored in system keychain (via `SecretStorage`).
- Users can toggle between Auth Types per model.
- "Test Connection" button validates credentials against real endpoints.

---

## 2. Project State (As-Is)
- **Structure**: `src/extension/modules/settings/`.
- **Existing Components**:
  - `Settings` (Backend): Already imports `SecretStorageService` but logic handles `apiKey` implicitly.
  - `SettingsBackground` (Orchestrator): Simple proxy.
  - `SettingsView` (UI): Basic Lit form.
- **Limitations**:
  - `LLMModelConfig` interface assumes `apiKey`.
  - No visual distinction for "Connected via OAuth".
  - Secrets are managed somewhat opaquely.

---

## 3. Acceptance Criteria Coverage

### AC-1: Scope (UI Refactor & Hybrid Auth)
- **Interpretation**: The UI must adapt fields based on the selected provider and auth type.
- **Verification**: Manual test of the form dynamic behavior.
- **Risks**: Complexity in Lit state management.

### AC-2: Inputs/Data (SecretStorage)
- **Interpretation**: Sensitive data must never touch `settings.json`.
- **Verification**: Inspect `settings.json` after save to ensure `apiKey` is absent.
- **Risks**: Migration of existing keys (if any users have them in old format).

### AC-3: Outputs (Validation & OAuth)
- **Interpretation**: "Test Connection" must perform a real network check.
- **Verification**: Click button -> Success/Error toast.
- **Risks**: Network latency or CORS issues in Webview (mitigated by proxying via Background).

---

## 4. Technical Research
*(Based on Phase 1 Research)*

- **Storage**: `vscode.SecretStorage` is the only viable secure option.
- **Validation**:
  - **OAuth**: `getSession()` check.
  - **API Key**: Minimal `GET /models` request.
  **Decision**: Implement `verifyConnection()` in `Settings` class (Backend layer) to centralize logic.

---

## 5. Participating Agents

- **vscode-specialist**
  - **Responsibilities**: Ensure `SecretStorage` usage patterns are correct and secure.
  - **Assigned Sub-areas**: `core/backend/secret-service.ts` review.

- **backend-agent**
  - **Responsibilities**: Refactor `Settings.ts` logic.
  - **Assigned Sub-areas**: `verifyConnection` logic, `saveModel` refactor for `authType`.

- **background-agent**
  - **Responsibilities**: Route `TEST_CONNECTION` messages.
  - **Assigned Sub-areas**: `SettingsBackground.ts`.

- **view-agent**
  - **Responsibilities**: Implement Lit components for Hybrid Auth UI.
  - **Assigned Sub-areas**: `settings/view/`.

**Handoffs**: View sends `TEST_CONNECTION` -> Background -> Backend (verifies) -> Background -> View (result).

**Required Components**:
- Modify: `Settings`, `SettingsBackground`, `SettingsView`.
- No new modules created.

---

## 6. Task Impact
- **Architecture**: No structural change. Adheres to Module Contract.
- **APIs**: `LLMModelConfig` interface updated (breaking change for internal types, practically safe as it's TS-only).
- **Compatibility**: Old `settings.json` configurations without `authType` should default to `apiKey` for backward compatibility.

---

## 7. Risks and Mitigations
- **Risk 1**: Keys in `settings.json` (Legacy).
  - **Mitigation**: On load, if `apiKey` is found in config, move it to SecretStorage and clear from config.

- **Risk 2**: UI Latency during Validation.
  - **Mitigation**: Add `isLoading` state to the button in Lit.

---

## 8. Open Questions
None. Phase 0 resolved all scope questions.

---

## 9. TODO Backlog
**Current state**: 0 pending items.
**Impact**: None.

---

## 10. Approval
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-18T07:45:00+01:00
    comments: Approved via chat
```
