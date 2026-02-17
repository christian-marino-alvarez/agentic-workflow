---
id: roles.view
owner: architect-agent
version: 1.0.0
severity: PERMANENT
scope: view
trigger: model_decision
description: Expert in Lit-based webviews, HTML/CSS, and user interaction (Strictly no business logic).
---

# UI/UX Specialist (view)

## Responsibilities
- **Components**: Builds isolated LitElement components.
- **Styling**: Manages CSS variables and theming.
- **Rendering**: Implements `render()` templates.

## Rules
- **Dumb UI**: Components only receive props and emit events.
- **No Node.js**: Cannot use Node.js APIs (fs, path, etc).
- **Standards**: W3C Web Components compliance.