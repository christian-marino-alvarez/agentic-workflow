---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 18-model-registry-ui
---

# Research Report — 18-model-registry-ui

## Agent Identification (MANDATORY)
🔬 **researcher-agent**: Technical research on SecretStorage, UI patterns, and API Validation.

## 1. Executive Summary
- **Problem**: Need to securely store credentials and validate them for multiple providers in the Settings UI.
- **Objective**: Identify standard APIs for secure storage, suitable UI patterns for hybrid auth, and lightweight validation endpoints.
- **Key Findings**: `vscode.SecretStorage` is the standard solution. Lit's reactive state handles conditional UI well. Each provider has a "list models" endpoint suitable for validation.

---

## 2. Detected Needs
- **Secure Storage**: Mechanism to store API keys outside `settings.json`.
- **UI State**: Way to toggle between API Key and OAuth inputs dynamically.
- **Validation**: Minimal network requests to verify credentials without consuming tokens (if possible).

---

## 3. Technical Findings

### vscode.SecretStorage
- **Description**: Asynchronous key-value storage backed by the OS keychain (native).
- **Status**: Stable API.
- **Documentation**: [VS Code API - SecretStorage](https://code.visualstudio.com/api/references/vscode-api#SecretStorage)
- **Usage**:
  - `get(key: string): Promise<string | undefined>`
  - `store(key: string, value: string): Promise<void>`
  - `delete(key: string): Promise<void>`
  - `onDidChange`: Event fired when secrets change.

### Lit Reactive Rendering
- **Description**: Lit components update automatically when reactive properties change.
- **Pattern**: Use a state property `@state() authType: 'apiKey' | 'oauth'` to conditionally render templates.
- **Security**: `<vscode-text-field type="password">` ensures keys aren't visible in UI (masked).

---

## 4. Relevant APIs (Validation)

| Provider | Endpoint | Method | Headers | Notes |
|---|---|---|---|---|
| **Google (Gemini)** | `https://generativelanguage.googleapis.com/v1beta/models` | GET | `x-goog-api-key: <key>` | Lists available models. Lightweight. |
| **OpenAI (Codex)** | `https://api.openai.com/v1/models` | GET | `Authorization: Bearer <key>` | Validates key permissions. |
| **Anthropic (Claude)** | `https://api.anthropic.com/v1/models` | GET | `x-api-key: <key>` | Requires version header usually. |

---

## 5. Multi-browser Compatibility
- **VS Code Webviews**: Based on Chromium/Electron.
- **CORS**: Requests from Webview (frontend) are restricted.
- **Mitigation**: Validation requests must be proxied through the **Background layer** (Node.js environment), not made directly from the UI.

---

## 6. Detected AI-first Opportunities
- **Auto-Discovery**: If OAuth is connected, we could automatically fetch the list of available models for that user instead of manual entry.

---

## 7. Identified Risks
- **Secret Desync**: If `settings.json` (config) and `SecretStorage` (keys) get out of sync, the UI might show a "configured" model that fails auth.
- **Validation Latency**: Network requests might be slow. UI needs a "Checking..." state to prevent double-clicks.

---

## 8. Sources
- [VS Code Extension Guidelines - Security](https://code.visualstudio.com/api/advanced-topics/security)
- [Gemini API Reference](https://ai.google.dev/api/rest/v1beta/models/list)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference/models/list)

---

## 9. Developer Approval (MANDATORY)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-18T07:35:00+01:00
    comments: Approved via chat
```
