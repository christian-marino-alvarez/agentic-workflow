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
- **Structure**: Triad required: `index.ts` (logic), `html.ts` (template), `styles.ts` (css).
- **Styling**: Vanilla CSS in `styles.ts`. No external preprocessors.

## 3. Communication
- **Event Bus**: Emit to Background via `p2p`/`bus`.
- **Forbidden**: Direct `vscode.postMessage` (use `Messaging` wrapper).
- **State**: View does NOT own permanent state.