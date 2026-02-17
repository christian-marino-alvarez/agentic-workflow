---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 17-implement-oauth-provider
---

# Implementation Plan — 17-implement-oauth-provider

## Agent Identification (MANDATORY)
`🏛️ **architect-agent**: Planning the OAuth Provider Implementation.`

## 1. Plan Summary
- **Context**: Implement the `AgwAuthenticationProvider` to enable OAuth flows in the extension.
- **Expected result**: A functional `agw-auth` provider registered in VS Code, capable of issuing tokens.
- **Scope**:
  - `src/extension/modules/auth/` module creation.
  - `AgwAuthProvider` class.
  - `AuthService` singleton.
  - Integration in `package.json` and `extension.ts`.

---

## 2. Contractual Inputs
- **Task**: `task.md` (Objective: Auth Provider).
- **Analysis**: `analysis.md` (Architecture: Native Auth API + PKCE).
- **Acceptance Criteria**: AC-1 (Reg), AC-2 (Sessions), AC-3 (PKCE), AC-4 (Storage).

---

## 3. Implementation Breakdown

### Step 1: Scaffold Auth Module
- **Description**: Create the directory structure and base classes.
- **Dependencies**: None.
- **Deliverables**: `src/extension/modules/auth/` folder, empty `AgwAuthProvider.ts`, `AuthService.ts`.
- **Responsible agent**: vscode-specialist.

### Step 2: Implement PKCE and Storage Logic
- **Description**: Implement `pkce.ts` (S256 generation) and integration with `context.secrets`.
- **Dependencies**: Step 1.
- **Deliverables**: `pkce.ts`, storage logic in `AuthService`.
- **Responsible agent**: backend-agent.

### Step 3: Implement Provider Logic & Registration
- **Description**: Implement `getSessions`, `createSession`, `removeSession` and register in `package.json`.
- **Dependencies**: Step 2.
- **Deliverables**: Fully implemented `AgwAuthProvider`, `package.json` updated.
- **Responsible agent**: vscode-specialist.

---

## 4. Responsibility Assignment

- **VSCode-Specialist**
  - Implement Provider Interface and Registration (Steps 1, 3).
- **Backend-Agent**
  - Implement PKCE and Storage Logic (Step 2).
- **Architect-Agent**
  - Review code against Analysis.

---

## 5. Testing and Validation Strategy

- **Unit Tests**:
  - `pkce.test.ts`: Verify S256 challenge generation.
  - `AuthService.test.ts`: Mock `SecretStorage` and verify persistence.
- **Manual Verification (E2E)**:
  - Launch Extension Host.
  - Run command `Developer: Inspect Tokens`.
  - Trigger login via `vscode.authentication.getSession('agw-auth', ...)`.
  - Verify redirect and token storage.

---

## 7. Estimations
- **Step 1**: Low (Scaffolding).
- **Step 2**: Medium (Crypto logic).
- **Step 3**: Medium (API integration).
- **Total**: ~1-2 hours.

---

## 8. Critical Points
- **Redirects**: Ensuring the OAuth callback `vscode://...` works is critical.
  - **Resolution**: Will log the redirect URI to console for manual verification if needed.

---

## 10. Completion Criteria
- `extensions.json` contains `agw-auth`.
- Unit tests pass.
- Manual login flow works.

---

## 11. Developer Approval
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-17T21:19:00+01:00
    comments: "Approved by user"
```
