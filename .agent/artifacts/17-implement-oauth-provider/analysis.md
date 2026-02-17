---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 17-implement-oauth-provider
---

# Analysis — 17-implement-oauth-provider

## Agent Identification (MANDATORY)
`🏛️ **architect-agent**: Analysis of OAuth Provider Implementation.`

## 1. Executive Summary
**Problem**
- The extension currently lacks a secure, native way to authenticate users against LLM providers (GitHub, Auth0), relying on manual API keys or disjointed flows.

**Objective**
- Implement a `vscode.AuthenticationProvider` to handle OAuth flows natively within VS Code.

**Success Criterion**
- The provider `agw-auth` is registered.
- `vscode.authentication.getSession('agw-auth', ...)` returns a valid token.
- Tokens are stored in `vscode.secrets`.

---

## 2. Project State (As-Is)
- **Structure**: `src/extension/modules/core` exists but lacks a dedicated `auth` module.
- **Components**: `SettingsStorage` (T021) is yet to be migrated; currently using `vscode.workspace.getConfiguration`.
- **Infrastructure**: `extension.ts` initializes modules. Need to add `AuthModule`.
- **Limitations**: No existing OAuth infrastructure.

---

## 3. Acceptance Criteria Coverage

### AC-1: Provider Registration
- **Interpretation**: Must use `vscode.authentication.registerAuthenticationProvider`.
- **Verification**: Check VS Code "Accounts" menu for the new provider.
- **Risks**: Name collision (unlikely with `agw-auth`).

### AC-2: Session Implementation
- **Interpretation**: Implement `getSessions`, `createSession`, `removeSession`.
- **Verification**: Call `getSession` working; "Sign out" working.
- **Risks**: Race conditions during concurrent login requests.

### AC-3: PKCE Flow
- **Interpretation**: Use standard PKCE (S256).
- **Verification**: Verify `code_challenge` in URL and token exchange success.
- **Risks**: `vscode.env.openExternal` failing on some setups.

### AC-4: Secure Storage
- **Interpretation**: Use `context.secrets`.
- **Verification**: Inspect `keychain` (system dependant) or verify persistence after reload.
- **Risks**: Linux keyring issues (known VS Code limitation, acceptable).

---

## 4. Technical Research
*(Based on Phase 1)*

**Alternative A: Manual Token Input (Legacy)**
- **Pros**: Simple.
- **Cons**: Insecure, poor UX, no refresh.

**Alternative B: Native Auth Provider (Selected)**
- **Pros**: Integrated UX (badges, account menu), secure storage, trusted by users.
- **Cons**: More boilerplate.

**Decision**: **Alternative B** as per Acceptance Criteria.

---

## 5. Participating Agents

- **architect-agent**
  - Validation of the analysis and plan.
- **vscode-specialist**
  - Implement `AgwAuthProvider` class.
  - Register in `package.json`.
- **backend-agent**
  - Implement `AuthService` (singleton).

**Required Components**
- `[NEW] src/extension/modules/auth/`
  - `AgwAuthProvider.ts`
  - `AuthService.ts`
  - `pkce.ts` (utils)

---

## 6. Task Impact
- **Architecture**: Adds a new core module `auth` that other modules (Chat, ModelRegistry) will depend on.
- **APIs**: Exposes `getSession` capability via the standard VS Code API.
- **Compatibility**: No breaking changes (new feature).

---

## 7. Risks and Mitigations
- **Risk 1**: OS not redirecting back to VS Code.
  - **Mitigation**: Implement a "copy code" fallback if redirect fails (Manual Auth Flow).
- **Risk 2**: Token expiration.
  - **Mitigation**: Implement `onDidChangeSessions` to notify listeners when re-login is needed.

---

## 8. Open Questions
- None. Scope defined in Phase 0.

---

## 9. TODO Backlog
- None relevant.

---

## 10. Approval
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-17T21:14:00+01:00
    comments: "Approved by user"
```
