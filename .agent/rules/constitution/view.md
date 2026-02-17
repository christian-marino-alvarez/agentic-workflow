---
id: constitution.view
owner: architect-agent
version: 2.0.1
severity: PERMANENT
scope: view
trigger: model_decision
description: "Governs UI. STRICT: Lit framework Only, structured triad (index/html/styles), no business logic, Event Bus comms, NO direct vscode API."
---

# VIEW LAYER CONSTITUTION

## 1. Principles
- **Dumb Components**: Rendering and interaction only. NO business logic.
- **Reactive**: Immediate UI updates on state change.
- **Web Standards**: Web Components (Lit) and standard CSS.

## 2. Standards
- **Framework**: **Lit** is mandatory. Use `@customElement`.
- **Naming**: Action handlers **MUST** use `userAction[PastTense]` (e.g., `userActionAdded`, `userActionSelected`).

## 3. Structure
- **Component File**: `view/<name>.ts` (Logic & State).
- **Templates**: `view/templates/<templateName>/` folder.
  - `html.ts`: Export `render(view: View)` function.
  - `css.ts`: Export `styles` (Lit CSS).
- **Multi-View**: Components can switch templates dynamically.

## 4. Prohibition
- **No Inline Styles/HTML**: All markup and styles must be in `templates/`.
- **No Direct DOM Manipulation**: Use Lit data binding.

## 5. Communication
- **Event Bus**: Emit to Background via `sendMessage`.
- **Request-Response**: `sendMessage()` returns a `Promise` resolving to the response.
- **Handling**: Override `async listen(message)` to handle incoming events.
- **Connectivity**: Use `await this.ping()` for native health check.
- **Forbidden**: 
  - Direct `vscode.postMessage` (use `sendMessage`).
  - Overriding `connectedCallback` for messaging (use `listen`).
- **State**: View does NOT own permanent state.