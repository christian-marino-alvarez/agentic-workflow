---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: approved
related_task: 13-implement-custom-chat-with-a2ui
---

# Research Report — 13-Implement Custom Chat with A2UI

## Agent Identification (MANDATORY)
🔬 **researcher-agent**: Researching A2UI integration for VS Code.

> [!CAUTION]
> **PERMANENT RULE**: This document is ONLY documentation.
> The researcher-agent documents findings WITHOUT analyzing, WITHOUT recommending, WITHOUT proposing solutions.
> Analysis belongs to Phase 2.

## 1. Executive Summary
- **Problem investigated**: How to implement a custom A2UI-based chat interface in VS Code to replace a legacy (non-existent/removed) ChatKit implementation.
- **Research objective**: Understand A2UI protocol, its integration with VS Code Webviews, and compliance with the "Spanish UI / English Code" requirement.
- **Key findings**:
  - A2UI is a JSON-based declarative UI protocol from Google.
  - No legacy "ChatKit" code exists in the current `src`, offering a clean slate.
  - Integration requires a Host (VS Code Extension) and a Client (Webview with A2UI Renderer).
  - Official A2UI renderers exist for React and Angular; Lit (current project standard) might require a custom adapter or wrapping a React renderer.

---

## 2. Detected Needs
- **Technical requirements**:
  - VS Code Webview capable of rendering A2UI JSON.
  - Streaming support for real-time AI responses.
  - Multi-modal support (text, code blocks, file attachments).
  - Localization support (Spanish UI labels).
- **Assumptions and limitations**:
  - The project currently uses `Lit` for webviews.
  - `openai` dependency is present in `package.json` but seemingly unused in `src`.

---

## 3. Technical Findings

### A2UI (Agent-to-User Interface)
- **Concept**: A protocol where AI agents send declarative JSON describing the UI.
- **Mechanism**:
  1.  **Agent** generates JSON (e.g., `{ "type": "button", "label": "Save" }`).
  2.  **Host** (Extension) forwards this JSON to the Client.
  3.  **Client** (Webview) uses a **Renderer** to map JSON to native components.
- **State**: Public Preview (v0.8).
- **Documentation**: [a2ui.org](https://a2ui.org)

### Integration with VS Code
- **Architecture**:
  - **Backend**: Node.js/TypeScript Extension Host. Acts as the A2UI "Server".
  - **Frontend**: Webview. Acts as the A2UI "Client".
  - **Transport**: `webview.postMessage` (Server -> Client) and `vscode.postMessage` (Client -> Server).
- **Current Codebase State**:
  - `src/extension/modules/app` is a basic Lit-based shell.
  - No conflicting "ChatKit" code found in `src`.
  - `openai` dependency exists (v6.17.0).

---

## 4. Relevant APIs
- **VS Code API**:
  - `vscode.window.createWebviewPanel`: To host the UI.
  - `webview.asWebviewUri`: To load safe content.
  - `webview.postMessage`: To stream A2UI chunks.
- **A2UI Protocol**:
  - `sc-msg` (Server-to-Client): `surfaceUpdate`, `dataModelUpdate`.
  - `cs-msg` (Client-to-Server): `userAction`.

---

## 5. Multi-browser Compatibility
- **VS Code Webview**: Uses a dedicated Electron instance (Chromium) on Desktop.
- **Web Support**: If run in GitHub Codespaces (Browser), A2UI client works as a standard SPA.
- **Mobile**: Not applicable for this VS Code extension scope.

---

## 6. Detected AI-first Opportunities
- **Generative UI**: A2UI allows the agent to invent new UI controls on the fly (e.g., a "Confirm Deploy" card with specific parameters) without deploying new frontend code.
- **Streaming**: A2UI supports streaming JSON, enabling the UI to build itself token-by-token.

---

## 7. Identified Risks
1.  **Renderer Availability for Lit**:
    - **Risk**: Current A2UI SDKs focus on React/Angular. The project uses Lit.
    - **Source**: NPM Registry search for `@a2ui/lit` (not found).
    - **Severity**: High. Might require building a custom renderer or using a React wrapper inside Lit.

2.  **Localization**:
    - **Risk**: Dynamic JSON from LLM might default to English unless system prompt is strictly controlled.
    - **Source**: LLM behavior.
    - **Severity**: Medium. Requires strict prompting ("Always generate labels in Spanish").

3.  **Complexity**:
    - **Risk**: Implementing a full A2UI client is complex compared to static HTML.
    - **Source**: A2UI Specification.
    - **Severity**: Medium.

---

## 8. Sources
- [A2UI Official Site](https://a2ui.org)
- [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview)
- Project Codebase Analysis (`grep`, `ls`, `package.json`).

---

## 9. Developer Approval (MANDATORY)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-16T12:06:32+01:00
    comments: "Approved via chat to save documentation, but PAUSED execution to switch priority to Task D1."
```
