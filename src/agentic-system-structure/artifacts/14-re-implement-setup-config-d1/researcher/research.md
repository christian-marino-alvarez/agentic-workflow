---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: approved
related_task: 14-re-implement-setup-config-d1
---

# Research Report — 14-Re-implement Setup/Config (D1)

## Agent Identification (MANDATORY)
🔬 **researcher-agent**: Researching Secure Storage and Material Design UI.

> [!CAUTION]
> **PERMANENT RULE**: This document is ONLY documentation.
> The researcher-agent documents findings WITHOUT analyzing, WITHOUT recommending, WITHOUT proposing solutions.
> Analysis belongs to Phase 2.

## 1. Executive Summary
- **Problem investigated**: How to implement a secure, persistent configuration system and a Google Material Design UI in VS Code.
- **Research objective**: Identify the correct storage APIs for secrets vs generic settings and confirm the toolchain for Lit + Material 3 implementation.
- **Key findings**:
  - **Secrets (API Keys)**: MUST use `vscode.SecretStorage`.
  - **Generic Settings**: `vscode.GlobalState` or `vscode.WorkspaceConfiguration`.
  - **UI**: `@material/web` provides official Google Material 3 components compatible with Lit.

---

## 2. Detected Needs
1.  **Secure Storage**: Secure encryption for OAuth tokens and API keys.
2.  **Persistence**: Settings must survive restart.
3.  **UI Fidelity**: Strict adherence to "Google Material Design" (not just VS Code native look).
4.  **Isolation**: Core layer must mediate access; UI cannot read secrets directly.

---

## 3. Technical Findings

### Secure Storage Mechanism
- **Generic Settings** (Language, Theme, Model):
  - **`vscode.ExtensionContext.globalState`**: Best for extension-specific state that doesn't need to be edited by the user in `settings.json`. Syncs across machines if configured.
  - **`vscode.workspace.getConfiguration`**: Best if we want users to edit settings via standard VS Code Settings UI.
  - **Finding**: Given the requirement for a *custom* UI, `globalState` acts better as a controlled database, whereas `getConfiguration` might conflict if the user edits `settings.json` manually.

- **Secrets** (API Keys):
  - **`vscode.ExtensionContext.secrets`**: Uses system keychain (macOS Keychain, Windows Credential Manager).
  - **Constraint**: Asynchronous API (`get`, `store`, `delete`).
  - **Security**: Data is encrypted at rest.

### Google Material Design with Lit
- **Library**: [`@material/web`](https://github.com/material-components/material-web) (Material 3).
- **Integration**:
  - Published as standard Web Components.
  - Fully compatible with Lit (`import '@material/web/button/filled-button.js'`).
  - **Constraint**: Material 3 uses CSS variables that might clash or look out of place in VS Code's theme unless carefully scoped or themed.
  - **Alternative**: VS Code Webview UI Toolkit (VS Code native look), but user specifically requested **Google Material Design**.

### Event Bus Architecture
- **Pattern**: Request/Response.
- **Flow**:
  1. UI sends `GetSettingsRequest`.
  2. Background (Core) reads `SecretStorage` + `GlobalState`.
  3. Background returns `SettingsPayload` (with masked keys for display).
  4. UI renders.
  5. UI sends `SaveSettingsRequest` (with new plain text keys if changed).
  6. Background writes to storages.

---

## 4. Relevant APIs
- `context.secrets.store(key, value)` / `context.secrets.get(key)`
- `context.globalState.update(key, value)` / `context.globalState.get(key)`
- `webview.postMessage` / `webview.onDidReceiveMessage`

---

## 5. Multi-browser Compatibility
- **Storage**: VS Code APIs abstract the underlying OS storage. Works in Web/Codespaces (Secrets are stored in server-side browser storage or mocked).
- **UI**: Web Components are standard and work in all modern webviews.

---

## 6. Detected AI-first Opportunities
- **Auto-configuration**: The system could potentially detect standard keys in `process.env` or `.env` files to pre-fill the setup (optional, not in strict scope but possible).

---

## 7. Identified Risks
1.  **Material 3 vs VS Code Theme**:
    - **Risk**: Material 3 has its own color system. It might not respect VS Code's High Contrast or Dark/Light theme switching automatically.
    - **Severity**: Medium. Requires explicit CSS variable mapping (`--md-sys-color-primary: var(--vscode-button-background)`).

2.  **Secret Persistence**:
    - **Risk**: Secrets are improperly cached in memory or passed to the UI in plain text.
    - **Mitigation**: Never send plain text keys to UI *unless* explicitly revealing (which is discouraged). Send masks (e.g., `sk-...XXXX`).

---

## 8. Sources
- [VS Code Extension API: SecretStorage](https://code.visualstudio.com/api/references/vscode-api#SecretStorage)
- [Material Web (M3)](https://github.com/material-components/material-web)
- [Lit Documentation](https://lit.dev)

---

## 9. Developer Approval (MANDATORY)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-16T12:18:19+01:00
    comments: "Approved via chat"
```
