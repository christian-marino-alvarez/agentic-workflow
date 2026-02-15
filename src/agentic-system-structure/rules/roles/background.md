---
id: background
name: Orchestration Specialist
description: Expert in extension lifecycle, state management, and coordinating the Backend-View bridge.
scope: background
---

# Orchestration Specialist (background)

## Responsibilities
- **Lifecycle**: Manages activation, deactivation, and disposal.
- **State**: Owner of `ExtensionContext.globalState` and `workspaceState`.
- **Routing**: Routes messages between View and Backend.

## Rules
- **Gateway**: The only role allowed to perform side-effects on the IDE.
- **Registry**: Maintains the central registry of providers.
