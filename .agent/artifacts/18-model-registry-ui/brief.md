---
artifact: brief
phase: short-phase-1-brief
owner: architect-agent
status: draft
related_task: 18-model-registry-ui
---

# Brief — 18-model-registry-ui

## Agent Identification (MANDATORY)
🏛️ **architect-agent**: Analysis and Plan for Model Registry UI.

## 1. Task Identification
**Title**: model-registry-ui
**Objective**: Refactor Settings to support Hybrid Auth (API Key/OAuth) and Credential Validation.
**Strategy**: Short

---

## 2. The 5 Mandatory Questions
*Documented in acceptance.md*

---

## 3. Acceptance Criteria
*Documented in acceptance.md*

---

## 4. Simplified Analysis

### Current State (As-Is)
- **Backend (`Settings.ts`)**: Already uses `SecretStorageService` for `apiKey`. Clean separation.
- **Data Model (`types.ts`)**: `LLMModelConfig` lacks `authType` (assumes apiKey).
- **UI (`SettingsView`)**: Simple list/form. Lacks OAuth toggle and "Test Connection" button.
- **Validation**: Non-existent.

### Complexity Evaluation
| Indicator | Status | Comment |
|-----------|--------|---------|
| Affects more than 3 packages | ☐ Yes ☑ No | Only `settings` module. |
| Requires API research | ☐ Yes ☑ No | Standard VS Code APIs. |
| Breaking changes | ☑ Yes ☐ No | `settings.json` schema update (minor). |
| Complex E2E tests | ☐ Yes ☑ No | UI testing via Playwright is standard. |

**Complexity result**: ☑ LOW (continue Short)

---

## 5. Implementation Plan

### Ordered Steps

1.  **Backend: Update Data Model**
    -   Modify `src/extension/modules/settings/types.ts`: Add `authType: 'apiKey' | 'oauth'`.
    -   Update `Settings.ts` to handle `authType` persistence.

2.  **Backend: Implement Validation Logic**
    -   Add `verifyConnection(config: LLMModelConfig): Promise<boolean>` to `Settings.ts`.
    -   Logic:
        -   **OAuth**: Call `Core.getSession(provider, scopes)`. If token exists -> Valid.
        -   **API Key**: Make a minimal HTTP request (e.g., list models) to provider API.

3.  **Background: Bridge Logic**
    -   Update `SettingsBackground.ts` to handle `TEST_CONNECTION_REQUEST`.
    -   Route request to `Settings.verifyConnection()`.

4.  **UI: Refactor Components (Lit)**
    -   Update `settings/view/index.ts` (or components).
    -   Add Radio Group: "Authentication Type" (API Key vs OAuth).
    -   Conditional Rendering:
        -   **API Key**: Show Input Field (Password type).
        -   **OAuth**: Show "Connect" button (triggers `createSession` via separate flow, or just "Test Connection" implies auth).
    -   Add "Test Connection" button with Loading/Success/Error state.

### Planned Verification
-   **Manual**: Add Codex (Key), Gemini (OAuth). Verify persistence and "Test Connection" success.
-   **Automated**: Unit tests for `verifyConnection` (mocking fetch/getSession).

---

## 6. Developer Approval (MANDATORY)

```yaml
approval:
  developer:
    decision: null # SI | NO
    date: null
    comments: null
```
