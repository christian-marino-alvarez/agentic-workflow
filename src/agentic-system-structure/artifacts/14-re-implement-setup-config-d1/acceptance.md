# Acceptance Criteria — 14-Re-implement Setup/Config (D1)

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## 1. Consolidated Definition
The user requires a complete re-implementation of the Setup and Configuration domain (D1). This involves abstracting the "Core" to expose secure methods for accessing settings. The settings to be persisted include LLM Models (selection), OAuth/API Keys, Language, and Theme. The storage mechanism must follow security best practices (likely `SecretStorage` for keys and `GlobalState` for non-sensitive data). The UI must be built using **Lit** and **Google Material Design**, ensuring a premium look and feel. There is no legacy data to migrate.

## 2. Answers to Clarification Questions
> This section documents the developer's answers to the 5 questions formulated by the architect-agent.

| # | Question (formulated by architect) | Answer (from developer) |
|---|-----------------------------------|------------------------|
| 1 | **Scope of Settings**: What specific settings must be persisted? | LLM -models (model selected), oAuth o API keys, Histori chat (pero es para otra tarea), language, theme |
| 2 | **Storage Mechanism**: Should `SettingsStorage` use VS Code `globalState`/`workspaceState`, `secretStorage` (for keys), or a local JSON file? | Analizar la mejor solucion desde la perspectiva de seguridad y recomendacion de vscode |
| 3 | **UI Framework**: Confirming usage of **Lit**. Should it be a standalone Webview (Settings Page) or integrated into the Chat Sidepanel? | Lit y Material Design de Google |
| 4 | **Backend Logic**: Does the `core/background` layer need to expose a specific API (e.g., `getSettings`, `updateSettings`) via the message bus? | Core siempre es abstracto, puedo exponer metodos para acceder a datos seguros y poder asegurar que todos los modulos mantienen la seguridad |
| 5 | **Migration**: Is there legacy data/configuration that needs to be migrated, or do we start with a fresh schema? | No, es nuevo |

---

## 3. Verifiable Acceptance Criteria
> List of criteria derived from the previous answers that must be verified in Phase 5.

1. Scope:
   - Implement `SettingsStorage` service in `core/background`.
   - Implement Settings UI using **Lit** and **Material Design** components.
   - Expose abstract methods in Core for secure data access.

2. Inputs / Data:
   - User inputs API Keys (securely masked).
   - User selects LLM Model from a dropdown.
   - User selects Language and Theme.

3. Outputs / Expected Result:
   - Settings are persisted across VS Code restarts.
   - API Keys are stored in VS Code `SecretStorage`.
   - Non-sensitive settings are stored in `GlobalState` or `WorkspaceState`.
   - UI reflects current settings state.

4. Constraints:
   - Must use **Lit** framework.
   - Must use **Material Design** tokens/styles.
   - Core layer must remain abstract and secure.

5. Acceptance Criterion (Done):
   - A functional Settings UI where users can configure the agent.
   - Verification that keys are not stored in plain text.
   - A clean, premium UI that matches Google's Material Design standards.

---

## Approval (Gate 0)
This document constitutes the task contract. Its approval is blocking to proceed to Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-16T12:14:51+01:00
    comments: "Approved via chat"
```

---

## Validation History (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-02-16T12:13:54+01:00"
    notes: "Acceptance criteria defined"
```
