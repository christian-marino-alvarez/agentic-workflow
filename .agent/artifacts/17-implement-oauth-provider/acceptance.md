---
artifact: acceptance_criteria
phase: phase-0-acceptance-criteria
owner: architect-agent
status: draft
related_task: 17-implement-oauth-provider
---

# Acceptance Criteria — 17-implement-oauth-provider

## 5 Mandatory Questions (Architect Definition)

### 1. What is the main objective?
Implement a VS Code `AuthenticationProvider` to handle OAuth flows for LLM providers (GitHub, Auth0, etc.).

### 2. What are the specific functional requirements?
- Register the provider with `id: agw-auth`.
- Implement `getSessions`, `createSession`, `removeSession`.
- Support PKCE Authorization Code flow.
- Store tokens securely using `vscode.secrets`.
- Handle token refresh if applicable.

### 3. What are the quality/technical constraints?
- Must use native `vscode.authentication` API.
- Must not block the UI during auth.
- Must handle network errors gracefully.
- Secure storage is mandatory.

### 4. What is out of scope?
- UI for managing models (handled in T018).
- Specific provider implementations (e.g. OpenAI specific logic). This task is the *Provider Foundation*.

### 5. What defines "Done"?
- The extension can request a session via `vscode.authentication.getSession`.
- The user is redirected to a dummy auth URL (or real one if available) and back.
- The token is stored and retrieved.

---

## Approval (Dev)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-17T21:10:00+01:00
    comments: "Approved by user"
```
