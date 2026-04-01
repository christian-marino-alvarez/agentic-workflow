# Acceptance Criteria — 13-Implement Custom Chat with A2UI

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## 1. Consolidated Definition
The user requires replacing the current VSCode ChatKit integration with a custom chat interface built using **A2UI** (Google's new framework for AI-rendered components). The goal is to completely remove dependencies on `vscode-chatkit` and implement a "Premium" chat experience that supports **Spanish UI labels** while maintaining the source code in **English**. Key features must include Markdown rendering, Streaming, Code Blocks, Slash Commands, and File Attachments. The design is not pre-defined, so a research phase is required to define the look & feel using A2UI capabilities.

## 2. Answers to Clarification Questions
> This section documents the developer's answers to the 5 questions formulated by the architect-agent.

| # | Question (formulated by architect) | Answer (from developer) |
|---|-----------------------------------|------------------------|
| 1 | **Architecture (A2UI)**: What exactly is "A2UI"? Is it an existing NPM library, a local module, or a new framework we need to create from scratch? | A2UI is the new framework from Google to render components by AI Agents. |
| 2 | **Scope (ChatKit)**: Does "Replace ChatKit" imply a complete removal of the `vscode-chatkit` dependency? Does this affect the backend `sessions` endpoint or just the frontend? | Yes, we have to eliminate any code made for OpenAI ChatKit. |
| 3 | **Features**: What mandatory features must this "Custom Chat" support? (e.g., Markdown, Streaming, Code Blocks, Slash Commands, File Attachments)? | Yes (Markdown, Streaming, Code Blocks, Slash Commands, File Attachments). |
| 4 | **Language**: Confirming "Spanish chat / English code": Does this mean **UI Labels/Texts** in Spanish and **Source Code** in English? Does it affect the System Prompt language? | Yes. |
| 5 | **Design**: Is there a specific design/wireframe for A2UI? Should it look like VS Code native or have a custom "Premium" style? | No, do research. |

---

## 3. Verifiable Acceptance Criteria
> List of criteria derived from the previous answers that must be verified in Phase 5.

1. Scope:
   - `vscode-chatkit` dependency is removed from `package.json` and `node_modules`.
   - All `ChatKit` related code in `src/extension/` and `src/webview/` is removed or refactored.
   - A new Chat Interface is implemented using A2UI framework.

2. Inputs / Data:
   - User types messages in Spanish/English.
   - User can attach files.
   - User can use slash commands (e.g., `/reset`, `/model`).

3. Outputs / Expected Result:
   - Chat UI renders messages with Markdown support.
   - Code blocks are syntax highlighted and copyable.
   - Responses stream in real-time.
   - UI Labels (buttons, placeholders, errors) are in **Spanish**.

4. Constraints:
   - Source code variable names, comments, and structure must be in **English**.
   - Must use **A2UI** framework.
   - Must work within VS Code Webview.

5. Acceptance Criterion (Done):
   - A functional Chat Interface displayed in VS Code Side Bar.
   - Can send a message and receive a streaming response from the Agent.
   - "ChatKit" is nowhere to be found in the codebase.

---

## Approval (Gate 0)
This document constitutes the task contract. Its approval is blocking to proceed to Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-16T12:00:33+01:00
    comments: "Approved via chat"
```

---

## Validation History (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-02-16T11:59:02+01:00"
    notes: "Acceptance criteria defined"
```
