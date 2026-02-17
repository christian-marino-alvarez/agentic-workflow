---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 16-define-advanced-roadmap
---

# Research Report — 16-define-advanced-roadmap

## Agent Identification
`🔬 **researcher-agent**: Advanced Roadmap Research.`

## 1. Executive Summary
- **Problem**: Need to select best technologies for Advanced Agentic features (Visual Workflows, OAuth, Agent Mapping).
- **Research Objective**: Identify libraries for Node/Graph editing compatible with Lit/VSCode, and confirm Architecture for OAuth/Mapping.
- **Key Findings**:
  - **Workflows**: **Litegraph.js** (Canvas) and **Rete.js** (DOM) are top candidates over React Flow (heavy dep).
  - **OAuth**: Native `vscode.authentication` API + `AuthenticationProvider` is the standard path.
  - **timeline**: `vis-timeline` is the standard for interactive timelines, framework agnostic.

---

## 2. Detected Needs
1.  **Workflow GUI**: A lightweight, interactive node editor embeddable in a VSCode Webview (Lit).
2.  **Auth Architecture**: Secure token management for multiple LLM providers.
3.  **Visual Timeline**: Component to visualize agent execution history.

---

## 3. Technical Findings

### 3.1 Workflow Visualization Libraries
| Library | Tech | VSCode Integration | Pros | Cons |
| :--- | :--- | :--- | :--- | :--- |
| **Litegraph.js** | Canvas | High (Framework agnostic) | High perf, "Blueprints" look, no heavy deps. | Canvas styling is harder than CSS. |
| **Rete.js** | DOM/Canvas | High (Modular) | Modern, customizable via CSS (DOM renderer). | V2 API is complex modularity. |
| **React Flow** | React | Medium (Wrapper needed) | Industry standard, great UX. | Requires React bundle inside Lit (bloat). |
| **Mermaid** | SVG | Native | Existing support in markdown. | Not interactive (read-only mostly). |

### 3.2 Visual Timeline Libraries
- **Vis-timeline**: Standard reference. Framework agnostic. High interactivity (zoom/pan).
- **VSCode Webview UI Toolkit**: Does NOT act as a complex timeline, only basic lists.

### 3.3 OAuth Architecture
The `vscode.authentication` namespace is mandatory for integrated experience.
- **Provider**: Implement `AuthenticationProvider`.
- **Flow**: PKCE Authorization Code.
- **Redirects**: `vscode.UriHandler` (`vscode://publisher.extension/callback`).
- **Storage**: `AuthenticationSession` tokens are stored securely by VS Code (Keychain/GLib).

---

## 4. Relevant APIs
- `vscode.authentication.registerAuthenticationProvider`
- `vscode.window.registerUriHandler`
- `vscode.SecretStorage` (for manual API keys, though generic Auth is preferred).

---

## 5. Multi-browser Compatibility
- **Webviews**: Run in an iframe.
- **Litegraph/Rete**: Both work in standard DOM/Canvas.
- **Codespaces**: OAuth callbacks need proxy handling (VS Code handles this via `asExternalUri`).

---

## 6. Detected AI-first Opportunities
- **Generative Workflows**: Use LLM to generate `Litegraph` JSON structure directly.
- **Smart Mapping**: Auto-suggest "Best Model" for a specific Agent Role based on capabilities (e.g., Coding -> Claude 3.5 Sonnet).

---

## 7. Identified Risks
- **React Flow Weight**: Using React Flow inside a Lit extension might increase bundle size ~100kb+ and complexity.
- **OAuth Callbacks**: Corporate proxies sometimes block custom protocol redirects.

---

## 8. Sources
- [VS Code Authentication API](https://code.visualstudio.com/api/references/vscode-api#authentication)
- [Litegraph.js GitHub](https://github.com/jagenjo/litegraph.js)
- [Rete.js Documentation](https://rete.js.org/)

---

## 9. Developer Approval (MANDATORY)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-17T18:25:00+01:00
    comments: "Approved by user"
```
