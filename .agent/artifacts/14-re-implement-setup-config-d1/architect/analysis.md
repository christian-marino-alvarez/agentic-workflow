---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: approved
related_task: 14-re-implement-setup-config-d1
---

# Analysis — 14-Re-implement Setup/Config (D1) [REVISED]

## Agent Identification (MANDATORY)
🏛️ **architect-agent**: Defined Modular Architecture (Shell + Tabs).

## 1. Executive Summary
- **Change Request**: Move from Monolithic App to **Modular Shell Architecture**.
- **New Structure**:
  - **App (Shell)**: Manages authentication, global state, and the **Main Navigation (Tabs)**. Use `md-tabs`.
  - **Modules**: Standalone units (Settings, Chat, History, etc.) that plug into the Shell.
  - **Settings Module**: The first Proof-of-Concept module. Owns its `SettingsView` and `SettingsService` (domain data).

## 2. Architectural Design

### A. The Module Interface (`Core`)
We need a standard contract for modules to register themselves with the App Shell.

```typescript
// src/extension/modules/core/module.ts
export interface IModule {
  id: string;          // e.g. 'settings', 'chat'
  label: string;       // e.g. 'Settings'
  icon: string;        // Material Icon name
  viewComponent: string; // Web Component tag name e.g. 'settings-view'
}
```

### B. App Shell (`src/extension/modules/app`)
- **State Responsibility**: Maintain the registry of Modules (`active: boolean`) and switch the `activeModuleId`.
- **View Responsibility**: Render the navigation container (e.g., Tabs) based on the strict state of modules.
- **Logic**: The App backend is agnostic to the UI representation (Tabs/Sidebar), it only knows: `setActiveModule(id)`.

## 3. Revised Component Structure

```
src/extension/modules/
├── core/                  # Shared Low-level Services
│   ├── backend/
│   │   ├── secrets.ts     # Generic Secret Access
│   │   └── config.ts      # Generic Config Access
├── app/                   # The Shell
│   ├── view/
│   │   ├── shell.ts       # Renders Navigation & Active View
│   │   └── index.ts       # Registration
├── settings/              # [NEW] Settings Module
│   ├── backend/           # [NEW]
│   │   └── service.ts     # SettingsService (LLM Logic)
│   ├── view/
│   │   ├── index.ts       # Registers settings-view
│   │   ├── settings-view.ts
│   │   ├── model-list.ts
│   │   └── model-form.ts
```

## 4. Data Flow
1.  **App Start**:
    -   `App` registers `SettingsModule`.
    -   `AppShell` renders navigation items.
2.  **Navigation**:
    -   User selects "Settings".
    -   `AppShell` calls `setActiveModule('settings')`.
    -   `App` updates state.
    -   `App` emits `MODULE_ACTIVATED` event.
3.  **Rendering**:
    -   `AppShell` re-renders and mounts `<settings-view>`.


## 5. Migration Steps
1.  **Cleanup**: Remove legacy `src/extension/modules/app/view/settings` (Done).
2.  **Scaffold Infrastructure**: Create `scaffold-module` Skill and Workflow.
3.  **Create Settings**: Run `scaffold-module` for `settings`.
4.  **Refactor App Shell**: Implement `ShellView`.
5.  **Register Settings**: Import `SettingsModule` in `App`.

## 6. Developer Approval (MANDATORY)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-16T16:02:19+01:00
    comments: "Approved Strict Separation."
```
