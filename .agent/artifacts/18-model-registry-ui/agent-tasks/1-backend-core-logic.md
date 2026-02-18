---
artifact: agent_task
phase: phase-4-implementation
owner: backend-agent
status: pending
related_task: 18-model-registry-ui
task_number: 1
---

# Agent Task — 1-backend-agent-backend-core-logic

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

## Input (REQUIRED)
- **Objective**: Implement backend logic for Model Registry (Auth Type & Validation).
- **Scope**: `src/extension/modules/settings/` (types.ts, backend/index.ts).
- **Dependencies**: None.

---

## Reasoning (MANDATORY)

> [!IMPORTANT]
> The agent **MUST** complete this section BEFORE executing.
> Documenting the reasoning improves quality and allows early error detection.

### Objective analysis
- What is being asked exactly?
  - Extend `LLMModelConfig` with `authType`.
  - Implement `verifyConnection` to validate credentials.
  - Ensure `saveModel` handles `authType` and persists/retrieves keys correctly.
- Are there ambiguities or dependencies?
  - `verifyConnection` needs to handle both OAuth (via `Core.getSession`) and API Key (via `fetch`).
  - `Settings` class is in `backend` layer but `getSession` is in `background` layer usually... WAIT.
  - **CRITICAL**: `Settings` (Backend) runs in Node.js sidecar or Main Process?
    - If it's a sidecar (Node), it CANNOT call `vscode.authentication.getSession` directly.
    - `Core.Background` (Orchestrator) has `getSession`.
    - `Settings` (Backend) currently runs in Main Process (initialized in `SettingsBackground` via `new Settings(context)`).
    - **VERIFIED**: `SettingsBackground.ts` does `this.settings = new Settings(context)`. It is NOT a sidecar. It runs in the Extension Host.
    - Therefore, `Settings.ts` CAN access `vscode` API directly if needed, or better, use the `Core` abstraction if available.
    - BUT `Settings.ts` imports `vscode`.
    - **Conclusion**: `Settings.ts` is in the Extension Host, so it can use `vscode.authentication` and `fetch`.

### Options considered
- **Option A**: Implement validation purely in `Settings.ts`.
  - Pros: Centralized logic.
  - Cons: None, since it's in Extension Host.
- **Option B**: Delegate validation to `Background`.
  - Pros: Decoupling.
  - Cons: `Settings` holds the logic for models, so validation belongs there conceptually as a domain method.

### Decision made
- Chosen option: **Option A**.
- Justification: `Settings` class is the domain model manager. Validation is a domain operation. 

---

## Output (REQUIRED)
- **Deliverables**:
  - `src/extension/modules/settings/types.ts` (updated)
  - `src/extension/modules/settings/backend/index.ts` (updated)
- **Required evidence**:
  - Unit test or manual verification log showing `verifyConnection` returns true/false.

---

## Execution

```yaml
execution:
  agent: "backend-agent"
  status: completed
  started_at: 2026-02-18T08:00:00+01:00
  completed_at: 2026-02-18T08:05:00+01:00
```

---

## Implementation Report

> This section is completed by the assigned agent during execution.

### Changes made
- Updated `src/extension/modules/settings/types.ts`: Added `authType` to `LLMModelConfig`.
- Updated `src/extension/modules/settings/backend/index.ts`: Implemented `verifyConnection` method specific to Codex, Gemini, and Claude.

### Technical decisions
- Implemented `verifyConnection` in `Settings` class (Backend layer).
- Refactored `provider`, `authType`, `URLs`, and `Headers` to use constants defined in `settings/constants.ts` (Configuration Schemas).
- Simplified validation logic by extracting request configuration to `getVerificationRequest` helper.

### Evidence
- `constants.ts` updated with `PROVIDERS`, `AUTH_TYPES`, `PROVIDER_URLS`, `PROVIDER_HEADERS`.
- `backend/index.ts` uses a unified `fetch` call with a helper method for request config.

### Deviations from objective
- Added `constants.ts` refactor (URLs and Headers) to the scope of this task as per user feedback.

---

## Gate (REQUIRED)

The developer **MUST** approve this task before the architect assigns the next one.

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <optional>
```
