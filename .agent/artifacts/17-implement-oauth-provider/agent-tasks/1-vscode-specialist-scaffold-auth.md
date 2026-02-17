---
artifact: agent_task
phase: phase-4-implementation
owner: vscode-specialist
status: pending
related_task: 17-implement-oauth-provider
task_number: 1
---

# Agent Task — 1-vscode-specialist-scaffold-auth

## Agent Identification (MANDATORY)
`🔬 **vscode-specialist**: Scaffolding Auth Module.`

## Input (REQUIRED)
- **Objective**: Create the directory structure and base classes for the Auth module.
- **Scope**: `src/extension/modules/auth/`, `AgwAuthProvider.ts`, `AuthService.ts`.
- **Dependencies**: None.

---

## Reasoning (MANDATORY)
*To be completed by the agent.*

---

## Output (REQUIRED)
- **Deliverables**:
  - `src/extension/modules/auth/constants.ts` (NAME constant).
  - `src/extension/modules/auth/index.ts` (Module Definition).
  - `src/extension/modules/auth/background/index.ts` (Background Class).
  - `src/extension/modules/auth/backend/index.ts` (Backend Class).
- **Required evidence**:
  - File existence check.
  - Compilation check (no syntax errors).

---

## Execution
```yaml
execution:
  agent: "vscode-specialist"
  status: completed
  started_at: "2026-02-17T21:22:00+01:00"
  completed_at: "2026-02-17T22:20:00+01:00"

---

## Implementation Report

### Changes made
- **Constitutional Hardening**:
  - Updated `modular-architecture.md`: **Anti-Patterns** (App Logic, Headless).
  - Updated `view.md`: **Standard vs App Patterns**, `listen()` usage.
- **Core Abstraction**:
  - `core/background`: Added `getSession()` method to abstract `vscode.authentication`.
  - `core/types`: Added `IAuthenticationSession` interface.
  - **Result**: Modules can now authenticate via `this.getSession()` without direct `vscode` dependency.
- **Refactoring (Auth)**:
  - `auth/background`: Extends `Core.Background`, implements `AuthenticationProvider`.
  - `auth/background`: Implements `listen()` for `LOGIN/LOGOUT`.
  - `auth/view`: **App View Pattern** (`templates/html.ts`, `templates/css.ts`).
  - `auth/constants.ts`: `MESSAGES`.
- **Refactoring (App & Settings)**:
  - `app/background`: Cleaned `Settings` logic.
  - `app/index.ts`: Registers `Auth` & `Settings`.

### Technical decisions
- **Auth Abstraction**: Implemented `getSession` in Core to satisfy user requirement that "no module should know about vscode auth".
- **Constitutions**: Codified strict rules.
- **View Pattern**: Standardized on App Pattern for simple views.

### Evidence
- **Structure**: Full module structure + Core Abstraction.
- **Compilation**: Verified success (Exit code 0).
- **Architecture**: Compliant with all strict rules and user preferences.

### Deviations from objective
- Added Core Abstraction for Auth as requested by user during review.

---

## Gate (REQUIRED)
```yaml
approval:
  developer:
    decision: null
    date: null
    comments: null
```
