# Acceptance Criteria — 18-model-registry-ui

## Agent Identification (MANDATORY)
🏛️ **architect-agent**: Define specific requirements for the Model Registry UI.

## 1. Consolidated Definition
Refactor the Settings module to act as a secure Model Registry. The UI must support adding/editing/deleting model configurations for a fixed set of providers (Codex, Gemini, Claude). Security is paramount: API Keys must be stored in `vscode.SecretStorage`. The UI must offer a choice between API Key and OAuth (where applicable) and provide immediate validation via a "Test Connection" feature.

## 2. Answers to Clarification Questions
> This section documents the developer's answers to the 5 questions formulated by the architect-agent.

| # | Question (formulated by architect) | Answer (from developer) |
|---|-----------------------------------|------------------------|
| 1 | Providers: Fixed list or free text? | Fixed list: Codex, Gemini, Claude. |
| 2 | Auth Interaction: OAuth button vs API Key field? | Both options for ALL providers (Hybrid). |
| 3 | Security: SecretStorage or settings.json? | `vscode.SecretStorage`. |
| 4 | CRUD Scope: Create/Edit/Delete? | Yes (Refactor existing functionality). |
| 5 | Validation: Include "Test Connection"? | YES. |

---

## 3. Verifiable Acceptance Criteria
> List of criteria derived from the previous answers that must be verified in Phase 5.

1. Scope:
   - [ ] **UI Refactor**: Settings view supports specific forms for Codex, Gemini, and Claude.
   - [ ] **Hybrid Auth**: Selector for "Authentication Type" (API Key / OAuth) is visible for each model.

2. Inputs / Data:
   - [ ] **Secret Storage**: API Keys are written to/read from `vscode.SecretStorage`.
   - [ ] **Configuration**: Non-sensitive data (model name, max tokens) remains in `settings.json`.

3. Outputs / Expected Result:
   - [ ] **OAuth Flow**: Clicking "Connect" triggers the `AuthenticationProvider` (Task 17) and retrieves a token.
   - [ ] **Validation**: Clicking "Test Connection" validates the credential (simple ping) and shows success/error.

4. Constraints:
   - [ ] **Migration**: Existing settings in `settings.json` must be migrated or deprecated cleanly.
   - [ ] **Security**: No API Key should ever be visible in plain text in `settings.json` after save.

5. Acceptance Criterion (Done):
   - [ ] Users can successfully add a Gemini model using Google OAuth.
   - [ ] Users can successfully add a Codex model using an API Key.
   - [ ] Both persist correctly across reloads (Secrets + Config).

---

## Approval (Gate 0)
This document constitutes the task contract. Its approval is blocking to proceed to Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-18T07:20:00+01:00
    comments: Approved via chat
```

---

## Validation History (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "pending"
    validated_by: "architect-agent"
    timestamp: "2026-02-18T07:15:00+01:00"
    notes: "Awaiting developer approval"
```
