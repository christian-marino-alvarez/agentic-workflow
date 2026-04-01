---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 17-implement-oauth-provider
---

# Research Report — 17-implement-oauth-provider

## Agent Identification (MANDATORY)
`🔬 **researcher-agent**: Researching OAuth Provider Implementation.`

## 1. Executive Summary
- **Problem**: Need to authenticate users against LLM providers (GitHub, Auth0) securely within VS Code.
- **Objective**: Identify the correct APIs and patterns to implement a custom `AuthenticationProvider`.
- **Key findings**:
  - `vscode.authentication.registerAuthenticationProvider` is the entry point.
  - `AuthenticationProvider` interface requires `getSessions`, `createSession`, `removeSession`.
  - `vscode.secrets` is the standard for secure token storage.
  - PKCE is the recommended flow for VS Code extensions.

---

## 2. Detected Needs
- **Registration**: The extension must declare `authenticationProviders` in `package.json`.
- **Session Management**: Must handle multiple sessions (potentially) and scopes.
- **Security**: Tokens must never be stored in plain text configuration.
- **UX**: The logic must handle the "Sign In" badge and system callbacks/redirects.

---

## 3. Technical Findings

### VS Code Authentication API (`vscode.authentication`)
- **Status**: Stable.
- **Documentation**: [VS Code Auth API](https://code.visualstudio.com/api/references/vscode-api#authentication)
- **Mechanism**:
  - Extension registers a provider.
  - Other extensions (or the same one) request a session: `vscode.authentication.getSession('agw-auth', ['scope'], { createIfNone: true })`.
  - VS Code UI handles the prompt.

### Secure Storage (`vscode.SecretStorage`)
- **Status**: Stable.
- **Documentation**: [SecretStorage](https://code.visualstudio.com/api/references/vscode-api#SecretStorage)
- **Usage**: `context.secrets.store(key, value)` and `context.secrets.get(key)`.
- **Encryption**: Managed by the OS (Keychain on macOS, Credential Manager on Windows, Gnome Keyring/KWallet on Linux).

### PKCE Flow (Proof Key for Code Exchange)
- **Standard**: OAuth 2.0 extension for public clients.
- **Implementation**:
  - Generate random `code_verifier`.
  - Hash to get `code_challenge`.
  - Send `code_challenge` in auth request.
  - Exchange code + `code_verifier` for token.
- **Redirect URI**: Extensions typically use `vscode://<publisher>.<extension-name>/auth`.

---

## 4. Relevant APIs
- `vscode.authentication.registerAuthenticationProvider(id, label, provider, options)`
- `vscode.window.registerUriHandler(handler)` (for callback redirects)
- `vscode.ExtensionContext.secrets`

---

## 5. Multi-browser Compatibility
- **Desktop (Electron)**: Full support via system handlers.
- **Web (vscode.dev)**: Supported but requires different redirect flows (often proxied via a service).
- **Remote**: Supported (auth happens on client, token flows to server if needed, or stays client-side).

---

## 6. Detected AI-first Opportunities
- None direct. This is infrastructure.

---

## 7. Identified Risks
- **Callback Handling**: Ensuring the OS redirects correctly to VS Code (URI Scheme registration required).
- **Token Expiry**: `AuthenticationProvider` needs to verify token validity and auto-refresh or prompt re-login.
- **Secret Storage Access**: On some Linux systems, keyring access can be flaky or require user unlocking.

---

## 8. Sources
- [VS Code API: Authentication](https://code.visualstudio.com/api/references/vscode-api#authentication)
- [VS Code Extension Samples: Auth Provider](https://github.com/microsoft/vscode-extension-samples/tree/main/authentication-provider-sample)
- [OAuth 2.0 PKCE](https://oauth.net/2/pkce/)

---

## 9. Developer Approval (MANDATORY)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-17T21:12:00+01:00
    comments: "Approved by user"
```
